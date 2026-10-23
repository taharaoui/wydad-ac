import type { Match, StandingRow, Player, NewsArticle, Lineup } from '@/types';

// ── Teams ──
export const WYDAD = {
  id: 'wydad',
  name: 'الوداد الرياضي',
  short_name: 'Wydad',
  logo_url: '/clubs/tm_805667.svg',
};

export const BOTOLA_TEAMS = {
  raja: { id: 'raja', name: 'الرجاء الرياضي', short_name: 'RCA', logo_url: '/clubs/tm_327682.svg' },
  far: { id: 'far', name: 'الجيش الملكي', short_name: 'FAR', logo_url: '/clubs/tm_029484.svg' },
  rsk: { id: 'rsk', name: 'النهضة البركانية', short_name: 'RSB', logo_url: '/clubs/tm_4560072.svg' },
  maz: { id: 'maz', name: 'المغرب الفاسي', short_name: 'MAS', logo_url: '/clubs/tm_446779.svg' },
  hus: { id: 'hus', name: 'حسنية أكادير', short_name: 'HUSA', logo_url: '/clubs/tm_773999.svg' },
  ocs: { id: 'ocs', name: 'أولمبيك آسفي', short_name: 'OCS', logo_url: '/clubs/oc-safi.svg' },
  fus: { id: 'fus', name: 'الفتح الرباطي', short_name: 'FUS', logo_url: '/clubs/tm_337870.svg' },
  uck: { id: 'uck', name: 'أولمبيك خريبكة', short_name: 'OCK', logo_url: undefined },
  cra: { id: 'cra', name: 'شباب الريف الحسيمي', short_name: 'CRA', logo_url: undefined },
  dhj: { id: 'dhj', name: 'الدفاع الحسني الجديدي', short_name: 'DHJ', logo_url: '/clubs/tm_551225.svg' },
  mat: { id: 'mat', name: 'المغرب التطواني', short_name: 'MAT', logo_url: '/clubs/tm_773955.png' },
  yas: { id: 'yas', name: 'يوسفية برشيد', short_name: 'YSB', logo_url: undefined },
  kac: { id: 'kac', name: 'الكوكب المراكشي', short_name: 'KACM', logo_url: '/clubs/tm_602409.svg' },
  rak: { id: 'rak', name: 'شباب المحمدية', short_name: 'SCC', logo_url: undefined },
  utsm: { id: 'utsm', name: 'اتحاد طنجة', short_name: 'IRT', logo_url: '/clubs/tm_1309697.svg' },
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
      groups: [
        {
          key: 'overview',
          rows: [
            { key: 'ball_possession', home: 56, away: 44, unit: 'percent' },
            { key: 'expected_goals', home: 1.84, away: 0.92, unit: 'decimal' },
            { key: 'total_shots', home: 14, away: 9, unit: 'count' },
            { key: 'shots_on_target', home: 6, away: 3, unit: 'count' },
            { key: 'corner_kicks', home: 7, away: 4, unit: 'count' },
            { key: 'fouls', home: 12, away: 15, unit: 'count' },
            { key: 'yellow_cards', home: 1, away: 2, unit: 'count' },
          ],
        },
        {
          key: 'attack',
          rows: [{ key: 'offsides', home: 2, away: 3, unit: 'count' }],
        },
      ],
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
    // Official club statement, 22 Oct 2026
    id: 'news-wac-nabi-2026-10',
    slug: 'nasreddine-nabi-entraineur',
    title: {
      ar: 'تعيين الإطار التونسي نصر الدين نابي مدرباً للفريق الأول',
      fr: 'Le Tunisien Nasreddine Nabi nommé entraîneur de l’équipe première',
      en: 'Tunisian coach Nasreddine Nabi appointed first-team head coach',
    },
    excerpt: {
      ar: 'يعلن نادي الوداد الرياضي عن تعيين الإطار التونسي نصر الدين نابي مدربا للفريق الأول، وذلك إلى غاية نهاية الموسم الرياضي الحالي.',
      fr: 'Le Wydad Athletic Club annonce la nomination du technicien tunisien Nasreddine Nabi au poste d’entraîneur de l’équipe première, jusqu’à la fin de la saison en cours.',
      en: 'Wydad Athletic Club announces the appointment of Tunisian coach Nasreddine Nabi as first-team head coach until the end of the current season.',
    },
    body: {
      ar: 'ويعكس هذا التعيين توجه النادي نحو الاستفادة من خبرة الإطار نصر الدين نابي وكفاءته التدريبية، لقيادة الفريق الأول خلال المرحلة المقبلة، والعمل على تطوير أدائه وتعزيز حضوره التنافسي في مختلف الاستحقاقات.\n\nوإذ يرحب نادي الوداد الرياضي بمدربه نصر الدين نابي، فإنه يتمنى له كامل التوفيق والنجاح في مهامه، والمساهمة في تحقيق الأهداف المسطرة والاستجابة لتطلعات الجماهير الودادية.',
      fr: 'Cette nomination traduit la volonté du club de s’appuyer sur l’expérience et les compétences de Nasreddine Nabi pour diriger l’équipe première lors de la période à venir, améliorer ses performances et renforcer sa compétitivité dans toutes les compétitions.\n\nEn souhaitant la bienvenue à son entraîneur Nasreddine Nabi, le Wydad Athletic Club lui adresse tous ses vœux de réussite dans ses missions, pour atteindre les objectifs fixés et répondre aux attentes des supporters wydadis.',
      en: 'The appointment reflects the club’s wish to draw on Nasreddine Nabi’s experience and coaching ability to lead the first team in the period ahead, improve its performances and strengthen its competitiveness across all competitions.\n\nIn welcoming its new coach Nasreddine Nabi, Wydad Athletic Club wishes him every success in his role, in reaching the objectives set and in meeting the expectations of the Wydad supporters.',
    },
    category: 'club',
    cover_image_url: '/images/news/nasreddine-nabi-appointment.jpg',
    cover_position: '28% 35%',
    published_at: '2026-10-22T17:00:00Z',
    read_time_minutes: 1,
    author: 'Wydad Athletic Club',
  },
  {
    // Officials appointed for Union Touarga Sport vs Wydad, 22 Oct 2026
    id: 'news-officials-uts-wac-2026',
    slug: 'arbitres-touarga-wydad',
    title: {
      ar: 'هشام التمسماني حكماً لمباراة إتحاد تواركة والوداد الرياضي',
      fr: 'Hicham Temsamani au sifflet de Touarga – Wydad',
      en: 'Hicham Temsamani to referee Touarga vs Wydad',
    },
    excerpt: {
      ar: 'عُيّن هشام التمسماني لقيادة مباراة إتحاد تواركة والوداد الرياضي، يوم السبت 24 أكتوبر على الساعة السادسة مساءً، برسم الجولة الخامسة من البطولة الاحترافية.',
      fr: 'Hicham Temsamani dirigera la rencontre entre l’Union Touarga Sport et le Wydad, samedi 24 octobre à 18h, pour la 5e journée de Botola Pro.',
      en: 'Hicham Temsamani will take charge of Union Touarga Sport vs Wydad on Saturday 24 October at 6pm, on Botola Pro matchday 5.',
    },
    body: {
      ar: 'وسيتواجد سليمان العاطفي في غرفة الفار.',
      fr: 'Soulaimane El Atifi officiera dans la salle de la VAR.',
      en: 'Soulaimane El Atifi will be in the VAR room.',
    },
    category: 'club',
    match_id: 'mt_468151508',
    published_at: '2026-10-22T14:00:00Z',
    read_time_minutes: 1,
    author: 'Wydad Athletic Club',
  },
  {
    // Official club statement, 22 Oct 2026
    id: 'news-wac-coach-2026-10',
    slug: 'paulo-sergio-depart-accord',
    title: {
      ar: 'الوداد ينهي ارتباطه بالمدرب باولو سيرجيو بالتراضي',
      fr: 'Le Wydad et Paulo Sérgio se séparent d’un commun accord',
      en: 'Wydad and Paulo Sérgio part ways by mutual agreement',
    },
    excerpt: {
      ar: 'يعلن نادي الوداد الرياضي عن توصله إلى اتفاق مع المدرب باولو سيرجيو بيريتو يقضي بفسخ العقد الذي يربط الطرفين بالتراضي.',
      fr: 'Le Wydad Athletic Club annonce être parvenu à un accord avec l’entraîneur Paulo Sérgio pour mettre fin, à l’amiable, au contrat qui liait les deux parties.',
      en: 'Wydad Athletic Club has reached an agreement with head coach Paulo Sérgio to terminate the contract between the two parties by mutual consent.',
    },
    body: {
      ar: 'وبهذه المناسبة، يتقدم النادي بخالص الشكر والتقدير للمدرب على ما قدمه خلال فترة إشرافه على الفريق، متمنياً له كامل التوفيق والنجاح في مسيرته المهنية.',
      fr: 'À cette occasion, le club adresse ses sincères remerciements à l’entraîneur pour le travail accompli durant sa période à la tête de l’équipe, et lui souhaite pleine réussite dans la suite de sa carrière.',
      en: 'The club extends its sincere thanks and appreciation to the coach for his work during his time in charge of the team, and wishes him every success in the rest of his career.',
    },
    category: 'club',
    cover_image_url: '/images/news/paulo-sergio-thank-you.jpg',
    cover_position: '72% 22%',
    cover_orientation: 'portrait',
    published_at: '2026-10-22T12:00:00Z',
    read_time_minutes: 1,
    author: 'Wydad Athletic Club',
  },
  {
    id: 'news-wac-usat-2026',
    slug: 'wydad-amal-tiznit-1-1',
    title: {
      ar: 'تعثر جديد: الوداد يسقط في فخ التعادل أمام أمل تيزنيت',
      fr: "Nouveau faux pas : le Wydad tenu en échec par l'Amal Tiznit",
      en: 'Another slip: Wydad held by Amal Tiznit',
    },
    excerpt: {
      ar: 'اكتفى الوداد بالتعادل بهدف لمثله أمام أمل تيزنيت بملعب محمد الخامس، في الجولة الرابعة من البطولة الاحترافية.',
      fr: "Le Wydad a dû se contenter d'un nul 1-1 face à l'Amal Tiznit au complexe Mohammed V, lors de la 4e journée de Botola Pro.",
      en: 'Wydad had to settle for a 1-1 draw against Amal Tiznit at the Mohammed V complex on Botola Pro matchday 4.',
    },
    body: {
      ar: 'لم ينجح الوداد الرياضي في تحقيق الفوز أمام جماهيره، بعدما فرض عليه أمل تيزنيت التعادل بهدف لمثله على أرضية مركب محمد الخامس بالدار البيضاء، برسم الجولة الرابعة من البطولة الاحترافية.\n\nافتتح الضيوف التسجيل في الدقيقة 53 عن طريق زكرياء الصالحي من ضربة جزاء.\n\nوردّ الوداد بعد تسع دقائق فقط، حين عادل سيلفير غانفولا النتيجة في الدقيقة 62 من ضربة جزاء أيضاً.\n\nبهذه النتيجة يرفع الوداد رصيده إلى 5 نقاط في المركز التاسع، فيما يصل أمل تيزنيت إلى 4 نقاط في المركز الحادي عشر.',
      fr: "Le Wydad Athletic Club n'a pas réussi à s'imposer devant son public. Au complexe Mohammed V de Casablanca, les Rouges ont été accrochés par l'Amal Tiznit (1-1), en clôture de la 4e journée de Botola Pro.\n\nLes visiteurs ont frappé les premiers : à la 53e minute, Zakaria Salhi a transformé un penalty pour donner l'avantage à Tiznit.\n\nLa réaction est venue neuf minutes plus tard. À la 62e, Silvère Ganvoula a lui aussi converti un penalty pour remettre les deux équipes à égalité.\n\nAvec ce nul, le Wydad compte 5 points et pointe à la 9e place. L'Amal Tiznit passe à 4 unités, au 11e rang.",
      en: "Wydad Athletic Club could not get the win in front of their own fans. At the Mohammed V complex in Casablanca, the Reds were held 1-1 by Amal Tiznit on Botola Pro matchday 4.\n\nThe visitors struck first: Zakaria Salhi converted a penalty in the 53rd minute to put Tiznit ahead.\n\nWydad answered nine minutes later, with Silvère Ganvoula also scoring from the spot in the 62nd minute to level the game.\n\nThe draw takes Wydad to 5 points in 9th place, while Amal Tiznit move up to 4 points in 11th.",
    },
    category: 'match_report',
    cover_image_url: '/images/news/wydad-amal-tiznit-lineup.jpg',
    cover_position: 'center 78%',
    match_id: 'mt_371866534',
    published_at: '2026-10-18T22:15:00Z',
    read_time_minutes: 2,
    author: 'Wydad Athletic Club',
  },
];
