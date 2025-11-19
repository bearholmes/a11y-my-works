import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { ErrorMessage, Field, Label } from '../components/ui/fieldset';
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
import { Textarea } from '../components/ui/textarea';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { businessAPI, codeAPI, holidayAPI, taskAPI } from '../services/api';

// 주말 요일 상수 (0: 일요일, 6: 토요일)
const WEEKEND_DAYS = [0, 6];

// TaskForm 스키마
const taskSchema = z.object({
  task_date: z.string().min(1, '날짜를 입력해주세요'),
  task_name: z.string().min(1, '업무명을 입력해주세요'),
  task_detail: z.string().optional(),
  task_url: z.string().url().optional().or(z.literal('')),
  work_time: z.number().min(0).optional(),
  cost_group_id: z.number().optional(),
  service_id: z.number().optional(),
  project_id: z.number().optional(),
  platform_id: z.number().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TaskList() {
  const queryClient = useQueryClient();
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 선택된 날짜 상태 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 상세보기 모달 상태
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 슬라이드 패널 상태 (업무 등록/수정)
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // TaskForm 상태
  const [selectedCostGroup, setSelectedCostGroup] = useState<number | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateForQuery = (date: Date) => format(date, 'yyyy-MM-dd');

  // 선택된 날짜가 포함된 주의 모든 날짜 계산
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // 일요일부터 시작
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 }); // 토요일로 끝
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 쿼리 파라미터 생성
  const query = {
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

  // 공휴일 조회 (선택된 주의 연도)
  const selectedYear = selectedDate.getFullYear();
  const { data: holidaysData } = useQuery({
    queryKey: ['holidays', selectedYear],
    queryFn: () =>
      holidayAPI.getHolidays({ year: selectedYear, pageSize: 100 }),
  });

  // 공휴일 날짜 Set 생성
  const holidayDates = new Set(
    holidaysData?.data.map((h: any) => h.holiday_date) || []
  );

  // 공휴일 이름 매핑
  const holidayNames = new Map(
    holidaysData?.data.map((h: any) => [h.holiday_date, h.name]) || []
  );

  // TaskForm용 데이터 조회
  const { data: costGroups } = useQuery({
    queryKey: ['costGroups'],
    queryFn: businessAPI.getCostGroups,
  });

  const { data: services } = useQuery({
    queryKey: ['services', selectedCostGroup],
    queryFn: () => businessAPI.getServices(selectedCostGroup || undefined),
    enabled: Boolean(selectedCostGroup),
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', selectedService],
    queryFn: () => businessAPI.getProjects(selectedService || undefined),
    enabled: Boolean(selectedService),
  });

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: codeAPI.getPlatforms,
  });

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_date: formatDateForQuery(selectedDate),
    },
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

  // 생성/수정 mutation
  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      return taskAPI.createTask({
        ...data,
        member_id: 1, // 임시 값, 실제로는 현재 사용자 ID
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('업무가 등록되었습니다.');
      setShowFormPanel(false);
      reset();
    },
    onError: (error: Error) => {
      showError(`등록 실패: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskFormData }) => {
      return taskAPI.updateTask(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('업무가 수정되었습니다.');
      setShowFormPanel(false);
      setEditingTaskId(null);
      reset();
    },
    onError: (error: Error) => {
      showError(`수정 실패: ${error.message}`);
    },
  });

  // 날짜 네비게이션 핸들러
  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handlePreviousWeek = () => {
    setSelectedDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate((prev) => addWeeks(prev, 1));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!Number.isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
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

  // 업무 등록 버튼 클릭
  const handleNewTask = () => {
    reset({
      task_date: formatDateForQuery(selectedDate),
    });
    setEditingTaskId(null);
    setSelectedCostGroup(null);
    setSelectedService(null);
    setShowFormPanel(true);
  };

  // 업무 수정 버튼 클릭
  const handleEditTask = (task: any) => {
    setEditingTaskId(task.task_id);
    reset({
      task_date: task.task_date,
      task_name: task.task_name,
      task_detail: task.task_detail || '',
      task_url: task.task_url || '',
      work_time: task.work_time || undefined,
      cost_group_id: task.cost_group_id || undefined,
      service_id: task.service_id || undefined,
      project_id: task.project_id || undefined,
      platform_id: task.platform_id || undefined,
      start_time: task.start_time || '',
      end_time: task.end_time || '',
    });
    setSelectedCostGroup(task.cost_group_id || null);
    setSelectedService(task.service_id || null);
    setShowFormPanel(true);
  };

  // 폼 제출 핸들러
  const onSubmit = (data: TaskFormData) => {
    if (editingTaskId) {
      updateMutation.mutate({ id: editingTaskId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // 청구 그룹 변경 시 하위 데이터 초기화
  const watchCostGroup = watch('cost_group_id');
  const watchService = watch('service_id');

  useEffect(() => {
    setSelectedCostGroup(watchCostGroup || null);
    if (watchCostGroup !== selectedCostGroup) {
      setValue('service_id', undefined as any);
      setValue('project_id', undefined as any);
    }
  }, [watchCostGroup, selectedCostGroup, setValue]);

  useEffect(() => {
    setSelectedService(watchService || null);
    if (watchService !== selectedService) {
      setValue('project_id', undefined as any);
    }
  }, [watchService, selectedService, setValue]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded dark:bg-red-950/50 dark:border-red-900 dark:text-red-400">
        업무 목록을 불러오는데 실패했습니다: {(error as Error).message}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Heading>업무 보고</Heading>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {format(selectedDate, 'yyyy년 M월 d일')}{' '}
            {format(selectedDate, 'EEEE', { locale: ko })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* 날짜 네비게이션 버튼 그룹 */}
          <div className="relative flex items-center rounded-md bg-white shadow-sm ring-1 ring-zinc-300 dark:bg-white/10 dark:ring-white/10">
            <button
              type="button"
              onClick={handlePreviousDay}
              className="flex h-9 w-12 items-center justify-center rounded-l-md text-zinc-500 hover:text-zinc-700 focus:relative dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10"
              aria-label="이전 날짜"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="hidden px-3.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus:relative dark:text-white dark:hover:bg-white/10"
            >
              오늘
            </button>
            <span className="relative -mx-px h-5 w-px bg-zinc-300 dark:bg-white/10" />
            <button
              type="button"
              onClick={handleNextDay}
              className="flex h-9 w-12 items-center justify-center rounded-r-md text-zinc-500 hover:text-zinc-700 focus:relative dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10"
              aria-label="다음 날짜"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* 날짜 선택 (데이트피커) */}
          <Field>
            <Label className="sr-only">날짜 선택</Label>
            <Input
              type="date"
              value={formatDateForQuery(selectedDate)}
              onChange={handleDateChange}
              className="w-auto"
            />
          </Field>

          {/* 업무 등록 버튼 */}
          <Button onClick={handleNewTask}>업무 등록</Button>
        </div>
      </div>

      {/* 주 단위 캘린더 */}
      <div className="mt-8 rounded-lg bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">
        <div className="flex items-center gap-4">
          {/* 이전 주 버튼 */}
          <button
            type="button"
            onClick={handlePreviousWeek}
            className="flex items-center justify-center p-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
            aria-label="이전 주"
          >
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* 주간 캘린더 */}
          <div className="flex-1 grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayOfWeek = day.getDay();
              const isWeekend = WEEKEND_DAYS.includes(dayOfWeek);
              const dateStr = formatDateForQuery(day);
              const isHoliday = holidayDates.has(dateStr);
              const holidayName = holidayNames.get(dateStr);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-3 rounded-lg text-center transition-colors relative
                    ${
                      isSelected
                        ? 'bg-zinc-600 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : isWeekend || isHoliday
                          ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30'
                          : isToday
                            ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }
                  `}
                  aria-label={`${format(day, 'yyyy년 M월 d일 EEEE', { locale: ko })}${holidayName ? ` (${holidayName})` : ''}`}
                >
                  <div
                    className={`text-xs font-medium mb-1 ${
                      isSelected
                        ? ''
                        : isWeekend || isHoliday
                          ? 'text-red-600 dark:text-red-400'
                          : ''
                    }`}
                  >
                    {format(day, 'EEE', { locale: ko })}
                  </div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                  {isHoliday && !isSelected && (
                    <div className="absolute top-1 right-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                  )}
                  {isHoliday && holidayName && (
                    <div
                      className={`text-[10px] mt-1 truncate ${
                        isSelected
                          ? 'text-white/80 dark:text-zinc-900/80'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {holidayName}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 다음 주 버튼 */}
          <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center justify-center p-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
            aria-label="다음 주"
          >
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* 주간 범위 표시 */}
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-3">
          {format(weekStart, 'M월 d일')} - {format(weekEnd, 'M월 d일')}
        </div>
      </div>

      {/* 업무 목록 */}
      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <Spinner />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="mt-8 py-12 text-center">
          <Text className="text-zinc-600 dark:text-zinc-400">
            {format(selectedDate, 'yyyy년 M월 d일')}에 작성된 업무 보고가
            없습니다.
          </Text>
          <Button onClick={handleNewTask} className="mt-4">
            업무 등록하기
          </Button>
        </div>
      ) : (
        <Table className="mt-8 [--gutter:--spacing(6)]">
          <TableHead>
            <TableRow>
              <TableHeader>업무명</TableHeader>
              <TableHeader>작업시간</TableHeader>
              <TableHeader className="text-right">작업</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((task) => (
              <TableRow key={task.task_id}>
                <TableCell>
                  <button
                    onClick={() => handleViewDetail(task)}
                    className="font-medium text-zinc-700 hover:text-zinc-800 text-left dark:text-zinc-400 dark:hover:text-zinc-300"
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
                  {task.work_time
                    ? `${Math.floor(task.work_time / 60)}시간 ${task.work_time % 60}분`
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button plain onClick={() => handleViewDetail(task)}>
                      상세
                    </Button>
                    <Button plain onClick={() => handleEditTask(task)}>
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
            <Button color="zinc" onClick={() => handleEditTask(selectedTask)}>
              수정
            </Button>
          )}
          <Button plain onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 슬라이드 패널 (업무 등록/수정) */}
      {showFormPanel && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowFormPanel(false)}
            aria-hidden="true"
          />

          {/* 슬라이드 패널 */}
          <div className="fixed inset-y-0 right-0 w-[800px] bg-white dark:bg-zinc-900 shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
              <Heading>
                {editingTaskId ? '업무 보고 수정' : '업무 보고 등록'}
              </Heading>
              <button
                type="button"
                onClick={() => setShowFormPanel(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <Label>
                      날짜{' '}
                      <span className="text-red-600" aria-label="필수 항목">
                        *
                      </span>
                    </Label>
                    <Input
                      id="task_date"
                      type="date"
                      {...register('task_date')}
                      aria-required="true"
                      aria-invalid={!!errors.task_date}
                    />
                    {errors.task_date && (
                      <ErrorMessage>{errors.task_date.message}</ErrorMessage>
                    )}
                  </Field>

                  <Field>
                    <Label>작업 시간 (분)</Label>
                    <Input
                      id="work_time"
                      type="number"
                      {...register('work_time', { valueAsNumber: true })}
                      aria-label="작업 시간을 분 단위로 입력"
                      min="0"
                    />
                  </Field>
                </div>

                <Field>
                  <Label>
                    업무명{' '}
                    <span className="text-red-600" aria-label="필수 항목">
                      *
                    </span>
                  </Label>
                  <Input
                    id="task_name"
                    type="text"
                    {...register('task_name')}
                    aria-required="true"
                    aria-invalid={!!errors.task_name}
                    placeholder="업무명을 입력하세요"
                  />
                  {errors.task_name && (
                    <ErrorMessage>{errors.task_name.message}</ErrorMessage>
                  )}
                </Field>

                <Field>
                  <Label>업무 상세</Label>
                  <Textarea
                    id="task_detail"
                    {...register('task_detail')}
                    rows={3}
                    aria-label="업무의 상세 내용 입력"
                    placeholder="업무 상세 내용을 입력하세요"
                  />
                </Field>

                <Field>
                  <Label>관련 URL</Label>
                  <Input
                    id="task_url"
                    type="url"
                    {...register('task_url')}
                    aria-invalid={!!errors.task_url}
                    placeholder="https://..."
                  />
                  {errors.task_url && (
                    <ErrorMessage>{errors.task_url.message}</ErrorMessage>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <Label>시작 시간</Label>
                    <Input
                      id="start_time"
                      type="time"
                      {...register('start_time')}
                      aria-label="작업 시작 시간 선택"
                    />
                  </Field>

                  <Field>
                    <Label>종료 시간</Label>
                    <Input
                      id="end_time"
                      type="time"
                      {...register('end_time')}
                      aria-label="작업 종료 시간 선택"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <Label>청구 그룹</Label>
                    <Select
                      id="cost_group_id"
                      {...register('cost_group_id', { valueAsNumber: true })}
                      aria-label="청구 그룹 선택"
                    >
                      <option value="">청구 그룹을 선택하세요</option>
                      {costGroups?.map((group) => (
                        <option
                          key={group.cost_group_id}
                          value={group.cost_group_id}
                        >
                          {group.name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field>
                    <Label>플랫폼</Label>
                    <Select
                      id="platform_id"
                      {...register('platform_id', { valueAsNumber: true })}
                      aria-label="플랫폼 선택"
                    >
                      <option value="">플랫폼을 선택하세요</option>
                      {platforms?.map((platform) => (
                        <option key={platform.code_id} value={platform.code_id}>
                          {platform.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <Label>서비스</Label>
                    <Select
                      id="service_id"
                      {...register('service_id', { valueAsNumber: true })}
                      aria-label="서비스 선택"
                      aria-disabled={!selectedCostGroup}
                      disabled={!selectedCostGroup}
                    >
                      <option value="">
                        {selectedCostGroup
                          ? '서비스를 선택하세요'
                          : '먼저 청구 그룹을 선택하세요'}
                      </option>
                      {services?.map((service) => (
                        <option
                          key={service.service_id}
                          value={service.service_id}
                        >
                          {service.name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field>
                    <Label>프로젝트</Label>
                    <Select
                      id="project_id"
                      {...register('project_id', { valueAsNumber: true })}
                      aria-label="프로젝트 선택"
                      aria-disabled={!selectedService}
                      disabled={!selectedService}
                    >
                      <option value="">
                        {selectedService
                          ? '프로젝트를 선택하세요'
                          : '먼저 서비스를 선택하세요'}
                      </option>
                      {projects?.map((project) => (
                        <option
                          key={project.project_id}
                          value={project.project_id}
                        >
                          {project.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Button
                    type="button"
                    plain
                    onClick={() => setShowFormPanel(false)}
                    aria-label="취소"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    aria-label={
                      editingTaskId ? '업무 보고 수정 저장' : '업무 보고 등록'
                    }
                    aria-busy={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? '저장 중...'
                      : editingTaskId
                        ? '수정'
                        : '등록'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
