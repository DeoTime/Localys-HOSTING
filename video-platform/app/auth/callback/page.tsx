'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ensureProfileForCurrentUser } from '@/lib/supabase/auth';

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const next = searchParams.get('next') || '/feed';
      const code = searchParams.get('code');
      const oauthError = searchParams.get('error_description') || searchParams.get('error');

      if (oauthError) {
        if (!cancelled) router.replace('/login?error=oauth');
        return;
      }

      try {
        // The browser client may auto-handle the redirect (detectSessionInUrl).
        let { data: { session } } = await supabase.auth.getSession();

        // Otherwise finish the PKCE exchange with the same browser client
        // that started it (the code_verifier lives in this client's storage).
        if (!session && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          session = data.session;
        }

        if (!session) {
          if (!cancelled) router.replace('/login?error=oauth');
          return;
        }

        // First-time Google users: create their profiles row (account_type
        // defaults to 'customer' at the DB level).
        await ensureProfileForCurrentUser();

        if (!cancelled) {
          router.replace(next);
          router.refresh();
        }
      } catch (err) {
        console.error('[auth/callback] OAuth exchange failed:', err);
        if (!cancelled) {
          setMessage('Sign-in failed. Redirecting…');
          router.replace('/login?error=oauth');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A18] px-4 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#F5A623]" />
        <p className="text-white/70">{message}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1A1A18] text-white/70">
          Signing you in…
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
