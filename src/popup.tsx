import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './components/Popup';

const root = document.getElementById('app');
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <Popup/>,
);
