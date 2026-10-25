/**
 * Wydad Live: shows, episodes, creators and schedule. Plain data with no React, so a future mobile
 * app (Expo / React Native) can reuse it. Every demo item carries `demo: true` and is labelled on
 * screen: nothing here pretends to be live or to have an audience it doesn't have.
 */
export type L10n = { fr: string; en: string; ar: string };

/** Where a video plays. YouTube is wired; Twitch and Kick embeds are ready for later. */
export type VideoSource =
  | { provider: 'youtube'; videoId: string }
  | { provider: 'twitch'; channel: string }
  | { provider: 'kick'; channel: string };

export type EpisodeStatus = 'live' | 'upcoming' | 'replay';

export type ShowCategory = 'official' | 'talk' | 'analysis' | 'stories' | 'matchday';

export interface Creator {
  slug: string;
  name: string;
  /** Short role, e.g. "Chaîne officielle du club" */
  role: L10n;
  bio: L10n;
  avatar?: string;
  /** Channel used to detect live broadcasts and list replays */
  youtubeChannelId?: string;
  links: { label: string; url: string }[];
  /** Placeholder profile (e.g. partner to be announced) */
  demo?: boolean;
}

export interface Show {
  slug: string;
  title: L10n;
  tagline: L10n;
  description: L10n;
  category: ShowCategory;
  creatorSlugs: string[];
  /** Cover artwork; demo shows use a generated Wydad-red cover */
  cover?: string;
  /** Usual slot, e.g. "Mardi · 21:00" */
  slot?: L10n;
  demo?: boolean;
}

export interface Episode {
  /** yt-<videoId> for YouTube videos, demo-<slug> for sample episodes */
  id: string;
  showSlug: string;
  title: string;
  description?: string;
  status: EpisodeStatus;
  /** Publication date (replays) or planned start (upcoming), ISO */
  date: string;
  source?: VideoSource;
  thumbnail?: string;
  /** Real counts only (YouTube feed); never estimated */
  views?: number;
  demo?: boolean;
}

export interface LiveHub {
  /** The official channel broadcasting right now, if it is */
  live: Episode[];
  upcoming: Episode[];
  replays: Episode[];
  shows: Show[];
  creators: Creator[];
  /** True when the partner creator channel is configured */
  partnerConfigured: boolean;
}
