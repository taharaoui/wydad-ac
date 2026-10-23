/**
 * Club identity helpers shared by server and client code.
 * Crest files live in public/clubs/{team_id}.svg (or .png), named by TheStatsAPI team id.
 */

/** Wydad's live API id, plus the id used in mock data. */
const WYDAD_IDS = new Set(['tm_805667', 'wydad', 'tm_83439338']);

export function isWydad(teamId: string): boolean {
  return WYDAD_IDS.has(teamId);
}

/** Botola Pro 2026/27 clubs with a vector crest in public/clubs/{id}.svg. */
const SVG_CRESTS = new Set([
  'tm_805667', // Wydad Casablanca
  'tm_327682', // Raja Club Athletic
  'tm_029484', // AS FAR Rabat
  'tm_4560072', // RS Berkane
  'tm_446779', // MAS de Fès
  'tm_773999', // Hassania d'Agadir
  'tm_602409', // Kawkab Athletic Club Marrakech
  'tm_446704', // CODM Meknès
  'tm_1309697', // Ittihad Tanger
  'tm_0178775', // Union Touarga Sport
  'tm_551225', // Difaâ Hassani El-Jadidi
  'tm_337870', // Fath Union Sport
  'tm_5227823', // Renaissance Zemamra
]);

/** Clubs that only have a raster crest, public/clubs/{id}.png. */
const PNG_CRESTS = new Set([
  'tm_4629780', // Union Sportive Amal Tiznit
  'tm_773955', // Moghreb Atlético Tetuán
  'tm_9816777', // Widad Temara
]);

/** Crests for clubs outside this season's API data, matched by name if they show up. */
const NAMED_CRESTS: [RegExp, string][] = [
  [/safi|آسفي/i, '/clubs/oc-safi.svg'],
  [/dcheira|الدشيرة/i, '/clubs/olympique-dcheira.svg'],
  [/mansour|المنصور/i, '/clubs/union-yacoub-el-mansour.svg'],
];

/** Short names for tight spots (match cards), the way psg.fr writes "Paris" or "Lyon". */
const SHORT_NAMES: Record<string, string> = {
  tm_805667: 'Wydad',
  tm_83439338: 'Wydad Espoirs',
  wydad: 'Wydad',
  tm_327682: 'Raja',
  tm_029484: 'AS FAR',
  tm_4560072: 'Berkane',
  tm_446779: 'MAS Fès',
  tm_773999: 'Hassania',
  tm_602409: 'Kawkab',
  tm_446704: 'CODM',
  tm_1309697: 'Tanger',
  tm_0178775: 'Touarga',
  tm_551225: 'El Jadida',
  tm_4629780: 'Tiznit',
  tm_773955: 'Tétouan',
  tm_9816777: 'Temara',
  tm_337870: 'FUS Rabat',
  tm_5227823: 'Zemamra',
};

export function clubShortName(team: { id: string; name: string }): string {
  return SHORT_NAMES[team.id] ?? team.name;
}

export function clubCrestUrl(teamId: string, teamName?: string): string | undefined {
  // The Espoir (U23) team wears the club crest
  const id = teamId === 'wydad' || teamId === 'tm_83439338' ? 'tm_805667' : teamId;
  if (SVG_CRESTS.has(id)) return `/clubs/${id}.svg`;
  if (PNG_CRESTS.has(id)) return `/clubs/${id}.png`;
  return teamName ? NAMED_CRESTS.find(([re]) => re.test(teamName))?.[1] : undefined;
}
