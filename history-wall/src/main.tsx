import { createRoot } from 'react-dom/client';
import { App } from './App';
import './app.css';

const root = createRoot(document.getElementById('root')!);

// The hotspot mapping tool only exists in dev (`npm run dev`, then open /#mapper).
if (import.meta.env.DEV && location.hash === '#mapper') {
  import('./dev/Mapper').then(({ Mapper }) => root.render(<Mapper />));
} else {
  root.render(<App />);
}
if (import.meta.env.DEV) window.addEventListener('hashchange', () => location.reload());
