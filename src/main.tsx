import React from 'react';
import ReactDOM from 'react-dom';
import TagManager from 'react-gtm-module';
import './global.less';
import App from './App';

TagManager.initialize({ gtmId: 'GTM-WWDMLJL' });

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
