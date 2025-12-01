import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Ponto de entrada padrão do React.
// Renderiza o componente principal App no elemento com id 'root'.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

