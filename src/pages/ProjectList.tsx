import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { projectAPI } from '../services/api';

export function ProjectList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 프로젝트 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'projects',
      { page, search, platform: platformFilter || undefined },
    ],
    queryFn: () =>
      projectAPI.getProjects({
        page,
        pageSize: 20,
        search,
        platform: platformFilter || undefined,
      }),
  });

  // 프로젝트 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: number) => projectAPI.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccess('프로젝트가 삭제되었습니다.');
    },
    onError: (error) => {
      showError(`삭제 실패: ${(error as Error).message}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (projectId: number, projectName: string) => {
    if (await confirmDelete('프로젝트를 삭제하시겠습니까?', projectName)) {
      deleteMutation.mutate(projectId);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">프로젝트 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Heading>프로젝트 관리</Heading>
        <Button href="/projects/new">+ 새 프로젝트</Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="project-search" className="sr-only">
              프로젝트명 또는 코드로 검색
            </label>
            <input
              id="project-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="프로젝트명, 코드로 검색"
              aria-label="프로젝트명 또는 코드로 검색"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 플랫폼</option>
            <option value="WEB">웹</option>
            <option value="APP">앱</option>
            <option value="BOTH">웹+앱</option>
          </select>
          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* 프로젝트 목록 테이블 */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            프로젝트가 없습니다.
          </div>
        ) : (
          <>
            <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
              <TableHead>
                <TableRow>
                  <TableHeader>프로젝트명</TableHeader>
                  <TableHeader>코드</TableHeader>
                  <TableHeader>플랫폼</TableHeader>
                  <TableHeader>버전</TableHeader>
                  <TableHeader>생성일</TableHeader>
                  <TableHeader className="text-right">작업</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((project: any) => (
                  <TableRow key={project.project_id}>
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-zinc-500 text-sm">
                          {project.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {project.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={
                          project.platform === 'WEB'
                            ? 'blue'
                            : project.platform === 'APP'
                              ? 'lime'
                              : 'purple'
                        }
                      >
                        {project.platform === 'WEB'
                          ? '웹'
                          : project.platform === 'APP'
                            ? '앱'
                            : '웹+앱'}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.version || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(project.created_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          plain
                          href={`/projects/edit/${project.project_id}`}
                          aria-label={`${project.name} 프로젝트 수정`}
                        >
                          수정
                        </Button>
                        <Button
                          plain
                          onClick={() =>
                            handleDelete(project.project_id, project.name)
                          }
                          aria-label={`${project.name} 프로젝트 삭제`}
                          disabled={deleteMutation.isPending}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {data && data.pagination.pageCount > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.pageCount, p + 1))
                    }
                    disabled={page === data.pagination.pageCount}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      전체{' '}
                      <span className="font-medium">
                        {data.pagination.total}
                      </span>
                      개 중{' '}
                      <span className="font-medium">{(page - 1) * 20 + 1}</span>{' '}
                      -{' '}
                      <span className="font-medium">
                        {Math.min(page * 20, data.pagination.total)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        이전
                      </button>
                      {Array.from(
                        { length: Math.min(5, data.pagination.pageCount) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.min(data.pagination.pageCount, p + 1)
                          )
                        }
                        disabled={page === data.pagination.pageCount}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
