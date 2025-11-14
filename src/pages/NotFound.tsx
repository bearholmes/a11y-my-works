import { Button } from '../components/ui/button';

/**
 * 404 페이지를 찾을 수 없음 에러 페이지
 *
 * 사용자가 존재하지 않는 URL에 접근했을 때 표시됩니다.
 *
 * @returns 404 에러 페이지 컴포넌트
 */
export function NotFound() {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-zinc-950">
      <div className="text-center">
        <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
          404
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-7xl dark:text-white">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-zinc-500 sm:text-xl/8 dark:text-zinc-400">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button href="/" color="blue">
            홈으로 돌아가기
          </Button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-sm font-semibold text-zinc-900 dark:text-white"
          >
            이전 페이지로 <span aria-hidden="true">&larr;</span>
          </button>
        </div>
      </div>
    </main>
  );
}
