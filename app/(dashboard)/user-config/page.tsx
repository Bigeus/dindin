"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from "axios"
import { toast, Toaster } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MoonLoader } from "react-spinners"
import Loading from "@/components/Loading"

// Define the form schema with zod
const userConfigSchema = z.object({
  // User Information
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres").optional().or(z.literal("")),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),

  // Company Information
  position: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  department: z.string().min(2, "Departamento deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  registration: z.string().min(2, "Registro deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
})

// Infer the type from the schema
type UserConfigFormValues = z.infer<typeof userConfigSchema>

const UserConfigPage = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Controle de loading para dados

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserConfigFormValues>({
    resolver: zodResolver(userConfigSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      position: "",
      department: "",
      registration: "",
    },
  })

  // Form submission handler
  const onSubmit = async (data: UserConfigFormValues) => {
    setIsSaving(true)

    try {
      // If password is empty, remove it from the request
      if (!data.password) {
        const { password, ...dataWithoutPassword } = data
        await axios.put("http://localhost:8080/user-config", dataWithoutPassword)
      } else {
        await axios.put("http://localhost:8080/user-config", data)
      }

      toast("Usuário salvo com sucesso")
    } catch (error) {
      console.error("Error updating user config:", error)
      toast.error("Erro ao salvar as configurações do usuário")
    } finally {
      setIsSaving(false)
    }
  }

  // Simulando dados do usuário que seriam carregados do backend
  const fakeUserData: UserConfigFormValues = {
    name: "João Silva",
    phone: "1234567890",
    address: "Rua Exemplo, 123",
    email: "joao.silva@example.com",
    password: "",
    position: "Desenvolvedor",
    department: "TI",
    registration: "12345",
  };

  useEffect(() => {
    // Simulando um delay de 2 segundos para o fetch dos dados
    const loadUserData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula o delay do backend

      // Preenche os campos com os dados simulados
      setValue("name", fakeUserData.name);
      setValue("phone", fakeUserData.phone);
      setValue("address", fakeUserData.address);
      setValue("email", fakeUserData.email);
      setValue("password", fakeUserData.password); // Não preenche a senha por segurança
      setValue("position", fakeUserData.position);
      setValue("department", fakeUserData.department);
      setValue("registration", fakeUserData.registration);

      console.log("Dados do usuário carregados:", fakeUserData);
      setIsLoading(false); // Dados carregados, esconde o loader
    };

    loadUserData();
  }, [setValue]);

  if (isLoading) {
    return (
     <Loading isLoading={isLoading}/>
    );
  }

  return (
    <Card className="w-full mx-auto bg-zinc-800 border-zinc-700 text-white">
      <Toaster />
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-white">Configurações de usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* INFORMAÇÕES DO USUÁRIO */}
          <div>
            <div className="bg-zinc-700/50 p-2 mb-4 rounded">
              <h3 className="text-lg font-medium">Informações do Usuário</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome:</Label>
                  <Input
                    id="name"
                    placeholder="Insira o nome..."
                    className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                    {...register("name")}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone:</Label>
                  <Input
                    id="phone"
                    placeholder="Insira o número do telefone..."
                    className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                    {...register("phone")}
                    aria-invalid={errors.phone ? "true" : "false"}
                  />
                  {errors.phone && <p className="text-sm text-red-400">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço:</Label>
                  <Input
                    id="address"
                    placeholder="Insira o Endereço..."
                    className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                    {...register("address")}
                    aria-invalid={errors.address ? "true" : "false"}
                  />
                  {errors.address && <p className="text-sm text-red-400">{errors.address.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email:</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Insira o email..."
                    className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha:</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Insira a senha..."
                    className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-700 my-6" />

          {/* INFORMAÇÕES DA EMPRESA */}
          <div>
            <div className="bg-zinc-700/50 p-2 mb-4 rounded">
              <h3 className="text-lg font-medium">Informações da Empresa</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo:</Label>
                <Input
                  id="position"
                  placeholder="Insira o Cargo..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                  {...register("position")}
                  aria-invalid={errors.position ? "true" : "false"}
                />
                {errors.position && <p className="text-sm text-red-400">{errors.position.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento:</Label>
                <Input
                  id="department"
                  placeholder="Insira o departamento..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                  {...register("department")}
                  aria-invalid={errors.department ? "true" : "false"}
                />
                {errors.department && <p className="text-sm text-red-400">{errors.department.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="registration">Registro de Usuário:</Label>
                <Input
                  id="registration"
                  placeholder="Insira o código ID..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                  {...register("registration")}
                  aria-invalid={errors.registration ? "true" : "false"}
                />
                {errors.registration && <p className="text-sm text-red-400">{errors.registration.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-4">
            <div className="text-green-400 text-sm mr-auto">{isSaving ? "Salvando..." : ""}</div>
            <Button type="submit" disabled={isSaving} className="bg-green-700 hover:bg-green-800 text-white">
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default UserConfigPage
