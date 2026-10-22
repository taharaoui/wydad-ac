/**
 * Wydad TV videos, hosted on the club's YouTube channel (@WACofficiel).
 * Add a video by pasting its YouTube id (the part after watch?v=).
 */
export interface Video {
  /** YouTube video id */
  id: string;
  title: { ar: string; fr: string; en: string };
  category: 'training' | 'highlights' | 'interview' | 'behind_the_scenes';
  /** ISO date; optional, since YouTube's oEmbed doesn't give it */
  published_at?: string;
}

/** Newest first. */
export const VIDEOS: Video[] = [
  {
    id: 'kPmj2TOKleI',
    title: {
      en: 'Inside Training | Pushing beyond limits: relentless work rate at Benjelloun',
      fr: "Inside Training | Repousser ses limites : une intensité sans relâche à Benjelloun",
      ar: 'من داخل التداريب | تجاوز الحدود: عمل بلا توقف في بنجلون',
    },
    category: 'training',
  },
];

export function getVideo(id: string): Video | undefined {
  return VIDEOS.find((v) => v.id === id);
}

/** maxresdefault is 1280×720; every video has hqdefault (480×360) as a fallback. */
export function videoThumbnail(id: string, quality: 'maxres' | 'hq' = 'maxres'): string {
  return `https://i.ytimg.com/vi/${id}/${quality === 'maxres' ? 'maxresdefault' : 'hqdefault'}.jpg`;
}

export function youtubeUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
