import { useQuery } from '@tanstack/react-query';
import { memberAPI } from '../services/api';
import type { MenuItem } from '../types/permission';

/**
 * 사용자 권한을 조회하는 hook
 * @returns 권한 목록과 권한 확인 함수
 */
export function usePermissions() {
  const {
    data: permissions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => memberAPI.getCurrentMemberPermissions(),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });

  /**
   * 특정 권한 키에 대한 읽기 권한이 있는지 확인
   * @param permissionKey 권한 키 (예: 'task.read')
   * @returns 읽기 권한 여부
   */
  const canRead = (permissionKey: string): boolean => {
    const permission = permissions.find((p) => p.key === permissionKey);
    return permission?.canRead ?? false;
  };

  /**
   * 특정 권한 키에 대한 쓰기 권한이 있는지 확인
   * @param permissionKey 권한 키 (예: 'task.write')
   * @returns 쓰기 권한 여부
   */
  const canWrite = (permissionKey: string): boolean => {
    const permission = permissions.find((p) => p.key === permissionKey);
    return permission?.canWrite ?? false;
  };

  /**
   * 메뉴 아이템에 접근 권한이 있는지 확인
   * @param menuItem 메뉴 아이템
   * @returns 접근 권한 여부
   */
  const canAccessMenu = (menuItem: MenuItem): boolean => {
    const permission = permissions.find(
      (p) => p.key === menuItem.requiredPermission
    );

    if (!permission) return false;

    // 읽기 권한만 필요한 경우
    if (menuItem.requireReadOnly !== false) {
      return permission.canRead;
    }

    // 쓰기 권한이 필요한 경우
    return permission.canWrite;
  };

  /**
   * 메뉴 목록에서 접근 가능한 메뉴만 필터링
   * @param menuItems 메뉴 아이템 목록
   * @returns 접근 가능한 메뉴 목록
   */
  const filterAccessibleMenus = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems
      .filter((item) => canAccessMenu(item))
      .map((item) => ({
        ...item,
        children: item.children
          ? filterAccessibleMenus(item.children)
          : undefined,
      }));
  };

  return {
    permissions,
    isLoading,
    error,
    canRead,
    canWrite,
    canAccessMenu,
    filterAccessibleMenus,
  };
}
