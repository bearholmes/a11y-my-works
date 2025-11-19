/**
 * CSV 다운로드 유틸리티
 * 브라우저 환경에서 CSV 파일 생성 및 다운로드
 */

/**
 * CSV 셀 값 이스케이프 처리
 * - 쉼표, 따옴표, 개행 문자 처리
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // 쉼표, 따옴표, 개행 문자가 있으면 따옴표로 감싸기
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    // 따옴표는 두 개로 이스케이프
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * 데이터를 CSV 문자열로 변환
 */
function arrayToCSV(headers: string[], rows: any[][]): string {
  const csvRows = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map((row) => row.map(escapeCSVValue).join(',')),
  ];

  return csvRows.join('\n');
}

/**
 * CSV 파일 다운로드
 * @param data 다운로드할 데이터 배열
 * @param filename 파일명 (확장자 포함)
 * @param headers CSV 헤더
 * @param rowMapper 데이터를 CSV 행으로 변환하는 함수
 */
export function downloadCSV<T>(
  data: T[],
  filename: string,
  headers: string[],
  rowMapper: (item: T) => any[]
) {
  // UTF-8 BOM 추가 (엑셀 한글 깨짐 방지)
  const BOM = '\uFEFF';

  // 데이터 행 생성
  const rows = data.map(rowMapper);

  // CSV 문자열 생성
  const csvContent = arrayToCSV(headers, rows);

  // Blob 생성
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  // 다운로드 링크 생성 및 클릭
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // 정리
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 업무 보고 데이터를 CSV로 다운로드
 */
export function downloadTasksCSV(tasks: any[], filename: string) {
  const headers = [
    '날짜',
    '팀원',
    '업무명',
    '업무 상세',
    '작업시간(분)',
    '시작시간',
    '종료시간',
    '프로젝트',
    '서비스',
    '비용그룹',
    '플랫폼',
    '관련 URL',
    '등록일시',
  ];

  downloadCSV(tasks, filename, headers, (task) => [
    task.task_date || '',
    task.member_name || task.members?.name || '',
    task.task_name || '',
    task.task_detail || '',
    task.work_time || 0,
    task.start_time || '',
    task.end_time || '',
    task.project_name || task.projects?.name || '',
    task.service_name || task.services?.name || '',
    task.cost_group_name || task.cost_groups?.name || '',
    task.platform_name || task.platform_codes?.name || '',
    task.task_url || '',
    task.created_at || '',
  ]);
}

/**
 * 월별 팀원 집계 데이터를 CSV로 다운로드
 */
export function downloadMonthlySummaryCSV(
  summaryData: any[],
  year: number,
  month: number
) {
  const headers = [
    '팀원',
    '계정ID',
    '총 업무 건수',
    '총 작업시간(분)',
    '완료일수',
    '미완료일수',
    '총 근무일수',
    '완료율(%)',
  ];

  const filename = `월별집계_${year}년${month}월_${new Date().toISOString().split('T')[0]}.csv`;

  downloadCSV(summaryData, filename, headers, (item) => [
    item.memberName || '',
    item.accountId || '',
    item.stats?.totalTasks || 0,
    item.stats?.totalWorkTime || 0,
    item.stats?.completedDays || 0,
    item.stats?.incompleteDays || 0,
    item.stats?.totalWorkingDays || 0,
    item.stats?.completionRate || 0,
  ]);
}
