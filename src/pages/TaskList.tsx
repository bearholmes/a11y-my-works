import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from '../components/ui/description-list';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from '../components/ui/dialog';
import { Field, Label } from '../components/ui/fieldset';
import { Heading, Subheading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '../components/ui/pagination';
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
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded dark:bg-red-950/50 dark:border-red-900 dark:text-red-400">
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
        <Subheading className="mb-4">검색 필터</Subheading>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field>
            <Label>시작 날짜</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>

          <Field>
            <Label>종료 날짜</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>

          <Field>
            <Label>검색어</Label>
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="업무명, 상세내용"
            />
          </Field>

          <Field>
            <Label>비용그룹</Label>
            <Select
              value={selectedCostGroup || ''}
              onChange={(e) => {
                setSelectedCostGroup(
                  e.target.value ? Number(e.target.value) : undefined
                );
                setSelectedService(undefined);
                setSelectedProject(undefined);
              }}
            >
              <option value="">전체</option>
              {costGroups?.map((cg) => (
                <option key={cg.cost_group_id} value={cg.cost_group_id}>
                  {cg.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>서비스</Label>
            <Select
              value={selectedService || ''}
              onChange={(e) => {
                setSelectedService(
                  e.target.value ? Number(e.target.value) : undefined
                );
                setSelectedProject(undefined);
              }}
              disabled={!selectedCostGroup}
            >
              <option value="">전체</option>
              {services?.map((service: any) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>프로젝트</Label>
            <Select
              value={selectedProject || ''}
              onChange={(e) =>
                setSelectedProject(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              disabled={!selectedService}
            >
              <option value="">전체</option>
              {projects?.map((project: any) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </Field>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto dark:border-blue-500"></div>
          <Text className="mt-2">로딩 중...</Text>
        </div>
      ) : data?.data.length === 0 ? (
        <Text className="p-8 text-center">조회된 업무 보고가 없습니다.</Text>
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
                      className="font-medium text-blue-600 hover:text-blue-900 text-left dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {task.task_name}
                    </button>
                    {task.task_detail && (
                      <div className="text-zinc-500 text-xs mt-1 dark:text-zinc-400">
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
      <Dialog open={showDetailModal} onClose={() => setShowDetailModal(false)}>
        <DialogTitle>업무 상세 정보</DialogTitle>
        <DialogBody>
          {selectedTask && (
            <DescriptionList>
              <DescriptionTerm>업무명</DescriptionTerm>
              <DescriptionDetails>{selectedTask.task_name}</DescriptionDetails>

              <DescriptionTerm>상세 내용</DescriptionTerm>
              <DescriptionDetails className="whitespace-pre-wrap">
                {selectedTask.task_detail || '-'}
              </DescriptionDetails>

              <DescriptionTerm>작업 날짜</DescriptionTerm>
              <DescriptionDetails>
                {format(new Date(selectedTask.task_date), 'yyyy-MM-dd')}
              </DescriptionDetails>

              <DescriptionTerm>작업 시간</DescriptionTerm>
              <DescriptionDetails>
                {selectedTask.work_time
                  ? `${Math.floor(selectedTask.work_time / 60)}시간 ${selectedTask.work_time % 60}분`
                  : '-'}
              </DescriptionDetails>

              <DescriptionTerm>작성자</DescriptionTerm>
              <DescriptionDetails>
                {(selectedTask as any).members?.name || '알 수 없음'}
              </DescriptionDetails>

              <DescriptionTerm>비용그룹</DescriptionTerm>
              <DescriptionDetails>
                {(selectedTask as any).cost_groups?.name || '-'}
              </DescriptionDetails>

              <DescriptionTerm>서비스</DescriptionTerm>
              <DescriptionDetails>
                {(selectedTask as any).services?.name || '-'}
              </DescriptionDetails>

              <DescriptionTerm>프로젝트</DescriptionTerm>
              <DescriptionDetails>
                {(selectedTask as any).projects?.name || '-'}
              </DescriptionDetails>

              <DescriptionTerm>등록일시</DescriptionTerm>
              <DescriptionDetails>
                {format(
                  new Date(selectedTask.created_at),
                  'yyyy-MM-dd HH:mm:ss'
                )}
              </DescriptionDetails>
            </DescriptionList>
          )}
        </DialogBody>
        <DialogActions>
          {selectedTask && (
            <Button color="blue" href={`/tasks/edit/${selectedTask.task_id}`}>
              수정
            </Button>
          )}
          <Button plain onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
