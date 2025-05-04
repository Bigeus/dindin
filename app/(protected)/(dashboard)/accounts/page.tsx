'use client'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  PlusCircle,
  MoreVertical,
  CreditCard,
  Wallet,
  Building,
  PiggyBank,
  ArrowUpDown,
  TrendingUp,
  Search,
  Home,
  Loader2
} from "lucide-react"
import accountService from "@/services/accountService"

export default function AccountsList() {
  // Estados
  const [searchQuery, setSearchQuery] = useState("")
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para novo formulário de conta
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "checking",
    institution: "",
    balance: 0,
    color: "#3b82f6" // Default blue color
  })

  // Obter o ID do usuário do localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userJson = localStorage.getItem("dindin_user")
      if (userJson) {
        const user = JSON.parse(userJson)
        return user
      }
      return null
    } catch (error) {
      console.error("Erro ao obter usuário do localStorage:", error)
      return null
    }
  }

  // Buscar todas as contas quando o componente montar
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Função para buscar contas
  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const allAccounts = await accountService.findAll()

      // Obter o usuário logado
      const user = getUserFromLocalStorage()

      // Filtrar apenas as contas do usuário atual
      const userAccounts = allAccounts.filter(account =>
        account.client && account.client.id === user.id
      )

      // Adicionar propriedades extras para compatibilidade com o componente
      const formattedAccounts = userAccounts.map(account => ({
        ...account,
        type: account.type || "checking", // Default type if not present
        color: account.color || getRandomColor(), // Use color or generate one
        lastTransaction: formatLastTransactionDate(account.transactions)
      }))

      setAccounts(formattedAccounts)
    } catch (error) {
      console.error("Erro ao buscar contas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas contas. Tente novamente mais tarde.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para gerar uma cor aleatória caso não exista
  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Função para formatar a data da última transação
  const formatLastTransactionDate = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return "Sem transações"
    }

    // Ordenar transações por data (mais recente primeiro)
    const sortedTransactions = [...transactions].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    )

    // Formatar a data da transação mais recente
    const lastDate = new Date(sortedTransactions[0].date)
    return lastDate.toLocaleDateString('pt-BR')
  }

  // Função para atualizar dados do novo formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAccount({
      ...newAccount,
      [name]: name === "balance" ? parseFloat(value) || 0 : value
    })
  }

  // Função para criar nova conta
  const handleCreateAccount = async () => {
    try {
      setIsSubmitting(true)

      // Obter o usuário logado
      const user = getUserFromLocalStorage()
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Faça login novamente.",
          variant: "destructive"
        })
        return
      }

      // Preparar dados da conta com o ID do cliente
      const accountData = {
        ...newAccount,
        client: {
          id: user.id
        }
      }

      // Enviar para o servidor
      await accountService.insert(accountData)

      // Atualizar a lista de contas
      fetchAccounts()

      // Fechar o diálogo e resetar o formulário
      setIsDialogOpen(false)
      setNewAccount({
        name: "",
        type: "checking",
        institution: "",
        balance: 0,
        color: "#3b82f6"
      })

      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!",
        variant: "default"
      })
    } catch (error) {
      console.error("Erro ao criar conta:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para deletar conta
  const handleDeleteAccount = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) {
      try {
        await accountService.delete(id)
        fetchAccounts()
        toast({
          title: "Sucesso",
          description: "Conta excluída com sucesso!",
          variant: "default"
        })
      } catch (error) {
        console.error("Erro ao excluir conta:", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir a conta. Tente novamente mais tarde.",
          variant: "destructive"
        })
      }
    }
  }

  // Filtrar contas pela busca
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.institution.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Componente para ícone baseado no tipo de conta
  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking':
        return <CreditCard size={20} />;
      case 'savings':
        return <PiggyBank size={20} />;
      case 'investment':
        return <TrendingUp size={20} />;
      case 'credit':
        return <CreditCard size={20} />;
      case 'digital':
        return <Wallet size={20} />;
      default:
        return <CreditCard size={20} />;
    }
  }

  // Traduções para os tipos de conta
  const accountTypeLabels = {
    checking: "Conta Corrente",
    savings: "Conta Poupança",
    investment: "Investimentos",
    credit: "Cartão de Crédito",
    digital: "Carteira Digital"
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Minhas Contas</h1>
          <p className="text-zinc-400">Gerencie todas as suas contas financeiras</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <PlusCircle size={16} />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-800 text-white border-zinc-700">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Conta</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Preencha os dados abaixo para cadastrar uma nova conta financeira.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Conta</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Conta Principal"
                    className="bg-zinc-700 border-zinc-600"
                    value={newAccount.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Conta</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-800"
                    value={newAccount.type}
                    onChange={handleInputChange}
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Conta Poupança</option>
                    <option value="investment">Investimentos</option>
                    <option value="credit">Cartão de Crédito</option>
                    <option value="digital">Carteira Digital</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="institution">Instituição Financeira</Label>
                  <Input
                    id="institution"
                    name="institution"
                    placeholder="Ex: Banco Alfa"
                    className="bg-zinc-700 border-zinc-600"
                    value={newAccount.institution}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="balance">Saldo Inicial (R$)</Label>
                  <Input
                    id="balance"
                    name="balance"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="bg-zinc-700 border-zinc-600"
                    value={newAccount.balance}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    className="h-10 bg-zinc-700 border-zinc-600"
                    value={newAccount.color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreateAccount}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
          <Input
            placeholder="Buscar contas..."
            className="pl-10 bg-zinc-700 border-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="max-w-fit">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="positive">Positivas</TabsTrigger>
            <TabsTrigger value="negative">Negativas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Visão geral dos saldos */}
      {/* <Card className="mb-6 bg-zinc-800 border-none p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-zinc-400 text-sm">Saldo Total</p>
            <p className="text-2xl font-bold text-white">
              R$ {accounts.reduce((sum, account) => sum + account.balance, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Ativos</p>
            <p className="text-2xl font-bold text-green-500">
              R$ {accounts.filter(a => a.balance > 0).reduce((sum, account) => sum + account.balance, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Passivos</p>
            <p className="text-2xl font-bold text-red-500">
              R$ {Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, account) => sum + account.balance, 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </Card> */}

      {/* Estado de carregamento */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Lista de contas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map(account => (
              <Card
                key={account.id}
                className="bg-zinc-800 border-none hover:bg-zinc-700 transition-colors cursor-pointer overflow-hidden"
              >
                <Link
                  href={`/account-transactions/${account.id}`}
                  passHref
                  legacyBehavior
                >
                  <a className="block">
                    <div className="h-2" style={{ backgroundColor: account.color }}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center"
                            style={{ backgroundColor: `${account.color}30` }}
                          >
                            {getAccountIcon(account.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{account.name}</h3>
                            <p className="text-xs text-zinc-400">{account.institution}</p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="bg-zinc-800 border-zinc-700 text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/account-transactions/${account.id}`} passHref legacyBehavior>
                              <DropdownMenuItem className="cursor-pointer">Ver Transações</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-500"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteAccount(account.id);
                              }}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm text-zinc-400">Saldo Atual</p>
                          <p className="text-sm text-zinc-400">
                            {accountTypeLabels[account.type] || "Conta"}
                          </p>
                        </div>
                        <p className={`text-xl font-semibold ${account.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          R$ {account.balance.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-xs text-zinc-400">
                        <ArrowUpDown size={14} />
                        <span>Última transação em {account.lastTransaction}</span>
                      </div>
                    </div>
                  </a>
                </Link>
              </Card>
            ))}
          </div>

          {/* Mensagem caso não haja contas ou resultados de busca */}
          {accounts.length === 0 && !isLoading && (
            <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-8 text-center mt-4">
              <p className="text-zinc-400 mb-4">Você ainda não possui nenhuma conta cadastrada.</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsDialogOpen(true)}
              >
                <PlusCircle size={16} className="mr-2" />
                Adicionar Conta
              </Button>
            </div>
          )}

          {accounts.length > 0 && filteredAccounts.length === 0 && (
            <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-8 text-center mt-4">
              <p className="text-zinc-400">Nenhuma conta encontrada para a sua busca.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}