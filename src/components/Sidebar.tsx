import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import type { MenuItem } from '../types/permission';

/**
 * 시스템 메뉴 정의
 */
const MENU_ITEMS: MenuItem[] = [
  {
    name: '대시보드',
    href: '/',
    icon: '📊',
    requiredPermission: 'task.read',
    requireReadOnly: true,
  },
  {
    name: '업무 보고',
    href: '/tasks',
    icon: '📋',
    requiredPermission: 'task.read',
    requireReadOnly: true,
  },
  {
    name: '업무 등록',
    href: '/tasks/new',
    icon: '➕',
    requiredPermission: 'task.write',
    requireReadOnly: false,
  },
  {
    name: '관리자 대시보드',
    href: '/admin/dashboard',
    icon: '📈',
    requiredPermission: 'member.read',
    requireReadOnly: true,
  },
  {
    name: '팀 업무 조회',
    href: '/team/tasks',
    icon: '👨‍👩‍👧‍👦',
    requiredPermission: 'task.read',
    requireReadOnly: true,
  },
  {
    name: '리소스 통계',
    href: '/team/stats',
    icon: '📊',
    requiredPermission: 'task.read',
    requireReadOnly: true,
  },
  {
    name: '청구 그룹',
    href: '/cost-groups',
    icon: '💰',
    requiredPermission: 'project.read',
    requireReadOnly: true,
  },
  {
    name: '서비스',
    href: '/services',
    icon: '🔧',
    requiredPermission: 'project.read',
    requireReadOnly: true,
  },
  {
    name: '프로젝트',
    href: '/projects',
    icon: '📁',
    requiredPermission: 'project.read',
    requireReadOnly: true,
  },
  {
    name: '공휴일',
    href: '/holidays',
    icon: '📅',
    requiredPermission: 'project.read',
    requireReadOnly: true,
  },
  {
    name: '사용자 관리',
    href: '/members',
    icon: '👥',
    requiredPermission: 'member.read',
    requireReadOnly: true,
  },
  {
    name: '역할 관리',
    href: '/roles',
    icon: '🔐',
    requiredPermission: 'member.write',
    requireReadOnly: false,
  },
  {
    name: '데이터 테스트',
    href: '/test',
    icon: '🧪',
    requiredPermission: 'task.read',
    requireReadOnly: true,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

/**
 * 권한 기반 사이드바 컴포넌트
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { filterAccessibleMenus, isLoading } = usePermissions();

  // 권한에 따라 필터링된 메뉴
  const accessibleMenus = filterAccessibleMenus(MENU_ITEMS);

  if (isLoading) {
    return (
      <aside
        id="sidebar"
        role="navigation"
        aria-label="주요 메뉴"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-label="메뉴 로딩 중"></div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside
        id="sidebar"
        role="navigation"
        aria-label="주요 메뉴"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex flex-col">
          {/* 로고 영역 */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link to="/" className="text-xl font-semibold text-gray-900" aria-label="홈으로 이동">
              {import.meta.env.VITE_APP_TITLE || '업무 보고'}
            </Link>
          </div>

          {/* 메뉴 영역 */}
          <nav className="flex-1 overflow-y-auto py-4" aria-label="메인 네비게이션">
            <ul className="space-y-1 px-3" role="list">
              {accessibleMenus.map((item) => {
                // 정확히 일치하거나, 하위 경로인 경우 활성으로 표시
                // 예: /projects 메뉴는 /projects, /projects/new, /projects/edit/1 에서 모두 활성
                const isActive =
                  item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 하단 정보 */}
          <div className="border-t border-gray-200 p-4">
            <p className="text-xs text-gray-500 text-center">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
