import { useSetAtom } from 'jotai';
import {
  addNotificationAtom,
  type NotificationType,
} from '../stores/notificationStore';

/**
 * 알림 표시 옵션
 */
interface NotificationOptions {
  duration?: number; // ms, undefined면 자동 닫기 안 함
  ariaLive?: 'polite' | 'assertive';
}

/**
 * 알림 표시 훅
 *
 * @example
 * const { showSuccess, showError } = useNotification();
 *
 * // 성공 메시지
 * showSuccess('저장되었습니다');
 *
 * // 에러 메시지 (긴급 - assertive)
 * showError('저장에 실패했습니다', { duration: 10000 });
 *
 * // 경고 메시지
 * showWarning('입력값을 확인해주세요');
 *
 * // 정보 메시지
 * showInfo('처리 중입니다...');
 */
export function useNotification() {
  const addNotification = useSetAtom(addNotificationAtom);

  /**
   * 특정 타입의 알림 표시
   */
  const show = (
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ) => {
    addNotification({
      type,
      message,
      ...options,
    });
  };

  /**
   * 성공 알림 표시
   */
  const showSuccess = (message: string, options: NotificationOptions = {}) => {
    show('success', message, options);
  };

  /**
   * 에러 알림 표시 (기본적으로 assertive)
   */
  const showError = (message: string, options: NotificationOptions = {}) => {
    show('error', message, {
      ariaLive: 'assertive',
      duration: 7000, // 에러는 좀 더 길게
      ...options,
    });
  };

  /**
   * 경고 알림 표시
   */
  const showWarning = (message: string, options: NotificationOptions = {}) => {
    show('warning', message, options);
  };

  /**
   * 정보 알림 표시
   */
  const showInfo = (message: string, options: NotificationOptions = {}) => {
    show('info', message, options);
  };

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
