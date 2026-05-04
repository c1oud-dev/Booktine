import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { setupAuthInterceptors } from './api/http';
import { authApi } from './auth/authApi';
import './styles/global.css';

setupAuthInterceptors(authApi.reissue);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
