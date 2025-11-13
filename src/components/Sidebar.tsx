import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import type { MenuItem } from '../types/permission';

/**
 * 시스템 메뉴 정의 (2depth 구조)
 * 권한별로 자동 필터링됨
 */
const MENU_ITEMS: MenuItem[] = [
  {
    name: '나의 업무',
    href: '#my-work',
    icon: '📋',
    requiredPermission: 'task.read',
    requireReadOnly: true,
    children: [
      {
        name: '대시보드',
        href: '/',
        icon: '📊',
        requiredPermission: 'task.read',
        requireReadOnly: true,
      },
      {
        name: '업무 관리',
        href: '/tasks',
        icon: '📝',
        requiredPermission: 'task.read',
        requireReadOnly: true,
      },
    ],
  },
  {
    name: '팀 관리',
    href: '#team-management',
    icon: '👥',
    requiredPermission: 'task.read',
    requireReadOnly: true,
    children: [
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
        icon: '📈',
        requiredPermission: 'task.read',
        requireReadOnly: true,
      },
    ],
  },
  {
    name: '프로젝트 관리',
    href: '#project-management',
    icon: '📁',
    requiredPermission: 'project.read',
    requireReadOnly: true,
    children: [
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
        icon: '📂',
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
    ],
  },
  {
    name: '시스템 관리',
    href: '#system-management',
    icon: '⚙️',
    requiredPermission: 'member.read',
    requireReadOnly: true,
    children: [
      {
        name: '관리자 대시보드',
        href: '/admin/dashboard',
        icon: '📊',
        requiredPermission: 'member.read',
        requireReadOnly: true,
      },
      {
        name: '사용자 관리',
        href: '/members',
        icon: '👤',
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
        requiredPermission: 'member.read',
        requireReadOnly: true,
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

/**
 * 메뉴 아이템 컴포넌트 (재귀 렌더링 지원)
 */
function MenuItemComponent({
  item,
  depth = 0,
  onClose,
}: {
  item: MenuItem;
  depth?: number;
  onClose?: () => void;
}) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // 현재 경로가 이 메뉴나 하위 메뉴에 있는지 확인
  const isActive =
    item.href === '/'
      ? location.pathname === '/'
      : !item.href.startsWith('#') && location.pathname.startsWith(item.href);

  // 하위 메뉴 중 하나라도 활성화되어 있는지 확인
  const hasActiveChild = item.children?.some((child) => {
    if (child.href === '/') return location.pathname === '/';
    return (
      !child.href.startsWith('#') && location.pathname.startsWith(child.href)
    );
  });

  // 하위 메뉴가 있는 경우 (그룹 헤더)
  if (item.children && item.children.length > 0) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasActiveChild
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        {isExpanded && (
          <ul className="mt-1 space-y-1 pl-4">
            {item.children.map((child) => (
              <MenuItemComponent
                key={child.href}
                item={child}
                depth={depth + 1}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // 일반 메뉴 아이템
  return (
    <li>
      <Link
        to={item.href}
        onClick={onClose}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span className="text-base" aria-hidden="true">
          {item.icon}
        </span>
        <span>{item.name}</span>
      </Link>
    </li>
  );
}

/**
 * 권한 기반 사이드바 컴포넌트
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { filterAccessibleMenus, isLoading } = usePermissions();

  // 권한에 따라 필터링된 메뉴
  const accessibleMenus = filterAccessibleMenus(MENU_ITEMS);

  if (isLoading) {
    return (
      <aside
        id="sidebar"
        aria-label="주요 메뉴"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex items-center justify-center">
          <span className="sr-only">메뉴 로딩 중</span>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
        aria-label="주요 메뉴"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex flex-col">
          {/* 로고 영역 */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
            <Link
              to="/"
              className="text-xl font-semibold text-gray-900"
              aria-label="홈으로 이동"
            >
              {import.meta.env.VITE_APP_TITLE || '업무 보고'}
            </Link>
          </div>

          {/* 메뉴 영역 - 독립적인 스크롤 */}
          <nav
            className="flex-1 overflow-y-auto py-4"
            aria-label="메인 네비게이션"
          >
            <ul className="space-y-1 px-3">
              {accessibleMenus.map((item) => (
                <MenuItemComponent
                  key={item.href}
                  item={item}
                  onClose={onClose}
                />
              ))}
            </ul>
          </nav>

          {/* 하단 정보 */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <p className="text-xs text-gray-500 text-center">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
