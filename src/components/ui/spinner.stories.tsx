import { Spinner, SpinnerOverlay } from './spinner';

/**
 * 스피너 컴포넌트 사용 예시
 *
 * 이 파일은 Storybook이나 개발 참고용으로 다양한 스피너 사용 예시를 보여줍니다.
 */

export function SpinnerExamples() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">기본 스피너</h2>
        <div className="flex items-center gap-4">
          <Spinner />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">크기 옵션</h2>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="text-sm">Medium (기본)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <span className="text-sm">Large</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="xl" />
            <span className="text-sm">Extra Large</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">색상 커스터마이징</h2>
        <div className="flex items-center gap-4">
          <Spinner className="text-blue-500" />
          <Spinner className="text-green-500" />
          <Spinner className="text-red-500" />
          <Spinner className="text-purple-500" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">버튼 내부 스피너</h2>
        <div className="flex gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
            disabled
          >
            <Spinner size="sm" className="text-white" />
            로딩 중...
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2"
            disabled
          >
            <Spinner size="sm" className="text-gray-600" />
            처리 중...
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">중앙 정렬 스피너</h2>
        <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200">
          <Spinner size="lg" label="데이터를 불러오는 중..." />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">카드 내부 스피너</h2>
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 text-base font-semibold">데이터 로딩 중</h3>
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">인라인 텍스트와 함께</h2>
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span>업데이트를 확인하는 중입니다...</span>
        </div>
      </section>
    </div>
  );
}

/**
 * 오버레이 스피너 예시
 */
export function OverlayExample() {
  return (
    <div className="relative h-64">
      <p>이 영역은 오버레이로 덮여집니다.</p>
      <SpinnerOverlay label="페이지를 불러오는 중..." />
    </div>
  );
}

/**
 * TanStack Query와 함께 사용하는 예시
 */
export function QueryExample() {
  // 예시 코드 (실제 구현 아님)
  const exampleCode = `
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@tanstack/react-query';

function TaskList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" label="업무 목록을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return <div>에러가 발생했습니다.</div>;
  }

  return <div>{/* 데이터 렌더링 */}</div>;
}
`;

  return (
    <div className="p-8">
      <h2 className="mb-4 text-lg font-semibold">TanStack Query 통합 예시</h2>
      <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
        <code>{exampleCode}</code>
      </pre>
    </div>
  );
}

/**
 * 조건부 렌더링 예시
 */
export function ConditionalExample() {
  const exampleCode = `
import { Spinner, SpinnerOverlay } from '@/components/ui/spinner';

function MyPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {/* 페이지 전체 로딩 */}
      {isLoading && <SpinnerOverlay />}

      {/* 섹션 로딩 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div>{/* 컨텐츠 */}</div>
      )}
    </div>
  );
}
`;

  return (
    <div className="p-8">
      <h2 className="mb-4 text-lg font-semibold">조건부 렌더링 예시</h2>
      <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
        <code>{exampleCode}</code>
      </pre>
    </div>
  );
}
