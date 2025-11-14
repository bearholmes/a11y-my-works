import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { ErrorMessage, Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
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
    <>
      <Heading>{isEdit ? '업무 보고 수정' : '업무 보고 등록'}</Heading>
      <div className="mt-8 max-w-2xl bg-white dark:bg-zinc-900 rounded-lg p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          aria-label={isEdit ? '업무 보고 수정 폼' : '업무 보고 등록 폼'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <Label>
                날짜{' '}
                <span className="text-red-600" aria-label="필수 항목">
                  *
                </span>
              </Label>
              <Input
                id="task_date"
                type="date"
                {...register('task_date')}
                aria-required="true"
                aria-invalid={!!errors.task_date}
              />
              {errors.task_date && (
                <ErrorMessage>{errors.task_date.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>작업 시간 (분)</Label>
              <Input
                id="work_time"
                type="number"
                {...register('work_time', { valueAsNumber: true })}
                aria-label="작업 시간을 분 단위로 입력"
                min="0"
              />
            </Field>
          </div>

          <Field>
            <Label>
              업무명{' '}
              <span className="text-red-600" aria-label="필수 항목">
                *
              </span>
            </Label>
            <Input
              id="task_name"
              type="text"
              {...register('task_name')}
              aria-required="true"
              aria-invalid={!!errors.task_name}
              placeholder="업무명을 입력하세요"
            />
            {errors.task_name && (
              <ErrorMessage>{errors.task_name.message}</ErrorMessage>
            )}
          </Field>

          <Field>
            <Label>업무 상세</Label>
            <Textarea
              id="task_detail"
              {...register('task_detail')}
              rows={3}
              aria-label="업무의 상세 내용 입력"
              placeholder="업무 상세 내용을 입력하세요"
            />
          </Field>

          <Field>
            <Label>관련 URL</Label>
            <Input
              id="task_url"
              type="url"
              {...register('task_url')}
              aria-invalid={!!errors.task_url}
              placeholder="https://..."
            />
            {errors.task_url && (
              <ErrorMessage>{errors.task_url.message}</ErrorMessage>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <Label>시작 시간</Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time')}
                aria-label="작업 시작 시간 선택"
              />
            </Field>

            <Field>
              <Label>종료 시간</Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time')}
                aria-label="작업 종료 시간 선택"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <Label>청구 그룹</Label>
              <Select
                id="cost_group_id"
                {...register('cost_group_id', { valueAsNumber: true })}
                aria-label="청구 그룹 선택"
              >
                <option value="">청구 그룹을 선택하세요</option>
                {costGroups?.map((group) => (
                  <option key={group.cost_group_id} value={group.cost_group_id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field>
              <Label>플랫폼</Label>
              <Select
                id="platform_id"
                {...register('platform_id', { valueAsNumber: true })}
                aria-label="플랫폼 선택"
              >
                <option value="">플랫폼을 선택하세요</option>
                {platforms?.map((platform) => (
                  <option key={platform.code_id} value={platform.code_id}>
                    {platform.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            role="group"
            aria-labelledby="project-selection-label"
          >
            <span id="project-selection-label" className="sr-only">
              프로젝트 선택 (청구 그룹, 서비스, 프로젝트 순서)
            </span>
            <Field>
              <Label>서비스</Label>
              <Select
                id="service_id"
                {...register('service_id', { valueAsNumber: true })}
                aria-label="서비스 선택"
                aria-disabled={!selectedCostGroup}
                disabled={!selectedCostGroup}
              >
                <option value="">
                  {selectedCostGroup
                    ? '서비스를 선택하세요'
                    : '먼저 청구 그룹을 선택하세요'}
                </option>
                {services?.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field>
              <Label>프로젝트</Label>
              <Select
                id="project_id"
                {...register('project_id', { valueAsNumber: true })}
                aria-label="프로젝트 선택"
                aria-disabled={!selectedService}
                disabled={!selectedService}
              >
                <option value="">
                  {selectedService
                    ? '프로젝트를 선택하세요'
                    : '먼저 서비스를 선택하세요'}
                </option>
                {projects?.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              plain
              onClick={() => navigate('/tasks')}
              aria-label="업무 등록 취소하고 목록으로 돌아가기"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              aria-label={isEdit ? '업무 보고 수정 저장' : '업무 보고 등록'}
              aria-busy={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? '저장 중...'
                : isEdit
                  ? '수정'
                  : '등록'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
