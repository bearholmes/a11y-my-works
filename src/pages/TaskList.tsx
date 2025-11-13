import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { businessAPI, taskAPI } from '../services/api';
import type { TaskQuery } from '../types/database';

export function TaskList() {
  const queryClient = useQueryClient();
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();
  const [query, setQuery] = useState<TaskQuery>({
    page: 1,
    pageSize: 20,
  });

  // 필터 상태
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCostGroup, setSelectedCostGroup] = useState<
    number | undefined
  >();
  const [selectedService, setSelectedService] = useState<number | undefined>();
  const [selectedProject, setSelectedProject] = useState<number | undefined>();

  // 상세보기 모달 상태
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 업무 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskAPI.getTasks(query),
  });

  // 비즈니스 데이터 조회
  const { data: costGroups } = useQuery({
    queryKey: ['costGroups'],
    queryFn: () => businessAPI.getCostGroups(),
  });

  const { data: services } = useQuery({
    queryKey: ['services', selectedCostGroup],
    queryFn: () => businessAPI.getServices(selectedCostGroup),
    enabled: !!selectedCostGroup,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', selectedService],
    queryFn: () => businessAPI.getProjects(selectedService),
    enabled: !!selectedService,
  });

  // 업무 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('업무가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      showError(`삭제 실패: ${error.message}`);
    },
  });

  const handleSearch = () => {
    setQuery({
      page: 1,
      pageSize: 20,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      keyword: keyword || undefined,
      projectId: selectedProject ? String(selectedProject) : undefined,
    });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setKeyword('');
    setSelectedCostGroup(undefined);
    setSelectedService(undefined);
    setSelectedProject(undefined);
    setQuery({ page: 1, pageSize: 20 });
  };

  const handlePageChange = (newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewDetail = (task: any) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleDelete = async (taskId: number, taskName: string) => {
    const confirmed = await confirmDelete('삭제하시겠습니까?', taskName);
    if (confirmed) {
      deleteMutation.mutate(taskId);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        업무 목록을 불러오는데 실패했습니다: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">업무 보고 목록</h1>
          <p className="mt-1 text-sm text-gray-500">
            등록된 업무 보고를 조회하고 관리합니다.
          </p>
        </div>
        <Link
          to="/tasks/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          업무 등록
        </Link>
      </div>

      {/* 검색 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">검색 필터</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 날짜 범위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 날짜
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료 날짜
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 검색어 */}
          <div>
            <label
              htmlFor="keyword-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              검색어
            </label>
            <input
              id="keyword-search"
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="업무명, 상세내용"
              aria-label="업무명 또는 상세내용으로 검색"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 비용그룹 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비용그룹
            </label>
            <select
              value={selectedCostGroup || ''}
              onChange={(e) => {
                setSelectedCostGroup(
                  e.target.value ? Number(e.target.value) : undefined
                );
                setSelectedService(undefined);
                setSelectedProject(undefined);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {costGroups?.map((cg) => (
                <option key={cg.cost_group_id} value={cg.cost_group_id}>
                  {cg.name}
                </option>
              ))}
            </select>
          </div>

          {/* 서비스 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              서비스
            </label>
            <select
              value={selectedService || ''}
              onChange={(e) => {
                setSelectedService(
                  e.target.value ? Number(e.target.value) : undefined
                );
                setSelectedProject(undefined);
              }}
              disabled={!selectedCostGroup}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">전체</option>
              {services?.map((service: any) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* 프로젝트 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프로젝트
            </label>
            <select
              value={selectedProject || ''}
              onChange={(e) =>
                setSelectedProject(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              disabled={!selectedService}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">전체</option>
              {projects?.map((project: any) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 검색 버튼 */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            검색
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 업무 목록 */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            조회된 업무 보고가 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <caption className="sr-only">
                  업무 보고 목록 - 총 {data.pagination.total}건
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
                      업무명
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      작성자
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      작업시간
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      프로젝트
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data.map((task) => (
                    <tr key={task.task_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(task.task_date), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => handleViewDetail(task)}
                          className="font-medium text-blue-600 hover:text-blue-900 text-left"
                        >
                          {task.task_name}
                        </button>
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
                        {task.work_time
                          ? `${Math.floor(task.work_time / 60)}시간 ${task.work_time % 60}분`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(task as any).projects?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(task)}
                            aria-label={`${task.task_name} 업무 상세보기`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            상세
                          </button>
                          <Link
                            to={`/tasks/edit/${task.task_id}`}
                            aria-label={`${task.task_name} 업무 수정`}
                            className="text-green-600 hover:text-green-900"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(task.task_id, task.task_name)
                            }
                            aria-label={`${task.task_name} 업무 삭제`}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isPending}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {data && data.pagination.pageCount > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange((query.page || 1) - 1)}
                    disabled={(query.page || 1) <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => handlePageChange((query.page || 1) + 1)}
                    disabled={(query.page || 1) >= data.pagination.pageCount}
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
                      <span className="font-medium">
                        {((query.page || 1) - 1) * (query.pageSize || 20) + 1}
                      </span>{' '}
                      -{' '}
                      <span className="font-medium">
                        {Math.min(
                          (query.page || 1) * (query.pageSize || 20),
                          data.pagination.total
                        )}
                      </span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange((query.page || 1) - 1)}
                        disabled={(query.page || 1) <= 1}
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
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                (query.page || 1) === pageNum
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
                        onClick={() => handlePageChange((query.page || 1) + 1)}
                        disabled={
                          (query.page || 1) >= data.pagination.pageCount
                        }
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

      {/* 상세보기 모달 */}
      {showDetailModal && selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailModal(false)}
          role="presentation"
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="task-detail-title"
                className="text-xl font-bold text-gray-900"
              >
                업무 상세 정보
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                aria-label="모달 닫기"
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  업무명
                </label>
                <p className="mt-1 text-gray-900">{selectedTask.task_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  상세 내용
                </label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                  {selectedTask.task_detail || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    작업 날짜
                  </label>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(selectedTask.task_date), 'yyyy-MM-dd')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    작업 시간
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedTask.work_time
                      ? `${Math.floor(selectedTask.work_time / 60)}시간 ${selectedTask.work_time % 60}분`
                      : '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    작성자
                  </label>
                  <p className="mt-1 text-gray-900">
                    {(selectedTask as any).members?.name || '알 수 없음'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    비용그룹
                  </label>
                  <p className="mt-1 text-gray-900">
                    {(selectedTask as any).cost_groups?.name || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    서비스
                  </label>
                  <p className="mt-1 text-gray-900">
                    {(selectedTask as any).services?.name || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    프로젝트
                  </label>
                  <p className="mt-1 text-gray-900">
                    {(selectedTask as any).projects?.name || '-'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  등록일시
                </label>
                <p className="mt-1 text-gray-900">
                  {format(
                    new Date(selectedTask.created_at),
                    'yyyy-MM-dd HH:mm:ss'
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Link
                to={`/tasks/edit/${selectedTask.task_id}`}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                수정
              </Link>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
