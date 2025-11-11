import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAuthContext } from '../providers/AuthProvider';
import { memberAPI } from '../services/api';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // 키보드 단축키 활성화
  useKeyboardShortcuts();

  // 현재 로그인한 사용자의 멤버 정보 조회
  const { data: currentMember } = useQuery({
    queryKey: ['currentMember'],
    queryFn: memberAPI.getCurrentMember,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });

  // Esc 키로 드롭다운 닫기 및 Alt + / 로 도움말 열기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Esc 키로 닫기
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsSidebarOpen(false);
      }

      // Alt + / 로 단축키 도움말 열기
      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.key === '/' || event.key === '?')
      ) {
        const target = event.target as HTMLElement;
        // 입력 필드가 아닐 때만
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          !target.isContentEditable
        ) {
          event.preventDefault();
          setIsShortcutsModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Skip to main content 링크 */}
      <a
        href="#main-content"
        className="sr-only-focusable absolute top-0 left-0 z-[100] bg-blue-600 text-white px-4 py-2 rounded-br-md focus:not-sr-only"
      >
        본문으로 바로가기
      </a>

      {/* 사이드바 */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 모바일 메뉴 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
                  aria-expanded={isSidebarOpen}
                  aria-controls="sidebar"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* 사용자 메뉴 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="사용자 메뉴"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold"
                    aria-hidden="true"
                  >
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{currentMember?.name}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        내 프로필
                      </Link>
                      <Link
                        to="/change-password"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        비밀번호 변경
                      </Link>
                      <hr className="my-1" />
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* 키보드 단축키 도움말 모달 */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
