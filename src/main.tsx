import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './styles.css';
import { marketBasePath } from './domain/runtimeBase';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={marketBasePath || undefined}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
