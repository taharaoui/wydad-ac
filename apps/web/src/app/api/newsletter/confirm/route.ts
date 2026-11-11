import { NextResponse } from 'next/server';
import { confirm, localePath } from '@/lib/newsletter/service';

export const dynamic = 'force-dynamic';

/** Link from the confirmation email → confirmation page */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = ['ar', 'fr', 'en'].includes(url.searchParams.get('lang') ?? '') ? url.searchParams.get('lang')! : 'fr';
  const result = await confirm(url.searchParams.get('token') ?? '');
  const target = new URL(localePath(lang, '/newsletter/confirmed'), url.origin);
  if (result !== 'ok') target.searchParams.set('status', 'invalid');
  return NextResponse.redirect(target, 303);
}
