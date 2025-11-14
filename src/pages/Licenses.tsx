import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Text } from '../components/ui/text';

/**
 * 오픈소스 라이센스 고지 페이지
 *
 * 프로젝트에서 사용 중인 모든 오픈소스 라이브러리의 라이센스 정보를 표시합니다.
 * public/LICENSES.txt 파일의 내용을 읽어 화면에 출력합니다.
 *
 * @returns 라이센스 고지 페이지 컴포넌트
 */
export function Licenses() {
  const [licenseText, setLicenseText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * 라이센스 텍스트 파일을 가져옵니다
     */
    const fetchLicenses = async () => {
      try {
        const response = await fetch('/LICENSES.txt');
        if (!response.ok) {
          throw new Error('라이센스 파일을 불러올 수 없습니다.');
        }
        const text = await response.text();
        setLicenseText(text);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">라이센스 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>오류</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Heading level={2} className="mb-4">
              라이센스 정보 로딩 실패
            </Heading>
            <Text className="mb-8">{error}</Text>
          </div>
          <Button href="/">홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Heading>오픈소스 라이센스</Heading>
            <Button href="/" plain>
              ← 돌아가기
            </Button>
          </div>
          <Text>
            본 소프트웨어는 다음의 오픈소스 라이브러리를 사용합니다.
            <br />
            모든 라이브러리는 상업적 사용이 가능한 오픈소스 라이센스를 따릅니다.
          </Text>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800 bg-gray-50 p-4 rounded border overflow-x-auto">
              {licenseText}
            </pre>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Text>
            상세한 라이센스 분석 문서는{' '}
            <a
              href="https://github.com/bearholmes/a11y-my-works/blob/main/.doc/dependency-licenses.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              프로젝트 문서
            </a>
            에서 확인하실 수 있습니다.
          </Text>
        </div>
      </div>
    </div>
  );
}
