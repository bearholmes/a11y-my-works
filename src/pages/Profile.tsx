import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuthContext } from '../providers/AuthProvider';
import { memberAPI } from '../services/api';

const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  account_id: z.string().min(1, '계정 ID를 입력해주세요'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function Profile() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 현재 사용자 프로필 조회
  const { data: profile, isLoading } = useQuery({
    queryKey: ['memberProfile', user?.id],
    queryFn: () => memberAPI.getCurrentMember(),
    enabled: !!user?.id,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || '',
      account_id: profile?.account_id || '',
    },
  });

  // 프로필 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      if (!profile?.member_id) throw new Error('프로필 정보를 찾을 수 없습니다');
      return memberAPI.updateMember(profile.member_id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberProfile'] });
      setSuccess('프로필이 수정되었습니다.');
      setError('');
    },
    onError: (err) => {
      setError((err as Error).message);
      setSuccess('');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    setError('');
    setSuccess('');
    updateMutation.mutate(data);
  };

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
          개인 정보를 관리하고 수정할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로필 정보 카드 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {profile.name.charAt(0)}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {profile.name}
              </h2>
              <p className="text-sm text-gray-500">@{profile.account_id}</p>
              <p className="mt-2 text-sm text-gray-600">{profile.email}</p>

              <div className="mt-6 w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">역할</span>
                  <span className="font-medium text-gray-900">
                    {profile.roles?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">상태</span>
                  <span
                    className={`font-medium ${profile.is_active ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    {profile.is_active ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">승인 상태</span>
                  <span
                    className={`font-medium ${
                      profile.is_approved
                        ? 'text-green-600'
                        : profile.approval_rejected_at
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {profile.is_approved
                      ? '승인됨'
                      : profile.approval_rejected_at
                        ? '거절됨'
                        : '대기 중'}
                  </span>
                </div>
              </div>

              <div className="mt-6 w-full">
                <Link
                  to="/change-password"
                  className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  비밀번호 변경
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 프로필 수정 폼 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              프로필 수정
            </h3>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이름 *
                </label>
                <input
                  id="name"
                  type="text"
                  {...form.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="홍길동"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="account_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  계정 ID *
                </label>
                <input
                  id="account_id"
                  type="text"
                  {...form.register('account_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user123"
                />
                {form.formState.errors.account_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.account_id.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => form.reset()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
