import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/Homepage.css';
import App from './App';

// Google Analytics
(function() {
  const script = document.createElement('script');
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-YR1E87XH5Z";
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-YR1E87XH5Z');
  };
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
