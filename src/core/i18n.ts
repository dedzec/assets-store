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
    // Default to browser language — real value loaded via init()
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    this.currentLocale = browserLang.startsWith('pt') ? 'pt-BR' : 'en-US';
  }

  /** Initialize with persisted locale from main process; migrates localStorage on first run */
  init(savedLocale?: string): void {
    if (savedLocale && this.translations[savedLocale as Locale]) {
      this.currentLocale = savedLocale as Locale;
    } else {
      // Migrate from localStorage if available
      const local = localStorage.getItem(this.STORAGE_KEY) as Locale;
      if (local && this.translations[local]) {
        this.currentLocale = local;
        this.saveLocale(local);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  private saveLocale(locale: Locale): void {
    window.api?.setSetting(this.STORAGE_KEY, locale);
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
