import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main className="h-screen bg-gray-900 text-white">
      <App />
    </main>
  </React.StrictMode>
); 