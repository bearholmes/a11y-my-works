import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './providers/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TaskList } from './pages/TaskList';
import { TaskForm } from './pages/TaskForm';
import { TestPage } from './pages/TestPage';
import { MemberList } from './pages/MemberList';
import { MemberForm } from './pages/MemberForm';
import { RoleList } from './pages/RoleList';
import { RoleForm } from './pages/RoleForm';
import { ProjectList } from './pages/ProjectList';
import { ProjectForm } from './pages/ProjectForm';

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

  if (loading) {
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

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
            <Route path="/tasks/new" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
            <Route path="/tasks/edit/:id" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><MemberList /></ProtectedRoute>} />
            <Route path="/members/edit/:id" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><RoleList /></ProtectedRoute>} />
            <Route path="/roles/new" element={<ProtectedRoute><RoleForm /></ProtectedRoute>} />
            <Route path="/roles/edit/:id" element={<ProtectedRoute><RoleForm /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
            <Route path="/projects/edit/:id" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
            <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
