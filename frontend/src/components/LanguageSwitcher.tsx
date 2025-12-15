import { Languages } from 'lucide-react';
import { getCurrentLanguage, setLanguage } from '@/i18n';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: 'ru' | 'en') => {
    setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        aria-label="Change language"
      >
        <Languages size={20} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700 uppercase">
          {currentLang}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={() => handleLanguageChange('ru')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-lg ${
                currentLang === 'ru' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
              }`}
            >
              🇷🇺 Русский
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors last:rounded-b-lg ${
                currentLang === 'en' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </>
      )}
    </div>
  );
}
