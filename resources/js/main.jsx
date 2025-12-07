import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import "../css/app.css"
import { Toaster } from "@/components/ui/sonner"

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//     <Toaster richColors />
//   </React.StrictMode>,
// )

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Toaster richColors />
  </>,
)