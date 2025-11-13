import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import {
  type Notification,
  clearAllNotificationsAtom,
  notificationsAtom,
  removeNotificationAtom,
} from '../stores/notificationStore';

/**
 * 알림 타입별 스타일 및 아이콘
 */
const notificationStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    icon: '✓',
    iconBg: 'bg-green-400',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    icon: '✕',
    iconBg: 'bg-red-400',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    icon: '⚠',
    iconBg: 'bg-yellow-400',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-800',
    icon: 'ℹ',
    iconBg: 'bg-blue-400',
  },
};

/**
 * 개별 토스트 알림 컴포넌트
 */
function ToastItem({ notification }: { notification: Notification }) {
  const removeNotification = useSetAtom(removeNotificationAtom);
  const style = notificationStyles[notification.type];

  // 알림 타입별 한글 레이블
  const typeLabels = {
    success: '성공',
    error: '오류',
    warning: '경고',
    info: '정보',
  };

  return (
    <div
      role="alert"
      aria-live={notification.ariaLive}
      aria-atomic="true"
      className={`
        ${style.bg} ${style.border} ${style.text}
        border-l-4 p-4 rounded shadow-lg
        flex items-start gap-3
        min-w-[320px] max-w-md
        animate-slide-in-right
      `}
    >
      {/* 아이콘 */}
      <div
        className={`
          ${style.iconBg}
          w-6 h-6 rounded-full
          flex items-center justify-center
          text-white text-sm font-bold
          flex-shrink-0
        `}
        aria-hidden="true"
      >
        {style.icon}
      </div>

      {/* 메시지 */}
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium">{notification.message}</p>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={() => removeNotification(notification.id)}
        aria-label={`${typeLabels[notification.type]} 알림 닫기`}
        className={`
          ${style.text}
          hover:opacity-70
          focus:outline-none focus:ring-2 focus:ring-offset-2
          rounded
          p-1
          flex-shrink-0
        `}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * 토스트 알림 컨테이너
 * 앱의 최상위 레벨에 배치되어 모든 알림을 표시
 */
export function ToastContainer() {
  const [notifications] = useAtom(notificationsAtom);
  const clearAllNotifications = useSetAtom(clearAllNotificationsAtom);

  // ESC 키로 모든 알림 닫기 (키보드 접근성)
  useEffect(() => {
    if (notifications.length === 0) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearAllNotifications();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [notifications.length, clearAllNotifications]);

  if (notifications.length === 0) return null;

  return (
    <div
      role="region"
      aria-label={`알림 영역 - ${notifications.length}개의 알림. ESC 키를 눌러 모든 알림을 닫을 수 있습니다.`}
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
    >
      {notifications.map((notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

/**
 * 스크린 리더 전용 알림 영역
 * 화면에는 보이지 않지만 스크린 리더가 읽을 수 있도록 함
 */
export function LiveRegionAnnouncer() {
  const [notifications] = useAtom(notificationsAtom);

  // 가장 최근 알림만 읽기 (중복 방지)
  const latestNotification = notifications[notifications.length - 1];

  return (
    <>
      {/* polite 알림 영역 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {latestNotification?.ariaLive === 'polite' &&
          latestNotification.message}
      </div>

      {/* assertive 알림 영역 (긴급) */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {latestNotification?.ariaLive === 'assertive' &&
          latestNotification.message}
      </div>
    </>
  );
}
