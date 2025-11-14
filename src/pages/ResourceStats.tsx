import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Stat } from '../components/Stat';
import { Heading, Subheading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Text } from '../components/ui/text';
import { taskAPI } from '../services/api';
import type { Task } from '../types/database';

/**
 * 리소스 통계 데이터 타입
 */
interface ResourceStat {
  id: number;
  name: string;
  totalHours: number;
  taskCount: number;
  memberCount: number;
  percentage: number;
}

interface MemberStat extends ResourceStat {
  accountId: string;
}

interface MonthlyStats {
  projects: ResourceStat[];
  services: ResourceStat[];
  costGroups: ResourceStat[];
  members: MemberStat[];
  totalHours: number;
  totalTasks: number;
  totalMembers: number;
}

/**
 * 매니저용 월간 리소스 통계 페이지
 *
 * 기능:
 * - 프로젝트별 투입 시간 및 리소스 통계
 * - 서비스별 투입 시간 및 리소스 통계
 * - 청구 그룹별 투입 시간 및 리소스 통계
 * - 월별 조회 및 비교
 */
export function ResourceStats() {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );

  // 월간 업무 데이터 조회
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['monthly-tasks', selectedMonth],
    queryFn: async () => {
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-31`;

      const result = await taskAPI.getTasks({
        startDate,
        endDate,
        pageSize: 1000, // 한 달 데이터 전체 조회
      });

      return result.data;
    },
  });

  // 통계 계산
  const stats: MonthlyStats = {
    projects: [],
    services: [],
    costGroups: [],
    members: [],
    totalHours: 0,
    totalTasks: 0,
    totalMembers: 0,
  };

  if (tasks.length > 0) {
    // 총계 계산
    stats.totalHours = tasks.reduce(
      (sum: number, task: Task) => sum + (task.work_time || 0),
      0
    );
    stats.totalTasks = tasks.length;
    stats.totalMembers = new Set(tasks.map((t: Task) => t.member_id)).size;

    // 프로젝트별 통계
    const projectMap = new Map<number, ResourceStat>();
    tasks.forEach((task: Task) => {
      if (task.project_id) {
        const existing = projectMap.get(task.project_id) || {
          id: task.project_id,
          name: (task as any).projects?.name || `프로젝트 ${task.project_id}`,
          totalHours: 0,
          taskCount: 0,
          memberCount: 0,
          percentage: 0,
        };

        existing.totalHours += task.work_time || 0;
        existing.taskCount += 1;
        projectMap.set(task.project_id, existing);
      }
    });

    stats.projects = Array.from(projectMap.values())
      .map((stat) => ({
        ...stat,
        percentage:
          stats.totalHours > 0 ? (stat.totalHours / stats.totalHours) * 100 : 0,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);

    // 서비스별 통계
    const serviceMap = new Map<number, ResourceStat>();
    tasks.forEach((task: Task) => {
      if (task.service_id) {
        const existing = serviceMap.get(task.service_id) || {
          id: task.service_id,
          name: (task as any).services?.name || `서비스 ${task.service_id}`,
          totalHours: 0,
          taskCount: 0,
          memberCount: 0,
          percentage: 0,
        };

        existing.totalHours += task.work_time || 0;
        existing.taskCount += 1;
        serviceMap.set(task.service_id, existing);
      }
    });

    stats.services = Array.from(serviceMap.values())
      .map((stat) => ({
        ...stat,
        percentage:
          stats.totalHours > 0 ? (stat.totalHours / stats.totalHours) * 100 : 0,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);

    // 청구 그룹별 통계
    const costGroupMap = new Map<number, ResourceStat>();
    tasks.forEach((task: Task) => {
      if (task.cost_group_id) {
        const existing = costGroupMap.get(task.cost_group_id) || {
          id: task.cost_group_id,
          name:
            (task as any).cost_groups?.name || `청구그룹 ${task.cost_group_id}`,
          totalHours: 0,
          taskCount: 0,
          memberCount: 0,
          percentage: 0,
        };

        existing.totalHours += task.work_time || 0;
        existing.taskCount += 1;
        costGroupMap.set(task.cost_group_id, existing);
      }
    });

    stats.costGroups = Array.from(costGroupMap.values())
      .map((stat) => ({
        ...stat,
        percentage:
          stats.totalHours > 0 ? (stat.totalHours / stats.totalHours) * 100 : 0,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);

    // 직원별 통계
    const memberMap = new Map<number, MemberStat>();
    tasks.forEach((task: Task) => {
      if (task.member_id) {
        const existing = memberMap.get(task.member_id) || {
          id: task.member_id,
          name: (task as any).members?.name || '알 수 없음',
          accountId: (task as any).members?.account_id || '-',
          totalHours: 0,
          taskCount: 0,
          memberCount: 1,
          percentage: 0,
        };

        existing.totalHours += task.work_time || 0;
        existing.taskCount += 1;
        memberMap.set(task.member_id, existing);
      }
    });

    stats.members = Array.from(memberMap.values())
      .map((stat) => ({
        ...stat,
        percentage:
          stats.totalHours > 0 ? (stat.totalHours / stats.totalHours) * 100 : 0,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Heading>월간 리소스 통계</Heading>
          <Text className="mt-1">
            프로젝트, 서비스, 청구그룹별 투입 리소스 현황
          </Text>
        </div>

        <div>
          <label htmlFor="month" className="sr-only">
            조회 월 선택
          </label>
          <Input
            type="month"
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="조회할 월 선택"
          />
        </div>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Stat
          title="총 투입 시간"
          value={stats.totalHours.toFixed(1)}
          description="시간"
          icon="⏱️"
        />
        <Stat
          title="총 업무 건수"
          value={stats.totalTasks}
          description="건"
          icon="📋"
        />
        <Stat
          title="투입 인원"
          value={stats.totalMembers}
          description="명"
          icon="👥"
        />
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-12"
          role="status"
          aria-live="polite"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            aria-label="로딩 중"
          ></div>
        </div>
      ) : (
        <>
          {/* 프로젝트별 통계 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <Subheading>프로젝트별 리소스</Subheading>
            </div>
            <div className="p-6">
              {stats.projects.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  프로젝트 데이터가 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.projects.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.taskCount}건 업무
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {project.totalHours.toFixed(1)}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.percentage}%` }}
                          role="progressbar"
                          aria-valuenow={project.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${project.name} 비율`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 서비스별 통계 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <Subheading>서비스별 리소스</Subheading>
            </div>
            <div className="p-6">
              {stats.services.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  서비스 데이터가 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.services.map((service) => (
                    <div key={service.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.taskCount}건 업무
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {service.totalHours.toFixed(1)}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${service.percentage}%` }}
                          role="progressbar"
                          aria-valuenow={service.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${service.name} 비율`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 청구 그룹별 통계 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <Subheading>청구 그룹별 리소스</Subheading>
            </div>
            <div className="p-6">
              {stats.costGroups.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  청구 그룹 데이터가 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.costGroups.map((costGroup) => (
                    <div key={costGroup.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {costGroup.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {costGroup.taskCount}건 업무
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {costGroup.totalHours.toFixed(1)}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {costGroup.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${costGroup.percentage}%` }}
                          role="progressbar"
                          aria-valuenow={costGroup.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${costGroup.name} 비율`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 직원별 통계 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <Subheading>직원별 리소스</Subheading>
            </div>
            <div className="p-6">
              {stats.members.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  직원 데이터가 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.members.map((member) => (
                    <div key={member.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}{' '}
                            <span className="text-gray-500">
                              (@{member.accountId})
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.taskCount}건 업무
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {member.totalHours.toFixed(1)}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${member.percentage}%` }}
                          role="progressbar"
                          aria-valuenow={member.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${member.name} 비율`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
