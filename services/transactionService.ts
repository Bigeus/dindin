import axios from 'axios';
import { z } from 'zod';
import { AccountSchema } from './accountService';

// Definindo a URL base da API
const API_BASE_URL = 'http://localhost:8080';

// Schemas Zod para validação
export const TransactionCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Nome da categoria é obrigatório')
});

export const ReportSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional()
});

// Definindo o enum TransactionType para corresponder ao backend
export const TransactionTypeEnum = z.enum(['REVENUE', 'EXPENSE']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const TransactionSchema = z.object({
  id: z.number().optional(),
  ammount: z.number({
    required_error: 'Valor é obrigatório',
    invalid_type_error: 'Valor deve ser um número'
  }),
  creationDate: z.string().optional().or(z.date()), // Pode ser fornecido como string ou Date
  balanceAfter: z.number().optional(),
  type: TransactionTypeEnum,
  category: z.union([z.number(), TransactionCategorySchema]).optional(), // Pode ser ID ou objeto completo
  account: AccountSchema.optional(),
  accountId: z.number().optional(), // Para facilitar a criação de transações
  report: ReportSchema.optional(),
  description: z.string().optional(), // Adicionado campo de descrição
  responsible: z.string().optional() // Adicionado campo de responsável
});

// Tipos extraídos dos schemas Zod
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;
export type Report = z.infer<typeof ReportSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

// Classe para tratar erros da API
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Classe para mapear entre os tipos de transação do frontend e backend
export class TransactionMapper {
  // Mapeia de "entrada"/"saida" (frontend) para "RECEITA"/"DESPESA" (backend)
  static mapTypeToBackend(type: string): TransactionType {
    switch (type) {
      case 'entrada':
        return 'RECEITA';
      case 'saida':
        return 'DESPESA';
      default:
        return type as TransactionType;
    }
  }

  // Mapeia de "RECEITA"/"DESPESA" (backend) para "entrada"/"saida" (frontend)
  static mapTypeToFrontend(type: TransactionType): string {
    switch (type) {
      case 'REVENUE':
        return 'entrada';
      case 'EXPENSE':
        return 'saida';
      default:
        return type.toLowerCase();
    }
  }
}

// Serviço para operações relacionadas a transações
class TransactionService {
  // Buscar todas as transações
  async findAll(): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/Transactions`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || 'Erro ao buscar transações', error.response?.status || 500);
      }
      throw new Error('Erro ao buscar transações');
    }
  }

  // Buscar uma transação pelo ID
  async findById(id: number): Promise<Transaction> {
    try {
      const response = await axios.get(`${API_BASE_URL}/Transactions/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Transação com ID ${id} não encontrada`, error.response?.status || 500);
      }
      throw new Error(`Erro ao buscar transação com ID ${id}`);
    }
  }

  // Criar uma nova transação
  async insert(transactionData: Transaction): Promise<Transaction> {
    try {
      // Preparar os dados para o backend
      const preparedData = this.prepareTransactionData(transactionData);
      
      // Validação dos dados
      TransactionSchema.parse(preparedData);
      
      console.log("Enviando dados da transação para a API:", JSON.stringify(preparedData));
      
      const response = await axios.post(`${API_BASE_URL}/Transactions`, preparedData);
      return response.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Erro de validação: ${error.errors.map(e => e.message).join(', ')}`);
      }
      if (axios.isAxiosError(error)) {
        console.error("Resposta de erro da API:", error.response?.data);
        throw new ApiError(error.response?.data?.message || 'Erro ao criar transação', error.response?.status || 500);
      }
      throw new Error('Erro ao criar transação');
    }
  }

  // Atualizar uma transação existente
  async update(id: number, transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      // Preparar os dados para o backend
      const preparedData = this.prepareTransactionData(transactionData);
      
      const response = await axios.put(`${API_BASE_URL}/Transactions/${id}`, preparedData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao atualizar transação ${id}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao atualizar transação ${id}`);
    }
  }

  // Excluir uma transação
  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/Transactions/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao excluir transação ${id}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao excluir transação ${id}`);
    }
  }

  // Buscar transações de uma conta específica
  async findByAccountId(accountId: number): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/${accountId}/Transactions`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.response?.data?.message || `Erro ao buscar transações da conta ${accountId}`, error.response?.status || 500);
      }
      throw new Error(`Erro ao buscar transações da conta ${accountId}`);
    }
  }

  // Criar transação a partir do formulário do frontend
  async createFromForm(formData: {
    date: Date;
    accountId: string;
    type: 'entrada' | 'saida';
    value: number;
    description: string;
    responsible: string;
    categoryId?: number;
  }): Promise<Transaction> {
    try {
      // Obter dados do usuário do localStorage
      const userData = this.getUserFromLocalStorage();
      
      // Mapear os dados do formulário para o formato da API
      const transactionData: Partial<Transaction> = {
        ammount: formData.value,
        type: TransactionMapper.mapTypeToBackend(formData.type),
        creationDate: formData.date.toISOString(),
        accountId: parseInt(formData.accountId),
        description: formData.description,
        responsible: formData.responsible,
        category: formData.categoryId
      };
      
      return await this.insert(transactionData as Transaction);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar transação a partir do formulário');
    }
  }

  // Método auxiliar para obter o usuário logado do localStorage
  private getUserFromLocalStorage(): { id: number } | null {
    try {
      const userString = localStorage.getItem('dindin_user');
      if (userString) {
        const user = JSON.parse(userString);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário do localStorage:', error);
      return null;
    }
  }

  // Método auxiliar para preparar os dados da transação antes de enviar para a API
  private prepareTransactionData(data: Partial<Transaction>): Partial<Transaction> {
    const preparedData = { ...data };
    
    // Se tiver accountId mas não tiver account, cria um objeto account
    if (preparedData.accountId && !preparedData.account) {
      preparedData.account = { id: preparedData.accountId } as any;
    }
    
    // Garante que creationDate está no formato ISO se for uma Date
    if (preparedData.creationDate instanceof Date) {
      preparedData.creationDate = preparedData.creationDate.toISOString();
    }
    
    return preparedData;
  }
}

// Exportando uma instância do serviço
const transactionService = new TransactionService();
export default transactionService;