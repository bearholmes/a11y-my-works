import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Text } from '../components/ui/text';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { costGroupAPI } from '../services/api';

export function CostGroupList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isActiveInput, setIsActiveInput] = useState<boolean | undefined>(
    undefined
  );
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 청구 그룹 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['costGroups', { page, search, isActive }],
    queryFn: () =>
      costGroupAPI.getCostGroups({
        page,
        pageSize: 20,
        search,
        isActive,
      }),
  });

  // 청구 그룹 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (costGroupId: number) =>
      costGroupAPI.deleteCostGroup(costGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costGroups'] });
      showSuccess('청구 그룹이 삭제되었습니다.');
    },
    onError: (error) => {
      showError(`삭제 실패: ${(error as Error).message}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setIsActive(isActiveInput);
    setPage(1);
  };

  const handleDelete = async (costGroupId: number, costGroupName: string) => {
    if (await confirmDelete('청구 그룹을 삭제하시겠습니까?', costGroupName)) {
      deleteMutation.mutate(costGroupId);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <Text className="text-red-600 dark:text-red-400">
          청구 그룹 목록을 불러오는데 실패했습니다.
        </Text>
        <Text className="text-sm text-red-500 dark:text-red-400 mt-1">
          {(error as Error).message}
        </Text>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Heading>청구 그룹 관리</Heading>
        <Button href="/cost-groups/new">+ 새 청구 그룹</Button>
      </div>

      {/* 검색 */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <Field className="flex-1">
              <Label htmlFor="cost-group-search" className="sr-only">
                청구 그룹명 또는 설명으로 검색
              </Label>
              <Input
                id="cost-group-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="청구 그룹명 또는 설명으로 검색"
                aria-label="청구 그룹명 또는 설명으로 검색"
              />
            </Field>
            <Field>
              <Label htmlFor="status-filter" className="sr-only">
                상태 필터
              </Label>
              <Select
                id="status-filter"
                value={
                  isActiveInput === undefined
                    ? 'all'
                    : isActiveInput
                      ? 'active'
                      : 'inactive'
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setIsActiveInput(
                    value === 'all' ? undefined : value === 'active'
                  );
                }}
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </Select>
            </Field>
            <Button type="submit">검색</Button>
          </div>
        </form>
      </div>

      {/* 청구 그룹 목록 테이블 */}
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <Text className="mt-2 text-zinc-600 dark:text-zinc-400">
              로딩 중...
            </Text>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center">
            <Text className="text-zinc-500 dark:text-zinc-400">
              청구 그룹이 없습니다.
            </Text>
          </div>
        ) : (
          <>
            <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
              <TableHead>
                <TableRow>
                  <TableHeader>청구 그룹명</TableHeader>
                  <TableHeader>상태</TableHeader>
                  <TableHeader>생성일</TableHeader>
                  <TableHeader className="text-right">작업</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((costGroup: any) => (
                  <TableRow key={costGroup.cost_group_id}>
                    <TableCell>
                      <div className="font-medium">{costGroup.name}</div>
                      {costGroup.description && (
                        <div className="text-zinc-500 text-sm">
                          {costGroup.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge color={costGroup.is_active ? 'lime' : 'zinc'}>
                        {costGroup.is_active ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(costGroup.created_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          plain
                          href={`/cost-groups/edit/${costGroup.cost_group_id}`}
                          aria-label={`${costGroup.name} 청구 그룹 수정`}
                        >
                          수정
                        </Button>
                        <Button
                          plain
                          onClick={() =>
                            handleDelete(
                              costGroup.cost_group_id,
                              costGroup.name
                            )
                          }
                          aria-label={`${costGroup.name} 청구 그룹 삭제`}
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
              <div className="bg-white dark:bg-zinc-900 px-4 py-3 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.pageCount, p + 1))
                    }
                    disabled={page === data.pagination.pageCount}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <Text className="text-sm text-zinc-700 dark:text-zinc-300">
                      전체{' '}
                      <span className="font-medium">
                        {data.pagination.total}
                      </span>
                      개 중{' '}
                      <span className="font-medium">{(page - 1) * 20 + 1}</span>{' '}
                      -{' '}
                      <span className="font-medium">
                        {Math.min(page * 20, data.pagination.total)}
                      </span>
                    </Text>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                      >
                        이전
                      </button>
                      {Array.from(
                        { length: Math.min(5, data.pagination.pageCount) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pageNum
                                  ? 'z-10 bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                                  : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.min(data.pagination.pageCount, p + 1)
                          )
                        }
                        disabled={page === data.pagination.pageCount}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
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
