import type React from 'react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh min-w-3xl flex-col p-2">
      <div className="flex grow items-center justify-center p-6 dark:bg-zinc-900 dark:ring-white/10">
        {children}
      </div>
    </main>
  );
}
