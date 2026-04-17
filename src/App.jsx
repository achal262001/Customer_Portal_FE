import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from "@mui/material"
import Login from './Screens/Login/Login'
import HomeLayout from './Screens/Home/HomeLayout'
import AdminLayout from './Screens/Admin/AdminLayout'

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home/*" element={<HomeLayout />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}

export default App
