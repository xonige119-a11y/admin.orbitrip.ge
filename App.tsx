
import React, { useState, useEffect, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Language, Tour, Booking, Driver, SystemSettings } from './types';
import { db } from './services/db';
import { smsService } from './services/smsService';
import { emailService } from './services/emailService';

// --- LAZY LOADING ---
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const DriverDashboard = React.lazy(() => import('./components/DriverDashboard'));
const DriverRegistration = React.lazy(() => import('./components/DriverRegistration'));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <span className="text-gray-400 text-sm font-bold tracking-widest animate-pulse uppercase">Orbitrip Portal...</span>
  </div>
);

const App = () => {
    const [language, setLanguage] = useState<Language>(() => {
        try {
            const storage = typeof window !== 'undefined' ? window.localStorage : null; 
            if (!storage) return Language.EN;
            const saved = storage.getItem('orbitrip_lang');
            return (saved as Language) || Language.EN;
        } catch (e) { return Language.EN; }
    });

    // Default view is LOGIN unless session exists
    const [currentView, setCurrentView] = useState('ADMIN_LOGIN'); 
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

    // Data State
    const [tours, setTours] = useState<Tour[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    // Auth State
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(() => {
        try { return typeof window !== 'undefined' ? window.localStorage.getItem('orbitrip_driver_session') : null; }
        catch (e) { return null; }
    });

    useEffect(() => {
        const initData = async () => {
            try {
                const settings = await db.settings.get();
                setSystemSettings(settings);
                
                // Load operational data
                setTours(await db.tours.getAll());
                setDrivers([...await db.drivers.getAll()]);
                setBookings(await db.bookings.getAll());

                // Auto-route based on session
                if (loggedInDriverId) {
                    setCurrentView('DRIVER_DASHBOARD');
                }
            } catch (err) { console.error(err); }
            finally { setIsDataLoaded(true); }
        };
        initData();
        window.addEventListener('orbitrip-db-change', initData);
        return () => window.removeEventListener('orbitrip-db-change', initData);
    }, [loggedInDriverId]);

    const handleNavigate = (view: string) => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogin = (role: 'ADMIN' | 'DRIVER', driverId?: string) => {
        if (role === 'ADMIN') {
            setCurrentView('ADMIN_DASHBOARD');
        } else if (role === 'DRIVER' && driverId) {
            setLoggedInDriverId(driverId);
            localStorage.setItem('orbitrip_driver_session', driverId);
            setCurrentView('DRIVER_DASHBOARD');
        }
    };

    const handleLogout = () => {
        setLoggedInDriverId(null);
        localStorage.removeItem('orbitrip_driver_session');
        setCurrentView('ADMIN_LOGIN');
    };

    if (!isDataLoaded) return <PageLoader />;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <Header 
                language={language} 
                setLanguage={setLanguage} 
                onToolSelect={(tool) => {
                    if (tool === 'LOGOUT') handleLogout();
                    else if (tool === 'LOGIN') setCurrentView('ADMIN_LOGIN');
                }} 
                currentLocation="Admin Panel"
                onLocationChange={() => {}}
                isLoggedIn={currentView !== 'ADMIN_LOGIN' && currentView !== 'DRIVER_REGISTRATION'}
            />

            <Suspense fallback={<PageLoader />}>
                <div className="flex-1 pt-24">
                    {(() => {
                        switch (currentView) {
                            case 'ADMIN_LOGIN':
                                return <AdminLogin onLogin={handleLogin} drivers={drivers} language={language} />;
                            
                            case 'ADMIN_DASHBOARD':
                                return <AdminDashboard 
                                    bookings={bookings} 
                                    tours={tours} 
                                    drivers={drivers} 
                                    onAddTour={t => db.tours.create(t)} 
                                    onUpdateTour={t => db.tours.update(t)} 
                                    onDeleteTour={id => db.tours.delete(id)} 
                                    onUpdateBookingStatus={(id, status) => db.bookings.updateStatus(id, status)} 
                                    onUpdateBooking={b => db.bookings.update(b)}
                                    onAddDriver={d => db.drivers.create(d)} 
                                    onUpdateDriver={d => db.drivers.update(d)} 
                                    onDeleteDriver={id => db.drivers.delete(id)}
                                    onLogout={handleLogout}
                                />;

                            case 'DRIVER_DASHBOARD':
                                return <DriverDashboard 
                                    bookings={bookings} 
                                    tours={tours} 
                                    drivers={drivers} 
                                    driverId={loggedInDriverId || ''} 
                                    onAddTour={t => db.tours.create(t)} 
                                    onUpdateTour={t => db.tours.update(t)} 
                                    onDeleteTour={id => db.tours.delete(id)} 
                                    onUpdateBookingStatus={(id, status) => db.bookings.updateStatus(id, status)}
                                    onAddDriver={d => db.drivers.create(d)} 
                                    onUpdateDriver={d => db.drivers.update(d)} 
                                    onDeleteDriver={id => db.drivers.delete(id)}
                                    onLogout={handleLogout}
                                />;

                            case 'DRIVER_REGISTRATION':
                                return <DriverRegistration 
                                    language={language} 
                                    onRegister={d => { 
                                        db.drivers.create(d); 
                                        alert(language === Language.EN ? 'Application Sent!' : 'Заявка отправлена!');
                                        setCurrentView('ADMIN_LOGIN');
                                    }} 
                                    onBack={() => setCurrentView('ADMIN_LOGIN')} 
                                />;

                            default:
                                return <AdminLogin onLogin={handleLogin} drivers={drivers} language={language} />;
                        }
                    })()}
                </div>
            </Suspense>

            <Footer language={language} settings={systemSettings} onNavigate={(v) => { if(v === 'ADMIN_LOGIN') setCurrentView('ADMIN_LOGIN'); }} />
        </div>
    );
};

export default App;
