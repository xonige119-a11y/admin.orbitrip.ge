
import React from 'react';
import { Language, SystemSettings } from '../types';

interface FooterProps {
  language: Language;
  settings: SystemSettings | null;
  onNavigate: (view: string, path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ language, settings }) => {
  const isEn = language === Language.EN;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-500 text-xs py-6 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2">
            <span className="font-black text-white tracking-tight">
                ORBI<span className="text-indigo-500">TRIP</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>Management Console</span>
        </div>

        <div className="flex gap-6">
           <a href={`mailto:support@orbitrip.ge`} className="hover:text-white transition">Tech Support</a>
           <span className="text-slate-700">•</span>
           <span>© {year}</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
