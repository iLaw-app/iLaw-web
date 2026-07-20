import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationSettingsProvider } from './context/NotificationSettingsContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationSettingsProvider>
          <App />
        </NotificationSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
