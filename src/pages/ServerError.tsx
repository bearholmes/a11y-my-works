import { Link } from 'react-router-dom';

/**
 * 500 서버 에러 페이지
 *
 * 서버 내부 오류 또는 예상치 못한 에러가 발생했을 때 표시됩니다.
 *
 * @returns 500 에러 페이지 컴포넌트
 */
export function ServerError() {
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
              <title>서버 오류</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            서버 오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-8">
            일시적인 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            페이지 새로고침
          </button>
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
