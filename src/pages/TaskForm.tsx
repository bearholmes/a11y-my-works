import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { businessAPI, codeAPI, taskAPI } from '../services/api';

const taskSchema = z.object({
  task_date: z.string().min(1, '날짜를 입력해주세요'),
  task_name: z.string().min(1, '업무명을 입력해주세요'),
  task_detail: z.string().optional(),
  task_url: z.string().url().optional().or(z.literal('')),
  work_time: z.number().min(0).optional(),
  cost_group_id: z.number().optional(),
  service_id: z.number().optional(),
  project_id: z.number().optional(),
  platform_id: z.number().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TaskForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [selectedCostGroup, setSelectedCostGroup] = useState<number | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_date: new Date().toISOString().split('T')[0],
    },
  });

  // 코드 및 비즈니스 데이터 조회
  const { data: costGroups } = useQuery({
    queryKey: ['costGroups'],
    queryFn: businessAPI.getCostGroups,
  });

  const { data: services } = useQuery({
    queryKey: ['services', selectedCostGroup],
    queryFn: () => businessAPI.getServices(selectedCostGroup || undefined),
    enabled: Boolean(selectedCostGroup),
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', selectedService],
    queryFn: () => businessAPI.getProjects(selectedService || undefined),
    enabled: Boolean(selectedService),
  });

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: codeAPI.getPlatforms,
  });

  // 수정 모드일 때 기존 데이터 조회 (현재는 주석 처리)
  // const { data: existingTask } = useQuery({
  //   queryKey: ['task', id],
  //   queryFn: () => {
  //     if (!id) throw new Error('Task ID required');
  //     // 임시로 빈 객체 반환 (실제로는 taskAPI.getTask(id) 구현 필요)
  //     return {} as any;
  //   },
  //   enabled: isEdit,
  // });

  // 생성/수정 mutation
  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      return taskAPI.createTask({
        ...data,
        member_id: 1, // 임시 값, 실제로는 현재 사용자 ID
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/tasks');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      if (!id) throw new Error('Task ID required');
      return taskAPI.updateTask(Number(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      navigate('/tasks');
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // 청구 그룹 변경 시 하위 데이터 초기화
  const watchCostGroup = watch('cost_group_id');
  const watchService = watch('service_id');

  useEffect(() => {
    setSelectedCostGroup(watchCostGroup || null);
    if (watchCostGroup !== selectedCostGroup) {
      setValue('service_id', undefined as any);
      setValue('project_id', undefined as any);
    }
  }, [watchCostGroup, selectedCostGroup, setValue]);

  useEffect(() => {
    setSelectedService(watchService || null);
    if (watchService !== selectedService) {
      setValue('project_id', undefined as any);
    }
  }, [watchService, selectedService, setValue]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          {isEdit ? '업무 보고 수정' : '업무 보고 등록'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 *
              </label>
              <input
                type="date"
                {...register('task_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.task_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.task_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작업 시간 (분)
              </label>
              <input
                type="number"
                {...register('work_time', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              업무명 *
            </label>
            <input
              type="text"
              {...register('task_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="업무명을 입력하세요"
            />
            {errors.task_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.task_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              업무 상세
            </label>
            <textarea
              {...register('task_detail')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="업무 상세 내용을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 URL
            </label>
            <input
              type="url"
              {...register('task_url')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
            {errors.task_url && (
              <p className="mt-1 text-sm text-red-600">
                {errors.task_url.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 시간
              </label>
              <input
                type="time"
                {...register('start_time')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 시간
              </label>
              <input
                type="time"
                {...register('end_time')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                청구 그룹
              </label>
              <select
                {...register('cost_group_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {costGroups?.map((group) => (
                  <option key={group.cost_group_id} value={group.cost_group_id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                플랫폼
              </label>
              <select
                {...register('platform_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {platforms?.map((platform) => (
                  <option key={platform.code_id} value={platform.code_id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                서비스
              </label>
              <select
                {...register('service_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedCostGroup}
              >
                <option value="">선택하세요</option>
                {services?.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트
              </label>
              <select
                {...register('project_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedService}
              >
                <option value="">선택하세요</option>
                {projects?.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? '저장 중...'
                : isEdit
                  ? '수정'
                  : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
