import 'server-only';
import { createHash } from 'node:crypto';

/**
 * Same value as public.article_content_hash() in the database: the responsive check of a version
 * is only valid for that exact text, images and layout settings.
 */
export function contentHash(f: {
  language: string;
  title: string;
  excerpt: string;
  body: string;
  bodyFormat: string;
  coverUrl: string | null;
  coverMobileUrl: string | null;
  coverPosition: string | null;
}): string {
  const parts = [f.language, f.title, f.excerpt, f.body, f.bodyFormat, f.coverUrl ?? '', f.coverMobileUrl ?? '', f.coverPosition ?? ''];
  return createHash('md5').update(parts.join('|'), 'utf8').digest('hex');
}
