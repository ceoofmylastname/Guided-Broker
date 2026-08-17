import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {CONFIG} from './config';
import './index.css';

// `/admin` used to render a second, simpler ticket list built into this app.
// It read the same `tickets` table as the real board but knew nothing about
// stages, leaders, tags, the timeline, or compose — two doors onto one table,
// one of them permanently drifting. It now forwards to the real board.
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();

if (path.endsWith('/admin')) {
  window.location.replace(CONFIG.adminBoardUrl);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
