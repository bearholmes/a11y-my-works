import { useAuthContext } from '../providers/AuthProvider';

/**
 * 승인 대기 화면
 * 가입은 완료되었지만 관리자의 승인을 기다리는 사용자에게 표시됩니다.
 */
export function PendingApprovalScreen() {
  const { signOut, user } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          {/* 아이콘 */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* 메시지 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            승인 대기 중
          </h2>
          <p className="text-gray-600 mb-6">
            회원가입이 완료되었습니다.
            <br />
            관리자의 승인 후 시스템을 이용하실 수 있습니다.
          </p>

          {/* 사용자 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="text-sm text-gray-500 mb-1">가입 이메일</div>
            <div className="text-gray-900 font-medium">{user?.email}</div>
          </div>

          {/* 안내 사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📌 다음 단계
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 관리자가 계정을 검토합니다</li>
              <li>• 역할이 할당되면 이메일로 알림을 받게 됩니다</li>
              <li>• 승인 후 다시 로그인하여 이용하실 수 있습니다</li>
            </ul>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            로그아웃
          </button>

          {/* 문의 안내 */}
          <p className="mt-4 text-xs text-gray-500">
            문의사항이 있으시면 관리자에게 연락해주세요
          </p>
        </div>
      </div>
    </div>
  );
}
