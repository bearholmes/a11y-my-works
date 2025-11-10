import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginForm } from './components/LoginForm';
import { CostGroupForm } from './pages/CostGroupForm';
import { CostGroupList } from './pages/CostGroupList';
import { Dashboard } from './pages/Dashboard';
import { HolidayForm } from './pages/HolidayForm';
import { HolidayList } from './pages/HolidayList';
import { MemberForm } from './pages/MemberForm';
import { MemberList } from './pages/MemberList';
import { PendingApprovalScreen } from './pages/PendingApprovalScreen';
import { ProjectForm } from './pages/ProjectForm';
import { ProjectList } from './pages/ProjectList';
import { RoleForm } from './pages/RoleForm';
import { RoleList } from './pages/RoleList';
import { ServiceForm } from './pages/ServiceForm';
import { ServiceList } from './pages/ServiceList';
import { TaskForm } from './pages/TaskForm';
import { TaskList } from './pages/TaskList';
import { TestPage } from './pages/TestPage';
import { AuthProvider, useAuthContext } from './providers/AuthProvider';
import { memberAPI } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();

  // 회원 정보 조회 (승인 상태 확인용)
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['currentMember', user?.id],
    queryFn: () => memberAPI.getCurrentMember(),
    enabled: !!user,
    retry: 1,
  });

  if (loading || memberLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 회원 정보가 없거나 비활성 상태이거나 역할이 없거나 Pending User(role_id=4)면 승인 대기 화면
  if (!member || !member.is_active || !member.role_id || member.role_id === 4) {
    return <PendingApprovalScreen />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
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
                  <TaskForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/edit/:id"
              element={
                <ProtectedRoute>
                  <TaskForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <MemberList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/edit/:id"
              element={
                <ProtectedRoute>
                  <MemberForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute>
                  <RoleList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/new"
              element={
                <ProtectedRoute>
                  <RoleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/edit/:id"
              element={
                <ProtectedRoute>
                  <RoleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <ProjectForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/edit/:id"
              element={
                <ProtectedRoute>
                  <ProjectForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServiceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services/new"
              element={
                <ProtectedRoute>
                  <ServiceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services/edit/:id"
              element={
                <ProtectedRoute>
                  <ServiceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cost-groups"
              element={
                <ProtectedRoute>
                  <CostGroupList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cost-groups/new"
              element={
                <ProtectedRoute>
                  <CostGroupForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cost-groups/edit/:id"
              element={
                <ProtectedRoute>
                  <CostGroupForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/holidays"
              element={
                <ProtectedRoute>
                  <HolidayList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/holidays/new"
              element={
                <ProtectedRoute>
                  <HolidayForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/holidays/:id"
              element={
                <ProtectedRoute>
                  <HolidayForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <TestPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
