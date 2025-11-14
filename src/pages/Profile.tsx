import { useQuery } from '@tanstack/react-query';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Heading, Subheading } from '../components/ui/heading';
import { Text } from '../components/ui/text';
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
        <Heading>내 프로필</Heading>
        <Text className="mt-1">개인 정보를 확인할 수 있습니다.</Text>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-zinc-900 rounded-lg">
          {/* 프로필 헤더 */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {profile.name.charAt(0)}
                </span>
              </div>
              <div>
                <Subheading>{profile.name}</Subheading>
                <Text>@{profile.account_id}</Text>
              </div>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="p-6 space-y-4">
            <div>
              <Text className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                이메일
              </Text>
              <Text className="text-zinc-900 dark:text-zinc-100">
                {profile.email}
              </Text>
            </div>

            <div>
              <Text className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                역할
              </Text>
              <Text className="text-zinc-900 dark:text-zinc-100">
                {profile.roles?.name || '-'}
              </Text>
            </div>

            <div>
              <Text className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                상태
              </Text>
              <Badge color={profile.is_active ? 'green' : 'zinc'}>
                {profile.is_active ? '활성' : '비활성'}
              </Badge>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="p-6 border-t bg-zinc-50 dark:bg-zinc-950">
            <Button href="/change-password">비밀번호 변경</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
