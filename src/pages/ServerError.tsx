import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Text } from '../components/ui/text';

/**
 * 500 서버 에러 페이지
 *
 * 서버 내부 오류 또는 예상치 못한 에러가 발생했을 때 표시됩니다.
 *
 * @returns 500 에러 페이지 컴포넌트
 */
export function ServerError() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-950 rounded-full mb-4">
            <ExclamationCircleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            500
          </h1>
          <Heading level={2} className="mb-4">
            서버 오류가 발생했습니다
          </Heading>
          <Text className="mb-8">
            일시적인 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </Text>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            페이지 새로고침
          </Button>
          <Button href="/" outline className="w-full">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
