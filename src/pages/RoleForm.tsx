import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { ErrorMessage, Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../hooks/useNotification';
import { permissionAPI, roleAPI } from '../services/api';

const roleSchema = z.object({
  name: z.string().min(1, '역할명을 입력해주세요'),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface PermissionState {
  permissionId: number;
  key: string;
  name: string;
  readAccess: boolean;
  writeAccess: boolean;
}

export function RoleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const { showSuccess, showError } = useNotification();

  const [permissions, setPermissions] = useState<PermissionState[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      is_active: true,
    },
  });

  // 전체 권한 목록 조회
  const { data: allPermissions } = useQuery({
    queryKey: ['allPermissions'],
    queryFn: () => permissionAPI.getPermissions(),
  });

  // 수정 모드일 때 역할 정보 조회
  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleAPI.getRole(Number(id)),
    enabled: isEditMode,
  });

  // 권한 목록 초기화
  useEffect(() => {
    if (allPermissions) {
      if (role && isEditMode) {
        // 수정 모드: 기존 역할의 권한 설정
        const permissionMap = new Map(
          role.permissions.map((p: any) => [p.permissionId, p])
        );

        setPermissions(
          allPermissions.map((p) => {
            const existing = permissionMap.get(p.permission_id) as
              | { readAccess?: boolean; writeAccess?: boolean }
              | undefined;
            return {
              permissionId: p.permission_id,
              key: p.key,
              name: p.name,
              readAccess: existing?.readAccess || false,
              writeAccess: existing?.writeAccess || false,
            };
          })
        );
      } else {
        // 신규 모드: 모든 권한 false로 초기화
        setPermissions(
          allPermissions.map((p) => ({
            permissionId: p.permission_id,
            key: p.key,
            name: p.name,
            readAccess: false,
            writeAccess: false,
          }))
        );
      }
    }
  }, [allPermissions, role, isEditMode]);

  // 폼 데이터 초기화
  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || '',
        is_active: role.is_active,
      });
    }
  }, [role, reset]);

  // 역할 생성 mutation
  const createMutation = useMutation({
    mutationFn: ({
      data,
      permissions,
    }: {
      data: RoleFormData;
      permissions: PermissionState[];
    }) =>
      roleAPI.createRole(
        data,
        permissions.filter((p) => p.readAccess || p.writeAccess)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSuccess('역할이 생성되었습니다.');
      navigate('/roles');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 역할 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      roleId,
      data,
      permissions,
    }: {
      roleId: number;
      data: RoleFormData;
      permissions: PermissionState[];
    }) => roleAPI.updateRole(roleId, data, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
      showSuccess('역할이 수정되었습니다.');
      navigate('/roles');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const handlePermissionChange = (
    permissionId: number,
    field: 'readAccess' | 'writeAccess',
    value: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.permissionId === permissionId ? { ...p, [field]: value } : p
      )
    );
  };

  const onSubmit = async (data: RoleFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ roleId: Number(id), data, permissions });
    } else {
      createMutation.mutate({ data, permissions });
    }
  };

  if (isEditMode && roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Heading>{isEditMode ? '역할 수정' : '역할 생성'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-4xl space-y-6"
        aria-label={isEditMode ? '역할 수정 폼' : '역할 생성 폼'}
      >
        {/* 기본 정보 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            기본 정보
          </h2>

          <Field>
            <Label>
              역할명{' '}
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
            <Label>설명</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              aria-label="역할 설명 입력"
            />
          </Field>

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  aria-label="역할 활성 상태"
                />
                <Label>활성 상태</Label>
              </div>
            )}
          />
        </div>

        {/* 권한 설정 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-4">
            권한 설정
          </h2>

          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700"
              aria-label="역할 권한 설정 테이블"
            >
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    권한
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    읽기
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    쓰기
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                {permissions.map((permission) => (
                  <tr key={permission.permissionId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-950 dark:text-white">
                        {permission.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {permission.key}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Checkbox
                        checked={permission.readAccess}
                        onChange={(checked) =>
                          handlePermissionChange(
                            permission.permissionId,
                            'readAccess',
                            checked
                          )
                        }
                        aria-label={`${permission.name} 읽기 권한`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Checkbox
                        checked={permission.writeAccess}
                        onChange={(checked) =>
                          handlePermissionChange(
                            permission.permissionId,
                            'writeAccess',
                            checked
                          )
                        }
                        aria-label={`${permission.name} 쓰기 권한`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            aria-label={isEditMode ? '역할 수정 저장' : '역할 생성'}
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
              '생성'
            )}
          </Button>
          <Button
            type="button"
            plain
            onClick={() => navigate('/roles')}
            aria-label="역할 등록 취소하고 목록으로 돌아가기"
          >
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
