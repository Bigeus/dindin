"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CashAccountCombobox } from "@/components/cash-account-combobox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import transactionService from "@/services/transactionService"
import accountService from "@/services/accountService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Account } from "@/services/accountService"

// Define the form schema with zod
const transactionSchema = z.object({
  date: z.date({
    required_error: "A data é obrigatória",
  }),
  accountId: z.string({
    required_error: "A conta é obrigatória",
  }),
  type: z.enum(["REVENUE", "EXPENSE"], {
    required_error: "O tipo de transação é obrigatório",
  }),
  value: z.coerce
    .number({
      required_error: "O valor é obrigatório",
      invalid_type_error: "O valor deve ser um número",
    })
    .positive("O valor deve ser positivo"),
  categoryId: z.coerce.number({
    required_error: "A categoria é obrigatória",
  }),
})

// Infer the type from the schema
type TransactionFormValues = z.infer<typeof transactionSchema>

export default function RegisterTransactionPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Carregar contas e categorias do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Obter o usuário do localStorage
        const userString = localStorage.getItem("dindin_user")
        if (!userString) {
          toast.error("Usuário não encontrado. Faça login novamente.")
          router.push("/login")
          return
        }

        const user = JSON.parse(userString)
        
        // Buscar contas do usuário
        const userAccounts = await accountService.findAll()
        
        // Filtrando apenas contas do usuário logado (se necessário)
        const filteredAccounts = userAccounts.filter(account => 
          account.client && account.client.id === user.id
        )
        
        setAccounts(filteredAccounts.length > 0 ? filteredAccounts : userAccounts)

        // Usar as categorias fornecidas
        setCategories([
          { id: 1, name: "Salário" },
          { id: 2, name: "Transferência Interna" },
          { id: 3, name: "Compra Online" },
          { id: 4, name: "Reembolso" },
          { id: 5, name: "Pagamento de Conta" }
        ])
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar dados. Tente novamente.")
        
        // Usar contas de exemplo em caso de erro
        setAccounts([
          { id: 1, name: "Conta Principal", balance: 2500.0, institution: "Banco A" },
          { id: 2, name: "Conta Secundária", balance: 1500.0, institution: "Banco B" },
          { id: 3, name: "Conta Poupança", balance: 5000.0, institution: "Banco C" },
          { id: 4, name: "Conta Investimentos", balance: 10000.0, institution: "Banco D" },
          { id: 5, name: "Conta EXPENSEs", balance: 800.0, institution: "Banco E" },
        ])
      }
    }

    loadUserData()
  }, [router])

  // Initialize form with default values
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      type: "REVENUE",
      value: undefined,
      categoryId: undefined,
    },
  })

  // Watch form values for preview
  const watchedValues = form.watch()

  // Get selected account
  const selectedAccount = accounts.find((account) => account.id === Number(watchedValues.accountId))

  // Form submission handler
  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setIsLoading(true)
      
      // Obter o usuário do localStorage
      const userString = localStorage.getItem("dindin_user")
      if (!userString) {
        toast.error("Usuário não encontrado. Faça login novamente.")
        router.push("/login")
        return
      }

      const user = JSON.parse(userString)
      
      // Encontrar a conta selecionada
      const selectedAccount = accounts.find(account => account.id === Number(data.accountId))
      
      if (!selectedAccount) {
        toast.error("Conta não encontrada. Selecione uma conta válida.")
        return
      }

      // Calcular o saldo após a transação
      let balanceAfter = selectedAccount.balance
      if (data.type === "REVENUE") {
        balanceAfter += data.value
      } else if (data.type === "EXPENSE") {
        balanceAfter -= data.value
      }

      // Criar transação no formato esperado pelo backend
      const transactionData = {
        ammount: data.value,
        balanceAfter: balanceAfter,
        type: data.type,
        category: data.categoryId, // Alterado de category para category
        accountId: Number(data.accountId),
        account: {
          id: selectedAccount.id,
          name: selectedAccount.name,
          balance: selectedAccount.balance,
          institution: selectedAccount.institution
        },
        creationDate: data.date.toISOString()
      }

      console.log("Enviando transação:", transactionData)
      
      // Enviar para o serviço
      await transactionService.insert(transactionData)

      toast.success("Transação registrada com sucesso!")
      router.push("/main")
    } catch (error) {
      console.error("Erro ao registrar transação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao registrar transação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Registrar Transação</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-zinc-800/80 border-zinc-700">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Date Field */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col text-white">
                        <FormLabel>Data:</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-zinc-700/50 border-zinc-600",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Selection */}
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col text-white">
                        <FormLabel>Conta:</FormLabel>
                        <CashAccountCombobox 
                          accounts={accounts.map(acc => ({
                            id: String(acc.id),
                            name: acc.name,
                            balance: acc.balance
                          }))} 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Transaction Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="text-white">
                        <FormLabel>Tipo de Transação:</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-zinc-700/50 border-zinc-600">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="REVENUE">Entrada (REVENUE)</SelectItem>
                            <SelectItem value="EXPENSE">Saída (EXPENSE)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category Selection - Renamed from categoryId to categoryId */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="text-white">
                        <FormLabel>Categoria:</FormLabel>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-zinc-700/50 border-zinc-600">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Value Field */}
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem className="text-white">
                      <FormLabel>Valor:</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-8 bg-zinc-700/50 border-zinc-600"
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex justify-center space-x-4 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando..." : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="bg-white text-black">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Relatório de Transação</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Data:</p>
                <div className="h-4 bg-gray-300 rounded w-1/3">
                  {watchedValues.date && (
                    <div className="bg-gray-600 h-full rounded text-xs text-white flex items-center px-2">
                      {format(watchedValues.date, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Categoria:</p>
                <div className="h-4 bg-gray-300 rounded w-2/5">
                  {watchedValues.categoryId && (
                    <div className="bg-blue-600 h-full rounded text-xs text-white flex items-center px-2">
                      {categories.find(c => c.id === watchedValues.categoryId)?.name || 'Categoria'}
                    </div>
                  )}
                </div>
              </div>

              {watchedValues.type === "REVENUE" && (
                <div>
                  <p className="text-sm font-medium mb-1">Valor de Entrada:</p>
                  <div className="h-4 bg-gray-300 rounded w-2/5">
                    {watchedValues.value && (
                      <div className="bg-green-600 h-full rounded text-xs text-white flex items-center px-2">
                        R$ {watchedValues.value.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {watchedValues.type === "EXPENSE" && (
                <div>
                  <p className="text-sm font-medium mb-1">Valor de Saída:</p>
                  <div className="h-4 bg-gray-300 rounded w-2/5">
                    {watchedValues.value && (
                      <div className="bg-red-600 h-full rounded text-xs text-white flex items-center px-2">
                        R$ {watchedValues.value.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Conta:</p>
                <div className="h-4 bg-gray-300 rounded w-2/5">
                  {selectedAccount && (
                    <div className="bg-blue-600 h-full rounded text-xs text-white flex items-center px-2">
                      {selectedAccount.name} - {selectedAccount.institution}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Saldo Disponível:</p>
                <div className="h-4 bg-gray-300 rounded w-2/5">
                  {selectedAccount && (
                    <div className="bg-blue-600 h-full rounded text-xs text-white flex items-center px-2">
                      R$ {selectedAccount.balance.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}