"use client"

import type React from "react"

import { useState } from "react"
import { Menu, User, Settings, LogOut, Bell, Cog } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import logo from '../../../public/hannaLogo.png';

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [expanded, setExpanded] = useState(false)

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
        <div className=" border-b border-zinc-700 flex justify-center items-center align-middle">
          {/* {expanded ? (
                        
                        <Image alt="logo" src={logo} height={40}/>
                    ) : (
                    
                    )} */}
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
          <NavItem icon={<LogOut />} label="Sair" expanded={expanded} />
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
    </div>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  expanded: boolean
}

function NavItem({ icon, label, expanded }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn("flex justify-start gap-4 hover:bg-zinc-700", expanded ? "px-4" : "px-0 justify-center")}
    >
      {icon}
      {expanded && <span>{label}</span>}
    </Button>
  )
}

