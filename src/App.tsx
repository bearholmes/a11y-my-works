import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { AuthProvider } from './providers/AuthProvider';
import { AppRouter } from './components/AppRouter';

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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
