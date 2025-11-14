import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { roleAPI } from '../services/api';

export function RoleList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { confirm } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 역할 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['roles', { page }],
    queryFn: () => roleAPI.getRoles({ page, pageSize: 20 }),
  });

  // 역할 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId: number) => roleAPI.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSuccess('역할이 삭제되었습니다.');
    },
    onError: (error) => {
      showError((error as Error).message);
    },
  });

  const handleDelete = async (roleId: number, roleName: string) => {
    if (
      await confirm({
        title: '삭제 확인',
        message: `"${roleName}" 역할을 삭제하시겠습니까?\n이 역할을 사용하는 사용자가 있으면 삭제할 수 없습니다.`,
        confirmButtonVariant: 'danger',
      })
    ) {
      deleteMutation.mutate(roleId);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">역할 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Heading>역할 관리</Heading>
        <Button href="/roles/new">역할 추가</Button>
      </div>

      {/* 역할 목록 */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">역할이 없습니다.</div>
        ) : (
          <>
            <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
              <TableHead>
                <TableRow>
                  <TableHeader>역할명</TableHeader>
                  <TableHeader>설명</TableHeader>
                  <TableHeader>상태</TableHeader>
                  <TableHeader>생성일</TableHeader>
                  <TableHeader className="text-right">작업</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((role) => (
                  <TableRow key={role.role_id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      <Badge color={role.is_active ? 'lime' : 'zinc'}>
                        {role.is_active ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(role.created_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          plain
                          href={`/roles/edit/${role.role_id}`}
                          aria-label={`${role.name} 역할 수정`}
                        >
                          수정
                        </Button>
                        <Button
                          plain
                          onClick={() => handleDelete(role.role_id, role.name)}
                          aria-label={`${role.name} 역할 삭제`}
                          disabled={deleteMutation.isPending}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {data && data.pagination.pageCount > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.pageCount, p + 1))
                    }
                    disabled={page === data.pagination.pageCount}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      전체{' '}
                      <span className="font-medium">
                        {data.pagination.total}
                      </span>
                      개
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        이전
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.min(data.pagination.pageCount, p + 1)
                          )
                        }
                        disabled={page === data.pagination.pageCount}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
