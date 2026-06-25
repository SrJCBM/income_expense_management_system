/**
 * Archivo principal main.jsx
 * Punto de entrada de la aplicación React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </HashRouter>
  </React.StrictMode>
);
