import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { marketCopy, toI18nResource } from './marketCopy';

function browserStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

const savedLocale = browserStorage()?.getItem('zenmind-market:locale');
const initialLanguage = savedLocale === 'en-US' || savedLocale === 'zh-CN'
  ? savedLocale
  : typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';

void i18n
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'en-US'],
    interpolation: { escapeValue: false },
    resources: {
      'zh-CN': { translation: { localeName: '中文', market: toI18nResource(marketCopy['zh-CN']) } },
      'en-US': { translation: { localeName: 'English', market: toI18nResource(marketCopy['en-US']) } },
    },
  });

i18n.on('languageChanged', (locale) => {
  browserStorage()?.setItem('zenmind-market:locale', locale);
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
});

export default i18n;
