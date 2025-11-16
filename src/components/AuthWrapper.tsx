import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { Spinner } from './ui/spinner';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" label="인증 확인 중..." />
          <p className="mt-4 text-gray-600 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
}
