import { Link } from 'react-router-dom';

/**
 * 404 페이지를 찾을 수 없음 에러 페이지
 *
 * 사용자가 존재하지 않는 URL에 접근했을 때 표시됩니다.
 *
 * @returns 404 에러 페이지 컴포넌트
 */
export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>페이지를 찾을 수 없음</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
            <br />
            주소를 다시 확인하시거나 홈으로 돌아가세요.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            홈으로 돌아가기
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
