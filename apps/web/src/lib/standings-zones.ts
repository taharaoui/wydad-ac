/**
 * Botola Pro table zones (16 clubs). Edit the positions here if the league changes its rules.
 * 1st is champion and goes to the CAF Champions League with 2nd; 3rd goes to the CAF Confederation Cup;
 * 13th–14th play the relegation play-off; 15th–16th go down.
 */
export type Zone = 'champion' | 'champions_league' | 'confederation_cup' | 'playoff' | 'relegation';

const ZONE_BY_POSITION: Record<number, Zone> = {
  1: 'champion',
  2: 'champions_league',
  3: 'confederation_cup',
  13: 'playoff',
  14: 'playoff',
  15: 'relegation',
  16: 'relegation',
};

export function zoneFor(position: number): Zone | undefined {
  return ZONE_BY_POSITION[position];
}

/** Fill for the position cell, darkest green for the title down to red for relegation. */
export const ZONE_CELL: Record<Zone, string> = {
  champion: 'bg-[#15803d] text-white',
  champions_league: 'bg-[#22c55e] text-[#052e14]',
  confederation_cup: 'bg-[#86efac] text-[#052e14]',
  playoff: 'bg-[#fde047] text-[#3f2d00]',
  relegation: 'bg-[#f87171] text-[#450a0a]',
};

/** Legend order */
export const ZONES: Zone[] = ['champion', 'champions_league', 'confederation_cup', 'playoff', 'relegation'];
