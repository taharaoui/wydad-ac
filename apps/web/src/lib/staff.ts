/**
 * First-team staff, as announced by the club. Add members here once official; a category tab
 * appears on the staff page as soon as it has someone in it. Photos go in public/images/staff/.
 */
export type L10n = { ar: string; fr: string; en: string };

export type StaffCategory = 'technical' | 'team_managers' | 'performance' | 'medical' | 'video' | 'equipment';

export const STAFF_CATEGORIES: StaffCategory[] = ['technical', 'team_managers', 'performance', 'medical', 'video', 'equipment'];

export interface StaffMember {
  name: string;
  /** Arabic spelling for the AR pages */
  name_ar?: string;
  role: L10n;
  category: StaffCategory;
  /** The head coach leads the page */
  head?: boolean;
  nationality?: L10n;
  photo?: string;
  /** News article announcing the appointment */
  statement?: string;
}

export const STAFF: StaffMember[] = [
  {
    name: 'Nasreddine Nabi',
    name_ar: 'نصر الدين نابي',
    role: { fr: 'Entraîneur principal', en: 'Head coach', ar: 'المدرب الرئيسي' },
    category: 'technical',
    head: true,
    nationality: { fr: 'Tunisie', en: 'Tunisia', ar: 'تونس' },
    /** Appointed until the end of the 2026-27 season (club statement, 22 Oct 2026) */
    statement: '/news/nasreddine-nabi-entraineur',
  },
];

/**
 * Training-ground portraits of the new first-team staff (club photos, Oct 2026, WebP). Names are
 * added to STAFF above once confirmed; until then they show as a gallery on the staff page.
 */
export const STAFF_PHOTOS: { src: string; width: number; height: number }[] = [
  { src: '/images/staff/staff-1.webp', width: 1200, height: 1200 },
  { src: '/images/staff/staff-2.webp', width: 900, height: 1200 },
  { src: '/images/staff/staff-3.webp', width: 668, height: 668 },
  { src: '/images/staff/staff-4.webp', width: 900, height: 1200 },
  { src: '/images/staff/staff-5.webp', width: 668, height: 668 },
  { src: '/images/staff/staff-6.webp', width: 668, height: 668 },
];
