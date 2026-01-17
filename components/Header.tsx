
import React, { useState } from 'react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onToolSelect: (tool: string) => void;
  currentLocation: string;
  onLocationChange: (loc: string) => void;
  isLoggedIn?: boolean; 
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, onToolSelect, isLoggedIn = false }) => {
  
  const toggleLanguage = (lang: Language) => {
      setLanguage(lang);
  };

  const isEn = language === Language.EN;

  return (
    <header className="fixed top-0 left-0 w-full z-[100] font-sans bg-slate-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer group z-50 mr-auto select-none" onClick={() => !isLoggedIn && onToolSelect('LOGIN')}>
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tight leading-none">
                        ORBI<span className="text-indigo-400">TRIP</span>
                    </span>
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Partner Portal
                    </span>
                </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={() => toggleLanguage(Language.EN)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === Language.EN ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => toggleLanguage(Language.RU)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === Language.RU ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    RU
                </button>
            </div>

            {/* Logout / Status */}
            {isLoggedIn && (
                <button 
                    onClick={() => onToolSelect('LOGOUT')}
                    className="text-xs font-bold text-red-300 hover:text-white hover:bg-red-900/50 transition border border-red-900/30 px-4 py-2 rounded-lg"
                >
                    {isEn ? 'Logout' : 'Выход'}
                </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
