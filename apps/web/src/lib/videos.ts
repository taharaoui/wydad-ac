import { clubName } from '@/lib/clubs';
/**
 * Wydad TV: videos from the club's official YouTube channel (youtube.com/@WACofficiel).
 * CHANNEL_VIDEOS is a snapshot of the channel (with exact upload dates); getVideos() adds any
 * newer uploads from the channel's RSS feed, so new videos appear without editing this file.
 */
export const WAC_CHANNEL_URL = 'https://www.youtube.com/@WACofficiel';
const WAC_CHANNEL_ID = 'UCf65dQ8syRzRPpALKZQUcOQ';

export type VideoCategory = 'training' | 'behind_the_scenes' | 'press_conference' | 'interview' | 'highlights';

export interface Video {
  /** YouTube video id */
  id: string;
  /** Title as published on the channel */
  title: string;
  category: VideoCategory;
  /** ISO date-time (UTC) */
  published_at: string;
  /** Match the video covers (behind the scenes, press conference) */
  match_id?: string;
}

/** Category from the channel's title prefixes ("INSIDE THE MATCH |", "PRESS CONFERENCE |", …) */
export function categorize(title: string): VideoCategory {
  if (/inside the match|behind the scenes/i.test(title)) return 'behind_the_scenes';
  if (/press conference/i.test(title)) return 'press_conference';
  if (/interview/i.test(title)) return 'interview';
  if (/highlights|résumé|ملخص/i.test(title)) return 'highlights';
  return 'training';
}

type Raw = Omit<Video, 'category'>;

/** Snapshot of the channel, newest first (22 Oct 2026) */
const CHANNEL_VIDEOS: Raw[] = [
  { id: 'zd4sEN4mlUo', title: 'Inside The Match | Close-Up Action, Player Focus & Match Reaction', published_at: '2026-10-20T21:00:11Z', match_id: 'mt_371866534' },
  { id: 'bq6fVyJh7r4', title: 'Game Day Ready | Saturday Pitch Work at Benjelloun Complex Headquarters', published_at: '2026-10-17T21:40:59Z' },
  { id: 'kPmj2TOKleI', title: 'INSIDE TRAINING | Pushing Beyond Limits: Relentless Work Rate at Benjelloun!', published_at: '2026-10-16T17:00:08Z' },
  { id: '6IBAoneZBCc', title: 'Inside Training | Squad Intensifies Preparation Ahead of Sunday Fixture', published_at: '2026-10-14T17:00:10Z' },
  { id: 'CE5LqqbSu9E', title: 'INSIDE THE MATCH | Raw Pitchside & Tunnel Access! Wydad AC 0-0 CODM', published_at: '2026-10-12T22:00:06Z', match_id: 'mt_982177608' },
  { id: 'sYtb7tVYnN0', title: 'Press Conference | Paulo Sérgio Post-Match Reaction: Wydad AC 0-0 CODM', published_at: '2026-10-12T00:21:28Z', match_id: 'mt_982177608' },
  { id: 'DjYxQz87jIA', title: 'MATCHDAY -1! | Final Session at Benjelloun Before Tomorrow Clash vs CODM!', published_at: '2026-10-10T23:15:00Z' },
  { id: 'JpxJYFtdStw', title: 'Friday Session | Squad Prepares for Sunday Botola Pro Fixture vs CODM', published_at: '2026-10-09T17:00:07Z' },
  { id: 'DEmax-JdwTE', title: 'INSIDE TRAINING | Light Work & Smiles: Squad Recharges After 2-0 Victory!', published_at: '2026-10-05T17:00:11Z' },
  { id: 'UyOLu18csys', title: 'INSIDE THE MATCH | Away Day Glory! DHJ 0-2 Wydad AC | Ganvoula & Zemraoui Strike!', published_at: '2026-10-04T21:00:10Z', match_id: 'mt_735424375' },
  { id: 'yeoRRsP74Cw', title: 'PRESS CONFERENCE | Paulo Sérgio Reacts to 2-0 Win vs DHJ!', published_at: '2026-10-03T22:00:08Z', match_id: 'mt_735424375' },
  { id: 'kvQMEPEesOM', title: 'MATCHDAY -1! | Final Session at Benjelloun before tomorrow Matchday 02 Clash vs DHJ!', published_at: '2026-10-02T21:00:11Z' },
  { id: 'Fzc1Oh81Vgg', title: 'FIRST INTERVIEW | Yahya Attiat Allah: "A Special Feeling Remains!"', published_at: '2026-10-01T21:40:08Z' },
  { id: '4AoNMGKwM-w', title: 'BEHIND THE SCENES | Inside the Official 26/27 Home Kit Reveal Shoot!', published_at: '2026-09-30T18:00:08Z' },
  { id: 'HJgS49qrb1A', title: 'INSIDE TRAINING | Pure Intensity & High-Tempo Work at Benjelloun', published_at: '2026-09-29T17:00:10Z' },
  { id: '0aUGAOxjB_M', title: 'BACK TO WORK! | Early Monday Morning Session After Matchday 01 Setback', published_at: '2026-09-28T17:00:06Z' },
  { id: '-MysGG2m5zE', title: "MATCHDAY -1! | Final Session at Benjelloun Before Tomorrow's Botola Opener vs WST!", published_at: '2026-09-26T00:32:49Z' },
  { id: 'Rjk1z2lRxFc', title: 'FIRST INTERVIEW | Ayman Hassouni: "A Special Feeling To Be Back With My Family!"', published_at: '2026-09-25T10:31:54Z' },
  { id: 'fc3O4LpkHH4', title: 'UNDER THE LIGHTS | Intensive Thursday Night Session 2 Days Before Opening Game!', published_at: '2026-09-24T23:00:07Z' },
  { id: 'Nm82jyYDWi4', title: 'INSIDE TRAINING | Who is the new player? hard wednesday Session & Great team vibes!', published_at: '2026-09-23T22:00:06Z' },
  { id: 'soCBJS137QU', title: 'FIRST INTERVIEW | Hamza Janan Allah: "IT FEELS GREAT TO RETURN TO THE CLUB WHERE I STARTED"', published_at: '2026-09-22T21:00:07Z' },
  { id: '1BRtwNqmYuM', title: 'INSIDE TRAINING | Pushing Limits on Tuesday: Tactical & Physical Prep for Game 1', published_at: '2026-09-22T17:00:08Z' },
  { id: '3TSNQuuh8E4', title: "INSIDE TRAINING | First Prep Session for Saturday's Botola Pro Opener", published_at: '2026-09-21T17:00:06Z' },
  { id: 'gQQppYB_lTA', title: 'FIRST INTERVIEW | Rachid Ghanimi: "I Joined Wydad To Win Titles!"', published_at: '2026-09-20T20:00:11Z' },
  { id: 'kbQuGDW-Euk', title: 'FRIENDLY MATCH | HIGHLIGHTS | Wydad AC 1-1 Moghreb Tétouan', published_at: '2026-09-19T21:00:07Z' },
  { id: '1W9oVOliM8g', title: 'FIRST INTERVIEW | Adil Khaloufi: "The Goal Is Clear: To Compete For Every Title!"', published_at: '2026-09-19T15:00:06Z' },
  { id: 'eGZlnSa6X3I', title: 'INSIDE TRAINING | Season Starts Next Week! High-Tempo Match Readiness Drills', published_at: '2026-09-18T18:00:07Z' },
  { id: 'aq7zmWOpzqU', title: 'FIRST INTERVIEW | Salah Eddine Cofi: "I promise the fans that I’ll add value!"', published_at: '2026-09-17T20:00:06Z' },
  { id: 'aYuraBBkCBw', title: 'INSIDE TRAINING | Dayo Issoufou First Touch & Squad Lock In For Heavy Preparation', published_at: '2026-09-17T16:00:06Z' },
  { id: 'N0vDvDCUsJc', title: 'INSIDE TRAINING | Fresh Addition Joins Squad Practice in Casablanca!', published_at: '2026-09-16T18:00:07Z' },
];

const withCategory = (v: Raw): Video => ({ ...v, category: categorize(v.title) });

/** The snapshot, for static generation */
export const VIDEOS: Video[] = CHANNEL_VIDEOS.map(withCategory);

/** Snapshot plus newer uploads from the channel RSS feed (refreshed every 3 hours), newest first. */
export async function getVideos(): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${WAC_CHANNEL_ID}`, { next: { revalidate: 3 * 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const known = new Set(VIDEOS.map((v) => v.id));
    const fresh: Video[] = [];
    for (const entry of xml.split('<entry>').slice(1)) {
      const id = entry.match(/<yt:videoId>([^<]+)</)?.[1];
      const title = entry.match(/<title>([^<]+)</)?.[1];
      const published = entry.match(/<published>([^<]+)</)?.[1];
      if (!id || !title || !published || known.has(id) || /#shorts/i.test(title)) continue;
      const clean = clubName(title).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      fresh.push(withCategory({ id, title: clean, published_at: new Date(published).toISOString() }));
    }
    return [...fresh, ...VIDEOS].sort((a, b) => b.published_at.localeCompare(a.published_at));
  } catch (err) {
    console.warn('[videos] channel feed unavailable:', err instanceof Error ? err.message : err);
    return VIDEOS;
  }
}

export async function getVideo(id: string): Promise<Video | undefined> {
  return (await getVideos()).find((v) => v.id === id);
}

/**
 * Club videos about a match: tagged with its id, or "Inside The Match" / press conference videos
 * uploaded within four days after kick-off.
 */
export function matchVideos(videos: Video[], match: { id: string; kickoff: string }): Video[] {
  const ko = new Date(match.kickoff).getTime();
  return videos
    .filter((v) => {
      if (v.match_id) return v.match_id === match.id;
      // Only match coverage: "Inside The Match" and press conferences (not e.g. a kit-shoot behind the scenes)
      if (!/inside the match|press conference/i.test(v.title)) return false;
      const dt = new Date(v.published_at).getTime() - ko;
      return dt > 0 && dt < 4 * 86_400_000;
    })
    .sort((a, b) => (a.category === 'behind_the_scenes' ? -1 : 1) - (b.category === 'behind_the_scenes' ? -1 : 1));
}

/** maxresdefault is 1280×720; every video has hqdefault (480×360) as a fallback. */
export function videoThumbnail(id: string, quality: 'maxres' | 'hq' = 'maxres'): string {
  return `https://i.ytimg.com/vi/${id}/${quality === 'maxres' ? 'maxresdefault' : 'hqdefault'}.jpg`;
}

export function youtubeUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
