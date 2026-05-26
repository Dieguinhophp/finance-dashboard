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
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route path="/transactions" element={
          <ProtectedRoute><Transactions /></ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute><Categories /></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute><Reports /></ProtectedRoute>
        } />

        {/* Redireciona a raiz conforme autenticação */}
        <Route path="/" element={
          <Navigate to={token ? '/transactions' : '/login'} />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App