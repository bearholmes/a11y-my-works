import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Link } from '../components/ui/link';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '../components/ui/pagination';
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
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Heading>업무 보고 목록</Heading>
        <Button href="/tasks/new">업무 등록</Button>
      </div>

      {/* 검색 필터 */}
      <div className="mt-8">
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
          <Button onClick={handleSearch}>검색</Button>
          <Button onClick={handleReset} plain>
            초기화
          </Button>
        </div>
      </div>

      {/* 업무 목록 */}
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
          <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
            <TableHead>
              <TableRow>
                <TableHeader>날짜</TableHeader>
                <TableHeader>업무명</TableHeader>
                <TableHeader>작성자</TableHeader>
                <TableHeader>작업시간</TableHeader>
                <TableHeader>프로젝트</TableHeader>
                <TableHeader className="text-right">작업</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>
                    {format(new Date(task.task_date), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {(task as any).members?.name || '알 수 없음'}
                  </TableCell>
                  <TableCell>
                    {task.work_time
                      ? `${Math.floor(task.work_time / 60)}시간 ${task.work_time % 60}분`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge color="zinc">
                      {(task as any).projects?.name || '미지정'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button plain onClick={() => handleViewDetail(task)}>
                        상세
                      </Button>
                      <Button plain href={`/tasks/edit/${task.task_id}`}>
                        수정
                      </Button>
                      <Button
                        plain
                        onClick={() =>
                          handleDelete(task.task_id, task.task_name)
                        }
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
            <Pagination className="mt-6">
              <PaginationPrevious
                onClick={() => handlePageChange((query.page || 1) - 1)}
                disabled={(query.page || 1) <= 1}
              >
                이전
              </PaginationPrevious>
              <PaginationList>
                {Array.from(
                  { length: Math.min(5, data.pagination.pageCount) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationPage
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        current={(query.page || 1) === pageNum}
                      >
                        {pageNum}
                      </PaginationPage>
                    );
                  }
                )}
              </PaginationList>
              <PaginationNext
                onClick={() => handlePageChange((query.page || 1) + 1)}
                disabled={(query.page || 1) >= data.pagination.pageCount}
              >
                다음
              </PaginationNext>
            </Pagination>
          )}
        </>
      )}

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
                href={`/tasks/edit/${selectedTask.task_id}`}
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
    </>
  );
}
