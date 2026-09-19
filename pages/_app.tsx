import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  }, []);
  return <Component {...pageProps} />;
}
