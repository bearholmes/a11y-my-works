import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">사용자 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            시스템 사용자를 관리합니다.
          </p>
        </div>
        <button
          onClick={handleInvite}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          사용자 초대
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="member-search" className="sr-only">
              이름, 이메일, 계정 ID로 검색
            </label>
            <input
              id="member-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="이름, 이메일, 계정 ID로 검색"
              aria-label="이름, 이메일, 계정 ID로 검색"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          {isActiveFilter === false && (
            <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              승인 대기 중인 사용자만 표시됩니다
            </div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            검색
          </button>
        </form>
      </div>

      {/* 사용자 목록 테이블 */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            사용자가 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <caption className="sr-only">
                  사용자 목록 - 총 {data.pagination.total}건
                </caption>
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      이름
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      계정 ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      이메일
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      역할
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      상태
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      업무보고
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      가입일
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
                  {data?.data.map((member: any) => (
                    <tr key={member.member_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.account_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.roles?.name
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {member.roles?.name || '역할 없음'}
                          </span>
                          {isPendingUser(member) && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              승인 대기
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.requires_daily_report
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {member.requires_daily_report
                            ? '작성 필수'
                            : '작성 불필요'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(member.created_at), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {isPendingUser(member) ? (
                            <button
                              onClick={() => handleApprove(member)}
                              aria-label={`${member.name} 사용자 승인`}
                              className="text-green-600 hover:text-green-900 font-semibold"
                              disabled={approveMutation.isPending}
                            >
                              승인
                            </button>
                          ) : (
                            <>
                              <Link
                                to={`/members/edit/${member.member_id}`}
                                aria-label={`${member.name} 사용자 수정`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                수정
                              </Link>
                              <button
                                onClick={() => handleResetPassword(member)}
                                aria-label={`${member.name} 사용자 비밀번호 초기화`}
                                className="text-purple-600 hover:text-purple-900"
                                disabled={resetPasswordMutation.isPending}
                              >
                                비밀번호 초기화
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleActive(
                                    member.member_id,
                                    member.is_active
                                  )
                                }
                                aria-label={`${member.name} 사용자 ${member.is_active ? '비활성화' : '활성화'}`}
                                className={`${
                                  member.is_active
                                    ? 'text-red-600 hover:text-red-900'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                disabled={
                                  activateMutation.isPending ||
                                  deactivateMutation.isPending
                                }
                              >
                                {member.is_active ? '비활성화' : '활성화'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {/* 승인 모달 */}
      {showApprovalModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              사용자 승인
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">이름</div>
              <div className="text-gray-900 font-medium">
                {selectedMember.name}
              </div>
              <div className="text-sm text-gray-500 mt-2 mb-1">이메일</div>
              <div className="text-gray-900">{selectedMember.email}</div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                역할 선택 *
              </label>
              <select
                value={selectedRoleId || ''}
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">역할을 선택하세요</option>
                {rolesData?.data.map((role: any) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                승인 후 이 역할의 권한으로 시스템을 이용할 수 있습니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprovalSubmit}
                disabled={!selectedRoleId || approveMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approveMutation.isPending ? '처리 중...' : '승인'}
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedMember(null);
                  setSelectedRoleId(null);
                }}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 초대 모달 (Supabase Auth 사용) */}
      {showInvitationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              사용자 초대
            </h2>

            {!invitationSuccess ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={invitationEmail}
                    onChange={(e) => setInvitationEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    초대할 사용자의 이메일 주소를 입력하세요.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={invitationName}
                    onChange={(e) => setInvitationName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    사용자 이름 (선택사항)
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    역할 선택 *
                  </label>
                  <select
                    value={invitationRoleId || ''}
                    onChange={(e) =>
                      setInvitationRoleId(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">역할을 선택하세요</option>
                    {rolesData?.data.map((role: any) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    초대받은 사용자에게 할당될 역할입니다.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleInvitationSubmit}
                    disabled={
                      !invitationEmail ||
                      !invitationRoleId ||
                      inviteUserMutation.isPending
                    }
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteUserMutation.isPending
                      ? '초대 중...'
                      : '초대 보내기'}
                  </button>
                  <button
                    onClick={handleCloseInvitationModal}
                    disabled={inviteUserMutation.isPending}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium mb-2">
                    초대 이메일이 발송되었습니다!
                  </p>
                  <p className="text-sm text-green-700 mb-2">
                    {invitationEmail}님에게 초대 이메일이 발송되었습니다.
                  </p>
                  <p className="text-sm text-green-700">
                    사용자가 이메일의 링크를 클릭하면 가입 절차를 진행할 수
                    있습니다.
                  </p>
                </div>

                <button
                  onClick={handleCloseInvitationModal}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
