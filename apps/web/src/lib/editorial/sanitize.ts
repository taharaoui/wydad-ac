import 'server-only';
import sanitizeHtml from 'sanitize-html';

/**
 * The only HTML an article body may contain: paragraphs, intertitles, emphasis, lists, quotes and
 * links. Anything else (scripts, styles, iframes, tables, images, event handlers) is removed on the
 * server before saving, and again before rendering.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'br'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['https', 'http', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    // Intertitles from pasted text: h1 is the article title, deeper levels become h3
    h1: 'h2',
    h4: 'h3',
    h5: 'h3',
    h6: 'h3',
    b: 'strong',
    i: 'em',
    div: 'p',
    a: (tagName, attribs) => {
      const external = /^https?:\/\//.test(attribs.href ?? '') && !/^https?:\/\/(www\.)?wydad/.test(attribs.href ?? '');
      const href = attribs.href ?? '';
      const out: Record<string, string> = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };
      return { tagName, attribs: out };
    },
  },
  exclusiveFilter: (frame) => ['p', 'h2', 'h3', 'li', 'blockquote'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren.length,
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS).replace(/\s+$/g, '');
}

/** Plain-text fields: no markup at all */
export function plain(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, '&').trim();
}
