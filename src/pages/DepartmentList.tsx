import {
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
import { departmentAPI } from '../services/api';
import type { DepartmentTreeNode } from '../types/database';

/**
 * 트리 노드 컴포넌트 - 파일 탐색기 스타일
 */
function TreeNode({
  node,
  level = 0,
  onEdit,
  onAddChild,
}: {
  node: DepartmentTreeNode;
  level?: number;
  onEdit: (id: number) => void;
  onAddChild: (parentId: number, parentName: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      {/* 현재 노드 */}
      <div
        className="group relative flex items-center gap-1.5 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors select-none"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* 접기/펼치기 버튼 */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-5 h-5 flex items-center justify-center flex-shrink-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
          aria-label={isExpanded ? '접기' : '펼치기'}
          aria-expanded={isExpanded}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            )
          ) : (
            <span className="w-4 h-4" />
          )}
        </button>

        {/* 조직 아이콘 */}
        <div className="w-5 h-5 flex-shrink-0">
          <BuildingOfficeIcon
            className={`w-5 h-5 ${
              hasChildren
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          />
        </div>

        {/* 활성 상태 뱃지 */}
        <Badge
          color={node.is_active ? 'lime' : 'zinc'}
          className="text-xs py-0 px-1.5"
        >
          {node.is_active ? '활성' : '비활성'}
        </Badge>

        {/* 부서명 */}
        <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          {node.name}
        </span>

        {/* 액션 버튼 (부서명 바로 뒤) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.department_id, node.name);
            }}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors"
            aria-label={`${node.name}의 하위 부서 추가`}
            title="하위 부서 추가"
          >
            <PlusIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node.department_id);
            }}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors"
            aria-label={`${node.name} 수정`}
            title="부서 수정"
          >
            <PencilIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* 통계 정보 (오른쪽으로 밀림) */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {node.member_count || 0}명
          </span>
          {hasChildren && (
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              · {node.children.length}개
            </span>
          )}
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
              onAddChild={onAddChild}
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

  // 트리 형태로 부서 목록 조회
  const {
    data: tree,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: () => departmentAPI.getDepartmentTree({ includeInactive: true }),
  });

  const handleEdit = (departmentId: number) => {
    navigate(`/departments/edit/${departmentId}`);
  };

  const handleAddChild = (parentId: number, _parentName: string) => {
    navigate(`/departments/new?parent=${parentId}`);
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
            계층 구조로 부서를 관리합니다. 상단 버튼으로 최상위 부서를, 트리의
            추가 버튼으로 하위 부서를 추가할 수 있습니다.
          </Text>
        </div>
        <div className="flex gap-4">
          <Button href="/departments/new">+ 부서 추가</Button>
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
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {tree.map((node) => (
              <TreeNode
                key={node.department_id}
                node={node}
                level={0}
                onEdit={handleEdit}
                onAddChild={handleAddChild}
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
              <li>
                각 부서에서 '+' 버튼을 클릭하여 하위 부서를 추가할 수 있습니다
              </li>
              <li>
                부서 수정 페이지에서 상위 부서를 변경하여 부서를 이동할 수
                있습니다
              </li>
              <li>부서 삭제는 수정 페이지에서 가능합니다</li>
              <li>
                하위 부서가 있거나 소속 사용자가 있는 부서는 삭제할 수 없습니다
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
