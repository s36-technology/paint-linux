import translationsJson from './translations.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'vi'] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number];
export type TranslationMap = Record<Language, Record<string, string>>;

export const translations = translationsJson as TranslationMap;

export function getLanguage(): Language {
  const lang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(lang as Language)) {
    return lang as Language;
  }
  return 'en';
}

export function t(key: string): string {
  const lang = getLanguage();
  return translations[lang][key] || translations.en[key] || key;
}
