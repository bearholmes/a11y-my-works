import { getShortcutList } from '../hooks/useKeyboardShortcuts';
import { Button } from './ui/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 키보드 단축키 도움말 모달
 */
export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const shortcuts = getShortcutList();

  return (
    <Dialog open={isOpen} onClose={onClose} size="2xl">
      <DialogTitle>키보드 단축키</DialogTitle>
      <DialogDescription>
        다음 키보드 단축키를 사용하여 빠르게 탐색할 수 있습니다.
      </DialogDescription>
      <DialogBody>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-950/10 dark:border-white/10">
              <th
                className="text-left py-2 px-3 text-sm font-semibold text-zinc-950 dark:text-white"
                scope="col"
              >
                단축키
              </th>
              <th
                className="text-left py-2 px-3 text-sm font-semibold text-zinc-950 dark:text-white"
                scope="col"
              >
                설명
              </th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((shortcut, index) => (
              <tr
                key={index}
                className="border-b border-zinc-950/5 last:border-b-0 hover:bg-zinc-950/[2.5%] dark:border-white/5 dark:hover:bg-white/[2.5%]"
              >
                <td className="py-3 px-3">
                  <kbd className="px-2 py-1 text-xs font-semibold text-zinc-950 bg-zinc-100 border border-zinc-200 rounded dark:text-white dark:bg-zinc-800 dark:border-zinc-700">
                    {shortcut.key}
                  </kbd>
                </td>
                <td className="py-3 px-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {shortcut.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}
