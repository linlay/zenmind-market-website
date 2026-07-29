import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
