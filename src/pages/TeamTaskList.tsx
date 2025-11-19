import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Field, Label } from '../components/ui/fieldset';
import { Heading, Subheading } from '../components/ui/heading';
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
import { businessAPI, codeAPI, memberAPI, taskAPI } from '../services/api';
import type { Member, Task } from '../types/database';

interface TaskWithMember extends Task {
  member_name?: string;
  member_account_id?: string;
  member_email?: string;
  project_name?: string;
  service_name?: string;
  cost_group_name?: string;
}

/**
 * 매니저용 팀 업무 보고 조회 페이지
 *
 * 권한: 매니저 또는 관리자만 접근 가능
 * 기능:
 * - 팀원들의 업무 보고 조회
 * - 다양한 필터 조건 (날짜, 팀원, 키워드, 프로젝트, 서비스, 비용그룹, 플랫폼)
 * - 업무 통계 요약
 */
export function TeamTaskList() {
  // UI 상태
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 필터 상태
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedCostGroupId, setSelectedCostGroupId] = useState<number | null>(
    null
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(
    null
  );

  // 팀원 목록 조회
  const { data: membersData } = useQuery({
    queryKey: ['members', 'active'],
    queryFn: async () => {
      return await memberAPI.getMembers();
    },
  });

  const members = membersData?.data.filter((m: Member) => m.is_active) || [];

  // 비용그룹 목록 조회
  const { data: costGroups } = useQuery({
    queryKey: ['costGroups'],
    queryFn: businessAPI.getCostGroups,
  });

  // 서비스 목록 조회 (비용그룹 선택 시)
  const { data: services } = useQuery({
    queryKey: ['services', selectedCostGroupId],
    queryFn: () => businessAPI.getServices(selectedCostGroupId || undefined),
    enabled: Boolean(selectedCostGroupId),
  });

  // 프로젝트 목록 조회 (서비스 선택 시)
  const { data: projects } = useQuery({
    queryKey: ['projects', selectedServiceId],
    queryFn: () => businessAPI.getProjects(selectedServiceId || undefined),
    enabled: Boolean(selectedServiceId),
  });

  // 플랫폼 목록 조회
  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: codeAPI.getPlatforms,
  });

  // 팀 업무 보고 조회
  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: [
      'team-tasks',
      startDate,
      endDate,
      selectedMemberId,
      keyword,
      selectedCostGroupId,
      selectedServiceId,
      selectedProjectId,
      selectedPlatformId,
    ],
    queryFn: async () => {
      // 모든 팀원의 업무 조회
      const result = await taskAPI.getTasks({
        page: 1,
        pageSize: 100,
        startDate,
        endDate,
        memberId: selectedMemberId ? String(selectedMemberId) : undefined,
        keyword: keyword || undefined,
        costGroupId: selectedCostGroupId || undefined,
        serviceId: selectedServiceId || undefined,
        projectId: selectedProjectId || undefined,
        platformId: selectedPlatformId || undefined,
      });

      // 팀원 정보 조합
      const tasksWithDetails: TaskWithMember[] = result.data.map(
        (task: Task) => {
          const member = members.find(
            (m: Member) => m.member_id === task.member_id
          );
          return {
            ...task,
            member_name: member?.name,
            member_account_id: member?.account_id,
            member_email: member?.email,
          };
        }
      );

      return tasksWithDetails;
    },
    enabled: members.length > 0,
  });

  const tasks = tasksData || [];

  // 통계 계산
  const stats = {
    totalTasks: tasks.length,
    totalWorkTime: tasks.reduce((sum, task) => sum + (task.work_time || 0), 0),
    memberCount: new Set(tasks.map((t) => t.member_id)).size,
  };

  // 비용그룹 변경 시 하위 필터 초기화
  const handleCostGroupChange = (value: string) => {
    setSelectedCostGroupId(value ? Number(value) : null);
    setSelectedServiceId(null);
    setSelectedProjectId(null);
  };

  // 서비스 변경 시 프로젝트 초기화
  const handleServiceChange = (value: string) => {
    setSelectedServiceId(value ? Number(value) : null);
    setSelectedProjectId(null);
  };

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>팀 업무 조회</Heading>
      </div>

      {/* 통계 카드 */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="size-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
                  총 업무 건수
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
                  {stats.totalTasks}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="size-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
                  총 작업 시간
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
                  {Math.floor(stats.totalWorkTime / 60)}시간{' '}
                  {stats.totalWorkTime % 60}분
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="size-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
                  보고 인원
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
                  {stats.memberCount}명
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Subheading>필터</Subheading>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {showAdvancedFilters ? (
              <>
                <ChevronUpIcon className="size-4" />
                상세 필터 접기
              </>
            ) : (
              <>
                <ChevronDownIcon className="size-4" />
                상세 필터 펼치기
              </>
            )}
          </button>
        </div>

        {/* 기본 필터 */}
        <div className="grid grid-cols-4 gap-6">
          {/* 날짜 범위 */}
          <Field>
            <Label>시작일</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>

          <Field>
            <Label>종료일</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>

          {/* 팀원 */}
          <Field>
            <Label>팀원</Label>
            <Select
              value={selectedMemberId || ''}
              onChange={(e) =>
                setSelectedMemberId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">전체 팀원</option>
              {members.map((member: Member) => (
                <option key={member.member_id} value={member.member_id}>
                  {member.name} (@{member.account_id})
                </option>
              ))}
            </Select>
          </Field>

          {/* 키워드 검색 */}
          <Field>
            <Label>키워드</Label>
            <div className="relative">
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="업무명 또는 내용"
              />
              <MagnifyingGlassIcon className="absolute right-2 top-2.5 size-5 text-zinc-400" />
            </div>
          </Field>
        </div>

        {/* 고급 필터 (접을 수 있음) */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            {/* 비용그룹 */}
            <Field>
              <Label>비용그룹</Label>
              <Select
                value={selectedCostGroupId || ''}
                onChange={(e) => handleCostGroupChange(e.target.value)}
              >
                <option value="">전체</option>
                {costGroups?.map((group) => (
                  <option key={group.cost_group_id} value={group.cost_group_id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </Field>

            {/* 서비스 */}
            <Field>
              <Label>서비스</Label>
              <Select
                value={selectedServiceId || ''}
                onChange={(e) => handleServiceChange(e.target.value)}
                disabled={!selectedCostGroupId}
              >
                <option value="">
                  {selectedCostGroupId ? '전체' : '비용그룹 먼저 선택'}
                </option>
                {services?.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </Field>

            {/* 프로젝트 */}
            <Field>
              <Label>프로젝트</Label>
              <Select
                value={selectedProjectId || ''}
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={!selectedServiceId}
              >
                <option value="">
                  {selectedServiceId ? '전체' : '서비스 먼저 선택'}
                </option>
                {projects?.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>

            {/* 플랫폼 */}
            <Field>
              <Label>플랫폼</Label>
              <Select
                value={selectedPlatformId || ''}
                onChange={(e) =>
                  setSelectedPlatformId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">전체</option>
                {platforms?.map((platform) => (
                  <option key={platform.code_id} value={platform.code_id}>
                    {platform.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}
      </div>

      {/* 업무 목록 */}
      <div className="mt-8">
        <div className="mb-4">
          <Subheading>업무 목록 ({tasks.length}건)</Subheading>
        </div>

        {loadingTasks ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg">
            <Text className="text-zinc-500">조회된 업무가 없습니다</Text>
          </div>
        ) : (
          <Table className="[--gutter:--spacing(6)]">
            <TableHead>
              <TableRow>
                <TableHeader>날짜</TableHeader>
                <TableHeader>팀원</TableHeader>
                <TableHeader>업무명</TableHeader>
                <TableHeader>프로젝트</TableHeader>
                <TableHeader>작업시간</TableHeader>
                <TableHeader>시작-종료</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.task_id}
                  href={`/tasks/edit/${task.task_id}`}
                >
                  <TableCell>
                    {format(new Date(task.task_date), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{task.member_name}</div>
                    <div className="text-zinc-500 text-sm">
                      @{task.member_account_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{task.task_name}</div>
                    {task.task_detail && (
                      <div className="text-zinc-500 text-sm line-clamp-2">
                        {task.task_detail}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {(task as any).projects?.name ? (
                      <Badge color="zinc">{(task as any).projects.name}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {task.work_time
                      ? `${Math.floor(task.work_time / 60)}h ${task.work_time % 60}m`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {task.start_time && task.end_time
                      ? `${task.start_time} - ${task.end_time}`
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
