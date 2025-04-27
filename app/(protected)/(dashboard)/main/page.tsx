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

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

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

  // Transaction data
  const transactions = [
    { date: "10/10/24", entrada: "+100,00", saida: "-50,00" },
    { date: "09/10/24", entrada: "+200,00", saida: "-65,00" },
    { date: "08/10/24", entrada: "+150,00", saida: "-20,00" },
    { date: "07/10/24", entrada: "+300,00", saida: "-100,00" },
  ]

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
                <p className="text-2xl font-bold">R$ 5.250,00</p>
                <p className="text-sm text-green-400">+12% em relação ao mês anterior</p>
              </div>
              
              <div className="bg-zinc-700 p-4 rounded-lg">
                <h3 className="font-medium text-red-400">Despesas</h3>
                <p className="text-2xl font-bold">R$ 2.980,00</p>
                <p className="text-sm text-red-400">+5% em relação ao mês anterior</p>
              </div>
              
              <div className="bg-zinc-700 p-4 rounded-lg">
                <h3 className="font-medium">Saldo Final</h3>
                <p className="text-2xl font-bold text-blue-400">R$ 2.270,00</p>
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
        <div className="mb-4">
          <span className="text-zinc-400">Saldo Total: R$</span>
          <h2 className="text-5xl font-bold">3.298,66</h2>
        </div>

        <div className="mt-8">
          <h3 className="text-xl mb-4">Transações Recentes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            {transactions.map((transaction, index) => (
              <TransactionCard
                key={index}
                date={transaction.date}
                entrada={transaction.entrada}
                saida={transaction.saida}
                index={index}
              />
            ))}
          </div>
          {/* BOTTOM HALF */}
          <div className="min-w-full flex flex-row justify-center gap-3">
            <Card className="p-0 w-full bg-zinc-700 text-white border-none">
              <h3 className="ms-3">Histórico</h3>
              <ScrollArea className="h-[200px] pe-3 ps-1" style={{ scrollbarColor: "white" }} type="always">
                <Card className="bg-green-700 h-5 rounded-md">Nota 007-09</Card>
                <Card className="bg-red-400 h-5 rounded-md">Nota 007-09</Card>
                <Card className="bg-green-700 rounded-md">Nota 007-09</Card>
                <Card className="bg-red-400 h-5 rounded-md">Nota 007-09</Card>
                <Card className="bg-green-700 rounded-md">Nota 007-09</Card>
                <Card className="bg-red-400 h-5 rounded-md">Nota 007-09</Card>
                <Card className="bg-green-700 rounded-md">Nota 007-09</Card>
                <Card className="bg-red-400 h-5 rounded-md">Nota 007-09</Card>
                <Card className="bg-green-700 rounded-md">Nota 007-09</Card>
                <Card className="bg-red-400 h-5 rounded-md">Nota 007-09</Card>
                <Card className="bg-green-700 rounded-md">Nota 007-09</Card>
                <Card className="bg-red-400 h-5 rounded-md">Nota 007-09</Card>
              </ScrollArea>
            </Card>
          </div>
        </div>
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
          {/* Green Progress Indicator */}
          <div className="flex pb-3">
            <ProgressIndicator value={50} variant="green" />
          </div>
          {/* Red Progress Indicator */}
          <div className="flex">
            <ProgressIndicator value={35} variant="red" />
          </div>
        </div>
      </div>
    </div>
  )
}