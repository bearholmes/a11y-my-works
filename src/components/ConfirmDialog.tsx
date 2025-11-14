import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useState } from 'react';
import {
  closeConfirmDialogAtom,
  confirmDialogAtom,
} from '../stores/notificationStore';
import { Alert, AlertActions, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

/**
 * 확인 다이얼로그 컴포넌트
 * 앱의 최상위 레벨에 배치되어 확인 다이얼로그를 표시
 */
export function ConfirmDialog() {
  const [dialog] = useAtom(confirmDialogAtom);
  const closeDialog = useSetAtom(closeConfirmDialogAtom);
  const [isProcessing, setIsProcessing] = useState(false);

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

  if (!dialog) return null;

  const isDanger = dialog.confirmButtonVariant === 'danger';

  return (
    <Alert open={!!dialog} onClose={handleCancel}>
      <AlertTitle>{dialog.title}</AlertTitle>
      <AlertDescription>{dialog.message}</AlertDescription>
      <AlertActions>
        <Button plain onClick={handleCancel} disabled={isProcessing}>
          {dialog.cancelText}
        </Button>
        <Button
          color={isDanger ? 'red' : undefined}
          onClick={handleConfirm}
          disabled={isProcessing}
          aria-busy={isProcessing}
        >
          {isProcessing ? '처리 중...' : dialog.confirmText}
        </Button>
      </AlertActions>
    </Alert>
  );
}
