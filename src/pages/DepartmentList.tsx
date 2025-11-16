import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Spinner } from '../components/ui/spinner';
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
import { departmentAPI } from '../services/api';

/**
 * 부서 관리 페이지
 * 부서 목록을 조회하고 생성/수정/삭제할 수 있습니다.
 */
export function DepartmentList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isActiveInput, setIsActiveInput] = useState<boolean | undefined>(
    undefined
  );
  const [includeInactive, setIncludeInactive] = useState(false);
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 부서 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['departments', { page, search, isActive, includeInactive }],
    queryFn: () =>
      departmentAPI.getDepartments({
        page,
        pageSize: 20,
        search,
        isActive,
        includeInactive,
      }),
  });

  // 부서 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (departmentId: number) =>
      departmentAPI.deleteDepartment(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showSuccess('부서가 삭제되었습니다.');
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

  const handleDelete = async (departmentId: number, departmentName: string) => {
    if (await confirmDelete('부서를 삭제하시겠습니까?', departmentName)) {
      deleteMutation.mutate(departmentId);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <Text className="text-red-600 dark:text-red-400">
          부서 목록을 불러오는데 실패했습니다.
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
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>부서 관리</Heading>
        <div className="flex gap-4">
          <Button href="/departments/new">+ 새 부서</Button>
        </div>
      </div>

      {/* 검색 */}
      <div className="mt-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <Field className="flex-1">
              <Label htmlFor="department-search" className="sr-only">
                부서명 또는 코드로 검색
              </Label>
              <Input
                id="department-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="부서명 또는 코드로 검색"
                aria-label="부서명 또는 코드로 검색"
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
            <Field>
              <Label htmlFor="include-inactive" className="sr-only">
                비활성 포함
              </Label>
              <Select
                id="include-inactive"
                value={includeInactive ? 'yes' : 'no'}
                onChange={(e) => setIncludeInactive(e.target.value === 'yes')}
              >
                <option value="no">활성만</option>
                <option value="yes">비활성 포함</option>
              </Select>
            </Field>
            <Button type="submit" className="self-end">
              검색
            </Button>
          </div>
        </form>
      </div>

      {/* 부서 목록 테이블 */}
      <div className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center">
            <Text className="text-zinc-500 dark:text-zinc-400">
              부서가 없습니다.
            </Text>
          </div>
        ) : (
          <>
            <Table className="[--gutter:--spacing(6)]">
              <TableHead>
                <TableRow>
                  <TableHeader>부서명</TableHeader>
                  <TableHeader>부서 코드</TableHeader>
                  <TableHeader>상위 부서</TableHeader>
                  <TableHeader>소속 인원</TableHeader>
                  <TableHeader>계층</TableHeader>
                  <TableHeader>상태</TableHeader>
                  <TableHeader>생성일</TableHeader>
                  <TableHeader className="text-right">작업</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((department: any) => (
                  <TableRow
                    key={department.department_id}
                    href={`/departments/edit/${department.department_id}`}
                  >
                    <TableCell>
                      <div className="font-medium">{department.name}</div>
                      {department.description && (
                        <div className="text-zinc-500 text-sm">
                          {department.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge color="zinc">{department.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {department.parent_department_name || (
                        <span className="text-zinc-400">최상위</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge color="purple">{department.member_count}명</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {department.depth === 0
                          ? '최상위'
                          : `${department.depth}단계`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge color={department.is_active ? 'lime' : 'zinc'}>
                        {department.is_active ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(department.created_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        plain
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(department.department_id, department.name);
                        }}
                        aria-label={`${department.name} 부서 삭제`}
                        disabled={deleteMutation.isPending}
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {data && data.pagination.pageCount > 1 && (
              <div className="bg-white dark:bg-zinc-900 px-4 py-3 flex items-center justify-between border-t">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.pageCount, p + 1))
                    }
                    disabled={page === data.pagination.pageCount}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
