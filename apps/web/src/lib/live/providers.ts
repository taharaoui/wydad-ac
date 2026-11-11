import type { VideoSource } from './types';

/** Embed URL of a source. Twitch needs the embedding host as `parent`. */
export function embedUrl(source: VideoSource, host: string, opts: { autoplay?: boolean } = {}): string {
  switch (source.provider) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${source.videoId}?rel=0&modestbranding=1${opts.autoplay ? '&autoplay=1&mute=1' : ''}`;
    case 'twitch':
      return `https://player.twitch.tv/?channel=${encodeURIComponent(source.channel)}&parent=${encodeURIComponent(host)}&autoplay=${opts.autoplay ? 'true' : 'false'}`;
    case 'kick':
      return `https://player.kick.com/${encodeURIComponent(source.channel)}?autoplay=${opts.autoplay ? 'true' : 'false'}`;
  }
}

export function watchUrl(source: VideoSource): string {
  switch (source.provider) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${source.videoId}`;
    case 'twitch':
      return `https://www.twitch.tv/${source.channel}`;
    case 'kick':
      return `https://kick.com/${source.channel}`;
  }
}

export function sourceThumbnail(source?: VideoSource): string | undefined {
  return source?.provider === 'youtube' ? `https://i.ytimg.com/vi/${source.videoId}/hqdefault.jpg` : undefined;
}

/**
 * Whether a YouTube channel is broadcasting now, without an API key: its /live page points to the
 * running broadcast (canonical watch URL) and flags it isLiveNow. Checked every 2 minutes.
 */
export async function detectYouTubeLive(channelId: string): Promise<{ videoId: string; title?: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'Accept-Language': 'en' },
      next: { revalidate: 120, tags: ['youtube-live'] },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const videoId = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1];
    if (!videoId || !html.includes('"isLiveNow":true')) return null;
    const title = html.match(/<meta name="title" content="([^"]*)"/)?.[1];
    return { videoId, title: title?.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') };
  } catch {
    return null;
  }
}
