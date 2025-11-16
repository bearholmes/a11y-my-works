import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Checkbox, CheckboxField } from '../components/ui/checkbox';
import { ErrorMessage, Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Spinner } from '../components/ui/spinner';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../hooks/useNotification';
import { departmentAPI } from '../services/api';

const departmentSchema = z.object({
  name: z.string().min(1, '부서명을 입력해주세요'),
  description: z.string().optional(),
  parent_department_id: z.number().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().optional().default(0),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

/**
 * 부서 등록/수정 폼
 */
export function DepartmentForm() {
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
    setValue,
    watch,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      is_active: true,
      sort_order: 0,
      parent_department_id: null,
    },
  });

  // 수정 모드일 때 부서 정보 조회
  const { data: department, isLoading: departmentLoading } = useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentAPI.getDepartment(Number(id)),
    enabled: isEditMode,
  });

  // 상위 부서 선택을 위한 부서 목록 조회
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', { includeInactive: false }],
    queryFn: () =>
      departmentAPI.getDepartments({
        page: 1,
        pageSize: 100,
        includeInactive: false,
      }),
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description || '',
        parent_department_id: department.parent_department_id || null,
        is_active: department.is_active,
        sort_order: department.sort_order,
      });
    }
  }, [department, reset]);

  // 부서 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: DepartmentFormData) => {
      // depth와 path는 API에서 자동 계산
      return departmentAPI.createDepartment({
        name: data.name,
        description: data.description || null,
        parent_department_id: data.parent_department_id || null,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
        depth: 0, // API에서 재계산됨
        path: '/temp', // API에서 재계산됨
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showSuccess('부서가 생성되었습니다.');
      navigate('/departments');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 부서 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      departmentId,
      data,
    }: {
      departmentId: number;
      data: DepartmentFormData;
    }) => {
      // parent_department_id는 수정 불가
      return departmentAPI.updateDepartment(departmentId, {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', id] });
      showSuccess('부서가 수정되었습니다.');
      navigate('/departments');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const onSubmit = async (data: DepartmentFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ departmentId: Number(id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isActive = watch('is_active');

  if (isEditMode && departmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // 현재 수정 중인 부서는 상위 부서 선택에서 제외 (자기 자신을 상위 부서로 선택 방지)
  const availableDepartments = isEditMode
    ? departmentsData?.data.filter((d: any) => d.department_id !== Number(id))
    : departmentsData?.data;

  return (
    <>
      <Heading>{isEditMode ? '부서 수정' : '부서 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 bg-white dark:bg-zinc-900 rounded-lg p-6 space-y-6"
        aria-label={isEditMode ? '부서 수정 폼' : '부서 등록 폼'}
      >
        <Field>
          <Label>
            부서명{' '}
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
            placeholder="예: 개발팀, 프론트엔드팀"
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </Field>

        <Field>
          <Label>설명</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            aria-label="부서 설명 입력"
            aria-invalid={!!errors.description}
            placeholder="부서에 대한 설명을 입력하세요"
          />
          {errors.description && (
            <ErrorMessage>{errors.description.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>상위 부서</Label>
          <Select
            id="parent_department_id"
            value={watch('parent_department_id') ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setValue(
                'parent_department_id',
                value ? Number(value) : null
              );
            }}
            disabled={isEditMode} // 수정 모드에서는 상위 부서 변경 불가
            aria-label="상위 부서 선택"
          >
            <option value="">최상위 부서</option>
            {availableDepartments?.map((dept: any) => (
              <option key={dept.department_id} value={dept.department_id}>
                {'  '.repeat(dept.depth)}
                {dept.name}
              </option>
            ))}
          </Select>
          {isEditMode && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              상위 부서는 생성 후 변경할 수 없습니다.
            </p>
          )}
        </Field>

        <Field>
          <Label>표시 순서</Label>
          <Input
            id="sort_order"
            {...register('sort_order', { valueAsNumber: true })}
            type="number"
            min="0"
            aria-label="표시 순서 (숫자가 작을수록 먼저 표시)"
            aria-invalid={!!errors.sort_order}
            placeholder="0"
          />
          {errors.sort_order && (
            <ErrorMessage>{errors.sort_order.message}</ErrorMessage>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            숫자가 작을수록 먼저 표시됩니다
          </p>
        </Field>

        <CheckboxField>
          <Checkbox
            id="is_active"
            checked={isActive}
            onChange={(checked) => setValue('is_active', checked)}
            aria-label="활성 상태"
          />
          <Label>활성 상태</Label>
        </CheckboxField>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            aria-label={isEditMode ? '부서 수정 저장' : '부서 등록'}
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
            onClick={() => navigate('/departments')}
            aria-label="부서 등록 취소하고 목록으로 돌아가기"
          >
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
