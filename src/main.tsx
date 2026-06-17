import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/errors/ErrorBoundary';

const runId = 'app_run_' + Math.random().toString(36).substring(7);

try {
  if (sessionStorage.getItem('currentRunId') !== runId) {
    sessionStorage.setItem('currentRunId', runId);
    if (!window.location.hash || window.location.hash.includes('profile') || window.location.hash.includes('roommate')) {
       window.location.hash = '#/';
    }
  }
} catch (e) {
  // Ignore iframe DOM exception
  if (!window.location.hash || window.location.hash.includes('profile') || window.location.hash.includes('roommate')) {
     window.location.hash = '#/';
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
