import { ru } from './ru';
import { en } from './en';

// Получить текущий язык из localStorage или использовать русский по умолчанию
const getStoredLang = (): 'ru' | 'en' => {
  const stored = localStorage.getItem('language');
  return (stored === 'en' || stored === 'ru') ? stored : 'ru';
};

// Текущий язык
let currentLang: 'ru' | 'en' = getStoredLang();

// Словари переводов
const translations = { ru, en };

// Функция для получения перевода
export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[currentLang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  }
  
  return value;
};

// Функция для смены языка
export const setLanguage = (lang: 'ru' | 'en') => {
  currentLang = lang;
  localStorage.setItem('language', lang);
  // Перезагрузить страницу для применения изменений
  window.location.reload();
};

// Функция для получения текущего языка
export const getCurrentLanguage = (): 'ru' | 'en' => currentLang;

// Экспорт всех переводов
export { ru, en };
export default t;
