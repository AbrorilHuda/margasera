import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Helper: validasi keberadaan dan kedaluwarsa JWT Supabase secara lokal (tanpa request ke cloud)
function isSupabaseTokenValid(cookies: { name: string; value: string }[]): boolean {
  try {
    const authCookie = cookies.find(
      (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
    );
    if (!authCookie) return false;

    let raw = authCookie.value;
    if (raw.startsWith('base64-')) {
      raw = Buffer.from(raw.slice(7), 'base64').toString('utf-8');
    }

    let token = '';
    if (raw.startsWith('{') || raw.startsWith('[')) {
      const parsed = JSON.parse(raw);
      token = Array.isArray(parsed) ? parsed[0] : parsed.access_token || '';
    } else {
      token = raw;
    }

    if (!token || !token.includes('.')) {
      return true; // Cookie ada, izinkan lewat
    }

    // Decode payload JWT
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      // Jika token sudah kedaluwarsa, return false
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return false;
      }
    }

    return true;
  } catch {
    // Jika ada cookie auth, anggap valid untuk toleransi offline
    return cookies.some(
      (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
    );
  }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Skip file statis manifest / webmanifest
  if (pathname === '/admin-manifest.json' || pathname.endsWith('.json') || pathname.endsWith('.webmanifest')) {
    return supabaseResponse;
  }

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!isAdminRoute) {
    return supabaseResponse;
  }

  // 1. Cek keberadaan token auth di cookie browser
  const allCookies = request.cookies.getAll();
  const hasValidAuthToken = isSupabaseTokenValid(allCookies);

  // Jika tidak memiliki cookie auth sama sekali dan bukan di halaman login -> redirect ke login
  if (!hasValidAuthToken && pathname !== '/admin/login') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Jika online, lakukan validasi & refresh sesi ke Supabase
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Jika Supabase tidak bisa diakses (offline / network error)
    const isNetworkError =
      userError &&
      (userError.name === 'AuthRetryableFetchError' ||
        userError.message?.toLowerCase().includes('fetch') ||
        userError.message?.toLowerCase().includes('network') ||
        userError.message?.toLowerCase().includes('failed'));

    // Dalam kondisi offline tapi token cookie masih valid -> IZINKAN AKSES DASHBOARD
    if (isNetworkError && hasValidAuthToken && pathname !== '/admin/login') {
      return supabaseResponse;
    }

    if (pathname !== '/admin/login') {
      // Jika online tapi tidak ada user (token expired / dicabut)
      if (!user && !isNetworkError) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/admin/login';
        loginUrl.searchParams.set('redirectedFrom', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Cek role profil jika user berhasil diverifikasi online
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          const role = profile?.role as string | undefined;
          if (role && !['admin', 'staff'].includes(role)) {
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = '/admin/login';
            loginUrl.searchParams.set('redirectedFrom', pathname);
            return NextResponse.redirect(loginUrl);
          }
        } catch {
          // Jika gagal query DB saat kondisi jaringan drop, biarkan lewat selama token valid
        }
      }
    }

    // Jika sudah login dan membuka /admin/login -> redirect ke dashboard
    if (pathname === '/admin/login' && user) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  } catch (err) {
    // Jika koneksi ke Supabase cloud throw network error (offline total)
    if (hasValidAuthToken && pathname !== '/admin/login') {
      return supabaseResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt, json, webmanifest
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|admin-manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|webmanifest)$).*)',
  ],
};

