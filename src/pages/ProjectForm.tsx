import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
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
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../hooks/useNotification';
import { projectAPI } from '../services/api';

const projectSchema = z.object({
  name: z.string().min(1, '프로젝트명을 입력해주세요'),
  service_id: z.number().min(1, '서비스를 선택해주세요'),
  code: z
    .string()
    .min(1, '프로젝트 코드를 입력해주세요')
    .regex(/^[A-Z0-9_]+$/, '대문자, 숫자, 언더스코어만 사용 가능합니다'),
  description: z.string().optional(),
  platform: z.enum(['WEB', 'APP', 'BOTH']),
  version: z.string().optional(),
  repository_url: z
    .string()
    .url('올바른 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectForm() {
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
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  // 서비스 목록 조회
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => projectAPI.getServicesForFilter(),
  });

  // 수정 모드일 때 프로젝트 정보 조회
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectAPI.getProject(Number(id)),
    enabled: isEditMode,
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        service_id: project.service_id || 0,
        code: project.code,
        description: project.description || '',
        platform: project.platform,
        version: project.version || '',
        repository_url: project.repository_url || '',
      });
    }
  }, [project, reset]);

  // 프로젝트 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      projectAPI.createProject({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccess('프로젝트가 생성되었습니다.');
      navigate('/projects');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 프로젝트 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: number;
      data: ProjectFormData;
    }) => projectAPI.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      showSuccess('프로젝트가 수정되었습니다.');
      navigate('/projects');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ projectId: Number(id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditMode && projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Heading>{isEditMode ? '프로젝트 수정' : '프로젝트 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-2xl bg-white dark:bg-zinc-900 rounded-lg p-6 space-y-6"
        aria-label={isEditMode ? '프로젝트 수정 폼' : '프로젝트 등록 폼'}
      >
        <Field>
          <Label>
            프로젝트명{' '}
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
            서비스{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Select
            id="service_id"
            {...register('service_id', { valueAsNumber: true })}
            aria-required="true"
            aria-invalid={!!errors.service_id}
          >
            <option value={0}>서비스 선택</option>
            {services?.map((service: any) => (
              <option key={service.service_id} value={service.service_id}>
                {service.name}
              </option>
            ))}
          </Select>
          {errors.service_id && (
            <ErrorMessage>{errors.service_id.message}</ErrorMessage>
          )}
          <Description>이 프로젝트가 속한 서비스를 선택하세요</Description>
        </Field>

        <Field>
          <Label>
            프로젝트 코드{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Input
            id="code"
            {...register('code')}
            type="text"
            placeholder="PROJECT_CODE"
            disabled={isEditMode}
            aria-required="true"
            aria-invalid={!!errors.code}
          />
          {errors.code && <ErrorMessage>{errors.code.message}</ErrorMessage>}
          <Description>
            대문자, 숫자, 언더스코어만 사용 가능합니다.{' '}
            {isEditMode && '(코드는 수정할 수 없습니다)'}
          </Description>
        </Field>

        <Field>
          <Label>설명</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            aria-label="프로젝트 설명 입력"
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <ErrorMessage>{errors.description.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>
            플랫폼{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Select
            id="platform"
            {...register('platform')}
            aria-required="true"
            aria-invalid={!!errors.platform}
          >
            <option value="">플랫폼 선택</option>
            <option value="WEB">웹</option>
            <option value="APP">앱</option>
            <option value="BOTH">웹+앱</option>
          </Select>
          {errors.platform && (
            <ErrorMessage>{errors.platform.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>버전</Label>
          <Input
            id="version"
            {...register('version')}
            type="text"
            placeholder="1.0.0"
            aria-label="프로젝트 버전 입력"
            aria-invalid={!!errors.version}
          />
          {errors.version && (
            <ErrorMessage>{errors.version.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>저장소 URL</Label>
          <Input
            id="repository_url"
            {...register('repository_url')}
            type="url"
            placeholder="https://github.com/..."
            aria-label="저장소 URL 입력"
            aria-invalid={!!errors.repository_url}
          />
          {errors.repository_url && (
            <ErrorMessage>{errors.repository_url.message}</ErrorMessage>
          )}
        </Field>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            aria-label={isEditMode ? '프로젝트 수정 저장' : '프로젝트 등록'}
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
            onClick={() => navigate('/projects')}
            aria-label="프로젝트 등록 취소하고 목록으로 돌아가기"
          >
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
