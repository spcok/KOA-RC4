import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New system update available. Reload to apply?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('🚀 KOA System: Fully optimized for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
