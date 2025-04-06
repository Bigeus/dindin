"use client"

import type React from "react"
import { useState } from "react"
import { Menu, User, Settings, LogOut, Bell, Cog } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import logo from '../../../public/hannaLogo.png'
import { useRouter } from "next/navigation"

// Importando os componentes de modal do Shadcn
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTitle
} from "@/components/ui/dialog"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [expanded, setExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para controlar a abertura do modal
  const router = useRouter()

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

  const handleLogoutClick = () => {
    setIsModalOpen(true) // Abre o modal quando o botão de logout for clicado
  }

  const handleConfirmLogout = () => {
    eraseUserStorage() // Chama a função para apagar dados e redirecionar
    setIsModalOpen(false) // Fecha o modal após confirmar
  }

  const handleCancelLogout = () => {
    setIsModalOpen(false) // Apenas fecha o modal se o usuário cancelar
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* LEFT NAVBAR */}
      <div
        className={cn(
          "flex flex-col h-full bg-zinc-800 transition-all duration-300 border-r border-zinc-700 items-center",
          expanded ? "w-64" : "w-16",
        )}
      >
        {/* Logo area */}
        <div className="border-b border-zinc-700 flex justify-center items-center align-middle">
          <Link href={'/main'} className="pb-4">
            <Image alt="logo" src={logo} />
          </Link>
        </div>

        {/* Hamburger menu */}
        <Button variant="ghost" size="icon" className="m-2 hover:bg-zinc-700" onClick={() => setExpanded(!expanded)}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Navigation items */}
        <div className="flex flex-col flex-1 py-4 gap-2">
          <NavItem icon={<Bell />} label="Notificações" expanded={expanded} />
          <NavItem icon={<Cog />} label="Configurações" expanded={expanded} />
        </div>

        {/* Bottom items */}
        <div className="flex flex-col gap-2 p-2 border-t border-zinc-700 pt-4 pb-4">
          <Link href={'/user-config'}>
            <NavItem icon={<User />} label="Perfil" expanded={expanded} />
          </Link>
          <NavItem icon={<Settings />} label="Configurações" expanded={expanded} />
          {/* Navegação para logout com modal de confirmação */}
          <NavItem icon={<LogOut />} label="Sair" expanded={expanded} onClick={handleLogoutClick} />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* BIG PAGE TITLE HEADER */}
        <header className="h-20 border-b border-zinc-800 p-4 flex items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Olá Usuário!</h1>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>

      {/* Modal de Confirmação de Logout */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Logout</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Tem certeza de que deseja sair? Todos os dados serão apagados.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLogout}>Cancelar</Button>
            <Button className="ml-2" onClick={handleConfirmLogout}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  expanded: boolean
  onClick?: () => void
}

function NavItem({ icon, label, expanded, onClick }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn("flex justify-start gap-4 hover:bg-zinc-700", expanded ? "px-4" : "px-0 justify-center")}
      onClick={onClick}
    >
      {icon}
      {expanded && <span>{label}</span>}
    </Button>
  )
}
