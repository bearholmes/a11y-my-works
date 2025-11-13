import { atom } from 'jotai';

/**
 * 알림 타입 정의
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * 알림 메시지 인터페이스
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // ms, undefined면 자동 닫기 안 함
  ariaLive?: 'polite' | 'assertive'; // 스크린 리더 우선순위
}

/**
 * 확인 다이얼로그 인터페이스
 */
export interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmButtonVariant?: 'primary' | 'danger';
}

/**
 * 알림 목록 atom (토스트 메시지들)
 */
export const notificationsAtom = atom<Notification[]>([]);

/**
 * 활성 확인 다이얼로그 atom (한 번에 하나만)
 */
export const confirmDialogAtom = atom<ConfirmDialog | null>(null);

/**
 * 알림 추가 액션
 */
export const addNotificationAtom = atom(
  null,
  (
    get,
    set,
    notification: Omit<Notification, 'id' | 'ariaLive'> & {
      ariaLive?: 'polite' | 'assertive';
    }
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;

    // 타입에 따라 기본 ariaLive 설정
    const ariaLive =
      notification.ariaLive ??
      (notification.type === 'error' ? 'assertive' : 'polite');

    const newNotification: Notification = {
      id,
      ariaLive,
      duration: notification.duration ?? 5000, // 기본 5초
      ...notification,
    };

    set(notificationsAtom, [...get(notificationsAtom), newNotification]);

    // 자동 삭제 타이머
    if (newNotification.duration) {
      setTimeout(() => {
        set(removeNotificationAtom, id);
      }, newNotification.duration);
    }
  }
);

/**
 * 알림 제거 액션
 */
export const removeNotificationAtom = atom(null, (get, set, id: string) => {
  set(
    notificationsAtom,
    get(notificationsAtom).filter((n) => n.id !== id)
  );
});

/**
 * 모든 알림 제거 액션
 */
export const clearAllNotificationsAtom = atom(null, (_get, set) => {
  set(notificationsAtom, []);
});

/**
 * 확인 다이얼로그 표시 액션
 */
export const showConfirmDialogAtom = atom(
  null,
  (
    _get,
    set,
    dialog: Omit<ConfirmDialog, 'id'> & {
      confirmText?: string;
      cancelText?: string;
      confirmButtonVariant?: 'primary' | 'danger';
    }
  ) => {
    const id = `confirm-${Date.now()}`;
    set(confirmDialogAtom, {
      id,
      confirmText: dialog.confirmText ?? '확인',
      cancelText: dialog.cancelText ?? '취소',
      confirmButtonVariant: dialog.confirmButtonVariant ?? 'primary',
      ...dialog,
    });
  }
);

/**
 * 확인 다이얼로그 닫기 액션
 */
export const closeConfirmDialogAtom = atom(null, (_get, set) => {
  set(confirmDialogAtom, null);
});
