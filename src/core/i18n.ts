/**
 * Internationalization Manager
 * Handles language selection and translation
 */

import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';
import { STORAGE_KEYS } from '../config/constants';

export type Locale = 'pt-BR' | 'en-US';

type TranslationKeys = typeof ptBR;

export class I18n {
  private currentLocale: Locale;
  private translations: Record<Locale, TranslationKeys>;
  private readonly STORAGE_KEY = STORAGE_KEYS.LOCALE;

  constructor() {
    this.translations = {
      'pt-BR': ptBR,
      'en-US': enUS,
    };
    this.currentLocale = this.loadLocale();
  }

  private loadLocale(): Locale {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Locale;
    if (saved && this.translations[saved]) {
      return saved;
    }
    
    // Auto-detect browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) {
      return 'pt-BR';
    }
    return 'en-US';
  }

  private saveLocale(locale: Locale): void {
    localStorage.setItem(this.STORAGE_KEY, locale);
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  setLocale(locale: Locale): void {
    if (!this.translations[locale]) {
      console.error(`Locale "${locale}" not found`);
      return;
    }
    this.currentLocale = locale;
    this.saveLocale(locale);
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for locale "${this.currentLocale}"`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  // Helper method to get all available locales
  getAvailableLocales(): Array<{ code: Locale; name: string }> {
    return [
      { code: 'pt-BR', name: this.t('settings.language.ptBR') },
      { code: 'en-US', name: this.t('settings.language.enUS') },
    ];
  }
}

export const i18n = new I18n();
