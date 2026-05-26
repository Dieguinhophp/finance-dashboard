import { createContext, useContext, useState } from 'react'


const AuthContext = createContext(null)


export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  function login(tokenRecebido) {
    localStorage.setItem('token', tokenRecebido)
    setToken(tokenRecebido)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  return useContext(AuthContext)
}