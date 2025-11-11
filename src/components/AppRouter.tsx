import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from './Layout';
import { LoginForm } from './LoginForm';
import { PermissionGuard } from './PermissionGuard';

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="페이지 로딩 중"></div>
      <span className="sr-only">페이지 로딩 중...</span>
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

// 테스트
const TestPage = lazy(() =>
  import('../pages/TestPage').then((m) => ({ default: m.TestPage }))
);

// 팀 관리
const TeamTaskList = lazy(() =>
  import('../pages/TeamTaskList').then((m) => ({ default: m.TeamTaskList }))
);
const ResourceStats = lazy(() =>
  import('../pages/ResourceStats').then((m) => ({ default: m.ResourceStats }))
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" aria-label="인증 확인 중"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </Layout>
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
              <PermissionGuard permission="TASK_WRITE" requireWrite>
                <TaskForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="TASK_WRITE" requireWrite>
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

        {/* 팀 관리 */}
        <Route
          path="/team/tasks"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="TASK_READ">
                <TeamTaskList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/stats"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="TASK_READ">
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
              <PermissionGuard permission="PROJECT_READ">
                <ProjectList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
                <ProjectForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
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
              <PermissionGuard permission="PROJECT_READ">
                <ServiceList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
                <ServiceForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
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
              <PermissionGuard permission="PROJECT_READ">
                <CostGroupList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cost-groups/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
                <CostGroupForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cost-groups/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
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
              <PermissionGuard permission="PROJECT_READ">
                <HolidayList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/holidays/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
                <HolidayForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/holidays/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="PROJECT_WRITE" requireWrite>
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
              <PermissionGuard permission="MEMBER_READ">
                <MemberList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="MEMBER_WRITE" requireWrite>
                <MemberForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="MEMBER_WRITE" requireWrite>
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
              <PermissionGuard permission="MEMBER_WRITE" requireWrite>
                <RoleList />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/new"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="MEMBER_WRITE" requireWrite>
                <RoleForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/edit/:id"
          element={
            <ProtectedRoute>
              <PermissionGuard permission="MEMBER_WRITE" requireWrite>
                <RoleForm />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* 테스트 페이지 */}
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <TestPage />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
