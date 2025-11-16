import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { ErrorMessage, Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Spinner } from '../components/ui/spinner';
import { useNotification } from '../hooks/useNotification';
import { serviceAPI } from '../services/api';

const serviceSchema = z.object({
  name: z.string().min(1, '서비스명을 입력해주세요'),
  cost_group_id: z.number().min(1, '청구 그룹을 선택해주세요'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceForm() {
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
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  // 청구 그룹 목록 조회
  const { data: costGroups } = useQuery({
    queryKey: ['costGroups'],
    queryFn: () => serviceAPI.getCostGroupsForFilter(),
  });

  // 수정 모드일 때 서비스 정보 조회
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceAPI.getService(Number(id)),
    enabled: isEditMode,
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        cost_group_id: service.cost_group_id || 0,
      });
    }
  }, [service, reset]);

  // 서비스 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: ServiceFormData) =>
      serviceAPI.createService({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      showSuccess('서비스가 생성되었습니다.');
      navigate('/services');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 서비스 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      serviceId,
      data,
    }: {
      serviceId: number;
      data: ServiceFormData;
    }) => serviceAPI.updateService(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      showSuccess('서비스가 수정되었습니다.');
      navigate('/services');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ serviceId: Number(id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditMode && serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Heading>{isEditMode ? '서비스 수정' : '서비스 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8  bg-white dark:bg-zinc-900 rounded-lg p-6 space-y-6"
        aria-label={isEditMode ? '서비스 수정 폼' : '서비스 등록 폼'}
      >
        <Field>
          <Label>
            청구 그룹{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Select
            id="cost_group_id"
            {...register('cost_group_id', { valueAsNumber: true })}
            aria-required="true"
            aria-invalid={!!errors.cost_group_id}
          >
            <option value={0}>청구 그룹 선택</option>
            {costGroups?.map((group: any) => (
              <option key={group.cost_group_id} value={group.cost_group_id}>
                {group.name}
              </option>
            ))}
          </Select>
          {errors.cost_group_id && (
            <ErrorMessage>{errors.cost_group_id.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>
            서비스명{' '}
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

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            aria-label={isEditMode ? '서비스 수정 저장' : '서비스 등록'}
            aria-busy={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
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
            onClick={() => navigate('/services')}
            aria-label="서비스 등록 취소하고 목록으로 돌아가기"
          >
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
