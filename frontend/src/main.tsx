import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth-provider.tsx';
import { BrowserRouter } from "react-router-dom";
import { LocalStorageProvider } from '@/providers/local-storage-provider.tsx';
import { MOCK_API_ON } from '@/config.ts';
import { SocketProvider } from '@/providers/socket-provider.tsx';


const queryClient = new QueryClient();

if (MOCK_API_ON) {
  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass", // don't break unknown APIs
  });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocalStorageProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </LocalStorageProvider>
    </QueryClientProvider>
  </StrictMode>
)
