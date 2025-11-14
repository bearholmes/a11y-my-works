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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">서비스 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Heading>서비스 관리</Heading>
        <Button href="/services/new">+ 새 서비스</Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="service-search" className="sr-only">
              서비스명으로 검색
            </label>
            <input
              id="service-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="서비스명으로 검색"
              aria-label="서비스명으로 검색"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={costGroupInput || ''}
            onChange={(e) => {
              setCostGroupInput(
                e.target.value ? Number(e.target.value) : undefined
              );
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 청구 그룹</option>
            {costGroups?.map((group: any) => (
              <option key={group.cost_group_id} value={group.cost_group_id}>
                {group.name}
              </option>
            ))}
          </select>
          <select
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상태</option>
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>
          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* 서비스 목록 테이블 */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            서비스가 없습니다.
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
                  <TableRow key={service.service_id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>
                      <Badge color="purple">
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          plain
                          href={`/services/edit/${service.service_id}`}
                          aria-label={`${service.name} 서비스 수정`}
                        >
                          수정
                        </Button>
                        <Button
                          plain
                          onClick={() =>
                            handleDelete(service.service_id, service.name)
                          }
                          aria-label={`${service.name} 서비스 삭제`}
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
                      개 중{' '}
                      <span className="font-medium">{(page - 1) * 20 + 1}</span>{' '}
                      -{' '}
                      <span className="font-medium">
                        {Math.min(page * 20, data.pagination.total)}
                      </span>
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
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
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
