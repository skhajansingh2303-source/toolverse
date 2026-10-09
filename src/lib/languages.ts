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

/**
 * Clear googtrans cookies using the EXACT same logic Google Translate uses
 * internally (mirrors the `ux()` function in el_main.js).
 */
export function clearGoogleTranslateCookies() {
  if (typeof document === 'undefined') return;

  // Google Translate's own domain calculation:
  // hostname.split('.') → shift while length > 2 → join with '.'
  const parts = window.location.hostname.split('.');
  while (parts.length > 2) parts.shift();
  const rootDomain = parts.join('.');

  const past = new Date(0).toUTCString(); // Thu, 01 Jan 1970 00:00:00 GMT

  const cookieNames = ['googtrans', 'googtransopt'];
  for (const name of cookieNames) {
    // Clear without domain (host-only cookie)
    document.cookie = `${name}=; expires=${past}; max-age=0; path=/;`;
    document.cookie = `${name}=none; expires=${past}; max-age=0; path=/;`;
    // Clear with root domain (exactly how Google Translate sets it)
    document.cookie = `${name}=; expires=${past}; max-age=0; path=/; domain=${rootDomain};`;
    document.cookie = `${name}=none; expires=${past}; max-age=0; path=/; domain=${rootDomain};`;
    // Also try with leading dot
    document.cookie = `${name}=; expires=${past}; max-age=0; path=/; domain=.${rootDomain};`;
    document.cookie = `${name}=none; expires=${past}; max-age=0; path=/; domain=.${rootDomain};`;
    // Also try with full hostname if different from rootDomain
    const hostname = window.location.hostname;
    if (hostname !== rootDomain) {
      document.cookie = `${name}=; expires=${past}; max-age=0; path=/; domain=${hostname};`;
      document.cookie = `${name}=none; expires=${past}; max-age=0; path=/; domain=${hostname};`;
      document.cookie = `${name}=; expires=${past}; max-age=0; path=/; domain=.${hostname};`;
      document.cookie = `${name}=none; expires=${past}; max-age=0; path=/; domain=.${hostname};`;
    }
  }
}

/**
 * Remove #googtrans(...) from URL hash if present.
 */
export function clearGoogTransHash() {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  if (hash && hash.includes('googtrans')) {
    // Remove googtrans from hash, keep other hash fragments
    const cleaned = hash.replace(/#?googtrans\([^)]*\)/g, '').replace(/^#$/, '');
    if (cleaned) {
      history.replaceState(null, '', window.location.pathname + window.location.search + cleaned);
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
}

/**
 * Fully restore English by clearing all Google Translate state sources:
 * 1. googtrans / googtransopt cookies (all domain variants)
 * 2. URL hash (#googtrans)
 * 3. Google Translate banner frame "restore" button
 * 4. goog-te-combo dropdown (set to empty = original language)
 */
export function restoreEnglish() {
  if (typeof document === 'undefined') return;

  // 1. Clear all cookies
  clearGoogleTranslateCookies();

  // 2. Clear URL hash
  clearGoogTransHash();

  // 3. Try clicking Google Translate's internal "Show Original" / restore button
  try {
    const bannerFrame = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement | null;
    if (bannerFrame) {
      const innerDoc = bannerFrame.contentDocument || bannerFrame.contentWindow?.document;
      if (innerDoc) {
        const buttons = innerDoc.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].id && buttons[i].id.indexOf('restore') >= 0) {
            buttons[i].click();
            break;
          }
        }
      }
    }
  } catch {
    // Cross-origin or not found - ignore
  }

  // 4. Reset the goog-te-combo dropdown to empty (= original language)
  try {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch {
    // Ignore
  }
}

export function setGoogleTranslateCookie(langCode: string) {
  if (typeof document === 'undefined') return;

  // Use same domain calculation as Google Translate
  const parts = window.location.hostname.split('.');
  while (parts.length > 2) parts.shift();
  const rootDomain = parts.join('.');
  const val = `/en/${langCode}`;

  // Set without domain (host-only)
  document.cookie = `googtrans=${val}; path=/;`;
  // Set with root domain (how Google Translate does it)
  document.cookie = `googtrans=${val}; path=/; domain=${rootDomain};`;
}
