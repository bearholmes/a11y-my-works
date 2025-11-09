import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskAPI } from '../services/api';
import type { TaskQuery } from '../types/database';

export function TaskList() {
  const [query, setQuery] = useState<TaskQuery>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskAPI.getTasks(query),
  });

  const handleSearch = (searchQuery: Partial<TaskQuery>) => {
    setQuery(prev => ({ ...prev, ...searchQuery, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setQuery(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        업무 목록을 불러오는데 실패했습니다: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          업무 보고 목록
        </h2>

        {/* 검색 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="date"
            placeholder="시작 날짜"
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => handleSearch({ startDate: e.target.value })}
          />
          <input
            type="date"
            placeholder="종료 날짜"
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => handleSearch({ endDate: e.target.value })}
          />
          <input
            type="text"
            placeholder="검색어"
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => handleSearch({ keyword: e.target.value })}
          />
        </div>

        {/* 업무 목록 */}
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업무명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로젝트
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.map((task) => (
                <tr key={task.task_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.task_date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{task.task_name}</div>
                    {task.task_detail && (
                      <div className="text-gray-500 text-xs mt-1">
                        {task.task_detail.length > 50 
                          ? `${task.task_detail.substring(0, 50)}...` 
                          : task.task_detail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(task as any).members?.name || '알 수 없음'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.work_time ? `${Math.floor(task.work_time / 60)}시간 ${task.work_time % 60}분` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(task as any).projects?.name || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.data.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              등록된 업무 보고가 없습니다.
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {data?.pagination && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              총 {data.pagination.total}개 중 {((query.page || 1) - 1) * (query.pageSize || 20) + 1}-
              {Math.min((query.page || 1) * (query.pageSize || 20), data.pagination.total)}개 표시
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange((query.page || 1) - 1)}
                disabled={(query.page || 1) <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-3 py-1 text-sm">
                {query.page || 1} / {data.pagination.pageCount}
              </span>
              <button
                onClick={() => handlePageChange((query.page || 1) + 1)}
                disabled={(query.page || 1) >= data.pagination.pageCount}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}