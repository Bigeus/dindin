"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { toast, Toaster } from "sonner"
import { Check, ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

// Importando os serviços
import userService, { User } from "@/services/userService"
import accountService, { Account } from "@/services/accountService"

// Definindo o esquema de validação com Zod
const cashAccountSchema = z.object({
  name: z.string().min(2, "Nome da conta deve ter pelo menos 2 caracteres"),
  initialBalance: z.coerce.number().min(0, "Saldo inicial não pode ser negativo"),
  accountNumber: z.string().min(3, "Número da conta deve ter pelo menos 3 caracteres"),
  institution: z.string().default("Pessoal"), // Adicionado para compatibilidade com a API
})

const userSchema = z.object({
  // Informações do Usuário
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  adress: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres").optional().or(z.literal("")), // Mantido como 'adress' para compatibilidade com a API
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  codUser: z.string().optional(), // Adicionado para compatibilidade com a API

  // Informações da Empresa (não usadas, mas mantidas para compatibilidade com o formulário)
  position: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  department: z.string().min(2, "Departamento deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  registration: z.string().min(2, "Registro deve ter pelo menos 2 caracteres").optional().or(z.literal("")),

  // Contas Caixa
  cashAccounts: z.array(cashAccountSchema).min(1, "Pelo menos uma conta caixa é necessária"),
})

// Inferindo o tipo a partir do esquema
type RegistrationFormValues = z.infer<typeof userSchema>

const RegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Inicializando o formulário com valores padrão
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      phone: "",
      adress: "",
      email: "",
      password: "",
      codUser: "",
      position: "",
      department: "",
      registration: "",
      cashAccounts: [
        {
          name: "",
          initialBalance: 0,
          accountNumber: "",
          institution: "Pessoal",
        },
      ],
    },
  })

  // Usando useFieldArray para lidar com campos dinâmicos
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashAccounts",
  })

  // Função de envio do formulário - Adaptada para usar os serviços
  // Função de envio do formulário corrigida
const onSubmit = async (data: RegistrationFormValues) => {
  setIsSubmitting(true)

  try {
    // Preparando o objeto de usuário para a API
    const userData: User = {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      adress: data.adress || "",
      password: data.password,
      codUser: `USR${Date.now().toString().slice(-6)}`, // Gerando um código de usuário simples
    }

    // 1. Criando o usuário
    const createdUser = await userService.insert(userData)

    if (!createdUser || !createdUser.id) {
      throw new Error("Erro ao criar usuário: ID do usuário não retornado")
    }

    // 2. Criando as contas para o usuário
    const accountPromises = data.cashAccounts.map(async (cashAccount) => {
      // Simplificando a estrutura da conta para corresponder ao JSON que funciona
      const accountData: Account = {
        name: cashAccount.name,
        balance: cashAccount.initialBalance,
        institution: cashAccount.institution || "Pessoal",
        client: {
          id: createdUser.id
        }
      }

      try {
        // Aguardando o resultado de cada criação de conta
        return await accountService.insert(accountData)
      } catch (err) {
        console.error(`Erro ao criar conta ${cashAccount.name}:`, err)
        throw err
      }
    })

    // Aguardando todas as contas serem criadas
    const createdAccounts = await Promise.all(accountPromises)
    console.log("Contas criadas:", createdAccounts)

    toast.success("Usuário e contas cadastrados com sucesso!")
    router.push("/main")
  } catch (error) {
    console.error("Erro ao enviar o formulário:", error)
    toast.error(error instanceof Error ? error.message : "Erro ao cadastrar usuário. Tente novamente.")
  } finally {
    setIsSubmitting(false)
  }
}

  // Função para navegação entre etapas
  const nextStep = async () => {
    if (currentStep === 1) {
      const result = await form.trigger(["name", "email", "password", "phone", "adress"])
      if (result) setCurrentStep(3)
    } else if (currentStep === 2) {
      const result = await form.trigger(["position", "department", "registration"])
      if (result) setCurrentStep(3)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Função para adicionar uma nova conta caixa
  const addCashAccount = () => {
    append({ name: "", initialBalance: 0, accountNumber: "", institution: "Pessoal" })
  }

  // Função para remover uma conta caixa
  const removeCashAccount = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      toast.error("É necessário pelo menos uma conta caixa")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto bg-zinc-800 border-zinc-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-white">Cadastro de Usuário</CardTitle>
          {/* Indicador de etapas */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 1 ? "bg-cyan-600" : "bg-zinc-700"}`}
              >
                {currentStep > 1 ? <Check className="h-5 w-5" /> : "1"}
              </div>
              <div className={`h-1 w-12 ${currentStep >= 2 ? "bg-cyan-600" : "bg-zinc-700"}`}></div>
              <div className={`h-1 w-12 ${currentStep >= 3 ? "bg-cyan-600" : "bg-zinc-700"}`}></div>
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 3 ? "bg-cyan-600" : "bg-zinc-700"}`}
              >
                3
              </div>
              <div className="text-sm text-zinc-400">Passo {currentStep} de 3</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Etapa 1: Informações Pessoais */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="exemplo@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Senha */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Telefone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Endereço */}
                  <FormField
                    control={form.control}
                    name="adress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, nº, cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Etapa 3: Contas Caixa */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4 bg-zinc-700/40">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Conta {index + 1}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCashAccount(index)}
                        >
                          Remover
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`cashAccounts.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Conta Principal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`cashAccounts.${index}.accountNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`cashAccounts.${index}.initialBalance`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Saldo Inicial</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`cashAccounts.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instituição</FormLabel>
                              <FormControl>
                                <Input placeholder="Banco ou Instituição" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addCashAccount}>
                    + Adicionar conta
                  </Button>
                </div>
              )}

              {/* Botões de navegação */}
              <div className="flex justify-between pt-4">
                <div></div>

                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Próximo <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Finalizar Cadastro"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}

export default RegistrationPage