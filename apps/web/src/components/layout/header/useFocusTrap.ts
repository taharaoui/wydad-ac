import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * While `active`: moves focus into `ref` (to `[data-autofocus]` or the first focusable), keeps Tab
 * cycling inside it, calls `onEscape` on Escape and locks page scroll. Restores focus on release.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement>,
  active: boolean,
  onEscape: () => void,
  /** Element to refocus on release; defaults to whatever had focus (Safari does not focus clicked buttons) */
  restoreTo?: RefObject<HTMLElement>,
) {
  const escape = useRef(onEscape);
  escape.current = onEscape;

  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;
    const previous = document.activeElement as HTMLElement | null;

    // Skip collapsed or hidden content (inert subtrees, display:none)
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !el.closest('[inert]'),
      );

    (node.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        escape.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      (restoreTo?.current ?? previous)?.focus?.();
    };
  }, [active, ref, restoreTo]);
}
