import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../index';
import { defaultTheme } from '../theme/default';
import GridMountLayout from './GridMountLayout';
import '../styles/global.css';
import '../theme/win98/index.scss';
import '../theme/winxp/index.scss';
import './index.scss';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme={defaultTheme}>
        <GridMountLayout />
      </ThemeProvider>
    </React.StrictMode>,
  );
}
