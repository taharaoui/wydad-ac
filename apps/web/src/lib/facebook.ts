import { clubName } from '@/lib/clubs';

/**
 * Posts from the club's official Facebook page (facebook.com/WACofficiel), refreshed every 15 minutes.
 * With FACEBOOK_PAGE_ID and FACEBOOK_PAGE_TOKEN set, the Graph API returns the latest posts. Without
 * them, the public page only exposes its latest post, read from the page itself; if Facebook refuses
 * the request, the site simply shows no Facebook post.
 */
export const FACEBOOK_URL = 'https://www.facebook.com/WACofficiel/';
const REVALIDATE = 900;
export const FACEBOOK_TAG = 'facebook';

export interface FacebookPost {
  id: string;
  /** First line of the post, without hashtags */
  title: string;
  /** The rest of the text */
  text: string;
  image?: string;
  url: string;
  /** ISO date-time */
  published_at: string;
}

/** "A Moment Frozen in Time. 🥶\n\n#DimaWydad" → title + text, hashtags dropped */
function split(message: string): { title: string; text: string } {
  const clean = clubName(message)
    .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const [first, ...rest] = clean.split('\n');
  return { title: first.trim().slice(0, 160), text: rest.join('\n').trim().slice(0, 600) };
}

async function fromGraphApi(pageId: string, token: string): Promise<FacebookPost[]> {
  const url = `https://graph.facebook.com/v21.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=10`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: REVALIDATE, tags: [FACEBOOK_TAG] } });
  if (!res.ok) throw new Error(`Graph API HTTP ${res.status}`);
  const { data } = (await res.json()) as { data: { id: string; message?: string; created_time: string; full_picture?: string; permalink_url: string }[] };
  return data
    .filter((p) => p.message?.trim())
    .map((p) => ({ id: p.id, ...split(p.message!), image: p.full_picture, url: p.permalink_url, published_at: new Date(p.created_time).toISOString() }));
}

const unescape = (s: string) => JSON.parse(`"${s}"`) as string;

/** Latest post exposed by the public page (one post, no token) */
async function fromPublicPage(): Promise<FacebookPost[]> {
  const res = await fetch(FACEBOOK_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Accept-Language': 'fr' },
    next: { revalidate: REVALIDATE, tags: [FACEBOOK_TAG] },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const message = html.match(/"message":\{"text":"((?:[^"\\]|\\.)*)"/);
  const permalink = html.match(/"permalink_url":"((?:[^"\\]|\\.)*)"/);
  const created = html.match(/"creation_time":(\d{10})/);
  if (!message || !permalink || !created) return [];
  // The post's picture is the first large CDN image after its link
  const after = html.slice(permalink.index);
  const image = after.match(/"image":\{"uri":"(https:\\\/\\\/scontent[^"]+)"/);
  const url = unescape(permalink[1]);
  return [
    {
      id: url.match(/\/(\d{6,})\/?$/)?.[1] ?? created[1],
      ...split(unescape(message[1])),
      image: image ? unescape(image[1]) : undefined,
      url,
      published_at: new Date(Number(created[1]) * 1000).toISOString(),
    },
  ];
}

export async function getFacebookPosts(): Promise<FacebookPost[]> {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const token = process.env.FACEBOOK_PAGE_TOKEN;
    const posts = pageId && token ? await fromGraphApi(pageId, token) : await fromPublicPage();
    // A date ahead of the server clock would read "in 4 hours": never later than now
    const now = new Date().toISOString();
    return posts.filter((p) => p.title).map((p) => ({ ...p, published_at: p.published_at > now ? now : p.published_at }));
  } catch (err) {
    console.warn('[facebook] posts unavailable:', err instanceof Error ? err.message : err);
    return [];
  }
}
