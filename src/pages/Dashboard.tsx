import { ChevronRightIcon } from '@heroicons/react/16/solid';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Field, Label } from '../components/ui/fieldset';
import { Heading, Subheading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Link } from '../components/ui/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Text } from '../components/ui/text';
import { dashboardAPI } from '../services/api';

export function Dashboard() {
  // 기본 날짜 범위: 최근 30일
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // 대시보드 통계 조회
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats', startDate, endDate],
    queryFn: () => dashboardAPI.getDashboardStats({ startDate, endDate }),
  });

  // 일별 통계 조회
  const { data: dailyStats } = useQuery({
    queryKey: ['dailyTaskStats', startDate, endDate],
    queryFn: () => dashboardAPI.getDailyTaskStats({ startDate, endDate }),
  });

  // 프로젝트별 통계 조회
  const { data: projectStats } = useQuery({
    queryKey: ['projectStats', startDate, endDate],
    queryFn: () => dashboardAPI.getProjectStats({ startDate, endDate }),
  });

  // 사용자별 통계 조회
  const { data: memberStats } = useQuery({
    queryKey: ['memberStats', startDate, endDate],
    queryFn: () => dashboardAPI.getMemberStats({ startDate, endDate }),
  });

  // 최근 업무 조회
  const { data: recentTasks } = useQuery({
    queryKey: ['recentTasks'],
    queryFn: () => dashboardAPI.getRecentTasks(10),
  });

  return (
    <>
      <Heading>업무 대시보드</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>주요 지표</Subheading>
        <div className="flex gap-3">
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
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-px bg-zinc-900/5 dark:bg-white/10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 dark:bg-zinc-900">
          <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            총 업무 수
          </dt>
          <dd className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            선택한 기간 내 등록
          </dd>
          <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-zinc-950 dark:text-white">
            {stats?.totalTasks || 0}
          </dd>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 dark:bg-zinc-900">
          <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            총 작업 시간
          </dt>
          <dd className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            정규 + 초과 시간
          </dd>
          <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-zinc-950 dark:text-white">
            {stats?.totalHours || 0}h
          </dd>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 dark:bg-zinc-900">
          <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            활성 사용자
          </dt>
          <dd className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            현재 활동 중
          </dd>
          <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-zinc-950 dark:text-white">
            {stats?.activeMembers || 0}
          </dd>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 dark:bg-zinc-900">
          <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            진행 중 프로젝트
          </dt>
          <dd className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            활성 상태
          </dd>
          <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-zinc-950 dark:text-white">
            {stats?.activeProjects || 0}
          </dd>
        </div>
      </dl>

      <Subheading className="mt-14">차트</Subheading>
      <div className="mt-4 grid grid-cols-1 gap-6">
        {/* 일별 업무 추이 */}
        <div className="rounded-lg bg-white p-6 dark:bg-zinc-900">
          <Subheading className="mb-4">일별 업무 추이</Subheading>
          {dailyStats && dailyStats.length > 0 ? (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {dailyStats.slice(-14).map((stat) => (
                    <div
                      key={stat.date}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="w-24 text-sm text-zinc-600 dark:text-zinc-400">
                        {format(new Date(stat.date), 'MM/dd')}
                      </div>
                      <div className="flex-1">
                        <div className="bg-zinc-200 rounded-full h-6 relative dark:bg-zinc-700">
                          <div
                            className="bg-zinc-600 h-6 rounded-full flex items-center justify-end pr-2 dark:bg-zinc-500"
                            style={{
                              width: `${Math.min((stat.totalHours / 40) * 100, 100)}%`,
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              {stat.totalHours}h
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-sm text-zinc-600 text-right dark:text-zinc-400">
                        {stat.taskCount}건
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Text className="text-center py-8">데이터가 없습니다</Text>
          )}
        </div>

        {/* 프로젝트별 업무 분포 */}
        <div className="rounded-lg bg-white p-6 dark:bg-zinc-900">
          <Subheading className="mb-4">프로젝트별 업무 분포</Subheading>
          {projectStats && projectStats.length > 0 ? (
            <div className="space-y-3">
              {projectStats.slice(0, 10).map((stat) => (
                <div key={stat.projectId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-zinc-700 truncate dark:text-zinc-300">
                      {stat.projectName}
                    </span>
                    <span className="text-zinc-600 ml-2 dark:text-zinc-400">
                      {stat.totalHours}h ({stat.taskCount}건)
                    </span>
                  </div>
                  <div className="bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
                    <div
                      className="bg-purple-600 h-2 rounded-full dark:bg-purple-500"
                      style={{
                        width: `${Math.min(
                          (stat.totalHours /
                            (projectStats[0]?.totalHours || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text className="text-center py-8">데이터가 없습니다</Text>
          )}
        </div>
      </div>

      <Subheading className="mt-14">통계</Subheading>
      <div className="mt-4 grid grid-cols-1 gap-6">
        {/* 사용자별 작업 시간 */}
        <div className="rounded-lg bg-white p-6 dark:bg-zinc-900">
          <Subheading className="mb-4">사용자별 작업 시간</Subheading>
          {memberStats && memberStats.length > 0 ? (
            <Table className="[--gutter:--spacing(6)]" dense>
              <TableHead>
                <TableRow>
                  <TableHeader>이름</TableHeader>
                  <TableHeader className="text-right">작업 시간</TableHeader>
                  <TableHeader className="text-right">업무 수</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberStats.slice(0, 10).map((stat) => (
                  <TableRow key={stat.memberId}>
                    <TableCell className="font-medium">
                      {stat.memberName}
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.totalHours}h
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.taskCount}건
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Text className="text-center py-8">데이터가 없습니다</Text>
          )}
        </div>

        {/* 최근 업무 목록 */}
        <div className="rounded-lg bg-white p-6 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <Subheading>최근 업무</Subheading>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-sm text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              전체 보기
              <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          {recentTasks && recentTasks.length > 0 ? (
            <Table className="[--gutter:--spacing(6)]" dense>
              <TableHead>
                <TableRow>
                  <TableHeader>업무명</TableHeader>
                  <TableHeader>담당자</TableHeader>
                  <TableHeader>프로젝트</TableHeader>
                  <TableHeader className="text-right">작업 시간</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTasks.map((task) => (
                  <TableRow key={task.task_id}>
                    <TableCell className="font-medium">
                      {task.task_name}
                    </TableCell>
                    <TableCell>{task.members?.name}</TableCell>
                    <TableCell>
                      <Badge color="zinc">
                        {task.projects?.name || '미지정'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {task.task_hours}h
                      {task.ot_hours ? ` +${task.ot_hours}h` : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Text className="text-center py-8">최근 업무가 없습니다</Text>
          )}
        </div>
      </div>
    </>
  );
}
