"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CashAccountCombobox } from "@/components/cash-account-combobox"

// Define the form schema with zod
const transactionSchema = z.object({
  date: z.date({
    required_error: "A data é obrigatória",
  }),
  accountId: z.string({
    required_error: "A conta é obrigatória",
  }),
  type: z.enum(["entrada", "saida"], {
    required_error: "O tipo de transação é obrigatório",
  }),
  value: z.coerce
    .number({
      required_error: "O valor é obrigatório",
      invalid_type_error: "O valor deve ser um número",
    })
    .positive("O valor deve ser positivo"),
  description: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
  responsible: z.string().min(2, "O responsável deve ter pelo menos 2 caracteres"),
  attachmentName: z.string().optional(),
})

// Infer the type from the schema
type TransactionFormValues = z.infer<typeof transactionSchema>

export default function RegisterTransactionPage() {
  const [attachment, setAttachment] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Fake cash accounts data
  const cashAccounts = [
    { id: "1", name: "Conta Principal", balance: 2500.0 },
    { id: "2", name: "Conta Secundária", balance: 1500.0 },
    { id: "3", name: "Conta Poupança", balance: 5000.0 },
    { id: "4", name: "Conta Investimentos", balance: 10000.0 },
    { id: "5", name: "Conta Despesas", balance: 800.0 },
  ]

  // Initialize form with default values
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      type: "entrada",
      value: undefined,
      description: "",
      responsible: "",
      attachmentName: "",
    },
  })

  // Watch form values for preview
  const watchedValues = form.watch()

  // Get selected account
  const selectedAccount = cashAccounts.find((account) => account.id === watchedValues.accountId)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setAttachment(file)
      form.setValue("attachmentName", file.name)

      // Create a preview URL for image files
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  // Form submission handler
  const onSubmit = (data: TransactionFormValues) => {
    // Here you would typically send the data to your API
    console.log("Form submitted:", data)
    console.log("Attachment:", attachment)

    // For demo purposes, show an alert
    alert("Transação registrada com sucesso!")
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
                        <CashAccountCombobox accounts={cashAccounts} value={field.value} onChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Transaction Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3 text-white">
                      <FormLabel>Tipo de Transação:</FormLabel>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            value="entrada"
                            checked={field.value === "entrada"}
                            onChange={() => field.onChange("entrada")}
                            className="form-radio h-4 w-4 text-green-600"
                          />
                          <span className="text-white">Entrada</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            value="saida"
                            checked={field.value === "saida"}
                            onChange={() => field.onChange("saida")}
                            className="form-radio h-4 w-4 text-red-600"
                          />
                          <span className="text-white">Saída</span>
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="text-white">
                      <FormLabel>Descrição:</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite uma breve descrição..."
                          className="resize-none h-24 bg-zinc-700/50 border-zinc-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Attachment Field */}
                <div className="space-y-2">
                  <Label htmlFor="attachment" className="text-white">Anexar Nota:</Label>
                  <div className="flex">
                    <Input
                      id="attachment"
                      type="text"
                      readOnly
                      placeholder="Anexe a Nota fiscal"
                      value={attachment?.name || ""}
                      className="bg-zinc-700/50 border-zinc-600 rounded-r-none"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="flex items-center justify-center px-4 border border-l-0 border-zinc-600 bg-zinc-700 rounded-r-md cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                  </div>
                </div>

                {/* Responsible Field */}
                <FormField
                  control={form.control}
                  name="responsible"
                  render={({ field }) => (
                    <FormItem className="text-white">
                      <FormLabel>Responsável:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome do Responsável do registro..."
                          className="bg-zinc-700/50 border-zinc-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex justify-center space-x-4 pt-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    Criar
                  </Button>
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="border-zinc-600 bg-zinc-700 hover:bg-zinc-600 text-white px-8"
                    onClick={() => form.reset()}
                  >
                    Cancelar
                  </Button> */}
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

              {watchedValues.type === "entrada" && (
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

              {watchedValues.type === "saida" && (
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
                <p className="text-sm font-medium mb-1">Descrição:</p>
                <div className="space-y-1">
                  {watchedValues.description ? (
                    watchedValues.description.split("\n").map((line, i) => (
                      <div key={i} className="h-4 bg-gray-600 rounded w-full">
                        <div className="text-xs text-white px-2">{line || " "}</div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Nota anexada:</p>
                {attachment ? (
                  previewUrl ? (
                    <div className="border border-gray-300 rounded p-2 max-w-xs">
                      <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="max-h-32 mx-auto" />
                    </div>
                  ) : (
                    <div className="h-4 bg-gray-600 rounded w-1/2">
                      <div className="text-xs text-white px-2">{attachment.name}</div>
                    </div>
                  )
                ) : (
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Responsável:</p>
                <div className="h-4 bg-gray-300 rounded w-3/5">
                  {watchedValues.responsible && (
                    <div className="bg-gray-600 h-full rounded text-xs text-white flex items-center px-2">
                      {watchedValues.responsible}
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

