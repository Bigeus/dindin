"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import axios from "axios"
import { toast, Toaster } from "sonner"
import { Check, ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

// Define the form schema with zod
const cashAccountSchema = z.object({
  name: z.string().min(2, "Nome da conta deve ter pelo menos 2 caracteres"),
  initialBalance: z.coerce.number().min(0, "Saldo inicial não pode ser negativo"),
  accountNumber: z.string().min(3, "Número da conta deve ter pelo menos 3 caracteres"),
})

const userSchema = z.object({
  // User Information
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres").optional().or(z.literal("")),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),

  // Company Information
  position: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  department: z.string().min(2, "Departamento deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  registration: z.string().min(2, "Registro deve ter pelo menos 2 caracteres").optional().or(z.literal("")),

  // Cash Account
  cashAccounts: z.array(cashAccountSchema).min(1, "Pelo menos uma conta caixa é necessária"),
})

// Infer the type from the schema
type RegistrationFormValues = z.infer<typeof userSchema>

const RegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Initialize form with default values
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      position: "",
      department: "",
      registration: "",
      cashAccounts: [
        {
          name: "",
          initialBalance: 0,
          accountNumber: "",
        },
      ],
    },
  })

  // Use fieldArray to properly handle dynamic form fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashAccounts",
  })

  // Real submission handler
  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true)

    try {
        // TODO: ESCONDER ESSA URL DEPOIS COM .ENV
        // TROCAR PARA A URL CORRETA
      const response = await axios.post("http://localhost:8080/create-user", data)
      toast.success("Usuário cadastrado com sucesso!")
      console.log("Submission successful:", response.data)
      router.push("/main")
    } catch (error) {
        console.error("Error submitting form:", error)
        toast.error("Erro ao cadastrar usuário. Tente novamente.")
    } finally {
        setIsSubmitting(false)
    }
}

// Fake submission for testing
const fakeOnSubmit = (data: RegistrationFormValues) => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
        console.log("Form data submitted (fake):", data)
        toast.success("Usuário cadastrado com sucesso! (Modo de teste)")
        router.push("/main")
      setIsSubmitting(false)
    }, 1500)
  }

  // Navigation between steps
  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate user information fields before proceeding
      const result = await form.trigger(["name", "email", "password", "phone", "address"])

      if (result) setCurrentStep(2)
    } else if (currentStep === 2) {
      // Validate company information fields before proceeding
      const result = await form.trigger(["position", "department", "registration"])

      if (result) setCurrentStep(3)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Add another cash account
  const addCashAccount = () => {
    append({ name: "", initialBalance: 0, accountNumber: "" })
  }

  // Remove a cash account
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
        <Toaster />
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-white">Cadastro de Usuário</CardTitle>

          {/* Step indicator */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 1 ? "bg-cyan-600" : "bg-zinc-700"}`}
              >
                {currentStep > 1 ? <Check className="h-5 w-5" /> : "1"}
              </div>
              <div className={`h-1 w-12 ${currentStep >= 2 ? "bg-cyan-600" : "bg-zinc-700"}`}></div>
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 2 ? "bg-cyan-600" : "bg-zinc-700"}`}
              >
                {currentStep > 2 ? <Check className="h-5 w-5" /> : "2"}
              </div>
              <div className={`h-1 w-12 ${currentStep >= 3 ? "bg-cyan-600" : "bg-zinc-700"}`}></div>
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 3 ? "bg-cyan-600" : "bg-zinc-700"}`}
              >
                3
              </div>
            </div>
            <div className="text-sm text-zinc-400">Passo {currentStep} de 3</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: User Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-zinc-700/50 p-2 mb-4 rounded">
                    <h3 className="text-lg font-medium">Informações Pessoais</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Insira seu nome completo"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="******"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rua, número, bairro, cidade"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Company Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-zinc-700/50 p-2 mb-4 rounded">
                    <h3 className="text-lg font-medium">Informações da Empresa</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Seu cargo na empresa"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Seu departamento"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registration"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Registro de Usuário</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Código de registro"
                              className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Cash Accounts */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-zinc-700/50 p-2 mb-4 rounded">
                    <h3 className="text-lg font-medium">Contas Caixa</h3>
                    <p className="text-sm text-zinc-400 mt-1">Adicione pelo menos uma conta caixa</p>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 border border-zinc-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Conta {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCashAccount(index)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`cashAccounts.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Conta</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Conta Principal"
                                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cashAccounts.${index}.accountNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número da Conta</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 12345"
                                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cashAccounts.${index}.initialBalance`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Saldo Inicial</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-zinc-400">
                                Valor inicial disponível nesta conta
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-zinc-600 bg-zinc-700/50 hover:bg-zinc-700 text-white"
                    onClick={addCashAccount}
                  >
                    + Adicionar outra conta
                  </Button>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-zinc-600 bg-zinc-700/50 hover:bg-zinc-700 text-white"
                >
                  Voltar
                </Button>

                <div className="flex gap-2">
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      Próximo
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        onClick={() => form.handleSubmit(fakeOnSubmit)()}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando
                          </>
                        ) : (
                          "Testar Envio"
                        )}
                      </Button>

                      <Button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando
                          </>
                        ) : (
                          "Finalizar Cadastro"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegistrationPage

