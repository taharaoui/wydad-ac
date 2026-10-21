import type { Match, StandingRow, Player, NewsArticle, Lineup } from '@/types';

// ── Teams ──
export const WYDAD = {
  id: 'wydad',
  name: 'الوداد الرياضي',
  short_name: 'WAC',
  logo_url: '/clubs/wydad.svg',
};

export const BOTOLA_TEAMS = {
  raja: { id: 'raja', name: 'الرجاء الرياضي', short_name: 'RCA', logo_url: '/clubs/raja.svg' },
  far: { id: 'far', name: 'الجيش الملكي', short_name: 'FAR', logo_url: '/clubs/far.svg' },
  rsk: { id: 'rsk', name: 'النهضة البركانية', short_name: 'RSB', logo_url: '/clubs/rsb.svg' },
  maz: { id: 'maz', name: 'المغرب الفاسي', short_name: 'MAS', logo_url: '/clubs/mas.svg' },
  hus: { id: 'hus', name: 'حسنية أكادير', short_name: 'HUSA', logo_url: '/clubs/husa.svg' },
  ocs: { id: 'ocs', name: 'أولمبيك آسفي', short_name: 'OCS', logo_url: '/clubs/ocs.svg' },
  fus: { id: 'fus', name: 'الفتح الرباطي', short_name: 'FUS', logo_url: '/clubs/fus.svg' },
  uck: { id: 'uck', name: 'أولمبيك خريبكة', short_name: 'OCK', logo_url: '/clubs/ock.svg' },
  cra: { id: 'cra', name: 'شباب الريف الحسيمي', short_name: 'CRA', logo_url: '/clubs/cra.svg' },
  dhj: { id: 'dhj', name: 'الدفاع الحسني الجديدي', short_name: 'DHJ', logo_url: '/clubs/dhj.svg' },
  mat: { id: 'mat', name: 'المغرب التطواني', short_name: 'MAT', logo_url: '/clubs/mat.svg' },
  yas: { id: 'yas', name: 'يوسفية برشيد', short_name: 'YSB', logo_url: '/clubs/ysb.svg' },
  kac: { id: 'kac', name: 'الكوكب المراكشي', short_name: 'KACM', logo_url: '/clubs/kacm.svg' },
  rak: { id: 'rak', name: 'شباب المحمدية', short_name: 'SCC', logo_url: '/clubs/scc.svg' },
  utsm: { id: 'utsm', name: 'اتحاد طنجة', short_name: 'IRT', logo_url: '/clubs/irt.svg' },
} as const;

const BOTOLA = {
  id: 'botola-pro',
  name: 'البطولة الاحترافية',
  short_name: 'Botola Pro',
  country: 'Morocco',
};

// ── Mock Matches ──
export const mockMatches: Match[] = [
  {
    id: 'match-1',
    competition: BOTOLA,
    home_team: WYDAD,
    away_team: BOTOLA_TEAMS.raja,
    status: 'finished',
    kickoff: '2026-10-15T20:00:00Z',
    venue: 'ملعب محمد الخامس',
    matchday: 8,
    score_home: 2,
    score_away: 1,
    minute: null,
    events: [
      { id: 'e1', type: 'goal', minute: 23, player_name: 'جلال الداودي', team_id: 'wydad' },
      { id: 'e2', type: 'yellow_card', minute: 37, player_name: 'يحيى الجبلي', team_id: 'raja' },
      { id: 'e3', type: 'goal', minute: 55, player_name: 'بن شرقي', team_id: 'raja' },
      { id: 'e4', type: 'goal', minute: 78, player_name: 'أيمن الحسوني', team_id: 'wydad' },
    ],
    stats: {
      possession_home: 56,
      possession_away: 44,
      shots_home: 14,
      shots_away: 9,
      shots_on_target_home: 6,
      shots_on_target_away: 3,
      corners_home: 7,
      corners_away: 4,
      fouls_home: 12,
      fouls_away: 15,
      offsides_home: 2,
      offsides_away: 3,
    },
    home_lineup: {
      formation: '4-3-3',
      players: [
        { id: 'p1', name: 'أحمد رضا التقنوتي', short_name: 'التقنوتي', number: 1, position: 'goalkeeper', is_starter: true },
        { id: 'lp2', name: 'يحيى عطية الله', short_name: 'عطية الله', number: 3, position: 'defender', is_starter: true },
        { id: 'lp3', name: 'مصطفى بابادي', short_name: 'بابادي', number: 4, position: 'defender', is_starter: true, is_captain: true },
        { id: 'lp4', name: 'شمس الدين', short_name: 'شمس الدين', number: 5, position: 'defender', is_starter: true },
        { id: 'lp5', name: 'نبيل جعيدي', short_name: 'جعيدي', number: 2, position: 'defender', is_starter: true },
        { id: 'lp6', name: 'سيدي بوزيد', short_name: 'بوزيد', number: 6, position: 'midfielder', is_starter: true },
        { id: 'lp7', name: 'أيمن الحسوني', short_name: 'الحسوني', number: 7, position: 'midfielder', is_starter: true },
        { id: 'lp8', name: 'يوسف المرابط', short_name: 'المرابط', number: 8, position: 'midfielder', is_starter: true },
        { id: 'lp9', name: 'جلال الداودي', short_name: 'الداودي', number: 9, position: 'forward', is_starter: true },
        { id: 'lp10', name: 'عادل الطاعولي', short_name: 'الطاعولي', number: 11, position: 'forward', is_starter: true, substituted_out: 82 },
        { id: 'lp11', name: 'إبراهيم النقاش', short_name: 'النقاش', number: 10, position: 'forward', is_starter: true },
        { id: 'lp12', name: 'حمزة أكبي', short_name: 'أكبي', number: 14, position: 'midfielder', is_starter: false, substituted_in: 82 },
      ],
    },
    away_lineup: {
      formation: '4-2-3-1',
      players: [
        { id: 'rp1', name: 'أنس الزنيتي', short_name: 'الزنيتي', number: 1, position: 'goalkeeper', is_starter: true },
        { id: 'rp2', name: 'فابريس نغاه', short_name: 'نغاه', number: 2, position: 'defender', is_starter: true },
        { id: 'rp3', name: 'إبراهيم أمزداك', short_name: 'أمزداك', number: 4, position: 'defender', is_starter: true, is_captain: true },
        { id: 'rp4', name: 'عثمان الحراق', short_name: 'الحراق', number: 5, position: 'defender', is_starter: true },
        { id: 'rp5', name: 'آدم نيانغ', short_name: 'نيانغ', number: 3, position: 'defender', is_starter: true },
        { id: 'rp6', name: 'يحيى الجبلي', short_name: 'الجبلي', number: 6, position: 'midfielder', is_starter: true },
        { id: 'rp7', name: 'عبد العزيز بوطالبي', short_name: 'بوطالبي', number: 8, position: 'midfielder', is_starter: true },
        { id: 'rp8', name: 'رحيم أوتاغانت', short_name: 'أوتاغانت', number: 10, position: 'midfielder', is_starter: true },
        { id: 'rp9', name: 'أنور الحسين', short_name: 'الحسين', number: 7, position: 'midfielder', is_starter: true },
        { id: 'rp10', name: 'سفيان رحيمي', short_name: 'رحيمي', number: 11, position: 'forward', is_starter: true },
        { id: 'rp11', name: 'بن شرقي', short_name: 'بن شرقي', number: 9, position: 'forward', is_starter: true },
      ],
    },
  },
  {
    id: 'match-2',
    competition: BOTOLA,
    home_team: BOTOLA_TEAMS.far,
    away_team: WYDAD,
    status: 'finished',
    kickoff: '2026-10-08T18:00:00Z',
    venue: 'ملعب مولاي عبد الله',
    matchday: 7,
    score_home: 0,
    score_away: 1,
    minute: null,
    events: [
      { id: 'e5', type: 'goal', minute: 64, player_name: 'جلال الداودي', team_id: 'wydad' },
    ],
  },
  {
    id: 'match-next',
    competition: BOTOLA,
    home_team: BOTOLA_TEAMS.hus,
    away_team: WYDAD,
    status: 'scheduled',
    kickoff: '2026-10-25T20:00:00Z',
    venue: 'ملعب أدرار',
    matchday: 9,
    score_home: null,
    score_away: null,
    minute: null,
  },
  {
    id: 'match-next-2',
    competition: BOTOLA,
    home_team: WYDAD,
    away_team: BOTOLA_TEAMS.fus,
    status: 'scheduled',
    kickoff: '2026-11-01T20:00:00Z',
    venue: 'ملعب محمد الخامس',
    matchday: 10,
    score_home: null,
    score_away: null,
    minute: null,
  },
];

// ── Mock Standings ──
export const mockStandings: StandingRow[] = [
  { position: 1, team: WYDAD, played: 8, won: 6, drawn: 1, lost: 1, goals_for: 15, goals_against: 5, goal_difference: 10, points: 19, form: ['W', 'W', 'W', 'D', 'W'] },
  { position: 2, team: BOTOLA_TEAMS.far, played: 8, won: 5, drawn: 2, lost: 1, goals_for: 12, goals_against: 4, goal_difference: 8, points: 17, form: ['W', 'L', 'W', 'W', 'D'] },
  { position: 3, team: BOTOLA_TEAMS.raja, played: 8, won: 5, drawn: 1, lost: 2, goals_for: 11, goals_against: 7, goal_difference: 4, points: 16, form: ['L', 'W', 'W', 'D', 'W'] },
  { position: 4, team: BOTOLA_TEAMS.rsk, played: 8, won: 4, drawn: 3, lost: 1, goals_for: 10, goals_against: 5, goal_difference: 5, points: 15, form: ['D', 'W', 'D', 'W', 'W'] },
  { position: 5, team: BOTOLA_TEAMS.hus, played: 8, won: 4, drawn: 2, lost: 2, goals_for: 9, goals_against: 6, goal_difference: 3, points: 14, form: ['W', 'D', 'L', 'W', 'W'] },
  { position: 6, team: BOTOLA_TEAMS.fus, played: 8, won: 3, drawn: 3, lost: 2, goals_for: 8, goals_against: 7, goal_difference: 1, points: 12, form: ['D', 'W', 'D', 'L', 'W'] },
  { position: 7, team: BOTOLA_TEAMS.dhj, played: 8, won: 3, drawn: 2, lost: 3, goals_for: 7, goals_against: 8, goal_difference: -1, points: 11, form: ['L', 'W', 'W', 'D', 'L'] },
  { position: 8, team: BOTOLA_TEAMS.ocs, played: 8, won: 2, drawn: 4, lost: 2, goals_for: 6, goals_against: 6, goal_difference: 0, points: 10, form: ['D', 'D', 'W', 'L', 'D'] },
];

// ── Mock Players ──
export const mockPlayers: Player[] = [
  { id: 'p1', name: 'أحمد رضا التقنوتي', short_name: 'التقنوتي', number: 1, position: 'goalkeeper', nationality: 'المغرب', date_of_birth: '1993-05-17', height_cm: 190, stats: { appearances: 8, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, minutes_played: 720, clean_sheets: 4 } },
  { id: 'p2', name: 'يحيى عطية الله', short_name: 'عطية الله', number: 3, position: 'defender', nationality: 'المغرب', date_of_birth: '1995-03-02', height_cm: 178, stats: { appearances: 7, goals: 0, assists: 2, yellow_cards: 1, red_cards: 0, minutes_played: 630 } },
  { id: 'p3', name: 'مصطفى بابادي', short_name: 'بابادي', number: 4, position: 'defender', nationality: 'المغرب', date_of_birth: '1997-11-22', height_cm: 185, stats: { appearances: 8, goals: 1, assists: 0, yellow_cards: 2, red_cards: 0, minutes_played: 720 } },
  { id: 'p4', name: 'أيمن الحسوني', short_name: 'الحسوني', number: 7, position: 'midfielder', nationality: 'المغرب', date_of_birth: '1998-06-15', height_cm: 175, stats: { appearances: 8, goals: 4, assists: 3, yellow_cards: 1, red_cards: 0, minutes_played: 690 } },
  { id: 'p5', name: 'جلال الداودي', short_name: 'الداودي', number: 9, position: 'forward', nationality: 'المغرب', date_of_birth: '1999-01-10', height_cm: 182, stats: { appearances: 8, goals: 6, assists: 1, yellow_cards: 0, red_cards: 0, minutes_played: 700 } },
  { id: 'p6', name: 'سيدي بوزيد', short_name: 'بوزيد', number: 5, position: 'midfielder', nationality: 'المغرب', date_of_birth: '1996-09-03', height_cm: 180, stats: { appearances: 7, goals: 1, assists: 2, yellow_cards: 3, red_cards: 0, minutes_played: 600 } },
  { id: 'p7', name: 'أنس الزنيتي', short_name: 'الزنيتي', number: 16, position: 'goalkeeper', nationality: 'المغرب', date_of_birth: '1988-10-28', height_cm: 188, stats: { appearances: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, minutes_played: 0, clean_sheets: 0 } },
  { id: 'p8', name: 'عادل الطاعولي', short_name: 'الطاعولي', number: 11, position: 'forward', nationality: 'المغرب', date_of_birth: '2000-04-20', height_cm: 176, stats: { appearances: 6, goals: 2, assists: 3, yellow_cards: 0, red_cards: 0, minutes_played: 480 } },
];

// ── Mock News ──
export const mockNews: NewsArticle[] = [
  {
    id: 'news-1',
    slug: 'derby-victory-2026',
    title: {
      ar: 'الوداد ينتصر في الديربي بهدفين مقابل هدف',
      fr: 'Le Wydad remporte le derby 2-1',
      en: 'Wydad win the derby 2-1',
    },
    excerpt: {
      ar: 'حقق الوداد الرياضي فوزاً مستحقاً على غريمه التقليدي الرجاء الرياضي بهدفين مقابل هدف في مباراة مثيرة بملعب محمد الخامس.',
      fr: 'Le Wydad AC a remporté une victoire méritée contre son rival traditionnel le Raja CA par 2 buts à 1 dans un match passionnant au stade Mohammed V.',
      en: 'Wydad AC claimed a deserved victory over traditional rivals Raja CA with a 2-1 win in a thrilling match at Mohammed V Stadium.',
    },
    body: {
      ar: 'في مباراة حضرها أكثر من 45,000 متفرج...',
      fr: 'Dans un match suivi par plus de 45 000 spectateurs...',
      en: 'In a match attended by over 45,000 fans...',
    },
    category: 'match_report',
    published_at: '2026-10-15T22:30:00Z',
    read_time_minutes: 4,
    author: 'الموقع الرسمي',
  },
  {
    id: 'news-2',
    slug: 'el-hassouni-form',
    title: {
      ar: 'الحسوني: أعيش أفضل فتراتي مع الوداد',
      fr: 'El Hassouni : Je vis ma meilleure période avec le Wydad',
      en: 'El Hassouni: I\'m living my best period with Wydad',
    },
    excerpt: {
      ar: 'صرح أيمن الحسوني في حديث حصري أنه يعيش أفضل لحظاته الكروية مع الوداد الرياضي هذا الموسم.',
      fr: 'Ayman El Hassouni a déclaré en exclusivité qu\'il vit ses meilleurs moments footballistiques avec le Wydad AC cette saison.',
      en: 'Ayman El Hassouni declared exclusively that he is living his best footballing moments with Wydad AC this season.',
    },
    body: {
      ar: 'في حوار خاص مع الموقع الرسمي...',
      fr: 'Dans un entretien exclusif avec le site officiel...',
      en: 'In an exclusive interview with the official website...',
    },
    category: 'interview',
    published_at: '2026-10-14T10:00:00Z',
    read_time_minutes: 3,
    author: 'الموقع الرسمي',
  },
  {
    id: 'news-3',
    slug: 'away-win-far',
    title: {
      ar: 'الوداد يحقق فوزاً ثميناً خارج الديار أمام الجيش الملكي',
      fr: 'Le Wydad s\'impose à l\'extérieur face au FAR',
      en: 'Wydad claim precious away win against FAR',
    },
    excerpt: {
      ar: 'واصل الوداد مسيرته القوية بتحقيق فوز مهم أمام الجيش الملكي في معقله بهدف نظيف سجله جلال الداودي.',
      fr: 'Le Wydad a poursuivi sa belle série en s\'imposant face au FAR à domicile grâce à un but de Jalal Daoudi.',
      en: 'Wydad continued their strong run with an important away win at FAR, courtesy of a Jalal Daoudi goal.',
    },
    body: {
      ar: 'في مباراة الجولة السابعة من البطولة...',
      fr: 'Lors de la 7e journée du championnat...',
      en: 'In the 7th matchday of the championship...',
    },
    category: 'match_report',
    published_at: '2026-10-08T20:30:00Z',
    read_time_minutes: 3,
    author: 'الموقع الرسمي',
  },
];
