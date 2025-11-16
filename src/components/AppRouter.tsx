import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApplicationLayout } from '../layouts/ApplicationLayout';
import { memberAPI } from '../services/api';
import { LoginForm } from './LoginForm';
import { PermissionGuard } from './PermissionGuard';
import { Spinner } from './ui/spinner';

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <Spinner size="lg" label="페이지 로딩 중" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">로딩 중...</p>
      </div>
    </div>
  );
}

// 레이지 로딩 페이지 컴포넌트
const Dashboard = lazy(() =>
  import('../pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const TaskList = lazy(() =>
  import('../pages/TaskList').then((m) => ({ default: m.TaskList }))
);
const TaskForm = lazy(() =>
  import('../pages/TaskForm').then((m) => ({ default: m.TaskForm }))
);
const Profile = lazy(() =>
  import('../pages/Profile').then((m) => ({ default: m.Profile }))
);
const ChangePassword = lazy(() =>
  import('../pages/ChangePassword').then((m) => ({ default: m.ChangePassword }))
);
const ForgotPassword = lazy(() =>
  import('../pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword }))
);
const ResetPassword = lazy(() =>
  import('../pages/ResetPassword').then((m) => ({ default: m.ResetPassword }))
);
const Forbidden = lazy(() =>
  import('../pages/Forbidden').then((m) => ({ default: m.Forbidden }))
);
const NotFound = lazy(() =>
  import('../pages/NotFound').then((m) => ({ default: m.NotFound }))
);
const ServerError = lazy(() =>
  import('../pages/ServerError').then((m) => ({ default: m.ServerError }))
);
const Licenses = lazy(() =>
  import('../pages/Licenses').then((m) => ({ default: m.Licenses }))
);
const Logout = lazy(() =>
  import('../pages/Logout').then((m) => ({ default: m.Logout }))
);

// 프로젝트 관리
const ProjectList = lazy(() =>
  import('../pages/ProjectList').then((m) => ({ default: m.ProjectList }))
);
const ProjectForm = lazy(() =>
  import('../pages/ProjectForm').then((m) => ({ default: m.ProjectForm }))
);

// 서비스 관리
const ServiceList = lazy(() =>
  import('../pages/ServiceList').then((m) => ({ default: m.ServiceList }))
);
const ServiceForm = lazy(() =>
  import('../pages/ServiceForm').then((m) => ({ default: m.ServiceForm }))
);

// 청구 그룹 관리
const CostGroupList = lazy(() =>
  import('../pages/CostGroupList').then((m) => ({ default: m.CostGroupList }))
);
const CostGroupForm = lazy(() =>
  import('../pages/CostGroupForm').then((m) => ({ default: m.CostGroupForm }))
);

// 공휴일 관리
const HolidayList = lazy(() =>
  import('../pages/HolidayList').then((m) => ({ default: m.HolidayList }))
);
const HolidayForm = lazy(() =>
  import('../pages/HolidayForm').then((m) => ({ default: m.HolidayForm }))
);

// 사용자 관리
const MemberList = lazy(() =>
  import('../pages/MemberList').then((m) => ({ default: m.MemberList }))
);
const MemberForm = lazy(() =>
  import('../pages/MemberForm').then((m) => ({ default: m.MemberForm }))
);

// 역할 관리
const RoleList = lazy(() =>
  import('../pages/RoleList').then((m) => ({ default: m.RoleList }))
);
const RoleForm = lazy(() =>
  import('../pages/RoleForm').then((m) => ({ default: m.RoleForm }))
);

// 팀 관리
const TeamTaskList = lazy(() =>
  import('../pages/TeamTaskList').then((m) => ({ default: m.TeamTaskList }))
);
const ResourceStats = lazy(() =>
  import('../pages/ResourceStats').then((m) => ({ default: m.ResourceStats }))
);
const PendingApprovalScreen = lazy(() =>
  import('../pages/PendingApprovalScreen').then((m) => ({
    default: m.PendingApprovalScreen,
  }))
);

// 팀 관리 - 업무 작성 현황 (구 관리자 대시보드)
const TeamReportStatus = lazy(() =>
  import('../pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // 회원 정보 조회 (승인 상태 확인용)
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['currentMember', user?.id],
    queryFn: () => memberAPI.getCurrentMember(),
    enabled: !!user,
    retry: 1,
  });

  if (loading || memberLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <Spinner size="lg" label="인증 확인 중" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 회원 정보가 없거나 비활성 상태이거나 역할이 없거나 Pending User(role_id=4)면 승인 대기 화면
  if (!member || !member.is_active || !member.role_id || member.role_id === 4) {
    return (
      <Suspense fallback={<PageLoader />}>
        <PendingApprovalScreen />
      </Suspense>
    );
  }

  return (
    <ApplicationLayout>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ApplicationLayout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 인증 관련 페이지 (로그인 불필요) */}
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<PageLoader />}>
              <ResetPassword />
            </Suspense>
          }
        />
        <Route
          path="/licenses"
          element={
            <Suspense fallback={<PageLoader />}>
              <Licenses />
            </Suspense>
          }
        />
        <Route
          path="/logout"
          element={
            <Suspense fallback={<PageLoader />}>
              <Logout />
            </Suspense>
          }
        />

        {/* 보호된 페이지 (로그인 필요) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="task.write" requireWrite>
                <TaskForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="task.write" requireWrite>
                <TaskForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* 팀 관리 - 업무 작성 현황 */}
        <Route
          path="/team/report-status"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="member.read">
                <TeamReportStatus />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 팀 관리 */}
        <Route
          path="/team/tasks"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="task.read">
                <TeamTaskList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/stats"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="task.read">
                <ResourceStats />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 프로젝트 관리 */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.read">
                <ProjectList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <ProjectForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <ProjectForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 서비스 관리 */}
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.read">
                <ServiceList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <ServiceForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <ServiceForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 청구 그룹 관리 */}
        <Route
          path="/cost-groups"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.read">
                <CostGroupList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cost-groups/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <CostGroupForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cost-groups/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <CostGroupForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 공휴일 관리 */}
        <Route
          path="/holidays"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.read">
                <HolidayList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/holidays/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <HolidayForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/holidays/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="project.write" requireWrite>
                <HolidayForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 사용자 관리 */}
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="member.read">
                <MemberList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="member.write" requireWrite>
                <MemberForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="member.write" requireWrite>
                <MemberForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 역할 관리 */}
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="member.write" requireWrite>
                <RoleList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="member.write" requireWrite>
                <RoleForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="member.write" requireWrite>
                <RoleForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 기타 */}
        <Route
          path="/forbidden"
          element={
            <Suspense fallback={<PageLoader />}>
              <Forbidden />
            </Suspense>
          }
        />
        <Route
          path="/500"
          element={
            <Suspense fallback={<PageLoader />}>
              <ServerError />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
