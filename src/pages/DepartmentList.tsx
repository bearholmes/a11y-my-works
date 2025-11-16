import {
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
import { useNotification } from '../hooks/useNotification';
import { departmentAPI } from '../services/api';
import type { DepartmentTreeNode } from '../types/database';

type DropPosition = 'none' | 'before' | 'inside' | 'after';

/**
 * 부서를 드래그 가능하게 만드는 컴포넌트
 */
function DraggableTreeNode({
  node,
  level = 0,
  onEdit,
  onAddChild,
  allNodes,
}: {
  node: DepartmentTreeNode;
  level?: number;
  onEdit: (id: number) => void;
  onAddChild: (parentId: number, parentName: string) => void;
  allNodes: DepartmentTreeNode[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dropPosition, setDropPosition] = useState<DropPosition>('none');
  const nodeRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children && node.children.length > 0;

  // 드래그 이벤트 핸들러
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        id: node.department_id,
        name: node.name,
        parent: node.parent_department_id,
      })
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nodeRef.current) return;

    // 마우스 위치 계산
    const rect = nodeRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // 드롭 영역 결정
    // 상단 30%: before (위에 삽입)
    // 중간 40%: inside (하위로 이동)
    // 하단 30%: after (아래에 삽입)
    if (y < height * 0.3) {
      setDropPosition('before');
    } else if (y > height * 0.7) {
      setDropPosition('after');
    } else {
      setDropPosition('inside');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropPosition('none');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const position = dropPosition;
    setDropPosition('none');

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const draggedId = data.id;

      // 자기 자신에게 드롭하는 경우 무시
      if (draggedId === node.department_id) {
        return;
      }

      // 순환 참조 검사: 하위 부서로 드롭하려는 경우 방지
      const isDescendant = (
        parentId: number,
        targetId: number,
        nodes: DepartmentTreeNode[]
      ): boolean => {
        const parent = findNode(parentId, nodes);
        if (!parent) return false;

        if (parent.department_id === targetId) return true;

        for (const child of parent.children || []) {
          if (isDescendant(child.department_id, targetId, nodes)) {
            return true;
          }
        }

        return false;
      };

      // inside인 경우에만 순환 참조 체크
      if (
        position === 'inside' &&
        isDescendant(draggedId, node.department_id, allNodes)
      ) {
        alert('하위 부서로는 이동할 수 없습니다.');
        return;
      }

      // 부모 이벤트로 전파 (DepartmentList에서 처리)
      const customEvent = new CustomEvent('department-drop', {
        detail: {
          draggedId,
          targetId: node.department_id,
          draggedParent: data.parent,
          targetParent: node.parent_department_id,
          position, // 'before' | 'inside' | 'after'
        },
        bubbles: true,
      });
      e.currentTarget.dispatchEvent(customEvent);
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  return (
    <div>
      {/* 현재 노드 */}
      <div ref={nodeRef} className="relative">
        {/* 위에 삽입 인디케이터 */}
        {dropPosition === 'before' && (
          <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-blue-500 z-10" />
        )}

        <div
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors select-none cursor-move ${
            dropPosition === 'inside'
              ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
              : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* 접기/펼치기 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-4 h-4 flex items-center justify-center flex-shrink-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            aria-label={isExpanded ? '접기' : '펼치기'}
            aria-expanded={isExpanded}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-500" />
              )
            ) : (
              <span className="w-3.5 h-3.5" />
            )}
          </button>

          {/* 조직 아이콘 */}
          <BuildingOfficeIcon
            className={`w-4 h-4 flex-shrink-0 ${
              node.is_active
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          />

          {/* 부서명 */}
          <span
            className={`text-sm font-medium flex-1 min-w-0 truncate ${
              node.is_active
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-500'
            }`}
          >
            {node.name}
          </span>

          {/* 인원수 */}
          <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">
            {node.member_count || 0}
          </span>

          {/* 액션 버튼 (호버 시만) */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.department_id, node.name);
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
              title="하위 부서 추가"
            >
              <PlusIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node.department_id);
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
              title="수정"
            >
              <PencilIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {/* 아래에 삽입 인디케이터 */}
        {dropPosition === 'after' && (
          <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-blue-500 z-10" />
        )}
      </div>

      {/* 하위 노드 (재귀) */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <DraggableTreeNode
              key={child.department_id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              allNodes={allNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 트리에서 노드 찾기 (재귀)
 */
function findNode(
  id: number,
  nodes: DepartmentTreeNode[]
): DepartmentTreeNode | null {
  for (const node of nodes) {
    if (node.department_id === id) return node;
    if (node.children) {
      const found = findNode(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 트리를 평탄화하여 모든 노드 추출
 */
function flattenTree(nodes: DepartmentTreeNode[]): DepartmentTreeNode[] {
  const result: DepartmentTreeNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

/**
 * 같은 레벨의 형제 노드들을 찾기
 */
function getSiblings(
  parentId: number | null,
  nodes: DepartmentTreeNode[]
): DepartmentTreeNode[] {
  if (parentId === null) {
    // 최상위 노드들
    return nodes.filter((n) => n.parent_department_id === null);
  }

  const parent = findNode(parentId, nodes);
  return parent?.children || [];
}

/**
 * 부서 관리 페이지 - 드래그앤드롭 트리
 */
export function DepartmentList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // 트리 형태로 부서 목록 조회
  const {
    data: tree,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: () => departmentAPI.getDepartmentTree({ includeInactive: true }),
  });

  // 부서 이동 mutation
  const moveMutation = useMutation({
    mutationFn: ({
      departmentId,
      newParentId,
    }: {
      departmentId: number;
      newParentId: number | undefined;
    }) => departmentAPI.moveDepartment(departmentId, newParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showSuccess('부서가 이동되었습니다.');
    },
    onError: (error) => {
      showError(`이동 실패: ${(error as Error).message}`);
    },
  });

  // 부서 순서 변경 mutation
  const reorderMutation = useMutation({
    mutationFn: (updates: Array<{ departmentId: number; sortOrder: number }>) =>
      departmentAPI.reorderDepartments(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showSuccess('순서가 변경되었습니다.');
    },
    onError: (error) => {
      showError(`순서 변경 실패: ${(error as Error).message}`);
    },
  });

  // 이벤트 리스너 등록
  useEffect(() => {
    const handleDepartmentDrop = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { draggedId, targetId, position } = customEvent.detail;

      if (!tree) return;

      const allNodes = flattenTree(tree);
      const draggedNode = findNode(draggedId, allNodes);
      const targetNode = findNode(targetId, allNodes);

      if (!draggedNode || !targetNode) return;

      if (position === 'inside') {
        // 하위로 이동
        moveMutation.mutate({
          departmentId: draggedId,
          newParentId: targetId,
        });
      } else if (position === 'before' || position === 'after') {
        // 순서 변경
        const targetParentId = targetNode.parent_department_id;

        // 1. 먼저 같은 부모로 이동 (다른 부모인 경우)
        if (draggedNode.parent_department_id !== targetParentId) {
          moveMutation.mutate(
            {
              departmentId: draggedId,
              newParentId: targetParentId || undefined,
            },
            {
              onSuccess: () => {
                // 이동 후 순서 변경
                setTimeout(() => {
                  reorderSiblings(
                    draggedId,
                    targetId,
                    position,
                    targetParentId ?? null
                  );
                }, 500);
              },
            }
          );
        } else {
          // 같은 부모면 바로 순서 변경
          reorderSiblings(
            draggedId,
            targetId,
            position,
            targetParentId ?? null
          );
        }
      }
    };

    const reorderSiblings = (
      draggedId: number,
      targetId: number,
      position: 'before' | 'after',
      parentId: number | null
    ) => {
      if (!tree) return;

      const allNodes = flattenTree(tree);
      const siblings = getSiblings(parentId, tree);

      // 드래그된 노드 제외
      const withoutDragged = siblings.filter(
        (s) => s.department_id !== draggedId
      );

      // 타겟 위치 찾기
      const targetIndex = withoutDragged.findIndex(
        (s) => s.department_id === targetId
      );
      if (targetIndex === -1) return;

      // 삽입 위치 결정
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

      // 새로운 순서 배열 생성
      const newOrder = [
        ...withoutDragged.slice(0, insertIndex),
        findNode(draggedId, allNodes)!,
        ...withoutDragged.slice(insertIndex),
      ];

      // sort_order 업데이트
      const updates = newOrder.map((node, index) => ({
        departmentId: node.department_id,
        sortOrder: index,
      }));

      reorderMutation.mutate(updates);
    };

    const container = treeContainerRef.current;
    if (container) {
      container.addEventListener('department-drop', handleDepartmentDrop);
      return () => {
        container.removeEventListener('department-drop', handleDepartmentDrop);
      };
    }
  }, [tree, moveMutation, reorderMutation]);

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

  const allNodes = tree ? flattenTree(tree) : [];

  return (
    <>
      {/* 헤더 */}
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <div>
          <Heading>부서 관리</Heading>
          <Text className="mt-2 text-zinc-500 dark:text-zinc-400">
            계층 구조로 부서를 관리합니다. 부서를 드래그하여 이동하거나 순서를
            변경할 수 있습니다.
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
          <div
            ref={treeContainerRef}
            className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            {tree.map((node) => (
              <DraggableTreeNode
                key={node.department_id}
                node={node}
                level={0}
                onEdit={handleEdit}
                onAddChild={handleAddChild}
                allNodes={allNodes}
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
              <strong>드래그앤드롭 사용법</strong>
            </Text>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>
                <strong>상단</strong>에 드롭: 해당 부서 <strong>위</strong>에
                삽입 (순서 변경)
              </li>
              <li>
                <strong>중간</strong>에 드롭: 해당 부서의{' '}
                <strong>하위 부서</strong>로 이동
              </li>
              <li>
                <strong>하단</strong>에 드롭: 해당 부서 <strong>아래</strong>에
                삽입 (순서 변경)
              </li>
              <li>
                각 부서에서 '+' 버튼을 클릭하여 하위 부서를 추가할 수 있습니다
              </li>
              <li>부서 삭제는 수정 페이지에서 가능합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
