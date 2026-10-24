import type { SearchEntry } from '@/lib/search';
import type { MenuNode, NavLink } from '@/lib/navigation-config';

export interface HeaderData {
  search: SearchEntry[];
  /** Side menu tree and top-bar links (CMS navigation, else the bundled config) */
  menu: MenuNode[];
  bar: NavLink[];
}
