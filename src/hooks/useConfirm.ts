import { useSetAtom } from 'jotai';
import { showConfirmDialogAtom } from '../stores/notificationStore';

/**
 * 확인 다이얼로그 옵션
 */
interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'danger';
}

/**
 * 확인 다이얼로그 훅
 *
 * @example
 * const confirm = useConfirm();
 *
 * // 기본 확인
 * const result = await confirm({
 *   title: '삭제 확인',
 *   message: '정말 삭제하시겠습니까?',
 *   confirmButtonVariant: 'danger'
 * });
 *
 * if (result) {
 *   // 사용자가 확인을 눌렀을 때
 *   await deleteItem();
 * }
 *
 * @example
 * // 간편 삭제 확인
 * const result = await confirmDelete('이 항목을 삭제하시겠습니까?');
 * if (result) {
 *   await deleteItem();
 * }
 */
export function useConfirm() {
  const showConfirmDialog = useSetAtom(showConfirmDialogAtom);

  /**
   * 확인 다이얼로그 표시
   * Promise를 반환하여 사용자의 선택을 기다림
   */
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      showConfirmDialog({
        title: options.title ?? '확인',
        message: options.message,
        confirmText: options.confirmText ?? '확인',
        cancelText: options.cancelText ?? '취소',
        confirmButtonVariant: options.confirmButtonVariant ?? 'primary',
        onConfirm: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  };

  /**
   * 삭제 확인 다이얼로그 (미리 정의된 스타일)
   */
  const confirmDelete = (
    message: string,
    itemName?: string
  ): Promise<boolean> => {
    const displayMessage = itemName
      ? `"${itemName}"을(를) ${message}`
      : message;

    return confirm({
      title: '삭제 확인',
      message: displayMessage,
      confirmText: '삭제',
      cancelText: '취소',
      confirmButtonVariant: 'danger',
    });
  };

  /**
   * 변경사항 저장 확인 다이얼로그
   */
  const confirmUnsavedChanges = (): Promise<boolean> => {
    return confirm({
      title: '변경사항 확인',
      message: '저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?',
      confirmText: '나가기',
      cancelText: '취소',
      confirmButtonVariant: 'danger',
    });
  };

  return {
    confirm,
    confirmDelete,
    confirmUnsavedChanges,
  };
}
