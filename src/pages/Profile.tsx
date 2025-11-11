import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { memberAPI } from '../services/api';

export function Profile() {
  const { user } = useAuthContext();

  // 현재 사용자 프로필 조회
  const { data: profile, isLoading } = useQuery({
    queryKey: ['memberProfile', user?.id],
    queryFn: () => memberAPI.getCurrentMember(),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">프로필 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
        <p className="mt-1 text-sm text-gray-500">
          개인 정보를 확인할 수 있습니다.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow">
          {/* 프로필 헤더 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">
                  {profile.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-500">@{profile.account_id}</p>
              </div>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                이메일
              </label>
              <p className="text-base text-gray-900">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                역할
              </label>
              <p className="text-base text-gray-900">
                {profile.roles?.name || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                상태
              </label>
              <p
                className={`text-base font-medium ${profile.is_active ? 'text-green-600' : 'text-gray-600'}`}
              >
                {profile.is_active ? '활성' : '비활성'}
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <Link
              to="/change-password"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              비밀번호 변경
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
