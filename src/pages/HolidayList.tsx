import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { holidayAPI } from '../services/api';

export function HolidayList() {
  const navigate = useNavigate();
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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공휴일 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            공휴일 정보를 조회하고 관리합니다.
          </p>
        </div>
        <button
          onClick={() => navigate('/holidays/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          공휴일 등록
        </button>
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
        <table className="min-w-full divide-y divide-gray-200">
          <caption className="sr-only">
            공휴일 목록 - 총 {data?.pagination?.total || 0}건
          </caption>
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                날짜
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                공휴일명
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                설명
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holidays.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  등록된 공휴일이 없습니다.
                </td>
              </tr>
            ) : (
              holidays.map((holiday: any) => (
                <tr key={holiday.holiday_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(holiday.holiday_date).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {holiday.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {holiday.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        navigate(`/holidays/${holiday.holiday_id}`)
                      }
                      aria-label={`${holiday.name} 공휴일 수정`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      수정
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(holiday.holiday_id, holiday.name)
                      }
                      aria-label={`${holiday.name} 공휴일 삭제`}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    </div>
  );
}
