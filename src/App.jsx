import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from "@mui/material"
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppThemeProvider, useAppTheme } from './ThemeContext'
import Login from './Screens/Login/Login'
import HomeLayout from './Screens/Home/HomeLayout'
import AdminLayout from './Screens/Admin/AdminLayout'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#F3F4F6', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#6B7280', disabled: '#9CA3AF' },
    divider: '#E5E7EB',
    primary: { main: '#185FA5' },
    action: { hover: 'rgba(0,0,0,0.04)', selected: 'rgba(24,95,165,0.1)' },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0f1117', paper: '#1a1b23' },
    text: { primary: '#f3f4f6', secondary: '#9ca3af', disabled: '#6b7280' },
    divider: '#2e303a',
    primary: { main: '#378ADD' },
    action: { hover: 'rgba(255,255,255,0.06)', selected: 'rgba(55,138,221,0.15)' },
  },
})

function ThemedApp() {
  const { mode } = useAppTheme()
  const muiTheme = mode === 'dark' ? darkTheme : lightTheme

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
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
    </MuiThemeProvider>
  )
}

function App() {
  return (
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  )
}

export default App
