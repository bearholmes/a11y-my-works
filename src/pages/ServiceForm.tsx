import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
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
      alert('서비스가 생성되었습니다.');
      navigate('/services');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
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
      alert('서비스가 수정되었습니다.');
      navigate('/services');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
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
          서비스 {isEditMode ? '수정' : '등록'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          서비스 정보를 {isEditMode ? '수정' : '입력'}합니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-sm rounded-lg border p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="cost_group_id"
            className="block text-sm font-medium text-gray-700"
          >
            청구 그룹 <span className="text-red-500">*</span>
          </label>
          <select
            {...register('cost_group_id', { valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>청구 그룹 선택</option>
            {costGroups?.map((group: any) => (
              <option key={group.cost_group_id} value={group.cost_group_id}>
                {group.name}
              </option>
            ))}
          </select>
          {errors.cost_group_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.cost_group_id.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            서비스명 <span className="text-red-500">*</span>
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

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? '처리 중...'
              : isEditMode
                ? '수정'
                : '등록'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
