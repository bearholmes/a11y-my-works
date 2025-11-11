import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  requireWrite?: boolean;
  fallback?: ReactNode;
}

/**
 * 권한이 있는 사용자만 자식 컴포넌트를 렌더링하는 가드
 */
export function PermissionGuard({
  children,
  permission,
  requireWrite = false,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermission(permission, requireWrite);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          aria-label="권한 확인 중"
        ></div>
      </div>
    );
  }

  if (!hasPermission) {
    return fallback ? fallback : <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

interface ConditionalRenderProps {
  children: ReactNode;
  permission: string;
  requireWrite?: boolean;
  fallback?: ReactNode;
}

/**
 * 권한에 따라 조건부 렌더링 (리다이렉션 없이)
 */
export function ConditionalRender({
  children,
  permission,
  requireWrite = false,
  fallback = null,
}: ConditionalRenderProps) {
  const { hasPermission, isLoading } = usePermission(permission, requireWrite);

  if (isLoading) {
    return null;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
