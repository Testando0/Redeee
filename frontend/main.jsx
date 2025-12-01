import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Importa o seu aplicativo inteiro
import './index.css' 

// Inicia o aplicativo. Pega o componente <App /> e renderiza ele no elemento com id='root'.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
