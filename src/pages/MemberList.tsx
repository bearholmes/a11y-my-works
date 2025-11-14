import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '../components/ui/dialog';
import { Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Text } from '../components/ui/text';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { invitationAPI, memberAPI, roleAPI } from '../services/api';

export function MemberList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const { confirm } = useConfirm();
  const { showSuccess, showError, showWarning } = useNotification();

  // 초대 관련 상태
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [invitationName, setInvitationName] = useState('');
  const [invitationRoleId, setInvitationRoleId] = useState<number | null>(null);
  const [invitationSuccess, setInvitationSuccess] = useState(false);

  // 사용자 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['members', { page, search, isActive: isActiveFilter }],
    queryFn: () =>
      memberAPI.getMembers({
        page,
        pageSize: 20,
        search,
        isActive: isActiveFilter,
      }),
  });

  // 역할 목록 조회
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleAPI.getRoles({ isActive: true }),
  });

  // 사용자 활성화/비활성화 mutation
  const activateMutation = useMutation({
    mutationFn: (memberId: number) => memberAPI.activateMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (memberId: number) => memberAPI.deactivateMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  // 사용자 승인 mutation
  const approveMutation = useMutation({
    mutationFn: ({ memberId, roleId }: { memberId: number; roleId: number }) =>
      memberAPI.approveMember(memberId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setShowApprovalModal(false);
      setSelectedMember(null);
      setSelectedRoleId(null);
    },
  });

  // 초대 생성 mutation (Supabase Auth 사용)
  const inviteUserMutation = useMutation({
    mutationFn: (params: { email: string; role_id: number; name?: string }) =>
      invitationAPI.inviteUser(params),
    onSuccess: () => {
      setInvitationSuccess(true);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  // 비밀번호 초기화 mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => memberAPI.resetUserPassword(email),
    onSuccess: () => {
      showSuccess('비밀번호 재설정 이메일을 발송했습니다.');
    },
    onError: (error: Error) => {
      showError(`비밀번호 초기화 실패: ${error.message}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleActive = async (
    memberId: number,
    currentStatus: boolean
  ) => {
    if (
      await confirm({
        message: `이 사용자를 ${currentStatus ? '비활성화' : '활성화'}하시겠습니까?`,
      })
    ) {
      if (currentStatus) {
        deactivateMutation.mutate(memberId);
      } else {
        activateMutation.mutate(memberId);
      }
    }
  };

  const handleApprove = (member: any) => {
    setSelectedMember(member);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedMember || !selectedRoleId) {
      showWarning('역할을 선택해주세요.');
      return;
    }

    if (
      await confirm({ message: `${selectedMember.name}님을 승인하시겠습니까?` })
    ) {
      approveMutation.mutate({
        memberId: selectedMember.member_id,
        roleId: selectedRoleId,
      });
    }
  };

  const isPendingUser = (member: any) => {
    return !member.role_id || !member.is_active;
  };

  const handleInvite = () => {
    setShowInvitationModal(true);
    setInvitationSuccess(false);
  };

  const handleInvitationSubmit = () => {
    if (!invitationEmail || !invitationRoleId) {
      showWarning('이메일과 역할을 모두 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(invitationEmail)) {
      showWarning('올바른 이메일 형식이 아닙니다.');
      return;
    }

    inviteUserMutation.mutate({
      email: invitationEmail,
      role_id: invitationRoleId,
      name: invitationName,
    });
  };

  const handleCloseInvitationModal = () => {
    setShowInvitationModal(false);
    setInvitationEmail('');
    setInvitationName('');
    setInvitationRoleId(null);
    setInvitationSuccess(false);
  };

  const handleResetPassword = async (member: any) => {
    if (
      await confirm({
        message: `${member.name}님의 비밀번호를 초기화하시겠습니까?\n비밀번호 재설정 이메일이 발송됩니다.`,
      })
    ) {
      resetPasswordMutation.mutate(member.email);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <Text className="text-red-600 dark:text-red-400">
          사용자 목록을 불러오는데 실패했습니다.
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
      <div className="flex items-center justify-between">
        <Heading>사용자 관리</Heading>
        <Button onClick={handleInvite}>사용자 초대</Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Field className="flex-1">
            <Label htmlFor="member-search" className="sr-only">
              이름, 이메일, 계정 ID로 검색
            </Label>
            <Input
              id="member-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="이름, 이메일, 계정 ID로 검색"
              aria-label="이름, 이메일, 계정 ID로 검색"
            />
          </Field>
          <Field>
            <Label htmlFor="status-filter" className="sr-only">
              상태 필터
            </Label>
            <Select
              id="status-filter"
              value={
                isActiveFilter === undefined
                  ? 'all'
                  : isActiveFilter
                    ? 'active'
                    : 'inactive'
              }
              onChange={(e) => {
                const value = e.target.value;
                setIsActiveFilter(
                  value === 'all' ? undefined : value === 'active'
                );
                setPage(1);
              }}
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </Select>
          </Field>
          {isActiveFilter === false && (
            <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
              승인 대기 중인 사용자만 표시됩니다
            </div>
          )}
          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* 사용자 목록 테이블 */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <Text className="mt-2 text-zinc-600 dark:text-zinc-400">
              로딩 중...
            </Text>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center">
            <Text className="text-zinc-500 dark:text-zinc-400">
              사용자가 없습니다.
            </Text>
          </div>
        ) : (
          <>
            <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
              <TableHead>
                <TableRow>
                  <TableHeader>이름</TableHeader>
                  <TableHeader>계정 ID</TableHeader>
                  <TableHeader>이메일</TableHeader>
                  <TableHeader>역할</TableHeader>
                  <TableHeader>상태</TableHeader>
                  <TableHeader>업무보고</TableHeader>
                  <TableHeader>가입일</TableHeader>
                  <TableHeader className="text-right">작업</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((member: any) => (
                  <TableRow key={member.member_id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.account_id}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge color={member.roles?.name ? 'blue' : 'zinc'}>
                          {member.roles?.name || '역할 없음'}
                        </Badge>
                        {isPendingUser(member) && (
                          <Badge color="yellow">승인 대기</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge color={member.is_active ? 'lime' : 'zinc'}>
                        {member.is_active ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={member.requires_daily_report ? 'purple' : 'zinc'}
                      >
                        {member.requires_daily_report
                          ? '작성 필수'
                          : '작성 불필요'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.created_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPendingUser(member) ? (
                          <Button
                            plain
                            onClick={() => handleApprove(member)}
                            aria-label={`${member.name} 사용자 승인`}
                            disabled={approveMutation.isPending}
                          >
                            승인
                          </Button>
                        ) : (
                          <>
                            <Button
                              plain
                              href={`/members/edit/${member.member_id}`}
                              aria-label={`${member.name} 사용자 수정`}
                            >
                              수정
                            </Button>
                            <Button
                              plain
                              onClick={() => handleResetPassword(member)}
                              aria-label={`${member.name} 사용자 비밀번호 초기화`}
                              disabled={resetPasswordMutation.isPending}
                            >
                              비밀번호 초기화
                            </Button>
                            <Button
                              plain
                              onClick={() =>
                                handleToggleActive(
                                  member.member_id,
                                  member.is_active
                                )
                              }
                              aria-label={`${member.name} 사용자 ${member.is_active ? '비활성화' : '활성화'}`}
                              disabled={
                                activateMutation.isPending ||
                                deactivateMutation.isPending
                              }
                            >
                              {member.is_active ? '비활성화' : '활성화'}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {data && data.pagination.pageCount > 1 && (
              <div className="bg-white dark:bg-zinc-900 px-4 py-3 flex items-center justify-between border-t sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.pageCount, p + 1))
                    }
                    disabled={page === data.pagination.pageCount}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <Text className="text-sm text-zinc-700 dark:text-zinc-300">
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
                    </Text>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md -space-x-px">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
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
                                  ? 'z-10 bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
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
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
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

      {/* 승인 모달 */}
      <Dialog
        open={showApprovalModal && !!selectedMember}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedMember(null);
          setSelectedRoleId(null);
        }}
      >
        <DialogTitle>사용자 승인</DialogTitle>
        <DialogDescription>
          사용자에게 역할을 할당하여 시스템 접근 권한을 부여합니다.
        </DialogDescription>
        {selectedMember && (
          <DialogBody>
            <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                이름
              </Text>
              <Text className="text-zinc-900 dark:text-zinc-100 font-medium">
                {selectedMember.name}
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-1">
                이메일
              </Text>
              <Text className="text-zinc-900 dark:text-zinc-100">
                {selectedMember.email}
              </Text>
            </div>

            <Field>
              <Label>역할 선택 *</Label>
              <Select
                value={selectedRoleId || ''}
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              >
                <option value="">역할을 선택하세요</option>
                {rolesData?.data.map((role: any) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </Field>
          </DialogBody>
        )}
        <DialogActions>
          <Button
            plain
            onClick={() => {
              setShowApprovalModal(false);
              setSelectedMember(null);
              setSelectedRoleId(null);
            }}
            disabled={approveMutation.isPending}
          >
            취소
          </Button>
          <Button
            onClick={handleApprovalSubmit}
            disabled={!selectedRoleId || approveMutation.isPending}
            color="green"
          >
            {approveMutation.isPending ? '처리 중...' : '승인'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 초대 모달 (Supabase Auth 사용) */}
      <Dialog open={showInvitationModal} onClose={handleCloseInvitationModal}>
        <DialogTitle>사용자 초대</DialogTitle>
        {!invitationSuccess ? (
          <>
            <DialogDescription>
              새로운 사용자를 초대하고 역할을 할당하세요. 초대 이메일이
              발송됩니다.
            </DialogDescription>
            <DialogBody>
              <Field>
                <Label>이메일 *</Label>
                <Input
                  type="email"
                  value={invitationEmail}
                  onChange={(e) => setInvitationEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </Field>

              <Field className="mt-4">
                <Label>이름</Label>
                <Input
                  type="text"
                  value={invitationName}
                  onChange={(e) => setInvitationName(e.target.value)}
                  placeholder="홍길동"
                />
              </Field>

              <Field className="mt-4">
                <Label>역할 선택 *</Label>
                <Select
                  value={invitationRoleId || ''}
                  onChange={(e) => setInvitationRoleId(Number(e.target.value))}
                >
                  <option value="">역할을 선택하세요</option>
                  {rolesData?.data.map((role: any) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </DialogBody>
            <DialogActions>
              <Button
                plain
                onClick={handleCloseInvitationModal}
                disabled={inviteUserMutation.isPending}
              >
                취소
              </Button>
              <Button
                onClick={handleInvitationSubmit}
                disabled={
                  !invitationEmail ||
                  !invitationRoleId ||
                  inviteUserMutation.isPending
                }
              >
                {inviteUserMutation.isPending ? '초대 중...' : '초대 보내기'}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogDescription>
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <Text className="text-green-800 dark:text-green-200 font-medium mb-2">
                  초대 이메일이 발송되었습니다!
                </Text>
                <Text className="text-sm text-green-700 dark:text-green-300 mb-2">
                  {invitationEmail}님에게 초대 이메일이 발송되었습니다.
                </Text>
                <Text className="text-sm text-green-700 dark:text-green-300">
                  사용자가 이메일의 링크를 클릭하면 가입 절차를 진행할 수
                  있습니다.
                </Text>
              </div>
            </DialogDescription>
            <DialogActions>
              <Button onClick={handleCloseInvitationModal}>닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
