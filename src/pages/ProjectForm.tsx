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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Heading>{isEditMode ? '프로젝트 수정' : '프로젝트 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-2xl bg-white shadow-sm rounded-lg border p-6 space-y-6"
        aria-label={isEditMode ? '프로젝트 수정 폼' : '프로젝트 등록 폼'}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            프로젝트명{' '}
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
            htmlFor="service_id"
            className="block text-sm font-medium text-gray-700"
          >
            서비스{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </label>
          <Select
            id="service_id"
            {...register('service_id', { valueAsNumber: true })}
            aria-required="true"
            aria-invalid={!!errors.service_id}
            aria-describedby={
              errors.service_id ? 'service_id-error' : undefined
            }
          >
            <option value={0}>서비스 선택</option>
            {services?.map((service: any) => (
              <option key={service.service_id} value={service.service_id}>
                {service.name}
              </option>
            ))}
          </Select>
          {errors.service_id && (
            <p
              id="service_id-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.service_id.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            이 프로젝트가 속한 서비스를 선택하세요
          </p>
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            프로젝트 코드{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </label>
          <Input
            id="code"
            {...register('code')}
            type="text"
            placeholder="PROJECT_CODE"
            disabled={isEditMode}
            aria-required="true"
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? 'code-error' : undefined}
          />
          {errors.code && (
            <p
              id="code-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.code.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            대문자, 숫자, 언더스코어만 사용 가능합니다.{' '}
            {isEditMode && '(코드는 수정할 수 없습니다)'}
          </p>
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
            aria-label="프로젝트 설명 입력"
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? 'description-error' : undefined
            }
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

        <div>
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-gray-700"
          >
            플랫폼{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </label>
          <Select
            id="platform"
            {...register('platform')}
            aria-required="true"
            aria-invalid={!!errors.platform}
            aria-describedby={errors.platform ? 'platform-error' : undefined}
          >
            <option value="">플랫폼 선택</option>
            <option value="WEB">웹</option>
            <option value="APP">앱</option>
            <option value="BOTH">웹+앱</option>
          </Select>
          {errors.platform && (
            <p
              id="platform-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.platform.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="version"
            className="block text-sm font-medium text-gray-700"
          >
            버전
          </label>
          <Input
            id="version"
            {...register('version')}
            type="text"
            placeholder="1.0.0"
            aria-label="프로젝트 버전 입력"
            aria-invalid={!!errors.version}
            aria-describedby={errors.version ? 'version-error' : undefined}
          />
          {errors.version && (
            <p
              id="version-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.version.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="repository_url"
            className="block text-sm font-medium text-gray-700"
          >
            저장소 URL
          </label>
          <Input
            id="repository_url"
            {...register('repository_url')}
            type="url"
            placeholder="https://github.com/..."
            aria-label="저장소 URL 입력"
            aria-invalid={!!errors.repository_url}
            aria-describedby={
              errors.repository_url ? 'repository_url-error' : undefined
            }
          />
          {errors.repository_url && (
            <p
              id="repository_url-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.repository_url.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            aria-label={isEditMode ? '프로젝트 수정 저장' : '프로젝트 등록'}
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
