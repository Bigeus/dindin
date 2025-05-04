"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast, Toaster } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Loading from "@/components/Loading"
import userService from "@/services/userService"

// Define the form schema with zod
const userConfigSchema = z.object({
  // User Information
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  adress: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres").optional().or(z.literal("")), // Note: API uses "adress" not "address"
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
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)

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
      adress: "",
      email: "",
      password: "",
      position: "",
      department: "",
      registration: "",
    },
  })

  // Form submission handler
  const onSubmit = async (data: UserConfigFormValues) => {
    if (!userId) {
      toast.error("ID do usuário não encontrado")
      return
    }

    setIsSaving(true)

    try {
      // Prepare data for update - map the form fields to API fields
      const updateData: any = {
        name: data.name,
        phone: data.phone,
        adress: data.adress, // Note: API uses "adress" not "address"
        email: data.email,
      }

      // Only include password if it's provided
      if (data.password) {
        updateData.password = data.password
      }

      // Add company-related information as metadata or custom fields if your API supports it
      // This would depend on your backend API structure
      
      // Update user in API
      const updatedUser = await userService.update(userId, updateData)
      
      // Get current user data from localStorage
      const storedUserString = localStorage.getItem("dindin_user")
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString)
        
        // Create a new object with updated values, preserving other fields
        const updatedStoredUser = { 
          ...storedUser,
          name: updatedUser.name,
          phone: updatedUser.phone,
          adress: updatedUser.adress,
          email: updatedUser.email
        }
        
        // Save updated user back to localStorage
        localStorage.setItem("dindin_user", JSON.stringify(updatedStoredUser))
        console.log("User data updated in localStorage:", updatedStoredUser)
      }
      
      toast.success("Usuário atualizado com sucesso")
    } catch (error) {
      console.error("Error updating user config:", error)
      toast.error("Erro ao salvar as configurações do usuário")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem("dindin_user")
        if (!storedUser) {
          toast.error("Usuário não encontrado")
          setIsLoading(false)
          return
        }

        const user = JSON.parse(storedUser)
        
        if (!user.id) {
          toast.error("ID do usuário não encontrado")
          setIsLoading(false)
          return
        }

        setUserId(user.id)

        // Fetch fresh user data from API
        const userData = await userService.findById(user.id)
        
        // Populate form with user data
        setValue("name", userData.name || "")
        setValue("phone", userData.phone || "")
        setValue("adress", userData.adress || "") // Note: API uses "adress" not "address"
        setValue("email", userData.email || "")
        // Don't set password for security reasons
        
        // Set company information if available
        // These fields might not be directly on the user object in your API
        // You might need to adjust this based on your actual data structure
        setValue("registration", userData.codUser || "")

        console.log("User data loaded successfully")
      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Erro ao carregar dados do usuário")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [setValue])

  if (isLoading) {
    return <Loading isLoading={isLoading} />
  }

  return (
    <Card className="w-full mx-auto bg-zinc-800 border-zinc-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-white">Configurações de usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* INFORMAÇÕES DO USUÁRIO */}
          <div>
           {/*  <div className="bg-zinc-700/50 p-2 mb-4 rounded">
              <h3 className="text-lg font-medium">Informações do Usuário</h3>
            </div> */}

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
                  <Label htmlFor="adress">Endereço:</Label>
                  <Input
                    id="adress"
                    placeholder="Insira o Endereço..."
                    className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                    {...register("adress")}
                    aria-invalid={errors.adress ? "true" : "false"}
                  />
                  {errors.adress && <p className="text-sm text-red-400">{errors.adress.message}</p>}
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
                  <p className="text-xs text-zinc-400">Deixe em branco para manter a senha atual</p>
                  {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-700 my-6" />

          {/* INFORMAÇÕES DA EMPRESA */}
          <div>
           {/*  <div className="bg-zinc-700/50 p-2 mb-4 rounded">
              <h3 className="text-lg font-medium">Informações da Empresa</h3>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div className="space-y-2">
                <Label htmlFor="position">Cargo:</Label>
                <Input
                  id="position"
                  placeholder="Insira o Cargo..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                  {...register("position")}
                  aria-invalid={errors.position ? "true" : "false"}
                />
                {errors.position && <p className="text-sm text-red-400">{errors.position.message}</p>}
              </div> */}

             {/*  <div className="space-y-2">
                <Label htmlFor="department">Departamento:</Label>
                <Input
                  id="department"
                  placeholder="Insira o departamento..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                  {...register("department")}
                  aria-invalid={errors.department ? "true" : "false"}
                />
                {errors.department && <p className="text-sm text-red-400">{errors.department.message}</p>}
              </div> */}

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
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default UserConfigPage