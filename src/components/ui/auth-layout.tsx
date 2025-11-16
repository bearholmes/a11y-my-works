import type React from 'react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh min-w-3xl flex-col p-2 bg-white dark:bg-zinc-950">
      <div className="flex grow items-center justify-center p-6">
        {children}
      </div>
    </main>
  );
}
