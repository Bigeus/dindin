"use client"

import type React from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CandlestickChartIcon, Briefcase, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast, Toaster } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import logo from "../public/cashLogo.png"
import { hashPassword } from "@/lib/hash"
import userService from "@/services/userService"

// Define the form schema with zod
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

// Infer the type from the schema
type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  /* const { login } = useAuth() */

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Função para autenticar o usuário com o serviço
  const loginUser = async (email: string, password: string) => {
    try {
      // Hash da senha antes de enviar para verificação
      const hashedPassword = await hashPassword(password)
      
      // Tentando encontrar o usuário pelo email
      const users = await userService.findAll()
      const user = users.find(u => u.email === email)
      
      if (!user) {
        throw new Error("Usuário não encontrado")
      }
      
      // Verificando se a senha está correta
      if (user.password !== hashedPassword) {
        throw new Error("Senha incorreta")
      }
      
      // Se chegou aqui, o usuário existe e a senha está correta
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        adress: user.adress, // Mantendo o mesmo nome de campo da API
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      throw error
    }
  }

  // Form submission handler
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
  
    try {
      // Usando a função de login implementada
      const user = await loginUser(data.email, data.password)
  
      // Mantendo o token fake conforme solicitado
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
      // Armazena dados localmente
      localStorage.setItem("dindin_user", JSON.stringify(user))
      document.cookie = `dindin_auth_token=${fakeToken}; path=/; max-age=${60 * 60 * 24 * 7}`
  
      toast.success("Login realizado com sucesso!\nVocê será redirecionado em instantes.")
  
      setTimeout(() => {
        router.push("/main")
      }, 1500)
    } catch (error: any) {
      console.error("Erro no login:", error)
      toast.error("Email ou senha inválidos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex items-center justify-center rounded-md">
                <Image alt="CashChegô Logo" src={logo} height={200} width={200}/>
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">DinDin company.</h1>
            <div className="text-center text-sm">
              Não possui uma conta?{" "}
              <Link href={"/registration"} className="underline underline-offset-4">
                Fazer cadastro
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="*******"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">Ou</span>
          </div>
          <div className="justify-center">
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={() => {
                toast.message("Erro ao fazer login", {
                  description: "Login com Google não implementado ainda.",
                })
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Clicando em continue você estará aceitando nossos <a href="#">Termos de Serviço</a> e nossas{" "}
        <a href="#">Políticas de Privacidade</a>.
      </div>
    </div>
  )
}