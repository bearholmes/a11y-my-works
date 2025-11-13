import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './components/AppRouter';
import { ConfirmDialog } from './components/ConfirmDialog';
import { LiveRegionAnnouncer, ToastContainer } from './components/Toast';
import { AuthProvider } from './providers/AuthProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <ToastContainer />
        <LiveRegionAnnouncer />
        <ConfirmDialog />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
