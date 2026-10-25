import type { Creator, Episode, Show } from './types';
import { WAC_CHANNEL_ID } from '@/lib/videos';

/**
 * Catalogue of Wydad Live. The official channel is real (its videos and live status come from
 * YouTube). The partner creator is configured through environment variables, never hard-coded.
 * Everything marked `demo` is sample content to show the experience before shows launch.
 */

export const OFFICIAL_CREATOR: Creator = {
  slug: 'wydad-tv',
  name: 'Wydad TV',
  role: { fr: 'Chaîne officielle du club', en: 'Official club channel', ar: 'القناة الرسمية للنادي' },
  bio: {
    fr: 'Les coulisses, conférences de presse, entraînements et matchs du Wydad Athletic Club, en direct de la chaîne YouTube officielle.',
    en: 'Behind the scenes, press conferences, training and matches of Wydad Athletic Club, straight from the official YouTube channel.',
    ar: 'الكواليس والندوات الصحفية والتداريب والمباريات، مباشرة من القناة الرسمية للوداد الرياضي على يوتيوب.',
  },
  avatar: '/images/crest.png',
  youtubeChannelId: WAC_CHANNEL_ID,
  links: [{ label: 'YouTube', url: 'https://www.youtube.com/@WACofficiel' }],
};

/**
 * Partner creator (e.g. the YouTuber the club is talking to), only once configured:
 * LIVE_PARTNER_NAME, LIVE_PARTNER_YOUTUBE_CHANNEL_ID (UC…), optional LIVE_PARTNER_URL / LIVE_PARTNER_AVATAR.
 */
export function partnerCreator(): Creator | null {
  const name = process.env.LIVE_PARTNER_NAME?.trim();
  const channel = process.env.LIVE_PARTNER_YOUTUBE_CHANNEL_ID?.trim();
  if (!name || !channel || !/^UC[\w-]{22}$/.test(channel)) return null;
  const url = process.env.LIVE_PARTNER_URL?.trim() || `https://www.youtube.com/channel/${channel}`;
  return {
    slug: 'partenaire',
    name,
    role: { fr: 'Créateur partenaire', en: 'Partner creator', ar: 'صانع محتوى شريك' },
    bio: {
      fr: `${name} anime des émissions Wydadi : lives, débats et analyses.`,
      en: `${name} hosts Wydadi shows: live streams, debates and analysis.`,
      ar: `${name} يقدم برامج ودادية: بث مباشر ونقاشات وتحليلات.`,
    },
    avatar: process.env.LIVE_PARTNER_AVATAR?.trim() || undefined,
    youtubeChannelId: channel,
    links: [{ label: 'YouTube', url }],
  };
}

/** Shown while no partner is configured: an open seat, not an invented person */
export const PARTNER_PLACEHOLDER: Creator = {
  slug: 'partenaire',
  name: 'Créateur partenaire',
  role: { fr: 'À annoncer', en: 'To be announced', ar: 'سيعلن عنه' },
  bio: {
    fr: 'Une voix de la communauté wydadie rejoindra bientôt Wydad Live pour animer des émissions en direct.',
    en: 'A voice from the Wydadi community will soon join Wydad Live to host live shows.',
    ar: 'صوت من الجماهير الودادية سينضم قريبا إلى Wydad Live لتقديم برامج مباشرة.',
  },
  links: [],
  demo: true,
};

export const OFFICIAL_SHOW: Show = {
  slug: 'wydad-tv',
  title: { fr: 'Wydad TV', en: 'Wydad TV', ar: 'وداد TV' },
  tagline: { fr: 'La chaîne officielle', en: 'The official channel', ar: 'القناة الرسمية' },
  description: {
    fr: 'Conférences de presse, coulisses des matchs, entraînements et entretiens : tout ce que publie la chaîne officielle du club.',
    en: 'Press conferences, matchday access, training and interviews: everything the club’s official channel publishes.',
    ar: 'الندوات الصحفية وكواليس المباريات والتداريب والحوارات: كل ما تنشره القناة الرسمية للنادي.',
  },
  category: 'official',
  creatorSlugs: ['wydad-tv'],
  cover: '/images/club/stade-mohammed-v.webp',
};

export const PARTNER_SHOW = (creator: Creator): Show => ({
  slug: 'partenaire',
  title: { fr: creator.name, en: creator.name, ar: creator.name },
  tagline: { fr: 'Créateur partenaire', en: 'Partner creator', ar: 'صانع محتوى شريك' },
  description: creator.bio,
  category: 'talk',
  creatorSlugs: [creator.slug],
});

/** Sample shows: formats to launch, clearly labelled "Démo" on screen */
export const DEMO_SHOWS: Show[] = [
  {
    slug: 'le-talk-wydadi',
    title: { fr: 'Le Talk Wydadi', en: 'The Wydadi Talk', ar: 'التوك الودادي' },
    tagline: { fr: 'Le débat d’après-match', en: 'The post-match debate', ar: 'نقاش ما بعد المباراة' },
    description: {
      fr: 'Après chaque match, supporters et invités refont la rencontre en direct, avec les questions du chat.',
      en: 'After every game, fans and guests replay the match live, taking questions from the chat.',
      ar: 'بعد كل مباراة، يعيد المشجعون والضيوف قراءة اللقاء مباشرة مع أسئلة الدردشة.',
    },
    category: 'talk',
    creatorSlugs: ['partenaire'],
    slot: { fr: 'Après chaque match', en: 'After every match', ar: 'بعد كل مباراة' },
    demo: true,
  },
  {
    slug: 'tableau-noir',
    title: { fr: 'Tableau noir', en: 'Blackboard', ar: 'السبورة' },
    tagline: { fr: 'L’analyse tactique', en: 'Tactical analysis', ar: 'التحليل التكتيكي' },
    description: {
      fr: 'Schémas, séquences clés et choix du staff : on décortique le jeu du Wydad, image par image.',
      en: 'Shapes, key sequences and coaching choices: Wydad’s play, broken down frame by frame.',
      ar: 'الخطط واللقطات الحاسمة واختيارات الطاقم: تفكيك لعب الوداد لقطة بلقطة.',
    },
    category: 'analysis',
    creatorSlugs: ['partenaire'],
    slot: { fr: 'Mercredi · 21:00', en: 'Wednesday · 21:00', ar: 'الأربعاء · 21:00' },
    demo: true,
  },
  {
    slug: 'histoires-rouges',
    title: { fr: 'Histoires rouges', en: 'Red Stories', ar: 'حكايات حمراء' },
    tagline: { fr: 'La mémoire du club', en: 'The club’s memory', ar: 'ذاكرة النادي' },
    description: {
      fr: 'Grands matchs, figures historiques et récits de tribune, racontés par celles et ceux qui les ont vécus.',
      en: 'Great matches, historic figures and stories from the stands, told by those who lived them.',
      ar: 'مباريات كبيرة ووجوه تاريخية وحكايات المدرجات، يرويها من عاشوها.',
    },
    category: 'stories',
    creatorSlugs: ['partenaire'],
    slot: { fr: 'Dimanche · 19:00', en: 'Sunday · 19:00', ar: 'الأحد · 19:00' },
    demo: true,
  },
  {
    slug: 'matchday-live',
    title: { fr: 'Matchday Live', en: 'Matchday Live', ar: 'Matchday Live' },
    tagline: { fr: 'L’avant-match', en: 'The build-up', ar: 'ما قبل المباراة' },
    description: {
      fr: 'Compositions, ambiance au stade et pronostics de la communauté, jusqu’au coup d’envoi.',
      en: 'Line-ups, stadium atmosphere and community predictions, right up to kick-off.',
      ar: 'التشكيلات وأجواء الملعب وتوقعات الجماهير، حتى صافرة البداية.',
    },
    category: 'matchday',
    creatorSlugs: ['partenaire'],
    slot: { fr: 'Les jours de match', en: 'On matchdays', ar: 'أيام المباريات' },
    demo: true,
  },
];

/** Next occurrence of a weekday at an hour, Moroccan time (UTC+0 since 20 Sep 2026) */
function next(weekday: number, hour: number, now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour));
  while (d.getUTCDay() !== weekday || d <= now) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

/** Sample schedule and replays for the demo shows (dates relative to today, all flagged demo) */
export function demoEpisodes(now = new Date()): Episode[] {
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
  return [
    { id: 'demo-tableau-noir-1', showSlug: 'tableau-noir', title: 'Le pressing de Nabi décrypté', status: 'upcoming', date: next(3, 21, now), demo: true },
    { id: 'demo-histoires-1', showSlug: 'histoires-rouges', title: '1992 : la première étoile africaine', status: 'upcoming', date: next(0, 19, now), demo: true },
    { id: 'demo-talk-1', showSlug: 'le-talk-wydadi', title: 'Le débrief de la journée', status: 'replay', date: daysAgo(1), demo: true },
    { id: 'demo-matchday-1', showSlug: 'matchday-live', title: 'Avant-match en direct du stade', status: 'replay', date: daysAgo(2), demo: true },
    { id: 'demo-histoires-0', showSlug: 'histoires-rouges', title: 'Le Père Jégo et les débuts du football rouge', status: 'replay', date: daysAgo(6), demo: true },
  ];
}
