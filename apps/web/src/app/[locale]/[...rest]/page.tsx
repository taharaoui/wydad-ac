import { notFound } from 'next/navigation';

/** Any unknown address under a locale: shows [locale]/not-found.tsx inside the site layout */
export default function CatchAll() {
  notFound();
}
