import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Field, Label } from '../components/ui/fieldset';
import { Heading, Subheading } from '../components/ui/heading';
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
import { dashboardAPI, memberAPI, taskAPI } from '../services/api';
import type { Member } from '../types/database';
import {
  downloadMonthlySummaryCSV,
  downloadTasksCSV,
} from '../utils/csvExport';

/**
 * 월별 팀 업무 보고 페이지 (매니저용)
 *
 * 권한: 매니저 또는 관리자만 접근 가능
 * 기능:
 * - 월별 팀원 업무 집계 조회
 * - 팀원별 완료율 확인
 * - CSV 다운로드 (집계 데이터 + 전체 상세 데이터)
 */
export function TeamMonthlyReport() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 팀원 목록 조회
  const { data: membersData } = useQuery({
    queryKey: ['members', 'active'],
    queryFn: async () => {
      return await memberAPI.getMembers();
    },
  });

  const members = membersData?.data.filter((m: Member) => m.is_active) || [];

  // 월별 팀원 업무 집계 조회
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ['monthly-report', selectedYear, selectedMonth],
    queryFn: async () => {
      return await dashboardAPI.getMonthlyMemberTaskCompletion(
        selectedYear,
        selectedMonth
      );
    },
  });

  // 선택된 팀원 필터링
  const filteredData = selectedMemberId
    ? monthlyData?.filter((item: any) => item.memberId === selectedMemberId)
    : monthlyData;

  // 전체 통계 계산
  const totalStats = filteredData?.reduce(
    (acc: any, item: any) => {
      acc.totalTasks += item.stats.completedDays || 0;
      acc.totalWorkingDays += item.stats.totalWorkingDays || 0;
      acc.completedDays += item.stats.completedDays || 0;
      return acc;
    },
    { totalTasks: 0, totalWorkingDays: 0, completedDays: 0 }
  );

  const overallCompletionRate =
    totalStats && totalStats.totalWorkingDays > 0
      ? Math.round(
          (totalStats.completedDays / totalStats.totalWorkingDays) * 100
        )
      : 0;

  // 년도 옵션 생성 (현재 년도 기준 ±2년)
  const yearOptions = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - 2 + i
  );

  // 월 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  /**
   * 집계 데이터 CSV 다운로드
   */
  const handleDownloadSummary = () => {
    if (!filteredData || filteredData.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    downloadMonthlySummaryCSV(filteredData, selectedYear, selectedMonth);
  };

  /**
   * 전체 상세 데이터 CSV 다운로드
   */
  const handleDownloadDetails = async () => {
    setIsDownloading(true);
    try {
      // 선택된 월의 전체 업무 데이터 조회 (페이지네이션 없음)
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const result = await taskAPI.getTasks({
        startDate,
        endDate,
        memberId: selectedMemberId ? String(selectedMemberId) : undefined,
        // page, pageSize 없음 = 전체 조회
      });

      if (!result.data || result.data.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }

      const filename = `팀업무상세_${selectedYear}년${selectedMonth}월_${new Date().toISOString().split('T')[0]}.csv`;
      downloadTasksCSV(result.data, filename);
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <div>
          <Heading>월별 팀 업무 집계</Heading>
          <Text className="mt-1">
            {selectedYear}년 {selectedMonth}월 팀원별 업무 현황
          </Text>
        </div>
        <div className="flex gap-2">
          <Button
            outline
            onClick={handleDownloadSummary}
            disabled={!filteredData || filteredData.length === 0}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            집계 다운로드
          </Button>
          <Button onClick={handleDownloadDetails} disabled={isDownloading}>
            <ArrowDownTrayIcon className="h-4 w-4" />
            {isDownloading ? '다운로드 중...' : '상세 다운로드'}
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-6">
            <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
              총 근무일수
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
              {totalStats?.totalWorkingDays || 0}일
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-6">
            <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
              완료일수
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
              {totalStats?.completedDays || 0}일
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg dark:bg-zinc-900">
          <div className="p-6">
            <dt className="text-sm font-medium text-zinc-500 truncate dark:text-zinc-400">
              전체 완료율
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
              {overallCompletionRate}%
            </dd>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="mt-8">
        <Subheading className="mb-4">필터</Subheading>
        <div className="grid grid-cols-3 gap-6">
          <Field>
            <Label>년도</Label>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>월</Label>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </Select>
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

      {/* 집계 테이블 */}
      <div className="mt-8">
        <Subheading className="mb-4">팀원별 집계</Subheading>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !filteredData || filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg">
            <Text className="text-zinc-500">조회된 데이터가 없습니다</Text>
          </div>
        ) : (
          <Table className="[--gutter:--spacing(6)]">
            <TableHead>
              <TableRow>
                <TableHeader>팀원</TableHeader>
                <TableHeader>계정 ID</TableHeader>
                <TableHeader className="text-right">완료일수</TableHeader>
                <TableHeader className="text-right">미완료일수</TableHeader>
                <TableHeader className="text-right">총 근무일수</TableHeader>
                <TableHeader className="text-right">완료율</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item: any) => (
                <TableRow key={item.memberId}>
                  <TableCell className="font-medium">
                    {item.memberName}
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    @{item.accountId}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.stats.completedDays}일
                  </TableCell>
                  <TableCell className="text-right">
                    {item.stats.incompleteDays}일
                  </TableCell>
                  <TableCell className="text-right">
                    {item.stats.totalWorkingDays}일
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.stats.completionRate === 100
                          ? 'text-green-600 dark:text-green-400 font-semibold'
                          : item.stats.completionRate >= 80
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-zinc-600 dark:text-zinc-400'
                      }
                    >
                      {item.stats.completionRate}%
                    </span>
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
