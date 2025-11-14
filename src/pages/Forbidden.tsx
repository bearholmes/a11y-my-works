import { LockClosedIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Text } from '../components/ui/text';

export function Forbidden() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-950 rounded-full mb-4">
            <LockClosedIcon className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            403
          </h1>
          <Heading level={2} className="mb-4">
            접근 권한이 없습니다
          </Heading>
          <Text className="mb-8">
            이 페이지에 접근할 권한이 없습니다.
            <br />
            관리자에게 문의하시거나 홈으로 돌아가세요.
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
