import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Divider } from '../components/ui/divider';
import { Heading, Subheading } from '../components/ui/heading';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
import { useAuthContext } from '../providers/AuthProvider';
import { memberAPI } from '../services/api';
import { getAvatarColors } from '../utils/avatarColor';

export function Profile() {
  const { user } = useAuthContext();

  // 현재 사용자 프로필 조회
  const { data: profile, isLoading } = useQuery({
    queryKey: ['memberProfile', user?.id],
    queryFn: () => memberAPI.getCurrentMember(),
    enabled: !!user?.id,
  });

  // account_id 기반 아바타 색상 계산
  const avatarColors = useMemo(() => {
    if (profile?.account_id) {
      return getAvatarColors(profile.account_id);
    }
    return null;
  }, [profile?.account_id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
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
    <>
      <Heading>내 프로필</Heading>
      <Text className="mt-2">개인 정보를 확인할 수 있습니다.</Text>

      <Divider className="my-10 mt-6" />

      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={
            avatarColors
              ? {
                  backgroundColor: avatarColors.backgroundColor,
                  color: avatarColors.textColor,
                }
              : {
                  backgroundColor: '#e4e4e7',
                  color: '#52525b',
                }
          }
        >
          <span className="text-2xl font-bold uppercase">
            {profile.account_id.charAt(0)}
          </span>
        </div>
        <div>
          <Subheading>{profile.name}</Subheading>
          <Text>@{profile.account_id}</Text>
        </div>
      </div>

      <dl className="space-y-6 max-w-2xl">
        <div>
          <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            이메일
          </dt>
          <dd className="mt-1 text-sm/6 text-zinc-950 dark:text-white">
            {profile.email}
          </dd>
        </div>

        <div>
          <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            역할
          </dt>
          <dd className="mt-1 text-sm/6 text-zinc-950 dark:text-white">
            {profile.roles?.name || '-'}
          </dd>
        </div>

        <div>
          <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            상태
          </dt>
          <dd className="mt-1">
            <Badge color={profile.is_active ? 'lime' : 'zinc'}>
              {profile.is_active ? '활성' : '비활성'}
            </Badge>
          </dd>
        </div>
      </dl>

      <Divider className="my-10" />

      <div className="flex gap-3">
        <Button href="/change-password">비밀번호 변경</Button>
      </div>
    </>
  );
}
