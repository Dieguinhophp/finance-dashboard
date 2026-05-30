import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Reports from './pages/Reports'

function App() {
  const { token } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        
        <Route path="/transactions" element={
          <ProtectedRoute><Transactions /></ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute><Categories /></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute><Reports /></ProtectedRoute>
        } />

        
        <Route path="/" element={
          <Navigate to={token ? '/transactions' : '/login'} />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App