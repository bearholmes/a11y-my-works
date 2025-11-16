import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { departmentAPI } from '../services/api';
import type { DepartmentTreeNode } from '../types/database';

/**
 * 트리 노드 컴포넌트 - 재귀적으로 계층 구조를 렌더링
 */
function TreeNode({
  node,
  level = 0,
  onEdit,
  onDelete,
}: {
  node: DepartmentTreeNode;
  level?: number;
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      {/* 현재 노드 */}
      <div
        className={`group flex items-center gap-2 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-b border-zinc-950/5 dark:border-white/5 transition-colors ${
          level > 0 ? 'bg-zinc-50/30 dark:bg-zinc-900/30' : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        {/* 접기/펼치기 아이콘 */}
        <div className="w-5 h-5 flex-shrink-0">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              aria-label={isExpanded ? '하위 부서 접기' : '하위 부서 펼치기'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* 부서 정보 */}
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {node.name}
              </span>
              <Badge color={node.is_active ? 'lime' : 'zinc'} className="text-xs">
                {node.is_active ? '활성' : '비활성'}
              </Badge>
              {level === 0 && (
                <Badge color="blue" className="text-xs">
                  최상위
                </Badge>
              )}
            </div>
            {node.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {node.description}
              </p>
            )}
          </div>

          {/* 통계 정보 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 dark:text-zinc-400">소속:</span>
              <Badge color="purple">{node.member_count || 0}명</Badge>
            </div>
            {hasChildren && (
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 dark:text-zinc-400">하위:</span>
                <Badge color="sky">{node.children.length}개</Badge>
              </div>
            )}
            <div className="text-zinc-400 dark:text-zinc-500 text-xs">
              {format(new Date(node.created_at), 'yyyy-MM-dd')}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              plain
              onClick={() => onEdit(node.department_id)}
              className="text-sm"
              aria-label={`${node.name} 수정`}
            >
              수정
            </Button>
            <Button
              plain
              onClick={() => onDelete(node.department_id, node.name)}
              className="text-sm text-red-600 dark:text-red-400"
              aria-label={`${node.name} 삭제`}
            >
              삭제
            </Button>
          </div>
        </div>
      </div>

      {/* 하위 노드 (재귀) */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.department_id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 부서 관리 페이지 - 트리 형태
 */
export function DepartmentList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirmDelete } = useConfirm();
  const { showSuccess, showError } = useNotification();

  // 트리 형태로 부서 목록 조회
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: () => departmentAPI.getDepartmentTree({ includeInactive: true }),
  });

  // 부서 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (departmentId: number) =>
      departmentAPI.deleteDepartment(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showSuccess('부서가 삭제되었습니다.');
    },
    onError: (error) => {
      showError(`삭제 실패: ${(error as Error).message}`);
    },
  });

  const handleEdit = (departmentId: number) => {
    navigate(`/departments/edit/${departmentId}`);
  };

  const handleDelete = async (departmentId: number, departmentName: string) => {
    const confirmed = await confirmDelete('부서를 삭제하시겠습니까?', departmentName);
    if (confirmed) {
      deleteMutation.mutate(departmentId);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <Text className="text-red-600 dark:text-red-400">
          부서 목록을 불러오는데 실패했습니다.
        </Text>
        <Text className="text-sm text-red-500 dark:text-red-400 mt-1">
          {(error as Error).message}
        </Text>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <div>
          <Heading>부서 관리</Heading>
          <Text className="mt-2 text-zinc-500 dark:text-zinc-400">
            계층 구조로 부서를 관리합니다. 클릭하여 접기/펼치기가 가능합니다.
          </Text>
        </div>
        <div className="flex gap-4">
          <Button href="/departments/new">+ 새 부서</Button>
        </div>
      </div>

      {/* 부서 트리 */}
      <div className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner />
          </div>
        ) : !tree || tree.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-lg border border-zinc-950/10 dark:border-white/10">
            <Text className="text-zinc-500 dark:text-zinc-400">
              부서가 없습니다.
            </Text>
            <Button href="/departments/new" className="mt-4">
              첫 부서 만들기
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-950/10 dark:border-white/10 overflow-hidden">
            {tree.map((node) => (
              <TreeNode
                key={node.department_id}
                node={node}
                level={0}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <Text className="text-sm text-blue-800 dark:text-blue-200">
              <strong>부서 관리 안내</strong>
            </Text>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>하위 부서가 있는 부서는 접기/펼치기 아이콘이 표시됩니다</li>
              <li>부서를 삭제하려면 먼저 하위 부서와 소속 사용자를 제거해야 합니다</li>
              <li>상위 부서는 생성 후 변경할 수 없습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
