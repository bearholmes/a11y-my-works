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
import { serviceAPI } from '../services/api';

export function ServiceList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [costGroupFilter, setCostGroupFilter] = useState<number | undefined>(
    undefined
  );
  const [costGroupInput, setCostGroupInput] = useState<number | undefined>(
    undefined
  );
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isActiveInput, setIsActiveInput] = useState<boolean | undefined>(
    undefined
  );
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 청구 그룹 목록 조회 (필터용)
  const { data: costGroups } = useQuery({
    queryKey: ['costGroups'],
    queryFn: () => serviceAPI.getCostGroupsForFilter(),
  });

  // 서비스 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'services',
      { page, search, costGroupId: costGroupFilter, isActive: isActiveFilter },
    ],
    queryFn: () =>
      serviceAPI.getServices({
        page,
        pageSize: 20,
        search,
        costGroupId: costGroupFilter,
        isActive: isActiveFilter,
      }),
  });

  // 서비스 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (serviceId: number) => serviceAPI.deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      showSuccess('서비스가 삭제되었습니다.');
    },
    onError: (error) => {
      showError(`삭제 실패: ${(error as Error).message}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCostGroupFilter(costGroupInput);
    setIsActiveFilter(isActiveInput);
    setPage(1);
  };

  const handleDelete = async (serviceId: number, serviceName: string) => {
    if (await confirmDelete('서비스를 삭제하시겠습니까?', serviceName)) {
      deleteMutation.mutate(serviceId);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <Text className="text-red-600 dark:text-red-400">
          서비스 목록을 불러오는데 실패했습니다.
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
        <Heading>서비스 관리</Heading>
        <div className="flex gap-4">
          <Button href="/services/new">+ 새 서비스</Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mt-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Field className="flex-1">
            <Label htmlFor="service-search" className="sr-only">
              서비스명으로 검색
            </Label>
            <Input
              id="service-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="서비스명으로 검색"
              aria-label="서비스명으로 검색"
            />
          </Field>
          <Field>
            <Label htmlFor="cost-group-filter" className="sr-only">
              청구 그룹 필터
            </Label>
            <Select
              id="cost-group-filter"
              value={costGroupInput || ''}
              onChange={(e) => {
                setCostGroupInput(
                  e.target.value ? Number(e.target.value) : undefined
                );
              }}
            >
              <option value="">전체 청구 그룹</option>
              {costGroups?.map((group: any) => (
                <option key={group.cost_group_id} value={group.cost_group_id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="status-filter" className="sr-only">
              상태 필터
            </Label>
            <Select
              id="status-filter"
              value={
                isActiveInput === undefined
                  ? ''
                  : isActiveInput
                    ? 'true'
                    : 'false'
              }
              onChange={(e) => {
                setIsActiveInput(
                  e.target.value === '' ? undefined : e.target.value === 'true'
                );
              }}
            >
              <option value="">전체 상태</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </Select>
          </Field>
          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* 서비스 목록 테이블 */}
      <div className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center">
            <Text className="text-zinc-500 dark:text-zinc-400">
              서비스가 없습니다.
            </Text>
          </div>
        ) : (
          <>
            <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
              <TableHead>
                <TableRow>
                  <TableHeader>서비스명</TableHeader>
                  <TableHeader>청구 그룹</TableHeader>
                  <TableHeader>상태</TableHeader>
                  <TableHeader>생성일</TableHeader>
                  <TableHeader className="text-right">작업</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((service: any) => (
                  <TableRow
                    key={service.service_id}
                    href={`/services/edit/${service.service_id}`}
                  >
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>
                      <Badge color="zinc">
                        {service.cost_groups?.name || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={service.is_active ? 'lime' : 'zinc'}>
                        {service.is_active ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(service.created_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        plain
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(service.service_id, service.name);
                        }}
                        aria-label={`${service.name} 서비스 삭제`}
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
              <div className="bg-white dark:bg-zinc-900 px-4 py-3 flex items-center justify-between border-t sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
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
                    <nav className="relative z-0 inline-flex rounded-md -space-x-px">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
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
                                  ? 'z-10 bg-zinc-100 dark:bg-zinc-900 border-zinc-500 dark:border-zinc-600 text-zinc-700 dark:text-zinc-400'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
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
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
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
