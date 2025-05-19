"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import {jwtDecode} from "jwt-decode"

// Tipos
interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

interface TokenPayload {
  sub: string
  name: string
  email: string
  role?: string
  exp: number
}

// Constantes
const TOKEN_KEY = "dindin_auth_token"
const USER_KEY = "dindin_user"

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    const storedToken = Cookies.get(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      try {
        // Verificar se o token expirou
        const decodedToken = jwtDecode<TokenPayload>(storedToken)
        const currentTime = Date.now() / 1000

        if (decodedToken.exp > currentTime) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))

          // Configurar o token no axios
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
        } else {
          // Token expirado, fazer logout
          handleLogout()
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error)
        handleLogout()
      }
    }

    setIsLoading(false)
  }, [])

  // Função de login
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await axios.post("https://cashchego-backend-bigeus.onrender.com/login", { email, password })
      const { token, user } = response.data

      // Armazenar token e dados do usuário
      Cookies.set(TOKEN_KEY, token, { expires: 7, secure: process.env.NODE_ENV === "production" })
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      // Atualizar estado
      setToken(token)
      setUser(user)

      // Configurar o token no axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return response.data
    } catch (error) {
      console.error("Erro no login:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const handleLogout = () => {
    // Remover token e dados do usuário
    Cookies.remove(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    // Limpar estado
    setToken(null)
    setUser(null)

    // Remover token do axios
    delete axios.defaults.headers.common["Authorization"]

    // Redirecionar para a página de login
    router.push("/login")
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

