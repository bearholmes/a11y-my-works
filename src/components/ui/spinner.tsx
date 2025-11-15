import clsx from 'clsx';

/**
 * 스피너 컴포넌트의 Props 인터페이스
 */
export interface SpinnerProps {
  /**
   * 스피너의 크기
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * 스피너의 색상 클래스
   * @default 'text-gray-500'
   */
  className?: string;
  /**
   * 스크린 리더를 위한 로딩 메시지
   * @default '로딩 중...'
   */
  label?: string;
}

const sizeStyles = {
  sm: 'size-4',
  md: 'size-8',
  lg: 'size-12',
  xl: 'size-16',
};

/**
 * 로딩 상태를 나타내는 스피너 컴포넌트
 *
 * @description
 * 사용자에게 로딩 중임을 시각적으로 표시하는 애니메이션 스피너입니다.
 * 접근성을 위해 role="status"와 스크린 리더용 텍스트를 포함합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Spinner />
 *
 * // 크기 조정
 * <Spinner size="lg" />
 *
 * // 커스텀 색상
 * <Spinner className="text-blue-500" />
 *
 * // 커스텀 로딩 메시지
 * <Spinner label="데이터를 불러오는 중..." />
 * ```
 */
export function Spinner({
  size = 'md',
  className,
  label = '로딩 중...',
}: SpinnerProps) {
  return (
    <div role="status" className="inline-flex items-center justify-center">
      <svg
        aria-hidden="true"
        className={clsx(
          'animate-spin fill-gray-800 dark:fill-gray-500',
          sizeStyles[size],
          className || 'text-gray-200'
        )}
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * 전체 화면을 덮는 로딩 오버레이 컴포넌트
 *
 * @description
 * 화면 전체를 어둡게 처리하고 중앙에 스피너를 표시합니다.
 * 모달이나 페이지 로딩 시 사용하기 적합합니다.
 *
 * @example
 * ```tsx
 * {isLoading && <SpinnerOverlay />}
 * ```
 */
export function SpinnerOverlay({
  label = '로딩 중...',
}: Pick<SpinnerProps, 'label'>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-lg bg-white p-6 dark:bg-zinc-900">
        <Spinner size="lg" label={label} />
      </div>
    </div>
  );
}
