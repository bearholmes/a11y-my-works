import { Button } from '../components/ui/button';

/**
 * 500 서버 에러 페이지
 *
 * 서버 내부 오류 또는 예상치 못한 에러가 발생했을 때 표시됩니다.
 *
 * @returns 500 에러 페이지 컴포넌트
 */
export function ServerError() {
  return (
    <main className="grid min-h-full min-w-3xl place-items-center bg-white px-6 py-24 dark:bg-zinc-950">
      <div className="text-center">
        <p className="text-base font-semibold text-red-600 dark:text-red-400">
          500
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-zinc-900 dark:text-white">
          서버 오류가 발생했습니다
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-zinc-500 dark:text-zinc-400">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            color="zinc"
          >
            페이지 새로고침
          </Button>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="text-sm font-semibold text-zinc-900 dark:text-white"
          >
            홈으로 돌아가기 <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </main>
  );
}
