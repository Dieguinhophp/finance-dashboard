import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { logout } = useAuth()
  const location = useLocation()

  // Função que destaca o link da página atual
  function linkClass(path) {
    const active = location.pathname === path
    return active
      ? 'text-blue-600 font-medium text-sm'
      : 'text-gray-500 hover:text-gray-800 text-sm transition-colors'
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <span className="font-semibold text-gray-800">FinanceDashboard</span>

        <div className="flex items-center gap-6">
          <Link to="/transactions" className={linkClass('/transactions')}>
            Transações
          </Link>
          <Link to="/categories" className={linkClass('/categories')}>
            Categorias
          </Link>
          <Link to="/reports" className={linkClass('/reports')}>
            Relatórios
          </Link>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar