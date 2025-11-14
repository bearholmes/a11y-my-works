import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import { ko } from 'date-fns/locale';
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
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
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
import { taskAPI } from '../services/api';
import type { TaskQuery } from '../types/database';

export function TaskList() {
  const queryClient = useQueryClient();
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 선택된 날짜 상태 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 상세보기 모달 상태
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateForQuery = (date: Date) => format(date, 'yyyy-MM-dd');

  // 선택된 날짜가 포함된 주의 모든 날짜 계산
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // 일요일부터 시작
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 }); // 토요일로 끝
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 쿼리 파라미터 생성
  const query: TaskQuery = {
    page: 1,
    pageSize: 100,
    startDate: formatDateForQuery(selectedDate),
    endDate: formatDateForQuery(selectedDate),
  };

  // 업무 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskAPI.getTasks(query),
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

  // 날짜 네비게이션 핸들러
  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
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
      {/* 헤더 - 날짜 네비게이션 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Heading>업무 보고</Heading>
          <Button href="/tasks/new">업무 등록</Button>
        </div>

        {/* 주 단위 캘린더 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-3 rounded-lg text-center transition-colors
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : isToday
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }
                  `}
                  aria-label={format(day, 'yyyy년 M월 d일 EEEE', {
                    locale: ko,
                  })}
                >
                  <div className="text-xs font-medium mb-1">
                    {format(day, 'EEE', { locale: ko })}
                  </div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="flex items-center justify-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg">
          {/* 이전 날짜 버튼 */}
          <Button
            plain
            onClick={handlePreviousDay}
            aria-label="이전 날짜"
            className="text-2xl"
          >
            ◀
          </Button>

          {/* 선택된 날짜 표시 */}
          <div className="text-center min-w-[200px]">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {format(selectedDate, 'yyyy년 M월 d일')}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {format(selectedDate, 'EEEE', { locale: ko })}
            </div>
          </div>

          {/* 다음 날짜 버튼 */}
          <Button
            plain
            onClick={handleNextDay}
            aria-label="다음 날짜"
            className="text-2xl"
          >
            ▶
          </Button>

          {/* 날짜 선택 (데이트피커) */}
          <Field className="ml-4">
            <Label className="sr-only">날짜 선택</Label>
            <Input
              type="date"
              value={formatDateForQuery(selectedDate)}
              onChange={handleDateChange}
              className="w-auto"
            />
          </Field>
        </div>
      </div>

      {/* 업무 목록 */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto dark:border-blue-500"></div>
          <Text className="mt-2">로딩 중...</Text>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <Text className="text-zinc-600 dark:text-zinc-400">
            {format(selectedDate, 'yyyy년 M월 d일')}에 작성된 업무 보고가
            없습니다.
          </Text>
          <Button href="/tasks/new" className="mt-4">
            업무 등록하기
          </Button>
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
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
                      onClick={() => handleDelete(task.task_id, task.task_name)}
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
