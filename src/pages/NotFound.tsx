import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Text } from '../components/ui/text';

/**
 * 404 페이지를 찾을 수 없음 에러 페이지
 *
 * 사용자가 존재하지 않는 URL에 접근했을 때 표시됩니다.
 *
 * @returns 404 에러 페이지 컴포넌트
 */
export function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-950 rounded-full mb-4">
            <QuestionMarkCircleIcon className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            404
          </h1>
          <Heading level={2} className="mb-4">
            페이지를 찾을 수 없습니다
          </Heading>
          <Text className="mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
            <br />
            주소를 다시 확인하시거나 홈으로 돌아가세요.
          </Text>
        </div>

        <div className="space-y-3">
          <Button href="/" className="w-full">
            홈으로 돌아가기
          </Button>
          <Button
            type="button"
            onClick={() => window.history.back()}
            outline
            className="w-full"
          >
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
}
