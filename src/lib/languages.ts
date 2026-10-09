export interface Language {
  code: string;
  label: string;
  flag: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', name: 'English' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼', name: 'Chinese (Traditional)' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', name: 'Italian' },
  { code: 'es', label: 'Español', flag: '🇪🇸', name: 'Spanish' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', name: 'French' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', name: 'German' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', name: 'Japanese' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', name: 'Korean' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', name: 'Russian' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', name: 'Portuguese' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', name: 'Hindi' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', name: 'Arabic' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩', name: 'Bengali' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩', name: 'Indonesian' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', name: 'Turkish' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', name: 'Dutch' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱', name: 'Polish' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', name: 'Vietnamese' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭', name: 'Thai' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦', name: 'Ukrainian' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪', name: 'Swedish' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷', name: 'Greek' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿', name: 'Czech' },
  { code: 'ro', label: 'Română', flag: '🇷🇴', name: 'Romanian' },
];

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);
export const GOOGLE_TRANSLATE_LANGS = SUPPORTED_LANGUAGES.map((l) => l.code).join(',');

export function clearGoogleTranslateCookies() {
  if (typeof document === 'undefined') return;

  const hostname = window.location.hostname;
  const hostParts = hostname.split('.');
  const domains: string[] = ['', hostname, `.${hostname}`];

  for (let i = 0; i < hostParts.length - 1; i++) {
    const parentDomain = hostParts.slice(i).join('.');
    domains.push(parentDomain);
    domains.push(`.${parentDomain}`);
  }

  const paths = ['/', window.location.pathname, ''];
  const cookieNames = ['googtrans', 'googtransopt', 'googtrans_saved'];

  for (const name of cookieNames) {
    for (const d of domains) {
      for (const p of paths) {
        const domainAttr = d ? `; domain=${d}` : '';
        const pathAttr = p ? `; path=${p}` : '';
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}${domainAttr};`;
        document.cookie = `${name}=none; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}${domainAttr};`;
      }
    }
  }
}

export function setGoogleTranslateCookie(langCode: string) {
  if (typeof document === 'undefined') return;

  const hostname = window.location.hostname;
  const rootDomain = hostname.replace(/^www\./, '');
  const val = `/en/${langCode}`;

  document.cookie = `googtrans=${val}; path=/;`;
  if (hostname && hostname !== 'localhost') {
    document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;
    if (rootDomain.includes('.')) {
      document.cookie = `googtrans=${val}; path=/; domain=.${rootDomain};`;
    }
  }
}
