import { createBrowserClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          const cookies: Record<string, string> = {};
          document.cookie.split('; ').forEach((cookie) => {
            const [name, ...rest] = cookie.split('=');
            cookies[name] = rest.join('=');
          });
          return Object.entries(cookies).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const parts = [`${name}=${value}`];
            if (options.maxAge) parts.push(`max-age=${options.maxAge}`);
            if (options.domain) parts.push(`domain=${options.domain}`);
            if (options.path) parts.push(`path=${options.path}`);
            if (options.secure) parts.push('secure');
            if (options.sameSite) parts.push(`samesite=${options.sameSite}`);
            document.cookie = parts.join('; ');
          });
        },
      },
    }
  );
}
