import {
  ArrowRightStartOnRectangleIcon,
  Cog8ToothIcon,
  KeyIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Avatar } from '../components/ui/avatar';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '../components/ui/dropdown';
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from '../components/ui/navbar';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '../components/ui/sidebar';
import { SidebarLayout } from '../components/ui/sidebar-layout';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthContext } from '../providers/AuthProvider';
import { memberAPI } from '../services/api';
import type { MenuItem } from '../types/permission';

interface ApplicationLayoutProps {
  children: ReactNode;
}

/**
 * 사용자 메뉴 드롭다운 컴포넌트
 */
function AccountDropdownMenu({
  anchor,
}: {
  anchor: 'top start' | 'bottom end';
}) {
  const { signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="/profile">
        <UserCircleIcon />
        <DropdownLabel>내 프로필</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/change-password">
        <KeyIcon />
        <DropdownLabel>비밀번호 변경</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/licenses">
        <Cog6ToothIcon />
        <DropdownLabel>라이선스</DropdownLabel>
      </DropdownItem>
      <DropdownItem onClick={handleSignOut}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>로그아웃</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  );
}

/**
 * 시스템 메뉴 정의 (권한 기반)
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
    icon: '📝',
    requiredPermission: 'task.read',
    requireReadOnly: true,
  },
  {
    name: '팀 관리',
    href: '#team',
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
      {
        name: '업무 작성 현황',
        href: '/team/report-status',
        icon: '📊',
        requiredPermission: 'member.read',
        requireReadOnly: true,
      },
    ],
  },
  {
    name: '프로젝트 관리',
    href: '#project',
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
    href: '#system',
    icon: '⚙️',
    requiredPermission: 'member.read',
    requireReadOnly: true,
    children: [
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
    ],
  },
];

/**
 * 메뉴 아이템을 Heroicons으로 매핑
 */
function getMenuIcon(href: string, icon?: string) {
  const iconMap: Record<string, any> = {
    '/': HomeIcon,
    '/tasks': ClipboardDocumentListIcon,
    '/team/tasks': UserGroupIcon,
    '/team/stats': ChartBarIcon,
    '/team/report-status': ChartBarIcon,
    '/cost-groups': CreditCardIcon,
    '/services': WrenchScrewdriverIcon,
    '/projects': HomeIcon,
    '/holidays': CalendarDaysIcon,
    '/members': UsersIcon,
    '/roles': Cog6ToothIcon,
  };

  const IconComponent = iconMap[href];
  return IconComponent ? (
    <IconComponent />
  ) : (
    <span aria-hidden="true">{icon}</span>
  );
}

/**
 * ApplicationLayout - Demo 패턴을 적용한 메인 레이아웃
 */
export function ApplicationLayout({ children }: ApplicationLayoutProps) {
  const location = useLocation();
  const { user } = useAuthContext();
  const { filterAccessibleMenus, isLoading } = usePermissions();

  // 현재 로그인한 사용자의 멤버 정보 조회
  const { data: currentMember } = useQuery({
    queryKey: ['currentMember'],
    queryFn: memberAPI.getCurrentMember,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });

  // 권한에 따라 필터링된 메뉴
  const accessibleMenus = filterAccessibleMenus(MENU_ITEMS);

  // 현재 경로와 일치하는지 확인
  const isCurrentPath = (href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    if (href.startsWith('#')) {
      return false;
    }
    return location.pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
            aria-label="레이아웃 로딩 중"
          />
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar
                  initials={user?.email?.charAt(0).toUpperCase() || 'U'}
                  className="size-8"
                />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-4 py-1">
              <span className="text-lg font-bold text-zinc-950 dark:text-white">
                {import.meta.env.VITE_APP_TITLE || '업무 보고'}
              </span>
            </div>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {accessibleMenus.map((item) => {
                // 하위 메뉴가 있는 경우
                if (item.children && item.children.length > 0) {
                  return (
                    <div key={item.href}>
                      <SidebarHeading>{item.name}</SidebarHeading>
                      {item.children.map((child) => (
                        <SidebarItem
                          key={child.href}
                          href={child.href}
                          current={isCurrentPath(child.href)}
                        >
                          {getMenuIcon(child.href, child.icon)}
                          <SidebarLabel>{child.name}</SidebarLabel>
                        </SidebarItem>
                      ))}
                    </div>
                  );
                }

                // 일반 메뉴 아이템
                return (
                  <SidebarItem
                    key={item.href}
                    href={item.href}
                    current={isCurrentPath(item.href)}
                  >
                    {getMenuIcon(item.href, item.icon)}
                    <SidebarLabel>{item.name}</SidebarLabel>
                  </SidebarItem>
                );
              })}
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="/logout">
                <ArrowRightStartOnRectangleIcon />
                <SidebarLabel>로그아웃</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    initials={
                      currentMember?.name?.charAt(0) ||
                      user?.email?.charAt(0).toUpperCase() ||
                      'U'
                    }
                    className="size-10"
                    square
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {currentMember?.name || user?.email}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {currentMember?.role?.name || '사용자'}
                    </span>
                  </span>
                </span>
                <Cog8ToothIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
