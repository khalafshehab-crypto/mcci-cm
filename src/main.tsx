import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log: 'Duplicate key error: ' + args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '),
        stack: new Error().stack
      })
    }).catch(()=> {
      // fallback
    });
  }
  
  if (typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.zIndex = '999999';
    el.style.backgroundColor = 'red';
    el.style.color = 'white';
    el.style.padding = '20px';
    el.innerText = 'DUPLICATE KEY: ' + JSON.stringify(args);
    document.body.appendChild(el);
  }
  originalError(...args);
  
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
