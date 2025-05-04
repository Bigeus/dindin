import axios from 'axios';
import { z } from 'zod';
import { hashPassword } from '../lib/hash';

// Definindo a URL base da API
const API_BASE_URL = 'http://localhost:8080';

// Schemas Zod para validação
export const CompanySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Nome da empresa é obrigatório')
  // adicione outros campos conforme necessário
});

export const UserSchema = z.object({
  id: z.number().optional(),
  codUser: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  adress: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'), // mantido como está na API
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  company: CompanySchema.optional()
});

export const AccountSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Nome da conta é obrigatório'),
  balance: z.number(),
  institution: z.string().min(1, 'Nome da instituição é obrigatório'),
  client: UserSchema.optional(),
  transactions: z.array(z.any()).optional()
});

export const TransactionSchema = z.object({
  id: z.number().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number(),
  date: z.string(),
  category: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE'])
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

// Tipos extraídos dos schemas Zod
export type Company = z.infer<typeof CompanySchema>;
export type User = z.infer<typeof UserSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type LoginCredentials = z.infer<typeof LoginSchema>;

// Classe para tratar erros da API
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Serviço para operações relacionadas a usuários
class UserService {
  // Buscar todos os usuários
  async findAll(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || 'Erro ao buscar usuários', error.response?.status || 500);
      }
      throw new Error('Erro ao buscar usuários');
    }
  }

  // Buscar um usuário pelo ID
  async findById(id: number): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Usuário com ID ${id} não encontrado`, error.response?.status || 500);
      }
      throw new Error(`Erro ao buscar usuário com ID ${id}`);
    }
  }

  // Buscar contas de um usuário (incluindo transações)
  async findUserAccounts(userId: number): Promise<Account[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/accounts`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao buscar contas do usuário ${userId}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao buscar contas do usuário ${userId}`);
    }
  }

  // Criar um novo usuário
  async insert(userData: User): Promise<User> {
    try {
      // Validação dos dados
      UserSchema.parse(userData);
      
      // Hash da senha antes de enviar para a API
      const hashedUserData = {
        ...userData,
        password: await hashPassword(userData.password)
      };
      
      const response = await axios.post(`${API_BASE_URL}/users`, hashedUserData);
      return response.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Erro de validação: ${error.errors.map(e => e.message).join(', ')}`);
      }
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || 'Erro ao criar usuário', error.response?.status || 500);
      }
      throw new Error('Erro ao criar usuário');
    }
  }

  // Atualizar um usuário existente
  async update(id: number, userData: Partial<User>): Promise<User> {
    try {
      // Se houver senha, faz o hash
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao atualizar usuário ${id}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao atualizar usuário ${id}`);
    }
  }

  // Excluir um usuário
  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao excluir usuário ${id}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao excluir usuário ${id}`);
    }
  }

  // Método de login
  async loginUser(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Validação das credenciais
      LoginSchema.parse(credentials);
      
      // Hash da senha antes de comparar
      const hashedPassword = await hashPassword(credentials.password);
      
      // Busca todos os usuários (em uma aplicação real isso seria feito no backend)
      const users = await this.findAll();
      
      // Encontra o usuário com email e senha correspondentes
      const user = users.find(u => 
        u.email === credentials.email && 
        u.password === hashedPassword
      );
      
      return user || null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Erro de validação: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error('Erro ao fazer login');
    }
  }
}

// Exportando uma instância do serviço
const userService = new UserService();
export default userService;