import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  closeConfirmDialogAtom,
  confirmDialogAtom,
} from '../stores/notificationStore';

/**
 * 확인 다이얼로그 컴포넌트
 * 앱의 최상위 레벨에 배치되어 확인 다이얼로그를 표시
 */
export function ConfirmDialog() {
  const [dialog] = useAtom(confirmDialogAtom);
  const closeDialog = useSetAtom(closeConfirmDialogAtom);
  const [isProcessing, setIsProcessing] = useState(false);

  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await dialog?.onConfirm();
      closeDialog();
    } catch (error) {
      // 에러는 onConfirm 내부에서 처리되어야 함
      console.error('Confirm dialog error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (isProcessing) return;
    dialog?.onCancel?.();
    closeDialog();
  }, [isProcessing, dialog, closeDialog]);

  // 다이얼로그가 열릴 때 포커스 트랩
  useEffect(() => {
    if (dialog) {
      // 첫 번째 버튼에 포커스
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    }
  }, [dialog]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, isProcessing, handleCancel]);

  if (!dialog) return null;

  const buttonVariantStyles =
    dialog.confirmButtonVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* 다이얼로그 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          z-50
          bg-white rounded-lg shadow-xl
          max-w-md w-full mx-4
          p-6
        "
      >
        {/* 제목 */}
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          {dialog.title}
        </h2>

        {/* 메시지 */}
        <p
          id="confirm-dialog-description"
          className="text-sm text-gray-600 mb-6"
        >
          {dialog.message}
        </p>

        {/* 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            className="
              px-4 py-2
              border border-gray-300 rounded-md
              text-sm font-medium text-gray-700
              hover:bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {dialog.cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            aria-busy={isProcessing}
            className={`
              px-4 py-2
              border border-transparent rounded-md
              text-sm font-medium text-white
              ${buttonVariantStyles}
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isProcessing ? '처리 중...' : dialog.confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
