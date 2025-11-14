import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { useNotification } from '../hooks/useNotification';
import { memberAPI, roleAPI } from '../services/api';

const memberSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  account_id: z.string().min(1, '계정 ID를 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  mobile: z.string().optional(),
  role_id: z.number().min(1, '역할을 선택해주세요'),
  is_active: z.boolean(),
  requires_daily_report: z.boolean(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export function MemberForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const { showSuccess, showError } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      is_active: true,
      requires_daily_report: true,
    },
  });

  // 역할 목록 조회
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleAPI.getRoles({ isActive: true }),
  });

  // 수정 모드일 때 사용자 정보 조회
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => memberAPI.getMember(Number(id)),
    enabled: isEditMode,
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        account_id: member.account_id,
        email: member.email,
        mobile: member.mobile || '',
        role_id: member.role_id || 0,
        is_active: member.is_active,
        requires_daily_report: member.requires_daily_report,
      });
    }
  }, [member, reset]);

  // 사용자 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: number;
      data: MemberFormData;
    }) => memberAPI.updateMember(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      showSuccess('사용자 정보가 수정되었습니다.');
      navigate('/members');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ memberId: Number(id), data });
    }
  };

  if (isEditMode && memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Heading>{isEditMode ? '사용자 수정' : '사용자 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-2xl bg-white shadow-sm rounded-lg border p-6 space-y-6"
        aria-label={isEditMode ? '사용자 수정 폼' : '사용자 등록 폼'}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            이름{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </label>
          <Input
            id="name"
            {...register('name')}
            type="text"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p
              id="name-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="account_id"
            className="block text-sm font-medium text-gray-700"
          >
            계정 ID{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </label>
          <Input
            id="account_id"
            {...register('account_id')}
            type="text"
            disabled={isEditMode}
            aria-required="true"
            aria-invalid={!!errors.account_id}
            aria-describedby={
              errors.account_id ? 'account_id-error' : undefined
            }
          />
          {errors.account_id && (
            <p
              id="account_id-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.account_id.message}
            </p>
          )}
          {isEditMode && (
            <p className="mt-1 text-sm text-gray-500">
              계정 ID는 수정할 수 없습니다.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            이메일{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </label>
          <Input
            id="email"
            {...register('email')}
            type="email"
            disabled={isEditMode}
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
          {isEditMode && (
            <p className="mt-1 text-sm text-gray-500">
              이메일은 수정할 수 없습니다.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-700"
          >
            휴대폰 번호
          </label>
          <Input
            id="mobile"
            {...register('mobile')}
            type="tel"
            placeholder="010-1234-5678"
            aria-label="휴대폰 번호 입력"
            aria-invalid={!!errors.mobile}
            aria-describedby={errors.mobile ? 'mobile-error' : undefined}
          />
          {errors.mobile && (
            <p
              id="mobile-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.mobile.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="role_id"
            className="block text-sm font-medium text-gray-700"
          >
            역할{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </label>
          <Select
            id="role_id"
            {...register('role_id', { valueAsNumber: true })}
            aria-required="true"
            aria-invalid={!!errors.role_id}
            aria-describedby={errors.role_id ? 'role_id-error' : undefined}
          >
            <option value={0}>역할 선택</option>
            {rolesData?.data.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.name}
              </option>
            ))}
          </Select>
          {errors.role_id && (
            <p
              id="role_id-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.role_id.message}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="is_active"
            {...register('is_active')}
            type="checkbox"
            aria-label="사용자 활성 상태"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_active"
            className="ml-2 block text-sm text-gray-900"
          >
            활성 상태
          </label>
        </div>

        <div className="flex items-center">
          <input
            {...register('requires_daily_report')}
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="requires_daily_report"
            className="ml-2 block text-sm text-gray-900"
          >
            업무보고 작성 의무
          </label>
          <span className="ml-2 text-xs text-gray-500">
            (체크 시 일일 업무보고 작성 대상자로 분류됩니다)
          </span>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            aria-label={isEditMode ? '사용자 정보 수정 저장' : '사용자 등록'}
            aria-busy={updateMutation.isPending}
          >
            {updateMutation.isPending
              ? '처리 중...'
              : isEditMode
                ? '수정'
                : '등록'}
          </Button>
          <Button
            type="button"
            plain
            onClick={() => navigate('/members')}
            aria-label="사용자 등록 취소하고 목록으로 돌아가기"
          >
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
