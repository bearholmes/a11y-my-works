import { useQuery } from '@tanstack/react-query';
import { memberAPI } from '../services/api';
import { useAuthContext } from '../providers/AuthProvider';

/**
 * 사용자의 특정 권한 보유 여부를 확인하는 훅
 * @param permissionKey 확인할 권한 키
 * @param requireWrite true면 쓰기 권한까지 확인, false면 읽기 권한만 확인
 */
export function usePermission(permissionKey: string, requireWrite = false) {
  const { user } = useAuthContext();

  const { data: permissions } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: () => memberAPI.getCurrentMemberPermissions(),
    enabled: !!user,
  });

  const permission = permissions?.find((p) => p.key === permissionKey);

  const hasPermission = permission
    ? requireWrite
      ? permission.canWrite
      : permission.canRead
    : false;

  return {
    hasPermission,
    permission,
    isLoading: !permissions && !!user,
  };
}

/**
 * 여러 권한 중 하나라도 있는지 확인하는 훅
 * @param permissionKeys 확인할 권한 키 배열
 * @param requireWrite true면 쓰기 권한까지 확인
 */
export function useAnyPermission(
  permissionKeys: string[],
  requireWrite = false
) {
  const { user } = useAuthContext();

  const { data: permissions } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: () => memberAPI.getCurrentMemberPermissions(),
    enabled: !!user,
  });

  const hasPermission = permissionKeys.some((key) => {
    const permission = permissions?.find((p) => p.key === key);
    return permission
      ? requireWrite
        ? permission.canWrite
        : permission.canRead
      : false;
  });

  return {
    hasPermission,
    isLoading: !permissions && !!user,
  };
}

/**
 * 모든 권한을 가지고 있는지 확인하는 훅
 * @param permissionKeys 확인할 권한 키 배열
 * @param requireWrite true면 쓰기 권한까지 확인
 */
export function useAllPermissions(
  permissionKeys: string[],
  requireWrite = false
) {
  const { user } = useAuthContext();

  const { data: permissions } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: () => memberAPI.getCurrentMemberPermissions(),
    enabled: !!user,
  });

  const hasPermission = permissionKeys.every((key) => {
    const permission = permissions?.find((p) => p.key === key);
    return permission
      ? requireWrite
        ? permission.canWrite
        : permission.canRead
      : false;
  });

  return {
    hasPermission,
    isLoading: !permissions && !!user,
  };
}

/**
 * 관리자 권한 확인 (사용자 관리 쓰기 권한 보유 여부)
 */
export function useIsAdmin() {
  return usePermission('member.write', true);
}

/**
 * 관리자 또는 매니저 권한 확인 (사용자 조회 권한 보유 여부)
 * 관리자 대시보드 등 팀 전체 현황을 볼 수 있는 권한
 */
export function useIsAdminOrManager() {
  return usePermission('member.read', false);
}
