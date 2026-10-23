import { clubName } from './clubs';

/**
 * Profile and latest posts from the club's Instagram (@wacofficiel), read from the public profile embed
 * (no API key). Refreshed hourly. If Instagram refuses the request, a local snapshot of the six
 * latest posts (public/images/instagram, 22 Oct 2026) is shown instead.
 */
export const INSTAGRAM_URL = 'https://www.instagram.com/wacofficiel/';

export interface InstagramPost {
  shortcode: string;
  kind: 'image' | 'carousel' | 'video';
  caption: string;
  /** Image URL: Instagram CDN (served through next/image) or the local snapshot */
  image: string;
  width: number;
  height: number;
  url: string;
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  followers: number;
  posts: number;
  /** Profile picture: Instagram CDN or the local snapshot */
  avatar: string;
}

export interface InstagramFeed {
  profile: InstagramProfile;
  posts: InstagramPost[];
}

const SNAPSHOT_PROFILE: InstagramProfile = {
  username: 'wacofficiel',
  fullName: 'Wydad Athletic Club',
  followers: 2944207,
  posts: 11251,
  avatar: '/images/instagram/profile.jpg',
};

const KIND: Record<string, InstagramPost['kind']> = { GraphImage: 'image', GraphSidecar: 'carousel', GraphVideo: 'video' };

const post = (shortcode: string, kind: InstagramPost['kind'], caption: string, width: number, height: number): InstagramPost => ({
  shortcode,
  kind,
  caption,
  image: `/images/instagram/${shortcode}.jpg`,
  width,
  height,
  url: `https://www.instagram.com/p/${shortcode}/`,
});

const SNAPSHOT: InstagramPost[] = [
  post('De0WQ0EIGIb', 'image', 'تعيين الإطار التونسي نصر الدين نابي مدربا للفريق الأول.', 1080, 1350),
  post('De0CKN5FuOz', 'carousel', 'Flying for Every Ball. ✈️⚽️', 1080, 1440),
  post('Dez89IThcWY', 'video', 'Thursday Through Our Lens. 📽️🌇', 720, 1280),
  post('Dez30dnFptf', 'carousel', 'Focus 👀⚽️', 1080, 1440),
  post('Dezwku2ljP0', 'carousel', '𝐖𝐀𝐂 ❤️🤍', 1080, 1440),
  post('DezXGLSA6-J', 'image', 'Thank you @paulosbrito 🙌', 1080, 1350),
];

interface EmbedContext {
  username: string;
  full_name: string;
  followers_count: number;
  posts_count: number;
  profile_pic_url: string;
  graphql_media?: EmbedMedia[];
}

interface EmbedMedia {
  shortcode_media: {
    __typename: string;
    shortcode: string;
    display_url: string;
    dimensions: { width: number; height: number };
    edge_media_to_caption?: { edges: { node: { text: string } }[] };
  };
}

/** Live profile and latest posts of any public account, from its embed page (hourly); null if refused */
export async function fetchInstagramFeed(username: string): Promise<InstagramFeed | null> {
  try {
    const res = await fetch(`https://www.instagram.com/${username}/embed/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const raw = html.match(/"contextJSON":"((?:[^"\\]|\\.)*)"/)?.[1];
    if (!raw) throw new Error('no embed data');
    const context = (JSON.parse(JSON.parse(`"${raw}"`)) as { context?: EmbedContext }).context;
    const media = context?.graphql_media ?? [];
    const posts = media.map(({ shortcode_media: n }) => ({
      shortcode: n.shortcode,
      kind: KIND[n.__typename] ?? 'image',
      caption: clubName(n.edge_media_to_caption?.edges[0]?.node.text ?? '').split('\n')[0].replace(/\*+/g, '').trim().slice(0, 140),
      image: n.display_url,
      width: n.dimensions.width,
      height: n.dimensions.height,
      url: `https://www.instagram.com/p/${n.shortcode}/`,
    }));
    if (posts.length === 0 || !context) throw new Error('no posts');
    return {
      profile: {
        username: context.username,
        fullName: context.full_name,
        followers: context.followers_count,
        posts: context.posts_count,
        avatar: context.profile_pic_url,
      },
      posts,
    };
  } catch (err) {
    console.warn(`[instagram] @${username} using snapshot:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getInstagram(): Promise<InstagramFeed> {
  return (await fetchInstagramFeed(SNAPSHOT_PROFILE.username)) ?? { profile: SNAPSHOT_PROFILE, posts: SNAPSHOT };
}
