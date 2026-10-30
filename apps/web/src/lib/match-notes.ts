/**
 * Hand-entered facts for matches the data source covers poorly (TheStatsAPI has no
 * timeline for Botola and sometimes no player stats at all). Keyed by match id.
 * Goals listed here replace the ones derived from player stats.
 */
export interface NoteGoal {
  side: 'home' | 'away';
  player: string;
  minute: number;
  penalty?: boolean;
  own_goal?: boolean;
}

export interface Official {
  role: 'referee' | 'var';
  /** Latin spelling (FR / EN pages) */
  name: string;
  /** Arabic spelling, as announced */
  name_ar: string;
}

export interface MatchNote {
  goals?: NoteGoal[];
  venue?: string;
  officials?: Official[];
}

export const MATCH_NOTES: Record<string, MatchNote> = {
  // Union Touarga Sport vs Wydad, Botola Pro matchday 5 (24 Oct 2026): officials as announced
  cmvgff319ojujnv07n48jhibs: {
    officials: [
      { role: 'referee', name: 'Hicham Temsamani', name_ar: 'هشام التمسماني' },
      { role: 'var', name: 'Soulaimane El Atifi', name_ar: 'سليمان العاطفي' },
    ],
  },
  // Wydad 1-1 Amal Tiznit, Botola Pro matchday 4 (18 Oct 2026)
  cmuuzodrtu4noti07roj377su: {
    venue: 'Complexe Mohammed V, Casablanca',
    goals: [
      { side: 'away', player: 'Zakaria Salhi', minute: 53, penalty: true },
      { side: 'home', player: 'Silvère Ganvoula', minute: 62, penalty: true },
    ],
  },
};

/**
 * Coaches who have left Wydad. The data source keeps listing them on later fixtures,
 * so they are hidden from matches kicking off after their departure.
 */
const WYDAD_COACH_DEPARTURES: { name: string; left: string }[] = [
  { name: 'Paulo Sérgio', left: '2026-10-22T00:00:00Z' }, // mutual termination announced 22 Oct 2026
];

export function currentWydadCoach(coach: string | undefined, kickoff: string): string | undefined {
  if (!coach) return coach;
  const gone = WYDAD_COACH_DEPARTURES.find((d) => coach.toLowerCase().includes(d.name.toLowerCase()) && kickoff >= d.left);
  return gone ? undefined : coach;
}
