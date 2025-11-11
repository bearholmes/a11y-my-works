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
 * - Alt + H: 홈 (대시보드)
 * - Alt + T: 업무 목록
 * - Alt + N: 새 업무 작성
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
      // 입력 필드에서는 단축키 비활성화
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
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
          case 'n':
            event.preventDefault();
            navigate('/tasks/new');
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
            // 단축키 도움말 표시 (나중에 구현)
            console.log('키보드 단축키 도움말');
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
      key: 'Alt + H',
      description: '홈 (대시보드)',
      action: () => {},
    },
    {
      key: 'Alt + T',
      description: '업무 목록',
      action: () => {},
    },
    {
      key: 'Alt + N',
      description: '새 업무 작성',
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
