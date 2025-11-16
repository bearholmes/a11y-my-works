import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Stat } from '../components/Stat';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox, CheckboxField } from '../components/ui/checkbox';
import { Label } from '../components/ui/fieldset';
import { Heading, Subheading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Spinner } from '../components/ui/spinner.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Text } from '../components/ui/text';
import { dashboardAPI, departmentAPI } from '../services/api';

/**
 * 업무 작성 현황 페이지
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
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null); // 부서 필터

  // 관리자 대시보드 통계 조회
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats', year, month],
    queryFn: () => dashboardAPI.getAdminDashboardStats(year, month),
  });

  // 부서 목록 조회 (필터용)
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', { includeInactive: false }],
    queryFn: () =>
      departmentAPI.getDepartments({
        page: 1,
        pageSize: 100,
        includeInactive: false,
      }),
  });

  // 필터링된 사용자 목록
  const filteredMembers =
    stats?.memberCompletion.filter((member) => {
      // 1. 부서 필터
      if (departmentFilter !== null) {
        // 부서 정보는 stats에 포함되지 않으므로, 별도로 필터링할 수 없음
        // 향후 API 개선 시 부서 정보 포함 필요
        // 현재는 이 기능을 주석 처리
      }

      // 2. 완료율 필터 (미완료만 보기)
      if (showIncompleteOnly && member.stats.completionRate === 100) {
        return false;
      }

      // 3. 사용자 이름 검색 필터
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = member.memberName.toLowerCase().includes(query);
        const accountIdMatch = member.accountId.toLowerCase().includes(query);
        if (!nameMatch && !accountIdMatch) {
          return false;
        }
      }

      // 4. 특정 날짜 미작성자 필터
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
    <>
      {/* 헤더 */}
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <div>
          <Heading>업무 작성 현황</Heading>
          <Text className="mt-1">
            팀원들의 월별 업무 일지 작성 현황을 확인하세요 (기준: 8시간)
          </Text>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col gap-3">
          {/* 월 선택기 */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handlePrevMonth}
              outline
              aria-label="이전 달"
            >
              ←
            </Button>
            <div className="flex gap-2">
              <Select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="text-sm"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => now.getFullYear() - 2 + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </Select>
              <Select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleNextMonth}
              outline
              aria-label="다음 달"
            >
              →
            </Button>
          </div>

          {/* 필터 컨트롤 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 사용자 검색 */}
            <div className="relative">
              <Input
                type="text"
                placeholder="사용자 이름 또는 ID 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            </div>

            {/* 부서 필터 */}
            <Select
              value={departmentFilter ?? ''}
              onChange={(e) =>
                setDepartmentFilter(e.target.value ? Number(e.target.value) : null)
              }
              className="text-sm"
            >
              <option value="">전체 부서</option>
              {departmentsData?.data.map((dept: any) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {'  '.repeat(dept.depth)}{dept.name}
                </option>
              ))}
            </Select>

            {/* 날짜 필터 */}
            <Select
              value={selectedDate ?? ''}
              onChange={(e) =>
                setSelectedDate(e.target.value ? Number(e.target.value) : null)
              }
              className="text-sm"
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
            </Select>

            {/* 미완료만 보기 토글 */}
            <CheckboxField>
              <Checkbox
                checked={showIncompleteOnly}
                onChange={(checked) => setShowIncompleteOnly(checked)}
              />
              <Label>미완료만 보기</Label>
            </CheckboxField>

            {/* 필터 초기화 */}
            {(searchQuery || selectedDate !== null || departmentFilter !== null || !showIncompleteOnly) && (
              <Button
                type="button"
                plain
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDate(null);
                  setDepartmentFilter(null);
                  setShowIncompleteOnly(true);
                }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 gap-6">
          <Stat
            title="활성 사용자"
            value={`${stats.totalActiveMembers}명`}
            description="현재 활성화된 팀원 수"
          />
          <Stat
            title="전체 완료율"
            value={`${stats.overallCompletionRate}%`}
            description={`${stats.totalCompletedDays} / ${stats.totalWorkingDays} 일`}
            className="[&_.text-gray-900]:!text-zinc-700"
          />
          <Stat
            title="완전 작성 사용자"
            value={`${stats.fullyCompletedMembers}명`}
            description="100% 작성 완료한 팀원"
            className="[&_.text-gray-900]:!text-lime-600"
          />
          <Stat
            title="미완료 사용자"
            value={`${stats.totalActiveMembers - stats.fullyCompletedMembers}명`}
            description="미완료 일지가 있는 팀원"
            className="[&_.text-gray-900]:!text-red-600"
          />
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-12">
          <Spinner size="lg" label="데이터를 불러오는 중..." />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            데이터를 불러오는 중...
          </p>
        </div>
      )}

      {/* 월별 캘린더 테이블 */}
      {stats && !isLoading && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <Subheading>월별 업무 일지 작성 현황</Subheading>
                <Text className="mt-1">
                  완료 = 8시간 이상, 미완료 = 8시간 미만, - = 주말/공휴일
                </Text>
              </div>
              <div>
                <Text className="text-zinc-700 font-medium">
                  {filteredMembers.length}명
                </Text>
                {selectedDate && (
                  <Text className="ml-2">
                    ({month}월 {selectedDate}일 미작성)
                  </Text>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-full" bleed dense>
              <TableHead>
                <TableRow>
                  <TableHeader className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-800 border-r">
                    사용자
                  </TableHeader>
                  <TableHeader className="text-center border-r">
                    완료율
                  </TableHeader>
                  {days.map((day) => {
                    const isWeekendDay = isWeekend(day);
                    return (
                      <TableHeader
                        key={day}
                        className={`text-center ${
                          isWeekendDay
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                            : ''
                        }`}
                      >
                        {day}
                      </TableHeader>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.memberId}>
                    <TableCell className="sticky left-0 z-10 bg-white dark:bg-zinc-900 border-r font-medium">
                      <div className="flex items-center gap-2">
                        <span>{member.memberName}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          ({member.accountId})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center border-r">
                      <Badge
                        color={
                          member.stats.completionRate === 100
                            ? 'lime'
                            : member.stats.completionRate >= 80
                              ? 'zinc'
                              : member.stats.completionRate >= 50
                                ? 'yellow'
                                : 'red'
                        }
                      >
                        {member.stats.completionRate}%
                      </Badge>
                    </TableCell>
                    {days.map((day) => {
                      const date = formatDate(day);
                      const completion = member.dailyCompletion[date];

                      return (
                        <TableCell
                          key={day}
                          className={`text-center ${
                            completion === null
                              ? 'bg-zinc-50 dark:bg-zinc-800'
                              : completion
                                ? 'bg-green-50 dark:bg-green-950'
                                : 'bg-red-50 dark:bg-red-950'
                          }`}
                        >
                          {completion === null ? (
                            <span className="text-zinc-400">-</span>
                          ) : completion ? (
                            <CheckCircleIcon
                              className="h-5 w-5 text-green-600 mx-auto"
                              title="완료 (8시간 이상)"
                            />
                          ) : (
                            <XCircleIcon
                              className="h-5 w-5 text-red-600 mx-auto"
                              title="미완료"
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 통계 요약 */}
          {filteredMembers.length === 0 && (
            <div className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
              {selectedDate ? (
                <div>
                  <p className="text-lg">
                    {month}월 {selectedDate}일에 미작성한 사용자가 없습니다!
                  </p>
                  <p className="mt-2 text-sm">
                    모든 사용자가 해당 날짜의 업무 일지를 작성했습니다.
                  </p>
                </div>
              ) : searchQuery ? (
                <p>검색 결과가 없습니다.</p>
              ) : showIncompleteOnly ? (
                <p>모든 사용자가 업무 일지를 완료했습니다!</p>
              ) : (
                <p>활성화된 사용자가 없습니다.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 범례 */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6">
        <Subheading className="mb-3">범례</Subheading>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <Text>완료 - 해당 날짜에 8시간(480분) 이상 업무 작성</Text>
          </div>
          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <Text>미완료 - 해당 날짜에 8시간 미만 작성</Text>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">-</span>
            <Text>주말/공휴일 - 작성 불필요</Text>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="lime">100%</Badge>
            <Text>완료율 - 근무일 대비 작성률</Text>
          </div>
        </div>
      </div>
    </>
  );
}
