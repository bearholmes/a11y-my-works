import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Checkbox, CheckboxField } from '../components/ui/checkbox';
import {
  Description,
  ErrorMessage,
  Field,
  Label,
} from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
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
    control,
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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Heading>{isEditMode ? '사용자 수정' : '사용자 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-2xl bg-white dark:bg-zinc-900 rounded-lg p-6 space-y-6"
        aria-label={isEditMode ? '사용자 수정 폼' : '사용자 등록 폼'}
      >
        <Field>
          <Label>
            이름{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            type="text"
            aria-required="true"
            aria-invalid={!!errors.name}
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </Field>

        <Field>
          <Label>
            계정 ID{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Input
            id="account_id"
            {...register('account_id')}
            type="text"
            disabled={isEditMode}
            aria-required="true"
            aria-invalid={!!errors.account_id}
          />
          {errors.account_id && (
            <ErrorMessage>{errors.account_id.message}</ErrorMessage>
          )}
          {isEditMode && (
            <Description>계정 ID는 수정할 수 없습니다.</Description>
          )}
        </Field>

        <Field>
          <Label>
            이메일{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Input
            id="email"
            {...register('email')}
            type="email"
            disabled={isEditMode}
            aria-required="true"
            aria-invalid={!!errors.email}
          />
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          {isEditMode && (
            <Description>이메일은 수정할 수 없습니다.</Description>
          )}
        </Field>

        <Field>
          <Label>휴대폰 번호</Label>
          <Input
            id="mobile"
            {...register('mobile')}
            type="tel"
            placeholder="010-1234-5678"
            aria-label="휴대폰 번호 입력"
            aria-invalid={!!errors.mobile}
          />
          {errors.mobile && (
            <ErrorMessage>{errors.mobile.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>
            역할{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Select
            id="role_id"
            {...register('role_id', { valueAsNumber: true })}
            aria-required="true"
            aria-invalid={!!errors.role_id}
          >
            <option value={0}>역할 선택</option>
            {rolesData?.data.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.name}
              </option>
            ))}
          </Select>
          {errors.role_id && (
            <ErrorMessage>{errors.role_id.message}</ErrorMessage>
          )}
        </Field>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <CheckboxField>
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                aria-label="사용자 활성 상태"
              />
              <Label>활성 상태</Label>
            </CheckboxField>
          )}
        />

        <Controller
          name="requires_daily_report"
          control={control}
          render={({ field }) => (
            <CheckboxField>
              <Checkbox checked={field.value} onChange={field.onChange} />
              <Label>업무보고 작성 의무</Label>
              <Description>
                체크 시 일일 업무보고 작성 대상자로 분류됩니다
              </Description>
            </CheckboxField>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            aria-label={isEditMode ? '사용자 정보 수정 저장' : '사용자 등록'}
            aria-busy={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                처리 중...
              </span>
            ) : isEditMode ? (
              '수정'
            ) : (
              '등록'
            )}
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
