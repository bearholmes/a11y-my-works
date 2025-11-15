import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';

/**
 * 로그아웃 페이지
 * - 자동으로 로그아웃을 수행하고 로그인 페이지로 리다이렉트
 */
export function Logout() {
  const { signOut } = useAuthContext();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
    };

    performLogout();
  }, [signOut]);

  // 로그아웃 후 로그인 페이지로 리다이렉트
  return <Navigate to="/login" replace />;
}
