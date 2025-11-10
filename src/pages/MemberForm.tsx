import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { memberAPI, roleAPI } from '../services/api';

const memberSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  account_id: z.string().min(1, '계정 ID를 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  mobile: z.string().optional(),
  role_id: z.number().min(1, '역할을 선택해주세요'),
  is_active: z.boolean(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export function MemberForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      is_active: true,
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
      alert('사용자 정보가 수정되었습니다.');
      navigate('/members');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          사용자 {isEditMode ? '수정' : '등록'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          사용자 정보를 {isEditMode ? '수정' : '입력'}합니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-sm rounded-lg border p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="account_id"
            className="block text-sm font-medium text-gray-700"
          >
            계정 ID <span className="text-red-500">*</span>
          </label>
          <input
            {...register('account_id')}
            type="text"
            disabled={isEditMode}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {errors.account_id && (
            <p className="mt-1 text-sm text-red-600">
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
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            disabled={isEditMode}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
          <input
            {...register('mobile')}
            type="tel"
            placeholder="010-1234-5678"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="role_id"
            className="block text-sm font-medium text-gray-700"
          >
            역할 <span className="text-red-500">*</span>
          </label>
          <select
            {...register('role_id', { valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>역할 선택</option>
            {rolesData?.data.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.role_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.role_id.message}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...register('is_active')}
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_active"
            className="ml-2 block text-sm text-gray-900"
          >
            활성 상태
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {updateMutation.isPending
              ? '처리 중...'
              : isEditMode
                ? '수정'
                : '등록'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
