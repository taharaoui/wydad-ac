import { COVER, LIMITS, SLUG_PATTERN, type Lang } from './spec';

/**
 * Content checks of an article, run live in the editor and again by the server before it saves a
 * publication: errors block publishing, warnings are advice the journalist can overrule.
 */

export interface ArticleDraft {
  id?: string;
  language: Lang | '';
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Rich text as sanitised HTML */
  bodyHtml: string;
  coverUrl: string;
  coverAlt: string;
  /** Source pixels behind the crop (smaller than 1200 × 675 means the image was enlarged) */
  coverWidth: number | null;
  coverHeight: number | null;
  coverMobileUrl: string;
  author: string;
  /** ISO date-time; empty means "now" when published */
  publishedAt: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  matchId: string;
}

export type Field = keyof ArticleDraft | 'body';

export interface Check {
  id: string;
  level: 'error' | 'warning';
  field: Field;
  message: string;
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

/** Plain text of the rich text, one entry per block (paragraph, intertitle, list item, quote) */
export function blocksOf(html: string): { tag: string; text: string }[] {
  const out: { tag: string; text: string }[] = [];
  const re = /<(p|h2|h3|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = m[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e] ?? ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) out.push({ tag: m[1].toLowerCase(), text });
  }
  return out;
}

export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);

export function stats(html: string) {
  const blocks = blocksOf(html);
  const words = blocks.reduce((n, b) => n + wordsOf(b.text).length, 0);
  return {
    words,
    readMinutes: Math.min(60, Math.max(1, Math.round(words / 200))),
    subheadings: blocks.filter((b) => b.tag === 'h2' || b.tag === 'h3').length,
    longParagraphs: blocks.filter((b) => b.tag === 'p' && wordsOf(b.text).length > LIMITS.paragraphWords).length,
    text: blocks.map((b) => b.text).join('\n'),
  };
}

/** Longest run of characters a phone can't break (web addresses excepted: they're links) */
function longestWord(text: string) {
  return wordsOf(text.replace(/https?:\/\/\S+/g, '')).reduce((max, w) => Math.max(max, [...w].length), 0);
}

function scriptMix(text: string, lang: Lang) {
  const arabic = (text.match(/[؀-ۿ]/g) ?? []).length;
  const latin = (text.match(/[A-Za-zÀ-ÿ]/g) ?? []).length;
  const total = arabic + latin;
  if (total < 80) return false;
  return lang === 'ar' ? latin / total > 0.35 : arabic / total > 0.1;
}

export function checkArticle(d: ArticleDraft, opts: { categoryActive?: boolean } = {}): Check[] {
  const c: Check[] = [];
  const err = (id: string, field: Field, message: string) => c.push({ id, level: 'error', field, message });
  const warn = (id: string, field: Field, message: string) => c.push({ id, level: 'warning', field, message });
  const s = stats(d.bodyHtml);
  const title = d.title.trim();
  const excerpt = d.excerpt.trim();

  if (!d.language) err('language', 'language', 'Choisissez la langue de l’article.');
  if (!d.categoryId) err('category', 'categoryId', 'Choisissez une catégorie.');
  else if (opts.categoryActive === false) err('category-inactive', 'categoryId', 'Cette catégorie est désactivée : choisissez-en une autre.');

  if (!title) err('title', 'title', 'Le titre est obligatoire.');
  else {
    if ([...title].length > LIMITS.title.max) err('title-long', 'title', `Titre trop long (${[...title].length}/${LIMITS.title.max} caractères).`);
    else if ([...title].length > LIMITS.title.recommended) warn('title-recommended', 'title', `Titre long : visez ${LIMITS.title.recommended} caractères maximum pour qu’il tienne sur mobile.`);
    if (/[A-ZÀ-Ý]{6,}/.test(title) && title === title.toUpperCase()) warn('title-caps', 'title', 'Évitez d’écrire le titre en majuscules : le site les met déjà en forme.');
    if (/[!?]{2,}/.test(title)) warn('title-clickbait', 'title', 'Ponctuation excessive : un titre informatif n’a pas besoin de « !! » ou « ?! ».');
  }
  if (!SLUG_PATTERN.test(d.slug)) err('slug', 'slug', 'Adresse invalide : lettres minuscules sans accents, chiffres et tirets (ex. wydad-raja-2-1).');

  if (!excerpt) err('excerpt', 'excerpt', 'Le résumé est obligatoire : il s’affiche sous le titre et dans les aperçus.');
  else if ([...excerpt].length > LIMITS.excerpt.max) err('excerpt-long', 'excerpt', `Résumé trop long (${[...excerpt].length}/${LIMITS.excerpt.max} caractères).`);
  else if ([...excerpt].length < LIMITS.excerpt.min) warn('excerpt-short', 'excerpt', `Résumé court : une ou deux phrases complètes (${LIMITS.excerpt.min} caractères minimum conseillés).`);

  if (s.words < 30) err('body', 'body', 'Le texte de l’article est trop court (30 mots minimum).');
  if (s.words > LIMITS.wordsBeforeSubheadings && s.subheadings === 0) warn('subheadings', 'body', `Article de ${s.words} mots sans intertitre : ajoutez des intertitres pour aérer la lecture.`);
  if (s.longParagraphs) warn('paragraphs', 'body', `${s.longParagraphs} paragraphe(s) de plus de ${LIMITS.paragraphWords} mots : coupez-les pour la lecture sur mobile.`);
  if (d.language && scriptMix(`${title} ${excerpt} ${s.text}`, d.language)) {
    warn('language-mix', 'body', d.language === 'ar' ? 'Beaucoup de texte en caractères latins dans un article en arabe : vérifiez la langue.' : 'Du texte en arabe dans un article en caractères latins : vérifiez la langue.');
  }
  const longest = Math.max(longestWord(title), longestWord(excerpt), longestWord(s.text));
  if (longest > LIMITS.longestWord) err('long-word', 'body', `Un mot de ${longest} caractères ne peut pas passer à la ligne et déborderait sur mobile : ajoutez des espaces ou transformez l’adresse en lien.`);

  if (!d.coverUrl) err('cover', 'coverUrl', `Ajoutez une image principale (${COVER.label}).`);
  else {
    if (d.coverWidth && d.coverHeight && (d.coverWidth < COVER.width || d.coverHeight < COVER.height)) {
      err('cover-small', 'coverUrl', `Image trop petite (${d.coverWidth} × ${d.coverHeight} px) : elle serait floue. Il faut au moins ${COVER.width} × ${COVER.height} px.`);
    }
    const alt = d.coverAlt.trim();
    if (!alt) err('alt', 'coverAlt', 'Décrivez l’image (texte alternatif) : il est lu aux personnes malvoyantes et par Google.');
    else if (alt.length < LIMITS.alt.min) warn('alt-short', 'coverAlt', 'Texte alternatif très court : décrivez ce que montre la photo (qui, quoi, où).');
    else if (alt.length > LIMITS.alt.max) warn('alt-long', 'coverAlt', `Texte alternatif long (${alt.length} caractères) : restez sous ${LIMITS.alt.max}.`);
  }
  if (d.publishedAt && Number.isNaN(Date.parse(d.publishedAt))) err('date', 'publishedAt', 'Date de publication invalide.');
  if (d.matchId && !/^(mt_[0-9]+|[a-z0-9]{20,32}|[a-z0-9-]+)$/.test(d.matchId)) err('match', 'matchId', 'Identifiant de match invalide.');
  if (d.seoTitle.length > LIMITS.seoTitle) warn('seo-title', 'seoTitle', `Titre Google long (${d.seoTitle.length}/${LIMITS.seoTitle}).`);
  if (d.seoDescription.length > LIMITS.seoDescription) warn('seo-description', 'seoDescription', `Description Google longue (${d.seoDescription.length}/${LIMITS.seoDescription}).`);
  return c;
}

export const blocking = (checks: Check[]) => checks.filter((c) => c.level === 'error');
