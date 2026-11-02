/**
 * Layout check of a rendered article page, run in the browser at each device width: by the editor's
 * preview (in iframes of the real public page) and by the Playwright tests (e2e/responsive.spec.ts).
 *
 * The function is self-contained (no imports, no outer variables) so Playwright can send it to the
 * page as is.
 */

export interface LayoutIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface DeviceResult {
  device: string;
  width: number;
  ok: boolean;
  issues: LayoutIssue[];
}

export function measureLayout(opts: { rtl: boolean; touch: boolean }, win: Window = window): LayoutIssue[] {
  const doc = win.document;
  const issues: LayoutIssue[] = [];
  const add = (level: LayoutIssue['level'], code: string, message: string) => {
    if (issues.filter((i) => i.code === code).length < 3 && !issues.some((i) => i.message === message)) issues.push({ level, code, message });
  };
  const vw = doc.documentElement.clientWidth;
  const root = doc.querySelector<HTMLElement>('[data-article]') ?? doc.body;
  const label = (el: Element) => {
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return `<${el.tagName.toLowerCase()}>${text ? ` « ${text}${text.length === 40 ? '…' : ''} »` : ''}`;
  };
  /** Clipped by an ancestor that itself fits the screen (cropped photos, scroll areas) */
  const clipped = (el: Element) => {
    for (let p = el.parentElement; p && p !== doc.body; p = p.parentElement) {
      const ox = win.getComputedStyle(p).overflowX;
      if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') {
        const r = p.getBoundingClientRect();
        return r.right <= vw + 1 && r.left >= -1;
      }
    }
    return false;
  };

  // 1. No horizontal scrolling
  if (doc.documentElement.scrollWidth > vw + 1) {
    add('error', 'h-scroll', `La page défile horizontalement (${doc.documentElement.scrollWidth} px de contenu pour ${vw} px d’écran).`);
  }

  // 2. Nothing sticks out of the screen
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) add('error', 'overflow', `${label(el)} dépasse de l’écran.`);
  }

  // 3. Text wraps inside its box (very long words, addresses)
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, p, li, blockquote, figcaption'))) {
    const cs = win.getComputedStyle(el);
    if (cs.overflowX === 'visible' && el.scrollWidth > el.clientWidth + 2) add('error', 'text-overflow', `${label(el)} : le texte ne passe pas à la ligne.`);
  }

  // 4. Readable text
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-article-body] p, [data-article-body] li'))) {
    if (parseFloat(win.getComputedStyle(el).fontSize) < 16) {
      add('warning', 'small-text', `${label(el)} : texte en dessous de 16 px.`);
      break;
    }
  }
  const h1 = root.querySelector('h1');
  if (!h1) add('error', 'no-title', 'Le titre de l’article n’est pas affiché.');

  // 5. Images load, keep their proportions and stay sharp
  for (const img of Array.from(root.querySelectorAll('img'))) {
    const r = img.getBoundingClientRect();
    if (r.width === 0) continue;
    if (!img.complete || img.naturalWidth === 0) {
      add('error', 'img-broken', `Une image ne se charge pas (${img.alt || img.src.slice(-40)}).`);
      continue;
    }
    const fit = win.getComputedStyle(img).objectFit;
    if (fit === 'fill' || fit === '') {
      const drift = Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) / (img.naturalWidth / img.naturalHeight);
      if (drift > 0.03) add('error', 'img-distorted', `Une image est déformée (${Math.round(drift * 100)} % d’écart de proportions).`);
    }
    if (img.naturalWidth < r.width * 0.75) add('warning', 'img-blurry', `Une image est agrandie (${img.naturalWidth} px affichés sur ${Math.round(r.width)} px) : elle peut paraître floue.`);
  }
  if (!root.querySelector('img')) add('warning', 'no-image', 'Aucune image affichée dans l’article.');

  // 6. Embedded content and tables fit
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('iframe, video, table'))) {
    if (el.getBoundingClientRect().width > vw + 1) add('error', 'embed', `${label(el)} est plus large que l’écran.`);
  }

  // 7. Buttons are big enough for a finger
  if (opts.touch) {
    for (const el of Array.from(root.querySelectorAll<HTMLElement>('a, button'))) {
      const cs = win.getComputedStyle(el);
      if (cs.display === 'inline' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.height < 32) add('warning', 'touch-target', `${label(el)} : zone tactile de ${Math.round(r.height)} px (44 px conseillés).`);
    }
  }

  // 8. Reading direction
  const dir = win.getComputedStyle(root).direction;
  if (opts.rtl && (doc.documentElement.dir !== 'rtl' || dir !== 'rtl')) add('error', 'rtl', 'L’article en arabe ne s’affiche pas de droite à gauche.');
  if (!opts.rtl && dir === 'rtl') add('error', 'ltr', 'L’article s’affiche de droite à gauche alors qu’il n’est pas en arabe.');

  return issues;
}

export const deviceOk = (issues: LayoutIssue[]) => !issues.some((i) => i.level === 'error');
