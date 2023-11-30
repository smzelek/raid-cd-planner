import React, { StrictMode } from 'react';
import * as ReactDOM from "react-dom";
import { App } from "./App";
import './global.scss';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
