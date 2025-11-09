import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectAPI } from '../services/api';

const projectSchema = z.object({
  name: z.string().min(1, '프로젝트명을 입력해주세요'),
  service_id: z.number().min(1, '서비스를 선택해주세요'),
  code: z.string().min(1, '프로젝트 코드를 입력해주세요').regex(/^[A-Z0-9_]+$/, '대문자, 숫자, 언더스코어만 사용 가능합니다'),
  description: z.string().optional(),
  platform: z.enum(['WEB', 'APP', 'BOTH']),
  version: z.string().optional(),
  repository_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

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
    mutationFn: (data: ProjectFormData) => projectAPI.createProject({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      alert('프로젝트가 생성되었습니다.');
      navigate('/projects');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 프로젝트 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: ProjectFormData }) =>
      projectAPI.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      alert('프로젝트가 수정되었습니다.');
      navigate('/projects');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          프로젝트 {isEditMode ? '수정' : '등록'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          프로젝트 정보를 {isEditMode ? '수정' : '입력'}합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-lg border p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            프로젝트명 <span className="text-red-500">*</span>
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
          <label htmlFor="service_id" className="block text-sm font-medium text-gray-700">
            서비스 <span className="text-red-500">*</span>
          </label>
          <select
            {...register('service_id', { valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>서비스 선택</option>
            {services?.map((service: any) => (
              <option key={service.service_id} value={service.service_id}>
                {service.name}
              </option>
            ))}
          </select>
          {errors.service_id && (
            <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            이 프로젝트가 속한 서비스를 선택하세요
          </p>
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            프로젝트 코드 <span className="text-red-500">*</span>
          </label>
          <input
            {...register('code')}
            type="text"
            placeholder="PROJECT_CODE"
            disabled={isEditMode}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            대문자, 숫자, 언더스코어만 사용 가능합니다. {isEditMode && '(코드는 수정할 수 없습니다)'}
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
            플랫폼 <span className="text-red-500">*</span>
          </label>
          <select
            {...register('platform')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">플랫폼 선택</option>
            <option value="WEB">웹</option>
            <option value="APP">앱</option>
            <option value="BOTH">웹+앱</option>
          </select>
          {errors.platform && (
            <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">
            버전
          </label>
          <input
            {...register('version')}
            type="text"
            placeholder="1.0.0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.version && (
            <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="repository_url" className="block text-sm font-medium text-gray-700">
            저장소 URL
          </label>
          <input
            {...register('repository_url')}
            type="url"
            placeholder="https://github.com/..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.repository_url && (
            <p className="mt-1 text-sm text-red-600">{errors.repository_url.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {(createMutation.isPending || updateMutation.isPending) ? '처리 중...' : isEditMode ? '수정' : '등록'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
