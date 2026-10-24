import type { NewsArticle } from '@/types';
import { getLatestNews } from '@/services/news';
import { getVideos, type Video } from '@/lib/videos';
import { getFacebookPosts, type FacebookPost } from '@/lib/facebook';

/**
 * The home page's news: club articles, Wydad TV videos (YouTube) and official Facebook posts in one
 * list, newest first. Each new upload or post shows up in the news section and, being the latest
 * item, in the hero.
 */
export type FeedItem =
  | { kind: 'article'; id: string; published_at: string; article: NewsArticle }
  | { kind: 'video'; id: string; published_at: string; video: Video }
  | { kind: 'facebook'; id: string; published_at: string; post: FacebookPost };

/** Videos and posts kept in the mix, so articles aren't pushed out by a busy upload day */
const MAX_VIDEOS = 4;
const MAX_POSTS = 3;

export async function getHomeFeed(limit = 9): Promise<FeedItem[]> {
  const [articles, videos, posts] = await Promise.all([getLatestNews(limit), getVideos(), getFacebookPosts()]);
  const items: FeedItem[] = [
    ...articles.map((article) => ({ kind: 'article' as const, id: `article-${article.id}`, published_at: article.published_at, article })),
    ...videos.slice(0, MAX_VIDEOS).map((video) => ({ kind: 'video' as const, id: `video-${video.id}`, published_at: video.published_at, video })),
    ...posts.slice(0, MAX_POSTS).map((post) => ({ kind: 'facebook' as const, id: `facebook-${post.id}`, published_at: post.published_at, post })),
  ];
  return items.sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, limit);
}

/** Items that can lead the hero: they need a picture (every video has its thumbnail) */
export const hasPicture = (item: FeedItem) =>
  item.kind === 'video' || (item.kind === 'article' ? !!item.article.cover_image_url : !!item.post.image);
