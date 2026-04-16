import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from "@mui/material"
import Login from './Screens/Login/Login'
import Home from './Screens/Home/Home'
import Dashboard from './Screens/Dashboard/Dashboard'
import Ticket from './Screens/Ticket/Ticket'
import CommunicationHub from './Screens/CommunicationHub/CommunicationHub'

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home/dashboard" element={<Dashboard />} />
          <Route path="/home/ticket" element={<Ticket />} />
          <Route path="/home/communication-hub" element={<CommunicationHub />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}

export default App