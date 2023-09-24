import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TransactionProvider } from './context/TransactionContext.jsx'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
ReactDOM.createRoot(document.getElementById('root')).render(
    <TransactionProvider>
    <React.StrictMode>
      <DndProvider backend={HTML5Backend}>
      <App />
      </DndProvider>
    </React.StrictMode>
    </TransactionProvider>,
)
