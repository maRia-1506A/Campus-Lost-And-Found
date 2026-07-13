import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ItemsProvider } from './contexts/ItemsContext';
import { ClaimsProvider } from './contexts/ClaimsContext';
import { MessagesProvider } from './contexts/MessagesContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ItemsProvider>
            <ClaimsProvider>
              <MessagesProvider>
                <App />
              </MessagesProvider>
            </ClaimsProvider>
          </ItemsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
