import { fetchInstagramFeed, type InstagramFeed } from './instagram';
import { SECTION_SNAPSHOTS } from './section-snapshots';

/**
 * The club's other sections, each fed by its official Instagram account (read live, local snapshot
 * as fallback). Texts are in the `sections` messages under the section key; highlights retell
 * posts from the account and link to them.
 */
export type SectionKey = 'swimming' | 'boxing' | 'fencing' | 'handball' | 'women' | 'academy' | 'basketball';

export interface SectionHighlight {
  /** Message keys: `{key}.{id}_title` and `{key}.{id}_text` */
  id: string;
  image: string;
  /** ISO date of the source post */
  date: string;
  url: string;
  /** Optional call to action (e.g. a registration form): label key `{key}.{id}_cta` */
  cta?: string;
}

export interface SectionConfig {
  key: SectionKey;
  instagram: string;
  facebook?: string;
  hero: string;
  /** CSS object-position of the hero photo */
  heroPosition?: string;
  highlights: SectionHighlight[];
  /** Extra photos with their own heading (`{key}.gallery_title`), e.g. the swimming archives */
  gallery?: { images: string[]; url: string };
  /** People named by the section, label key `{key}.staff_{role}` */
  staff?: { role: string; name: string }[];
}

const ig = (shortcode: string) => `https://www.instagram.com/p/${shortcode}/`;
const img = (key: SectionKey, file: string) => `/images/sections/${key}/${file}.jpg`;

export const SECTION_PAGES: SectionConfig[] = [
  {
    key: 'swimming',
    instagram: 'wydadnatationofficiel',
    facebook: 'https://www.facebook.com/wydadnatation/',
    hero: img('swimming', 'medal-hero'),
    heroPosition: '50% 35%',
    staff: [
      { role: 'president', name: 'Badreddine Bouchouirab' },
      { role: 'head_coach', name: 'Aymen Riadi' },
      { role: 'coaches', name: 'Karima El Marhar · Monsef Daghai' },
      { role: 'physio', name: 'Khadija Aboutaib' },
    ],
    highlights: [
      { id: 'stage', image: img('swimming', 'Deqp79bMoVb'), date: '2026-10-19', url: ig('Deqp79bMoVb') },
      { id: 'physio', image: img('swimming', 'DeeeOEmjODc'), date: '2026-10-14', url: ig('DeeeOEmjODc') },
      { id: 'internationals', image: img('swimming', 'DePp56FsFQi'), date: '2026-10-08', url: ig('DePp56FsFQi') },
    ],
    gallery: {
      images: ['archive-1', 'archive-2', 'archive-3', 'archive-4'].map((f) => img('swimming', f)),
      url: 'https://www.facebook.com/wydadnatation/photos',
    },
  },
  {
    key: 'boxing',
    instagram: 'wac_boxe',
    hero: img('boxing', 'DemJbrYNKl3'),
    heroPosition: '50% 40%',
    highlights: [
      { id: 'mouti', image: img('boxing', 'Dekt2ivCDMg'), date: '2026-10-16', url: ig('Dekt2ivCDMg') },
      { id: 'training', image: img('boxing', 'DemJbrYNKl3'), date: '2026-10-17', url: ig('DemJbrYNKl3') },
    ],
  },
  {
    key: 'fencing',
    instagram: 'wydadescrime',
    hero: img('fencing', 'DeVJ1i_DLnP'),
    heroPosition: '50% 25%',
    highlights: [
      { id: 'zaimi', image: img('fencing', 'DewaoIpMUUV'), date: '2026-10-21', url: ig('DewaoIpMUUV') },
      { id: 'antidoping', image: img('fencing', 'DezWDfiDCCV'), date: '2026-10-22', url: ig('DezWDfiDCCV') },
      { id: 'next_gen', image: img('fencing', 'Deh223uDCr0'), date: '2026-10-15', url: ig('Deh223uDCr0') },
    ],
  },
  {
    key: 'handball',
    instagram: 'wydadhandballofficiel',
    hero: img('handball', 'DZ2zGgQjKZS'),
    heroPosition: '50% 40%',
    staff: [{ role: 'head_coach', name: 'Abdelmajid Zaouli' }],
    highlights: [{ id: 'coach', image: img('handball', 'Ddrmu6qDp4V'), date: '2026-09-24', url: ig('Ddrmu6qDp4V') }],
  },
  {
    key: 'women',
    instagram: 'wydadacwomen',
    hero: img('women', 'DerRYo-iKzR'),
    heroPosition: '50% 20%',
    highlights: [],
  },
  {
    key: 'academy',
    instagram: 'wydadacschool',
    hero: img('academy', 'DbAnzQzPps6'),
    heroPosition: '50% 40%',
    highlights: [
      { id: 'registrations', image: img('academy', 'Dc_XJqnDm8D'), date: '2026-09-07', url: 'https://app.atlasclubmorocco.com/inscription/INS-Z9UZL5', cta: 'register' },
      { id: 'summer_camp', image: img('academy', 'DbAnzQzPps6'), date: '2026-07-20', url: ig('DbAnzQzPps6') },
    ],
  },
  {
    key: 'basketball',
    instagram: 'wacbasketball',
    hero: img('basketball', 'Dep1utPIiJo'),
    highlights: [
      { id: 'academy', image: img('basketball', 'Dee8jhVRSYE'), date: '2026-10-14', url: 'https://wydadbasketball.ma/inscription/', cta: 'register' },
    ],
  },
];

/** Sections with their own page at /sections/{key} (basketball has its own pages) */
export const SECTION_ROUTES = SECTION_PAGES.filter((s) => s.key !== 'basketball').map((s) => s.key);

export const getSection = (key: string) => SECTION_PAGES.find((s) => s.key === key);

/** Live feed of the section's account, or its snapshot */
export async function getSectionFeed(section: SectionConfig): Promise<InstagramFeed> {
  return (await fetchInstagramFeed(section.instagram)) ?? SECTION_SNAPSHOTS[section.key];
}
