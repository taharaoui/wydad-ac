'use client';

import type { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { isExternal } from '@/lib/navigation-config';

type Props = Omit<ComponentProps<'a'>, 'href'> & { href: string };

/** Localised internal link, or a new-tab link (announced to screen readers) for absolute URLs. */
export function SmartLink({ href, children, ...rest }: Props) {
  const t = useTranslations('header');
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> {t('new_tab')}</span>
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
