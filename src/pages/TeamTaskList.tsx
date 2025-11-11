import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
      const tasksWithDetails: TaskWithMember[] = result.data.map((task: Task) => {
        const member = members.find((m: Member) => m.member_id === task.member_id);
        return {
          ...task,
          member_name: member?.name,
          member_account_id: member?.account_id,
          member_email: member?.email,
        };
      });

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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀 업무 보고</h1>
          <p className="mt-1 text-sm text-gray-600">
            팀원들의 업무 보고를 조회하고 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl" aria-hidden="true">
                  📋
                </span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 업무 건수
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl" aria-hidden="true">
                  ⏱️
                </span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 작업 시간
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalWorkTime}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl" aria-hidden="true">
                  👥
                </span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    보고 인원
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.memberCount}명
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              날짜
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label="조회할 날짜 선택"
            />
          </div>

          <div>
            <label
              htmlFor="member"
              className="block text-sm font-medium text-gray-700"
            >
              팀원
            </label>
            <select
              id="member"
              value={selectedMemberId || ''}
              onChange={(e) =>
                setSelectedMemberId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label="팀원 필터"
            >
              <option value="">전체 팀원</option>
              {members.map((member: Member) => (
                <option key={member.member_id} value={member.member_id}>
                  {member.name} (@{member.account_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 업무 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">업무 목록</h2>
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
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl" aria-hidden="true">
              📭
            </span>
            <p className="mt-2 text-sm text-gray-500">
              선택한 날짜에 업무 보고가 없습니다
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" role="table">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    팀원
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    업무명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    업무 유형
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    작업 시간
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    시작-종료
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr
                    key={task.task_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.member_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{task.member_account_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {task.task_name}
                      </div>
                      {task.task_detail && (
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {task.task_detail}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {task.task_type || '일반'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.work_time || 0}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.start_time && task.end_time
                        ? `${task.start_time} - ${task.end_time}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/tasks/edit/${task.task_id}`}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label={`${task.task_name} 상세보기`}
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
