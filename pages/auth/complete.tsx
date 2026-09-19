import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import '../../app/globals.css';

export default function CompleteLogin() {
  const started = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const response = await fetch('/api/users/oauth/complete', { method: 'POST' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to complete login');
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        // OAuth is a short-lived handoff into the existing application session.
        await signOut({ redirect: false });
        window.location.replace('/');
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to complete login');
      }
    })();
  }, []);
  return <main className="max-w-md mx-auto p-6">
    <h1 className="text-2xl font-semibold">Signing you in</h1>
    {error ? <><p role="alert">{error}</p><Link href="/login">Return to login</Link></> : <p>Please wait…</p>}
  </main>;
}
