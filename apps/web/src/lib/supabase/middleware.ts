import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';

/**
 * Admin requests: refreshes the Supabase session cookies and sends visitors without a session to
 * the login page. Whether the user is an administrator is checked again on the server (layout and
 * every action) and by RLS; this is only the first gate.
 */
export async function adminMiddleware(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === '/admin/login';
  if (!isSupabaseConfigured()) return isLogin ? NextResponse.next() : NextResponse.redirect(new URL('/admin/login', request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
