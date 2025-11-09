import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { roleAPI, permissionAPI } from '../services/api';

const roleSchema = z.object({
  name: z.string().min(1, '역할명을 입력해주세요'),
  description: z.string().optional(),
  is_active: z.boolean()
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

  const [permissions, setPermissions] = useState<PermissionState[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      is_active: true,
    },
  });

  // 전체 권한 목록 조회
  const { data: allPermissions } = useQuery({
    queryKey: ['permissions'],
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
            const existing = permissionMap.get(p.permission_id);
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
    mutationFn: ({ data, permissions }: { data: RoleFormData; permissions: PermissionState[] }) =>
      roleAPI.createRole(data, permissions.filter(p => p.readAccess || p.writeAccess)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      alert('역할이 생성되었습니다.');
      navigate('/roles');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 역할 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ roleId, data, permissions }: { roleId: number; data: RoleFormData; permissions: PermissionState[] }) =>
      roleAPI.updateRole(roleId, data, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
      alert('역할이 수정되었습니다.');
      navigate('/roles');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const handlePermissionChange = (permissionId: number, field: 'readAccess' | 'writeAccess', value: boolean) => {
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          역할 {isEditMode ? '수정' : '생성'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          역할 정보와 권한을 {isEditMode ? '수정' : '설정'}합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white shadow-sm rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              역할명 <span className="text-red-500">*</span>
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              활성 상태
            </label>
          </div>
        </div>

        {/* 권한 설정 */}
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">권한 설정</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    권한
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    읽기
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    쓰기
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permissions.map((permission) => (
                  <tr key={permission.permissionId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      <div className="text-xs text-gray-500">{permission.key}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={permission.readAccess}
                        onChange={(e) =>
                          handlePermissionChange(permission.permissionId, 'readAccess', e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={permission.writeAccess}
                        onChange={(e) =>
                          handlePermissionChange(permission.permissionId, 'writeAccess', e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? '처리 중...'
              : isEditMode
              ? '수정'
              : '생성'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
