import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from "@mui/material"
import Login from './Screens/Login/Login'
import HomeLayout from './Screens/Home/HomeLayout'

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home/*" element={<HomeLayout />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}

export default App
