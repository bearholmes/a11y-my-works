import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dashboardAPI } from '../services/api';

/**
 * 관리자 대시보드 페이지
 * 매니저와 관리자가 월별로 팀원들의 업무 일지 작성 현황을 확인할 수 있습니다.
 * 일별 기준: 480분(8시간) 이상 작성 시 완료로 표시
 */
export function AdminDashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(true); // 기본값: 미완료만 보기
  const [searchQuery, setSearchQuery] = useState(''); // 사용자 이름 검색
  const [selectedDate, setSelectedDate] = useState<number | null>(null); // 선택한 날짜 (1-31, null = 전체)

  // 관리자 대시보드 통계 조회
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats', year, month],
    queryFn: () => dashboardAPI.getAdminDashboardStats(year, month),
  });

  // 필터링된 사용자 목록
  const filteredMembers =
    stats?.memberCompletion.filter((member) => {
      // 1. 완료율 필터 (미완료만 보기)
      if (showIncompleteOnly && member.stats.completionRate === 100) {
        return false;
      }

      // 2. 사용자 이름 검색 필터
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = member.memberName.toLowerCase().includes(query);
        const accountIdMatch = member.accountId.toLowerCase().includes(query);
        if (!nameMatch && !accountIdMatch) {
          return false;
        }
      }

      // 3. 특정 날짜 미작성자 필터
      if (selectedDate !== null) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
        const completion = member.dailyCompletion[dateStr];
        // null(주말/공휴일)이거나 true(완료)인 경우 제외
        if (completion !== false) {
          return false;
        }
      }

      return true;
    }) || [];

  // 해당 월의 날짜 수
  const lastDay = new Date(year, month, 0).getDate();
  const days = Array.from({ length: lastDay }, (_, i) => i + 1);

  // 이전/다음 달로 이동
  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  // 날짜 포맷 (YYYY-MM-DD)
  const formatDate = (day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 요일 계산
  const getDayOfWeek = (day: number) => {
    const date = new Date(year, month - 1, day);
    return date.getDay();
  };

  // 주말 여부
  const isWeekend = (day: number) => {
    const dayOfWeek = getDayOfWeek(day);
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              관리자 대시보드
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              팀원들의 월별 업무 일지 작성 현황을 확인하세요
            </p>
          </div>

          {/* 검색 및 필터 */}
          <div className="mt-4 md:mt-0 flex flex-col gap-3">
            {/* 월 선택기 */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                aria-label="이전 달"
              >
                ←
              </button>
              <div className="flex gap-2">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => now.getFullYear() - 2 + i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                aria-label="다음 달"
              >
                →
              </button>
            </div>

            {/* 필터 컨트롤 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 사용자 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="사용자 이름 또는 ID 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* 날짜 필터 */}
              <select
                value={selectedDate ?? ''}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">전체 날짜</option>
                {days
                  .filter((day) => {
                    // 주말은 제외
                    const dayOfWeek = getDayOfWeek(day);
                    return dayOfWeek !== 0 && dayOfWeek !== 6;
                  })
                  .map((day) => (
                    <option key={day} value={day}>
                      {month}월 {day}일 미작성자
                    </option>
                  ))}
              </select>

              {/* 미완료만 보기 토글 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showIncompleteOnly}
                  onChange={(e) => setShowIncompleteOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">미완료만 보기</span>
              </label>

              {/* 필터 초기화 */}
              {(searchQuery ||
                selectedDate !== null ||
                !showIncompleteOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDate(null);
                    setShowIncompleteOnly(true);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">활성 사용자</h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.totalActiveMembers}명
            </div>
            <p className="mt-2 text-xs text-gray-600">현재 활성화된 팀원 수</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">전체 완료율</h3>
            <div className="mt-2 text-3xl font-semibold text-blue-600">
              {stats.overallCompletionRate}%
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {stats.totalCompletedDays} / {stats.totalWorkingDays} 일
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              완전 작성 사용자
            </h3>
            <div className="mt-2 text-3xl font-semibold text-green-600">
              {stats.fullyCompletedMembers}명
            </div>
            <p className="mt-2 text-xs text-gray-600">100% 작성 완료한 팀원</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">미완료 사용자</h3>
            <div className="mt-2 text-3xl font-semibold text-red-600">
              {stats.totalActiveMembers - stats.fullyCompletedMembers}명
            </div>
            <p className="mt-2 text-xs text-gray-600">
              미완료 일지가 있는 팀원
            </p>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600" />
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 월별 캘린더 테이블 */}
      {stats && !isLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  월별 업무 일지 작성 현황
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  ✅ = 완료 (8시간 이상), ❌ = 미완료, - = 주말/공휴일
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-blue-600 font-medium">
                  {filteredMembers.length}명
                </span>
                {selectedDate && (
                  <span className="ml-2 text-gray-500">
                    ({month}월 {selectedDate}일 미작성)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    사용자
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    완료율
                  </th>
                  {days.map((day) => {
                    const isWeekendDay = isWeekend(day);
                    return (
                      <th
                        key={day}
                        className={`px-2 py-3 text-center text-xs font-medium uppercase ${
                          isWeekendDay
                            ? 'bg-gray-100 text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.memberId} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span>{member.memberName}</span>
                        <span className="text-xs text-gray-500">
                          ({member.accountId})
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center text-sm border-r border-gray-200">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          member.stats.completionRate === 100
                            ? 'bg-green-100 text-green-800'
                            : member.stats.completionRate >= 80
                              ? 'bg-blue-100 text-blue-800'
                              : member.stats.completionRate >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.stats.completionRate}%
                      </span>
                    </td>
                    {days.map((day) => {
                      const date = formatDate(day);
                      const completion = member.dailyCompletion[date];

                      return (
                        <td
                          key={day}
                          className={`px-2 py-3 text-center text-sm ${
                            completion === null
                              ? 'bg-gray-50'
                              : completion
                                ? 'bg-green-50'
                                : 'bg-red-50'
                          }`}
                        >
                          {completion === null ? (
                            <span className="text-gray-400">-</span>
                          ) : completion ? (
                            <span
                              className="text-green-600"
                              title="완료 (8시간 이상)"
                            >
                              ✅
                            </span>
                          ) : (
                            <span className="text-red-600" title="미완료">
                              ❌
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 통계 요약 */}
          {filteredMembers.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              {selectedDate ? (
                <div>
                  <p className="text-lg">
                    {month}월 {selectedDate}일에 미작성한 사용자가 없습니다! 🎉
                  </p>
                  <p className="mt-2 text-sm">
                    모든 사용자가 해당 날짜의 업무 일지를 작성했습니다.
                  </p>
                </div>
              ) : searchQuery ? (
                <p>검색 결과가 없습니다.</p>
              ) : showIncompleteOnly ? (
                <p>모든 사용자가 업무 일지를 완료했습니다! 🎉</p>
              ) : (
                <p>활성화된 사용자가 없습니다.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 범례 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">범례</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-gray-700">
              완료 - 해당 날짜에 8시간(480분) 이상 업무 작성
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600">❌</span>
            <span className="text-gray-700">
              미완료 - 해당 날짜에 8시간 미만 작성
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">-</span>
            <span className="text-gray-700">주말/공휴일 - 작성 불필요</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              100%
            </span>
            <span className="text-gray-700">완료율 - 근무일 대비 작성률</span>
          </div>
        </div>
      </div>
    </div>
  );
}
