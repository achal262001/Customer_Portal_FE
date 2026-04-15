import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from "@mui/material"
import Login from './Screens/Login/Login'
import Home from './Screens/Home/Home'

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}

export default App