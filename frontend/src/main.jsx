import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'   // ✅ Tailwind included
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'
import { AuthProvider } from "./context/AuthContext.jsx";
import PatientContextProvider from "./context/PatientContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <PatientContextProvider>
  <AuthProvider>
    <AppContextProvider>
      <App />
    </AppContextProvider>
    </AuthProvider>
</PatientContextProvider>
  </BrowserRouter>,
)
