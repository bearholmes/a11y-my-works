import type { ReactNode } from 'react';
import { Badge } from './ui/badge';
import { Divider } from './ui/divider';

interface StatProps {
  title: string;
  value: string | number;
  change?: string;
  description?: string;
  className?: string;
  icon?: ReactNode;
}

/**
 * 통계 카드 컴포넌트
 *
 * @example
 * <Stat
 *   title="총 업무 수"
 *   value="128"
 *   change="+12.5%"
 *   description="이번 주"
 *   className="custom-class"
 *   icon={<DocumentTextIcon className="h-6 w-6" />}
 * />
 */
export function Stat({
  title,
  value,
  change,
  description,
  className,
  icon,
}: StatProps) {
  return (
    <div className={className}>
      <Divider />
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="text-lg/6 font-medium sm:text-sm/6">{title}</div>
        {icon && <div className="text-zinc-500 dark:text-zinc-400">{icon}</div>}
      </div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      {(change || description) && (
        <div className="mt-3 text-sm/6 sm:text-xs/6">
          {change && (
            <>
              <Badge
                color={
                  change.startsWith('+')
                    ? 'lime'
                    : change.startsWith('-')
                      ? 'pink'
                      : 'zinc'
                }
              >
                {change}
              </Badge>{' '}
            </>
          )}
          {description && (
            <span className="text-zinc-500 dark:text-zinc-400">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
