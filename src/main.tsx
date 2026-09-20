import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initTheme } from './services/themeManager';
import './index.css';

// Initialize user custom theme from storage immediately
initTheme();

// Register PWA Service Worker for mobile installability & offline caching
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('AssetPulse PWA Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('AssetPulse PWA Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
