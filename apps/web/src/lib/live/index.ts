import { getVideos } from '@/lib/videos';
import { clubName } from '@/lib/clubs';
import { detectYouTubeLive, sourceThumbnail } from './providers';
import { DEMO_SHOWS, OFFICIAL_CREATOR, OFFICIAL_SHOW, PARTNER_PLACEHOLDER, PARTNER_SHOW, demoEpisodes, partnerCreator } from './catalog';
import type { Creator, Episode, LiveHub, Show } from './types';

export type * from './types';
export { embedUrl, watchUrl } from './providers';

/** Latest uploads of any YouTube channel from its public feed (titles, dates, real view counts) */
async function channelReplays(channelId: string, showSlug: string): Promise<Episode[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { next: { revalidate: 600, tags: ['youtube'] } });
    if (!res.ok) return [];
    const xml = await res.text();
    return xml
      .split('<entry>')
      .slice(1)
      .flatMap((entry): Episode[] => {
        const id = entry.match(/<yt:videoId>([^<]+)</)?.[1];
        const title = entry.match(/<title>([^<]+)</)?.[1];
        const published = entry.match(/<published>([^<]+)</)?.[1];
        if (!id || !title || !published || /#shorts/i.test(title)) return [];
        const views = entry.match(/<media:statistics views="(\d+)"/)?.[1];
        const source = { provider: 'youtube' as const, videoId: id };
        return [{ id: `yt-${id}`, showSlug, title: clubName(title).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"), status: 'replay', date: new Date(published).toISOString(), source, thumbnail: sourceThumbnail(source), views: views ? Number(views) : undefined }];
      });
  } catch {
    return [];
  }
}

const liveEpisode = (showSlug: string, live: { videoId: string; title?: string }): Episode => {
  const source = { provider: 'youtube' as const, videoId: live.videoId };
  return { id: `yt-${live.videoId}`, showSlug, title: live.title ?? 'En direct', status: 'live', date: new Date().toISOString(), source, thumbnail: sourceThumbnail(source) };
};

/** Everything the Wydad Live pages show; real data first, demo items flagged */
export async function getLiveHub(): Promise<LiveHub> {
  const partner = partnerCreator();
  const [officialLive, partnerLive, videos, partnerReplays] = await Promise.all([
    detectYouTubeLive(OFFICIAL_CREATOR.youtubeChannelId!),
    partner ? detectYouTubeLive(partner.youtubeChannelId!) : Promise.resolve(null),
    getVideos(),
    partner ? channelReplays(partner.youtubeChannelId!, 'partenaire') : Promise.resolve([]),
  ]);

  const officialReplays: Episode[] = videos.map((v) => {
    const source = { provider: 'youtube' as const, videoId: v.id };
    return { id: `yt-${v.id}`, showSlug: 'wydad-tv', title: v.title, status: 'replay', date: v.published_at, source, thumbnail: sourceThumbnail(source), views: v.views };
  });
  const demo = demoEpisodes();
  const live = [officialLive && liveEpisode('wydad-tv', officialLive), partnerLive && liveEpisode('partenaire', partnerLive)].filter((e): e is Episode => !!e);
  const liveIds = new Set(live.map((e) => e.id));

  return {
    live,
    upcoming: demo.filter((e) => e.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date)),
    replays: [...officialReplays, ...partnerReplays, ...demo.filter((e) => e.status === 'replay')]
      .filter((e) => !liveIds.has(e.id))
      .sort((a, b) => b.date.localeCompare(a.date)),
    shows: [OFFICIAL_SHOW, ...(partner ? [PARTNER_SHOW(partner)] : []), ...DEMO_SHOWS],
    creators: [OFFICIAL_CREATOR, partner ?? PARTNER_PLACEHOLDER],
    partnerConfigured: !!partner,
  };
}

export async function getEpisode(id: string): Promise<{ episode: Episode; show?: Show; hub: LiveHub } | null> {
  const hub = await getLiveHub();
  let episode = [...hub.live, ...hub.upcoming, ...hub.replays].find((e) => e.id === id);
  // A YouTube video of the club not in the latest feed (older uploads): still playable
  if (!episode && /^yt-[\w-]{11}$/.test(id)) {
    const source = { provider: 'youtube' as const, videoId: id.slice(3) };
    const video = (await getVideos()).find((v) => v.id === source.videoId);
    if (video) episode = { id, showSlug: 'wydad-tv', title: video.title, status: 'replay', date: video.published_at, source, thumbnail: sourceThumbnail(source) };
  }
  if (!episode) return null;
  return { episode, show: hub.shows.find((s) => s.slug === episode!.showSlug), hub };
}

export const showEpisodes = (hub: LiveHub, slug: string) => [...hub.live, ...hub.upcoming, ...hub.replays].filter((e) => e.showSlug === slug);

export const findCreator = (hub: LiveHub, slug: string): Creator | undefined => hub.creators.find((c) => c.slug === slug);
