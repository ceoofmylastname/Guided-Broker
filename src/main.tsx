import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Admin from './components/Admin.tsx';
import './index.css';

// Lightweight routing: /admin renders the admin dashboard, everything else the site.
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
const isAdmin = path.endsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <Admin /> : <App />}
  </StrictMode>,
);
