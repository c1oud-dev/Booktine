import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { setupAuthInterceptors } from './api/http';
import { authApi } from './auth/authApi';
import { AuthProvider } from './auth/AuthContext';
import { ReminderProvider } from './reminders/ReminderContext';
import './styles/global.css';

setupAuthInterceptors(authApi.reissue);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReminderProvider>
          <App />
        </ReminderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
