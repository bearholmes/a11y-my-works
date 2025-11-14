import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import { holidayAPI } from '../services/api';

export function HolidayList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const pageSize = 20;
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 공휴일 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ['holidays', year, page],
    queryFn: () => holidayAPI.getHolidays({ year, page, pageSize }),
  });

  // 공휴일 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (holidayId: number) => holidayAPI.deleteHoliday(holidayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      showSuccess('공휴일이 삭제되었습니다.');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const handleDelete = async (holidayId: number, name: string) => {
    if (await confirmDelete('공휴일을 삭제하시겠습니까?', name)) {
      deleteMutation.mutate(holidayId);
    }
  };

  // 년도 선택 옵션 (현재 년도 ±5년)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // 페이지네이션 계산
  const holidays = data?.data || [];
  const totalPages = data?.pagination?.pageCount || 1;

  if (isLoading) {
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
      <div className="mb-6 flex justify-between items-center">
        <Heading>공휴일 관리</Heading>
        <Button href="/holidays/new">공휴일 등록</Button>
      </div>

      {/* 필터 */}
      <div className="mb-4 flex gap-4">
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            연도
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {holidays.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            등록된 공휴일이 없습니다.
          </div>
        ) : (
          <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
            <TableHead>
              <TableRow>
                <TableHeader>날짜</TableHeader>
                <TableHeader>공휴일명</TableHeader>
                <TableHeader>설명</TableHeader>
                <TableHeader className="text-right">관리</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {holidays.map((holiday: any) => (
                <TableRow key={holiday.holiday_id}>
                  <TableCell>
                    {new Date(holiday.holiday_date).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell>{holiday.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        plain
                        href={`/holidays/${holiday.holiday_id}`}
                        aria-label={`${holiday.name} 공휴일 수정`}
                      >
                        수정
                      </Button>
                      <Button
                        plain
                        onClick={() =>
                          handleDelete(holiday.holiday_id, holiday.name)
                        }
                        aria-label={`${holiday.name} 공휴일 삭제`}
                      >
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>
          <span className="px-3 py-1">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
