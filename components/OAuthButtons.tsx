import { useEffect, useState } from 'react';
import { getProviders, signIn } from 'next-auth/react';

export default function OAuthButtons({ linking = false }: { linking?: boolean }) {
  const [providers, setProviders] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    getProviders().then(result => setProviders(Object.keys(result || {}).filter(id => ['github', 'google'].includes(id)))).catch(() => {});
  }, []);
  async function start(provider: string) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/users/oauth/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(linking ? { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` } : {}) },
        body: JSON.stringify(linking ? { provider } : { clear: true }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Unable to start login');
      await signIn(provider, { callbackUrl: '/auth/complete' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to start login');
      setBusy(false);
    }
  }
  if (!providers.length) return null;
  return <div className="mb-4 space-y-2 text-gray-800 dark:text-gray-100">
    {linking && <p>Connect a provider to sign into this same account.</p>}
    {providers.map(provider => <button key={provider} type="button" disabled={busy}
      onClick={() => start(provider)}
      className="w-full rounded border border-gray-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
      {linking ? 'Connect' : 'Continue with'} {provider === 'github' ? 'GitHub' : 'Google'}
    </button>)}
    {error && <p role="alert" className="text-red-500">{error}</p>}
  </div>;
}
