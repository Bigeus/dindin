import axios from "axios"
import Cookies from "js-cookie"

// Constantes
const TOKEN_KEY = "dindin_auth_token"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_KEY)

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erro 401 (não autorizado)
    if (error.response && error.response.status === 401) {
      // Limpar dados de autenticação
      Cookies.remove(TOKEN_KEY)
      localStorage.removeItem("dindin_user")

      // Redirecionar para login
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default api

