import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Helper: validasi keberadaan, struktur JWT, dan kedaluwarsa token Supabase secara ketat
function isSupabaseTokenValid(cookies: { name: string; value: string }[]): boolean {
  try {
    const authCookies = cookies
      .filter((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (authCookies.length === 0) return false;

    // Gabungkan potongan cookie jika terfragmentasi (.0, .1, dst)
    let raw = authCookies.map((c) => c.value).join('');
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

    if (!token || typeof token !== 'string') return false;

    // Struktur JWT wajib memiliki 3 bagian: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;
    if (!headerB64 || !payloadB64 || !signatureB64 || signatureB64.length < 10) {
      return false;
    }

    // 1. Verifikasi Header (algoritma wajib valid dan bukan 'none')
    const headerStr = Buffer.from(headerB64, 'base64url').toString('utf-8');
    const header = JSON.parse(headerStr);
    const validAlgorithms = ['HS256', 'RS256', 'ES256', 'HS512', 'RS512'];
    if (!header.alg || !validAlgorithms.includes(header.alg) || header.alg.toLowerCase() === 'none') {
      return false;
    }

    // 2. Verifikasi Payload (subjek, audiens/role, dan waktu kedaluwarsa)
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    if (!payload.sub || typeof payload.sub !== 'string') return false;
    if (payload.aud !== 'authenticated' && payload.role !== 'authenticated') return false;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== 'number' || payload.exp < nowSeconds) {
      return false;
    }

    return true;
  } catch {
    // Jika format tidak valid atau gagal didecode, tolak akses demi keamanan
    return false;
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

  // Jika mengakses /admin tepat, arahkan ke dashboard jika login, atau ke login jika belum
  if (pathname === '/admin') {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = hasValidAuthToken ? '/admin/dashboard' : '/admin/login';
    return NextResponse.redirect(targetUrl);
  }

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

