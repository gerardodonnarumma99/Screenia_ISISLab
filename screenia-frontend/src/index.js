import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RecoilRoot } from "recoil";
import { themeOptions } from './theme';
import { ThemeProvider } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import { createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import FullScreenLoader from './components/FullScreenLoader/FullScreenLoader';

const theme = createTheme(themeOptions);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <BrowserRouter basename="/screenia">
            <App />
        </BrowserRouter>
      </ThemeProvider>
    </RecoilRoot>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
