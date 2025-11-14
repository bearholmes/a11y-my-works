import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../hooks/useNotification';
import { costGroupAPI } from '../services/api';

const costGroupSchema = z.object({
  name: z.string().min(1, '청구 그룹명을 입력해주세요'),
  description: z.string().optional(),
});

type CostGroupFormData = z.infer<typeof costGroupSchema>;

export function CostGroupForm() {
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
  } = useForm<CostGroupFormData>({
    resolver: zodResolver(costGroupSchema),
  });

  // 수정 모드일 때 청구 그룹 정보 조회
  const { data: costGroup, isLoading: costGroupLoading } = useQuery({
    queryKey: ['costGroup', id],
    queryFn: () => costGroupAPI.getCostGroup(Number(id)),
    enabled: isEditMode,
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (costGroup) {
      reset({
        name: costGroup.name,
        description: costGroup.description || '',
      });
    }
  }, [costGroup, reset]);

  // 청구 그룹 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: CostGroupFormData) =>
      costGroupAPI.createCostGroup({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costGroups'] });
      showSuccess('청구 그룹이 생성되었습니다.');
      navigate('/cost-groups');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 청구 그룹 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      costGroupId,
      data,
    }: {
      costGroupId: number;
      data: CostGroupFormData;
    }) => costGroupAPI.updateCostGroup(costGroupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costGroups'] });
      queryClient.invalidateQueries({ queryKey: ['costGroup', id] });
      showSuccess('청구 그룹이 수정되었습니다.');
      navigate('/cost-groups');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const onSubmit = async (data: CostGroupFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ costGroupId: Number(id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditMode && costGroupLoading) {
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
      <Heading>{isEditMode ? '청구 그룹 수정' : '청구 그룹 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-2xl bg-white shadow-sm rounded-lg border p-6 space-y-6"
        aria-label={isEditMode ? '청구 그룹 수정 폼' : '청구 그룹 등록 폼'}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            청구 그룹명{' '}
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
            placeholder="예: 내부사업, 구글, 애플"
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
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            설명
          </label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            aria-label="청구 그룹 설명 입력"
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? 'description-error' : undefined
            }
            placeholder="청구 그룹에 대한 설명을 입력하세요"
          />
          {errors.description && (
            <p
              id="description-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            aria-label={isEditMode ? '청구 그룹 수정 저장' : '청구 그룹 등록'}
            aria-busy={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? '처리 중...'
              : isEditMode
                ? '수정'
                : '등록'}
          </Button>
          <Button
            type="button"
            plain
            onClick={() => navigate('/cost-groups')}
            aria-label="청구 그룹 등록 취소하고 목록으로 돌아가기"
          >
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
