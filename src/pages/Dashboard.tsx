import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useState } from 'react';
import { Stat } from '../components/Stat';
import { Badge } from '../components/ui/badge';
import { Heading, Subheading } from '../components/ui/heading';
import { Link } from '../components/ui/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
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
          <div>
            <label
              htmlFor="startDate"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              시작일
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              종료일
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="총 업무 수"
          value={`${stats?.totalTasks || 0}`}
          description="선택한 기간 내 등록"
        />
        <Stat
          title="총 작업 시간"
          value={`${stats?.totalHours || 0}h`}
          description="정규 + 초과 시간"
        />
        <Stat
          title="활성 사용자"
          value={`${stats?.activeMembers || 0}`}
          description="현재 활동 중"
        />
        <Stat
          title="진행 중 프로젝트"
          value={`${stats?.activeProjects || 0}`}
          description="활성 상태"
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일별 업무 추이 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            일별 업무 추이
          </h3>
          {dailyStats && dailyStats.length > 0 ? (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {dailyStats.slice(-14).map((stat) => (
                    <div
                      key={stat.date}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="w-24 text-sm text-gray-600">
                        {format(new Date(stat.date), 'MM/dd')}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
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
                      <div className="w-16 text-sm text-gray-600 text-right">
                        {stat.taskCount}건
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* 프로젝트별 업무 분포 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            프로젝트별 업무 분포
          </h3>
          {projectStats && projectStats.length > 0 ? (
            <div className="space-y-3">
              {projectStats.slice(0, 10).map((stat) => (
                <div key={stat.projectId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 truncate">
                      {stat.projectName}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {stat.totalHours}h ({stat.taskCount}건)
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
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
            <div className="text-center py-8 text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 사용자별 통계 및 최근 업무 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사용자별 작업 시간 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            사용자별 작업 시간
          </h3>
          {memberStats && memberStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      이름
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      작업 시간
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      업무 수
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {memberStats.slice(0, 10).map((stat) => (
                    <tr key={stat.memberId}>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        {stat.memberName}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-right">
                        {stat.totalHours}h
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-right">
                        {stat.taskCount}건
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* 최근 업무 목록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Subheading>최근 업무</Subheading>
            <Link
              href="/tasks"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              전체 보기 →
            </Link>
          </div>
          {recentTasks && recentTasks.length > 0 ? (
            <Table>
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
            <div className="text-center py-8 text-gray-500">
              최근 업무가 없습니다
            </div>
          )}
        </div>
      </div>
    </>
  );
}
