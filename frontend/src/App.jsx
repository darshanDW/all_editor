
import viteLogo from '/vite.svg'
import Texteditor from './Texteditor'
import './App.css'
import { v4 as uuidV4 } from "uuid"


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (

    <BrowserRouter>
      <Routes>



        <Route path="/" element={<Navigate to={`/${uuidV4()}`} />} />
        <Route path="/:id" element={<Texteditor />} />




      </Routes>
    </BrowserRouter>
  )
}

export default App
