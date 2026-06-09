import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// точка входа — цепляемся за <div id="root"> в index.html
const rootElement = document.getElementById('root');
if (!rootElement) {
  // если корня нет — что-то совсем сломалось, дальше нет смысла
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
