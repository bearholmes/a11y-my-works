import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 키보드 단축키 타입 정의
 */
interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/**
 * 글로벌 키보드 단축키 훅
 *
 * 지원하는 단축키:
 * - Ctrl/Cmd + N: 새 업무 작성
 * - Ctrl/Cmd + F: 검색 포커스
 * - Alt + H: 홈 (대시보드)
 * - Alt + T: 업무 목록
 * - Alt + P: 프로젝트 관리
 * - Alt + S: 서비스 관리
 * - Alt + M: 사용자 관리
 * - Alt + /: 단축키 도움말
 * - Esc: 모달/드롭다운 닫기
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에서는 네비게이션 단축키 비활성화 (검색은 제외)
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Ctrl/Cmd 키 조합 (데스크탑 중심)
      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'n':
            // 새 업무 작성 (입력 필드에서도 동작)
            event.preventDefault();
            navigate('/tasks/new');
            break;
          case 'f': {
            // 검색 포커스
            event.preventDefault();
            const searchInput = document.querySelector<HTMLInputElement>(
              'input[type="search"], input[id*="search"]'
            );
            if (searchInput) {
              searchInput.focus();
              searchInput.select();
            }
            break;
          }
        }
        return;
      }

      // 입력 필드에서는 Alt 단축키 비활성화
      if (isInputField) {
        return;
      }

      // Alt 키 조합
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            navigate('/');
            break;
          case 't':
            event.preventDefault();
            navigate('/tasks');
            break;
          case 'r':
            event.preventDefault();
            navigate('/team/stats');
            break;
          case 'p':
            event.preventDefault();
            navigate('/projects');
            break;
          case 's':
            event.preventDefault();
            navigate('/services');
            break;
          case 'm':
            event.preventDefault();
            navigate('/members');
            break;
          case '/':
          case '?':
            event.preventDefault();
            // 단축키 도움말 표시 (KeyboardShortcutsModal)
            window.dispatchEvent(new CustomEvent('toggle-shortcuts-modal'));
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
}

/**
 * 단축키 목록 반환
 */
export function getShortcutList(): ShortcutConfig[] {
  return [
    {
      key: 'Ctrl + N',
      description: '새 업무 작성',
      action: () => {},
    },
    {
      key: 'Ctrl + F',
      description: '검색 포커스',
      action: () => {},
    },
    {
      key: 'Alt + H',
      description: '홈 (대시보드)',
      action: () => {},
    },
    {
      key: 'Alt + T',
      description: '업무 관리',
      action: () => {},
    },
    {
      key: 'Alt + R',
      description: '리소스 통계',
      action: () => {},
    },
    {
      key: 'Alt + P',
      description: '프로젝트 관리',
      action: () => {},
    },
    {
      key: 'Alt + S',
      description: '서비스 관리',
      action: () => {},
    },
    {
      key: 'Alt + M',
      description: '사용자 관리',
      action: () => {},
    },
    {
      key: 'Alt + /',
      description: '단축키 도움말',
      action: () => {},
    },
    {
      key: 'Esc',
      description: '모달/드롭다운 닫기',
      action: () => {},
    },
  ];
}
