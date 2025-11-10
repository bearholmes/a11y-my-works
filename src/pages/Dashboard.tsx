import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="space-y-6">
      {/* 헤더 및 날짜 필터 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">업무 대시보드</h2>
            <p className="mt-1 text-sm text-gray-600">
              업무 현황과 통계를 한눈에 확인하세요
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
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
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">총 업무 수</h3>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.totalTasks || 0}
          </div>
          <p className="mt-2 text-xs text-gray-600">
            선택한 기간 내 등록된 업무
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">총 작업 시간</h3>
          <div className="mt-2 text-3xl font-semibold text-blue-600">
            {stats?.totalHours || 0}h
          </div>
          <p className="mt-2 text-xs text-gray-600">정규 시간 + 초과 시간</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">활성 사용자</h3>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {stats?.activeMembers || 0}
          </div>
          <p className="mt-2 text-xs text-gray-600">현재 활동 중인 팀원</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            진행 중 프로젝트
          </h3>
          <div className="mt-2 text-3xl font-semibold text-purple-600">
            {stats?.activeProjects || 0}
          </div>
          <p className="mt-2 text-xs text-gray-600">활성 상태의 프로젝트</p>
        </div>
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
            <h3 className="text-lg font-semibold text-gray-900">최근 업무</h3>
            <Link
              to="/tasks"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              전체 보기 →
            </Link>
          </div>
          {recentTasks && recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.task_id}
                  className="border-l-4 border-blue-600 pl-3 py-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {task.task_name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {task.members?.name} • {task.projects?.name || '미지정'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {task.task_hours}h
                      {task.ot_hours ? ` +${task.ot_hours}h` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              최근 업무가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
