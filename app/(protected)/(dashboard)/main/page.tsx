'use client'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProgressIndicator } from "@/components/progress-indicator"
import { TransactionCard } from "@/components/transaction"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import Image from "next/image"
import graph from "../../../../public/graph.svg"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import accountService from "@/services/accountService"
import { Account } from "@/services/accountService"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalBalance, setTotalBalance] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  
  // Novos estados para comparação mês a mês
  const [revenueGrowth, setRevenueGrowth] = useState(0)
  const [expenseGrowth, setExpenseGrowth] = useState(0)

  // Open dialog automatically when component mounts if not seen before
  useEffect(() => {
    // Check if the user has already seen the report
    const hasSeenReport = localStorage.getItem('hasSeenMonthlyReport')
    
    if (!hasSeenReport) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        // Mark as seen
        localStorage.setItem('hasSeenMonthlyReport', 'true')
      }, 1000) // Open after 1 second
      
      return () => clearTimeout(timer)
    }
  }, [])

  // Fetch accounts and calculate financial data
  useEffect(() => {
    const fetchAccountsData = async () => {
      try {
        setIsLoading(true)
        const accountsData = await accountService.findAll()
        
        // Get user from localStorage to filter accounts
        const userJson = localStorage.getItem("dindin_user")
        if (!userJson) {
          router.push("/login")
          return
        }
        
        const user = JSON.parse(userJson)
        
        // Filter accounts belonging to the current user
        const userAccounts = accountsData.filter(account => 
          account.client && account.client.id === user.id
        )
        
        setAccounts(userAccounts)
        
        // Calculate total balance
        const balance = userAccounts.reduce((sum, account) => sum + account.balance, 0)
        setTotalBalance(balance)
        
        // Process all transactions from all accounts
        const allTransactions: any[] = []
        let totalRev = 0
        let totalExp = 0
        
        // Variáveis para análise mês a mês
        let currentMonthRev = 0
        let currentMonthExp = 0
        let lastMonthRev = 0
        let lastMonthExp = 0
        
        // Obter mês atual e mês anterior
        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        
        // Calcular primeiro e último dia do mês atual e do mês anterior
        const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1)
        const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0)
        
        const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1)
        const lastDayLastMonth = new Date(currentYear, currentMonth, 0)
        
        userAccounts.forEach(account => {
          if (account.transactions && account.transactions.length > 0) {
            // Add account transactions to the list
            account.transactions.forEach(transaction => {
              allTransactions.push({
                ...transaction,
                accountName: account.name
              })
              
              // Calculate totals by type
              if (transaction.type === "REVENUE") {
                totalRev += transaction.ammount
              } else if (transaction.type === "EXPENSE") {
                totalExp += transaction.ammount
              }
              
              // Análise por período
              const transactionDate = new Date(transaction.creationDate)
              
              // Verificar se é do mês atual
              if (transactionDate >= firstDayCurrentMonth && transactionDate <= lastDayCurrentMonth) {
                if (transaction.type === "REVENUE") {
                  currentMonthRev += transaction.ammount
                } else if (transaction.type === "EXPENSE") {
                  currentMonthExp += transaction.ammount
                }
              }
              
              // Verificar se é do mês anterior
              if (transactionDate >= firstDayLastMonth && transactionDate <= lastDayLastMonth) {
                if (transaction.type === "REVENUE") {
                  lastMonthRev += transaction.ammount
                } else if (transaction.type === "EXPENSE") {
                  lastMonthExp += transaction.ammount
                }
              }
            })
          }
        })
        
        setTotalRevenue(totalRev)
        setTotalExpense(totalExp)
        
        // Calcular crescimento percentual
        const calcPercentageChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return ((current - previous) / previous) * 100
        }
        
        setRevenueGrowth(calcPercentageChange(currentMonthRev, lastMonthRev))
        setExpenseGrowth(calcPercentageChange(currentMonthExp, lastMonthExp))
        
        // Sort transactions by date (recent first) and get top 4
        const sortedTransactions = allTransactions.sort((a, b) => 
          new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
        ).slice(0, 4)
        
        setRecentTransactions(sortedTransactions)
      } catch (error) {
        console.error("Error fetching accounts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAccountsData()
  }, [router])

  // Format date for transaction display (DD/MM/YY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().substring(2)}`
  }
  
  // Format number to currency
  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace('.', ',')
  }

  // Função para logout que limpa o localStorage
  const eraseUserStorage = () => {
    // Limpar o localStorage
    localStorage.clear()

    // Limpar todos os cookies
    const cookies = document.cookie.split(";")
    cookies.forEach(cookie => {
      const cookieName = cookie.split("=")[0]
      document.cookie = `${cookieName}=; max-age=0; path=/` // Apaga o cookie definindo um max-age de 0
    })

    // Redirecionar para a página de login
    router.push("/login")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Auto-opening Dialog - só aparece se o usuário ainda não viu */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="min-w-5xl bg-zinc-800 text-white border-zinc-700 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-400">Relatório Financeiro Mensal</DialogTitle>
            <DialogDescription className="text-zinc-300">
              Seu relatório do mês está pronto! Veja um resumo abaixo:
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-zinc-700 p-4 rounded-lg">
                <h3 className="font-medium text-green-400">Receitas</h3>
                <p className="text-2xl font-bold">R$ {formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-green-400">{revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}% em relação ao mês anterior</p>
              </div>
              
              <div className="bg-zinc-700 p-4 rounded-lg">
                <h3 className="font-medium text-red-400">Despesas</h3>
                <p className="text-2xl font-bold">R$ {formatCurrency(totalExpense)}</p>
                <p className="text-sm text-red-400">{expenseGrowth >= 0 ? "+" : ""}{expenseGrowth.toFixed(1)}% em relação ao mês anterior</p>
              </div>
              
              <div className="bg-zinc-700 p-4 rounded-lg">
                <h3 className="font-medium">Saldo Final</h3>
                <p className="text-2xl font-bold text-blue-400">R$ {formatCurrency(totalRevenue - totalExpense)}</p>
                <p className="text-sm">Melhor que 75% dos meses anteriores</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Image 
                alt="Gráfico financeiro" 
                src={graph}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div></div>
            <Link href="/reports" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Ver Relatório Completo
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saldo Total */}
      <div className="lg:col-span-2 bg-zinc-800 rounded-lg p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-zinc-400">Saldo Total: R$</span>
              <h2 className="text-5xl font-bold">{formatCurrency(totalBalance)}</h2>
            </div>

            <div className="mt-8">
              <h3 className="text-xl mb-4">Transações Recentes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                {recentTransactions.map((transaction, index) => (
                  <TransactionCard
                    key={transaction.id}
                    date={formatDate(transaction.creationDate)}
                    entrada={transaction.type === "REVENUE" ? `+${formatCurrency(transaction.ammount)}` : "+0,00"}
                    saida={transaction.type === "EXPENSE" ? `-${formatCurrency(transaction.ammount)}` : "-0,00"}
                    protocol={`TX${transaction.id}`}
                    index={index}
                  />
                ))}
              </div>
              {/* BOTTOM HALF */}
              <div className="min-w-full flex flex-row justify-center gap-3">
                <Card className="p-0 w-full bg-zinc-700 text-white border-none">
                  <h3 className="ms-3">Histórico</h3>
                  <ScrollArea className="h-[200px] pe-3 ps-1" style={{ scrollbarColor: "white" }} type="always">
                    {accounts.length > 0 && accounts.flatMap(account => 
                      account.transactions || []
                    )
                    .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
                    .map(transaction => (
                      <Card 
                        key={transaction.id} 
                        className={`${transaction.type === "REVENUE" ? "bg-green-700" : "bg-red-400"} h-5 rounded-md mb-1`}
                      >
                        {transaction.type === "REVENUE" ? "+ " : "- "}
                        R$ {formatCurrency(transaction.ammount)} - {formatDate(transaction.creationDate)}
                      </Card>
                    ))}
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right side panels */}
      <div className="flex flex-col gap-4">
        {/* botão de registrar transação */}
        <Card className="bg-zinc-700 text-white border-none flex flex-col justify-center items-center text-center p-4">
          <div className="flex flex-col gap-2 w-full">
            <Link href={"/register-transaction"}>
              <Button className="w-full bg-green-600 hover:bg-green-700 p-16 text-4xl">Registrar Transação</Button>
            </Link>
          </div>
        </Card>

        {/* Indicadores */}
        <div>
          {/* Green Progress Indicator (Revenue) */}
          <div className="flex pb-3">
            <ProgressIndicator 
              value={totalRevenue > 0 ? Math.min((totalRevenue / (totalRevenue + totalExpense)) * 100, 100) : 0} 
              variant="green"
              amount={totalRevenue}
              percentage={revenueGrowth}
            />
          </div>
          {/* Red Progress Indicator (Expense) */}
          <div className="flex">
            <ProgressIndicator 
              value={totalExpense > 0 ? Math.min((totalExpense / (totalRevenue + totalExpense)) * 100, 100) : 0} 
              variant="red"
              amount={totalExpense}
              percentage={expenseGrowth}
            />
          </div>
        </div>
      </div>
    </div>
  )
}