import type { ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function FormShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen px-4 py-6 sm:py-10">
    <div className="mx-auto mb-6 flex max-w-md items-center justify-between">
      <Link href="/" className="font-semibold text-lg tracking-tight text-gray-800 dark:text-gray-100">Scriptorium</Link>
      <ThemeToggle />
    </div>
    {children}
  </main>;
}
