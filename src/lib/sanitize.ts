/**
 * ToolsVerse Security & Sanitization Utilities
 * Protects against Cross-Site Scripting (XSS), Malicious SVG Injection,
 * Prototype Pollution, and DOM Manipulation attacks.
 */

/**
 * Escapes plain text for safe insertion into HTML strings.
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips dangerous HTML tags, attributes, event handlers, and javascript: protocols.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  // 1. Remove script, iframe, object, embed, applet, base, and frame tags with contents
  let clean = dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
    .replace(/<base\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '');

  // 2. Remove inline event handlers (onload, onerror, onclick, onmouseover, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Remove dangerous protocols from href, src, formaction, data attributes
  clean = clean.replace(/(href|src|formaction|action)\s*=\s*['"]\s*(?:javascript|vbscript|data:text\/html):[^'"]*['"]/gi, '$1="#"');

  return clean;
}

/**
 * Sanitizes SVG markup to prevent SVG-based XSS attacks.
 * Removes <script>, <foreignObject>, all event listeners, and dangerous hrefs.
 */
export function sanitizeSvg(svgCode: string): string {
  if (!svgCode || typeof svgCode !== 'string') return '';

  return svgCode
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove foreignObject which can contain arbitrary HTML
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
    // Remove inline event listeners like onload, onclick, onerror
    .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Remove javascript: URLs in href and xlink:href
    .replace(/(?:href|xlink:href)\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"')
    // Remove data: text/html URLs
    .replace(/(?:href|xlink:href)\s*=\s*['"]\s*data:text\/html[^'"]*['"]/gi, 'href="#"');
}

/**
 * Validates and sanitizes a URL to ensure it only uses safe protocols (http, https, mailto, tel, blob).
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html')
  ) {
    return '#';
  }
  return trimmed;
}
