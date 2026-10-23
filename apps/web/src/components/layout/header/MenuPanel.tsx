'use client';

import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { MENU, MEMBER_AREA_URL, SIGN_IN_URL, type MenuNode } from '@/lib/navigation-config';
import { ChevronRightIcon, CloseIcon, UserIcon } from './icons';
import { LanguageSwitch } from './LanguageSwitch';
import { SmartLink } from './SmartLink';
import { useFocusTrap } from './useFocusTrap';

const PANEL_ID = 'menu-level';
/** Width of each column on lg+ */
const COL = 'lg:w-[460px]';

/** Children of the node reached by following `path` from the root */
function nodesAt(path: string[]): MenuNode[] {
  let nodes = MENU;
  for (const key of path) nodes = nodes.find((n) => n.key === key)?.children ?? [];
  return nodes;
}

/**
 * Side menu, after psg.fr: a white panel on the start edge with the main list; choosing an entry
 * with children opens a grey panel beside it (lg+). On smaller screens levels replace each other,
 * with a back button. The page stays visible, dimmed, behind. Focus is trapped while open.
 */
export function MenuPanel({ open, onClose, trigger }: { open: boolean; onClose: () => void; trigger: RefObject<HTMLElement> }) {
  const t = useTranslations('header');
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string[]>([]);

  useFocusTrap(ref, open, onClose, trigger);
  useEffect(() => {
    if (!open) setPath([]);
  }, [open]);

  /** Opens a level; keyboard activation (detail 0) moves focus into it */
  const openLevel = (next: string[]) => (e: MouseEvent) => {
    setPath(next);
    if (e.detail !== 0) return;
    requestAnimationFrame(() => {
      const items = ref.current?.querySelectorAll<HTMLElement>(`[data-level="${next.length}"] a, [data-level="${next.length}"] button`) ?? [];
      // A level can exist twice (side panel on lg+, inline below): focus the visible one
      Array.from(items).find((el) => el.getClientRects().length > 0)?.focus();
    });
  };

  /** One list of the menu; `depth` 0 is the main list */
  const level = (nodes: MenuNode[], depth: number) => (
    <ul data-level={depth}>
      {nodes.map((node) => {
        const selected = path[depth] === node.key;
        const dimmed = depth === 0 && path.length > 0 && !selected;
        const cls = `flex min-h-[64px] w-full items-center justify-between gap-4 font-condensed text-[26px] font-extrabold uppercase leading-none tracking-wide transition-colors ${
          dimmed ? 'text-wydad-charcoal/35 hover:text-wydad-charcoal' : 'text-wydad-charcoal hover:text-wydad-logo'
        }`;
        return (
          <li key={node.key}>
            {node.children ? (
              <button type="button" aria-expanded={selected} aria-controls={PANEL_ID} onClick={openLevel([...path.slice(0, depth), node.key])} className={cls}>
                {t(node.key)}
                <ChevronRightIcon size={22} className={`shrink-0 rtl:rotate-180 ${dimmed ? 'opacity-40' : 'text-wydad-charcoal/60'}`} />
              </button>
            ) : (
              <SmartLink
                href={node.href!}
                onClick={onClose}
                // Anchor links (/club#history) share a path, so only plain links mark the current page
                aria-current={!node.href!.includes('#') && pathname === node.href ? 'page' : undefined}
                className={`${cls} ${dimmed ? '' : 'aria-[current=page]:text-wydad-logo'}`}
              >
                {t(node.key)}
              </SmartLink>
            )}
          </li>
        );
      })}
    </ul>
  );

  const back = (
    <button
      type="button"
      onClick={openLevel(path.slice(0, -1))}
      className="mb-3 flex min-h-11 items-center gap-1.5 font-condensed text-sm font-bold uppercase tracking-[0.14em] text-wydad-charcoal/55 hover:text-wydad-charcoal"
    >
      <ChevronRightIcon size={16} className="rotate-180 rtl:rotate-0" />
      {t(path.length > 1 ? path[path.length - 2] : 'back')}
    </button>
  );
  const levelTitle = path.length > 0 && (
    <h2 className="mb-4 inline-block border-b-[3px] border-wydad-logo pb-1 font-condensed text-[26px] font-extrabold uppercase leading-none text-wydad-charcoal">
      {t(path[path.length - 1])}
    </h2>
  );

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={t('menu')}
      aria-hidden={!open}
      {...({ inert: open ? undefined : '' } as object)}
      className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden
      />

      <div
        className={`absolute inset-y-0 start-0 flex max-w-full transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        }`}
      >
        {/* Main column */}
        <div className={`flex h-full w-screen max-w-full flex-col bg-white text-wydad-charcoal sm:w-[460px] ${COL}`}>
          <div className="flex h-20 shrink-0 items-center gap-6 px-5 sm:h-24 sm:px-8">
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label={t('close')}
              className="-ms-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-black/[0.05]"
            >
              <CloseIcon size={26} />
            </button>
            <SmartLink href="/" onClick={onClose} aria-label={t('home_label')} className="font-condensed text-[2.6rem] font-extrabold uppercase leading-none tracking-tight sm:text-5xl">
              <span aria-hidden>
                Dima <span className="text-wydad-logo">Wydad</span>
              </span>
            </SmartLink>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-6 sm:px-8 lg:pt-10">
            {/* lg+: main list stays; below lg the open level replaces it */}
            <nav aria-label={t('main_nav')} className={path.length ? 'hidden lg:block' : ''}>
              {level(MENU, 0)}
            </nav>
            {path.length > 0 && (
              <div className="lg:hidden">
                {back}
                {levelTitle}
                <div>{level(nodesAt(path), path.length)}</div>
              </div>
            )}
          </div>

          {/* Account, language, theme */}
          <div className="shrink-0 border-t border-black/[0.08] px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-8">
            <div className="flex items-center gap-3">
              <SmartLink href={SIGN_IN_URL} onClick={onClose} className="flex min-h-11 items-center gap-2 text-sm font-semibold hover:text-wydad-logo">
                <UserIcon size={18} />
                {t('sign_in')}
              </SmartLink>
              <span className="h-5 w-px bg-black/10" aria-hidden />
              <SmartLink href={MEMBER_AREA_URL} onClick={onClose} className="flex min-h-11 items-center text-sm font-semibold hover:text-wydad-logo">
                {t('member_area')}
              </SmartLink>
            </div>
            <div className="mt-3">
              <LanguageSwitch onSwitch={onClose} />
            </div>
          </div>
        </div>

        {/* Level panel (lg+), beside the main column */}
        <div
          id={PANEL_ID}
          className={`hidden h-full overflow-y-auto bg-[#F6F7F9] px-10 pt-[136px] text-wydad-charcoal ${COL} ${path.length ? 'lg:block' : ''}`}
        >
          {path.length > 1 && back}
          {levelTitle}
          {path.length > 0 && level(nodesAt(path), path.length)}
        </div>
      </div>
    </div>
  );
}
