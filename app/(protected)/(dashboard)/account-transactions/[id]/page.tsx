'use client'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  ChevronLeft,
  Search,
  ArrowUp,
  ArrowDown,
  Filter,
  PlusCircle,
  Download,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Clock,
  Tag,
  Trash,
  Edit,
  MoreVertical,
  ArrowUpDown,
  ArrowRightLeft
} from "lucide-react"
import { useParams } from "next/navigation"
import accountService from "@/services/accountService"

export default function AccountTransactions() {
  const params = useParams()
  const accountId = parseInt(params.id as string)

  // Define a interface para o tipo de conta
  interface Account {
    id?: number;
    name: string;
    balance: number;
    institution: string;
    client?: { id: number };
    transactions?: Transaction[];
  }

  // Define a interface para transações
  interface Transaction {
    id: number;
    description: string;
    ammount: number;
    type: "REVENUE" | "EXPENSE" | "TRANSFER";
    creationDate: string;
    cathegory?: {
      id: number;
      name: string;
    };
  }

  // Estados com tipos corretos
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Categorias disponíveis
  const categories = [
    { id: 1, name: "Salário" },
    { id: 2, name: "Transferência Interna" },
    { id: 3, name: "Compra Online" },
    { id: 4, name: "Reembolso" },
    { id: 5, name: "Pagamento de Conta" }
  ]

  // Estado para nova transação
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    ammount: "",
    type: "EXPENSE" as "EXPENSE" | "REVENUE" | "TRANSFER",
    cathegory: {
      id: "1",
      name: "Salário"
    },
    date: new Date().toISOString().split('T')[0]
  })

  // Buscar dados da conta
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoading(true)
        const data = await accountService.findById(accountId)
        setAccount(data)
        setError(null)
      } catch (err: any) {
        console.error("Erro ao buscar dados da conta:", err)
        setError(err.message || "Erro ao carregar dados da conta")
        
      } finally {
        setIsLoading(false)
      }
    }

    if (accountId) {
      fetchAccountData()
    }
  }, [accountId])

  // Manipuladores de eventos
  const handleTransactionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "ammount") {
      setNewTransaction(prev => ({
        ...prev,
        ammount: value
      }))
    } else {
      setNewTransaction(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "cathegory") {
      const selectedCategory = categories.find(cat => cat.id === parseInt(value))
      setNewTransaction(prev => ({
        ...prev,
        cathegory: {
          id: value,
          name: selectedCategory?.name || ""
        }
      }))
    } else {
      setNewTransaction(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Filtrar e ordenar transações
  const getFilteredTransactions = () => {
    if (!account?.transactions) return []

    let filtered = [...account.transactions]

    // Filtro por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => {
        const description = t.description?.toLowerCase() || ""
        const categoryName = t.cathegory?.name?.toLowerCase() || ""
        return description.includes(query) || categoryName.includes(query)
      })
    }

    // Filtro por tipo
    if (transactionType !== "all") {
      filtered = filtered.filter(t => t.type === transactionType)
    }

    // Filtro por data
    const today = new Date()
    if (dateRange === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      filtered = filtered.filter(t => new Date(t.creationDate) >= startOfMonth)
    } else if (dateRange === "lastMonth") {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      filtered = filtered.filter(t =>
        new Date(t.creationDate) >= startOfLastMonth &&
        new Date(t.creationDate) < startOfMonth
      )
    } else if (dateRange === "last90days") {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(today.getDate() - 90)
      filtered = filtered.filter(t => new Date(t.creationDate) >= ninetyDaysAgo)
    }

    // Ordenação
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
      } else if (sortOrder === "highestAmount") {
        return b.ammount - a.ammount
      } else if (sortOrder === "lowestAmount") {
        return a.ammount - b.ammount
      }
      return 0
    })

    return filtered
  }

  const filteredTransactions = getFilteredTransactions()
  const totalRevenue = filteredTransactions
    .filter(t => t.type === "REVENUE")
    .reduce((sum, t) => sum + t.ammount, 0)
  const totalExpenses = filteredTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.ammount, 0)
  const balance = totalRevenue - totalExpenses

  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Estados de loading/erro
  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="animate-spin h-10 w-10 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-white">Carregando detalhes da conta...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="bg-red-600/20 p-6 rounded-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-white mb-2">Erro ao carregar dados</h2>
          <p className="text-zinc-300">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-xl text-white">Conta não encontrada</p>
        <Link href="/accounts">
          <Button className="mt-4">Voltar para contas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Link href="/accounts">
            <Button variant="ghost" className="p-2 h-auto">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{account.name}</h1>
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <span>{account.institution}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CreditCard size={14} />
                {account.id && `****${account.id.toString().slice(-4)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link href={"/register-transaction"}>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <PlusCircle size={16} />
              Nova Transação
            </Button>
          </Link>
        </div>
      </div>

      {/* Resumo da conta */}
      <Card className="mb-6 bg-zinc-800 border-none p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-zinc-400 text-sm">Saldo Atual</p>
            <p className="text-2xl font-bold text-white">
              R$ {account.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Receitas (período)</p>
            <p className="text-2xl font-bold text-green-500">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Despesas (período)</p>
            <p className="text-2xl font-bold text-red-500">
              R$ {totalExpenses.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Saldo (período)</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="bg-zinc-700 border-zinc-600 w-[180px]">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="Todas transações" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">Todas transações</SelectItem>
              <SelectItem value="REVENUE">Receitas</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
              <SelectItem value="TRANSFER">Transferências</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="bg-zinc-700 border-zinc-600 w-[180px]">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <SelectValue placeholder="Todo período" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="thisMonth">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês anterior</SelectItem>
              <SelectItem value="last90days">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="bg-zinc-700 border-zinc-600 w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} />
                <SelectValue placeholder="Ordenar por" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigas</SelectItem>
              <SelectItem value="highestAmount">Maior valor</SelectItem>
              <SelectItem value="lowestAmount">Menor valor</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="bg-zinc-700 border-zinc-600">
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Lista de transações */}
      <Card className="bg-zinc-800 border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-700">
            <TableRow className="hover:bg-zinc-700">
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-white">Categoria</TableHead>
              {/* <TableHead className="text-white">Descrição</TableHead> */}
              <TableHead className="text-right text-white">Valor</TableHead>
              {/* <TableHead className="text-right text-white">Saldo</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead> */}
            </TableRow>
          </TableHeader>  
          
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-zinc-700 hover:bg-zinc-700/50">
                  <TableCell className="font-medium text-zinc-300">
                    {formatDate(transaction.creationDate)}
                  </TableCell>
                  <TableCell className="flex items-center gap-2 text-white">
                    {transaction.type === "REVENUE" ? (
                      <ArrowUp className="text-green-500" size={16} />
                    ) : transaction.type === "EXPENSE" ? (
                      <ArrowDown className="text-red-500" size={16} />
                    ) : (
                      <ArrowRightLeft className="text-blue-500" size={16} />
                    )}
                    {transaction.description || "Sem descrição"}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Tag size={14} />
                      {transaction.cathegory?.name || "Não categorizado"}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === "REVENUE"
                      ? "text-green-500"
                      : transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}>
                    {transaction.type === "REVENUE" ? "+" :
                      transaction.type === "EXPENSE" ? "-" : ""}
                    R$ {transaction.ammount?.toFixed(2) || '0.00'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-zinc-400">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}