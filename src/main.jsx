import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LenisProvider } from './hooks/useGSAP';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>,
);