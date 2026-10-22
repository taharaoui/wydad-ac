import type { MatchStatus, Team } from '@/types';
import type { SearchEntry } from '@/lib/search';

/** A match as the header shows it. Dates are pre-formatted on the server to keep hydration stable. */
export interface HeaderMatch {
  id: string;
  home: Team;
  away: Team;
  status: MatchStatus;
  scoreHome: number | null;
  scoreAway: number | null;
  minute: number | null;
  kickoff: string;
  /** e.g. "sam. 24 oct." */
  day: string;
  /** e.g. "18:00", Moroccan time */
  time: string;
  /** e.g. "Botola Pro · Journée 5" */
  competition: string;
}

/** One message in the red flash bar, shown one at a time */
export interface Announcement {
  id: string;
  message: string;
  cta?: { label: string; href: string };
}

export interface HeaderData {
  announcements: Announcement[];
  search: SearchEntry[];
}
