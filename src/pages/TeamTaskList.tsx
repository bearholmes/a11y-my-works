import {
  ClockIcon,
  DocumentTextIcon,
  InboxIcon,
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
import { memberAPI, taskAPI } from '../services/api';
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
 * - 날짜별, 팀원별 필터링
 * - 업무 통계 요약
 */
export function TeamTaskList() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // 팀원 목록 조회
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['members', 'active'],
    queryFn: async () => {
      return await memberAPI.getMembers();
    },
  });

  const members = membersData?.data.filter((m: Member) => m.is_active) || [];

  // 팀 업무 보고 조회
  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['team-tasks', selectedDate, selectedMemberId],
    queryFn: async () => {
      // 모든 팀원의 업무 조회
      const result = await taskAPI.getTasks({
        startDate: selectedDate,
        endDate: selectedDate,
        memberId: selectedMemberId ? String(selectedMemberId) : undefined,
      });

      // 팀원 정보 및 프로젝트 정보 조합
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

  const isLoading = loadingMembers || loadingTasks;

  return (
    <>
      {/* 헤더 */}
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>팀 업무 조회</Heading>
      </div>

      {/* 통계 카드 */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="size-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
                    총 업무 건수
                  </dt>
                  <dd className="text-2xl font-semibold text-zinc-950 dark:text-white">
                    {stats.totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="size-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
                    총 작업 시간
                  </dt>
                  <dd className="text-2xl font-semibold text-zinc-950 dark:text-white">
                    {stats.totalWorkTime}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="size-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
                    보고 인원
                  </dt>
                  <dd className="text-2xl font-semibold text-zinc-950 dark:text-white">
                    {stats.memberCount}명
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="mt-8 bg-white rounded-lg p-6 dark:bg-zinc-900">
        <Subheading className="mb-4">필터</Subheading>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field>
            <Label>날짜</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Field>

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
        </div>
      </div>

      {/* 업무 목록 */}
      <div className="mt-8 bg-white rounded-lg overflow-hidden dark:bg-zinc-900">
        <div className="px-6 py-4 border-b border-zinc-950/10 dark:border-white/10">
          <Subheading>업무 목록</Subheading>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <InboxIcon className="mx-auto size-12 text-zinc-400 dark:text-zinc-500" />
            <Text className="mt-2">선택한 날짜에 업무 보고가 없습니다</Text>
          </div>
        ) : (
          <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
            <TableHead>
              <TableRow>
                <TableHeader>팀원</TableHeader>
                <TableHeader>업무명</TableHeader>
                <TableHeader>업무 유형</TableHeader>
                <TableHeader>작업 시간</TableHeader>
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
                    <Badge color="blue">{task.task_type || '일반'}</Badge>
                  </TableCell>
                  <TableCell>{task.work_time || 0}h</TableCell>
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
