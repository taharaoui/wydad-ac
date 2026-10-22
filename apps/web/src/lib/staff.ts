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
}

export const STAFF: StaffMember[] = [
  {
    name: 'Nasreddine Nabi',
    name_ar: 'نصر الدين النابي',
    role: { fr: 'Entraîneur principal', en: 'Head coach', ar: 'المدرب الرئيسي' },
    category: 'technical',
    head: true,
    nationality: { fr: 'Tunisie', en: 'Tunisia', ar: 'تونس' },
  },
];
