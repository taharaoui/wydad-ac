import type { Team } from '@/types';

/**
 * Wydad's Botola Pro 2026-27 first-half schedule, as published by the club (matchday, opponent,
 * home or away). Kick-off dates come from the data source once the league confirms them.
 */
export interface ScheduleEntry {
  matchday: number;
  opponent: Team;
  home: boolean;
}

const team = (id: string, name: string, short_name: string): Team => ({ id, name, short_name });

export const SEASON_SCHEDULE: ScheduleEntry[] = [
  { matchday: 1, opponent: team('tm_9816777', 'Widad Temara', 'WST'), home: true },
  { matchday: 2, opponent: team('tm_551225', 'Difaâ Hassani El-Jadidi', 'DHJ'), home: false },
  { matchday: 3, opponent: team('tm_446704', 'CODM Meknès', 'CODM'), home: true },
  { matchday: 4, opponent: team('tm_4629780', 'Union Sportive Amal Tiznit', 'USAT'), home: true },
  { matchday: 5, opponent: team('tm_0178775', 'Union Touarga Sport', 'UTS'), home: false },
  { matchday: 6, opponent: team('tm_773955', 'Moghreb Atlético Tetuán', 'MAT'), home: true },
  { matchday: 7, opponent: team('tm_602409', 'Kawkab Athletic Club Marrakech', 'KACM'), home: false },
  { matchday: 8, opponent: team('tm_029484', 'AS FAR Rabat', 'FAR'), home: true },
  { matchday: 9, opponent: team('tm_5227823', 'Renaissance Zemamra', 'RCAZ'), home: false },
  { matchday: 10, opponent: team('tm_446779', 'MAS de Fès', 'MAS'), home: true },
  { matchday: 11, opponent: team('tm_327682', 'Raja Club Athletic', 'RCA'), home: false },
  { matchday: 12, opponent: team('tm_773999', "Hassania d'Agadir", 'HUSA'), home: true },
  { matchday: 13, opponent: team('tm_4560072', 'RS Berkane', 'RSB'), home: false },
  { matchday: 14, opponent: team('tm_1309697', 'Ittihad Tanger', 'IRT'), home: true },
  { matchday: 15, opponent: team('tm_337870', 'Fath Union Sport', 'FUS'), home: false },
];
