/**
 * 권한 관련 타입 정의
 */

/**
 * 권한 정보
 */
export interface Permission {
  /** 권한 ID */
  id: string;
  /** 권한 키 (예: task.read, project.write) */
  key: string;
  /** 권한 이름 */
  name: string;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 역할 권한 정보
 */
export interface RolePermission {
  /** 역할 ID */
  roleId: string;
  /** 권한 ID */
  permissionId: string;
  /** 읽기 권한 */
  readAccess: boolean;
  /** 쓰기 권한 */
  writeAccess: boolean;
}

/**
 * 역할 정보
 */
export interface Role {
  /** 역할 ID */
  id: string;
  /** 역할 이름 */
  name: string;
  /** 역할 설명 */
  description?: string;
  /** 활성 상태 */
  isActive: boolean;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 사용자 권한 정보 (권한 키와 읽기/쓰기 권한 포함)
 */
export interface UserPermission {
  /** 권한 키 */
  key: string;
  /** 읽기 권한 */
  canRead: boolean;
  /** 쓰기 권한 */
  canWrite: boolean;
}

/**
 * 메뉴 아이템 타입
 */
export interface MenuItem {
  /** 메뉴 이름 */
  name: string;
  /** 라우트 경로 */
  href: string;
  /** 아이콘 (이모지 또는 컴포넌트) */
  icon: string;
  /** 필요한 권한 키 */
  requiredPermission: string;
  /** 읽기 권한만 필요한지 여부 (기본값: true) */
  requireReadOnly?: boolean;
  /** 하위 메뉴 */
  children?: MenuItem[];
}
