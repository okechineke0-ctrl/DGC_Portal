import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PortalErrorBoundary } from './components/PortalErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalErrorBoundary>
      <App />
    </PortalErrorBoundary>
  </StrictMode>,
);
