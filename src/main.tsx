import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/config'; // Initialize i18n before rendering
import './styles/globals.css';
import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>
);
