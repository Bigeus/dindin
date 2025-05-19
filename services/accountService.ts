import axios from 'axios';
import { z } from 'zod';
import { UserSchema } from './userService';

// Definindo a URL base da API
const API_BASE_URL = 'https://cashchego-backend-bigeus.onrender.com';

// Schemas Zod para validação - Simplificado para corresponder ao JSON de sucesso
export const AccountSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Nome da conta é obrigatório'),
  balance: z.number(),
  institution: z.string().min(1, 'Nome da instituição é obrigatório'),
  client: z.object({
    id: z.number()
  }).optional(),
  transactions: z.array(z.any()).optional()
});

// Tipos extraídos dos schemas Zod
export type Account = z.infer<typeof AccountSchema>;

// Classe para tratar erros da API
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Serviço para operações relacionadas a contas
class AccountService {
  // Buscar todas as contas
  async findAll(): Promise<Account[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || 'Erro ao buscar contas', error.response?.status || 500);
      }
      throw new Error('Erro ao buscar contas');
    }
  }

  // Buscar uma conta pelo ID
  async findById(id: number): Promise<Account> {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Conta com ID ${id} não encontrada`, error.response?.status || 500);
      }
      throw new Error(`Erro ao buscar conta com ID ${id}`);
    }
  }

  // Criar uma nova conta
  async insert(accountData: Account): Promise<Account> {
    try {
      // Validação dos dados
      AccountSchema.parse(accountData);
      
      console.log("Enviando dados da conta para a API:", JSON.stringify(accountData));
      
      const response = await axios.post(`${API_BASE_URL}/accounts`, accountData);
      return response.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Erro de validação: ${error.errors.map(e => e.message).join(', ')}`);
      }
      if (axios.isAxiosError(error)) {
        console.error("Resposta de erro da API:", error.response?.data);
        throw new ApiError(error.response?.data?.message || 'Erro ao criar conta', error.response?.status || 500);
      }
      throw new Error('Erro ao criar conta');
    }
  }

  // Atualizar uma conta existente
  async update(id: number, accountData: Partial<Account>): Promise<Account> {
    try {
      const response = await axios.put(`${API_BASE_URL}/accounts/${id}`, accountData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao atualizar conta ${id}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao atualizar conta ${id}`);
    }
  }

  // Excluir uma conta
  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/accounts/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao excluir conta ${id}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao excluir conta ${id}`);
    }
  }
}

// Exportando uma instância do serviço
const accountService = new AccountService();
export default accountService;