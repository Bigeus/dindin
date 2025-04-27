'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import Link from "next/link"

export default function FinancialReports() {
  // Estado para armazenar a conta selecionada
  const [selectedAccount, setSelectedAccount] = useState(1)
  
  // Dados detalhados para o relatório mensal (simulando dados de transações)
  const monthlyData = [
    { date: "01/10/24", type: "REVENUE", valor: 200, saldo: 200, idDaConta: 1 },
    { date: "02/10/24", type: "EXPENSE", valor: 50, saldo: 150, idDaConta: 1 },
    { date: "05/10/24", type: "REVENUE", valor: 300, saldo: 450, idDaConta: 1 },
    { date: "07/10/24", type: "EXPENSE", valor: 100, saldo: 350, idDaConta: 1 },
    { date: "08/10/24", type: "REVENUE", valor: 150, saldo: 500, idDaConta: 1 },
    { date: "09/10/24", type: "EXPENSE", valor: 65, saldo: 435, idDaConta: 1 },
    { date: "10/10/24", type: "REVENUE", valor: 100, saldo: 535, idDaConta: 1 },
    { date: "12/10/24", type: "EXPENSE", valor: 80, saldo: 455, idDaConta: 1 },
    { date: "15/10/24", type: "REVENUE", valor: 250, saldo: 705, idDaConta: 1 },
    { date: "18/10/24", type: "EXPENSE", valor: 120, saldo: 585, idDaConta: 1 },
    { date: "20/10/24", type: "REVENUE", valor: 180, saldo: 765, idDaConta: 1 },
    { date: "22/10/24", type: "EXPENSE", valor: 90, saldo: 675, idDaConta: 1 },
    { date: "25/10/24", type: "REVENUE", valor: 220, saldo: 895, idDaConta: 1 },
    { date: "28/10/24", type: "EXPENSE", valor: 70, saldo: 825, idDaConta: 1 },
    { date: "30/10/24", type: "REVENUE", valor: 190, saldo: 1015, idDaConta: 1 },
    
    // Conta 2
    { date: "03/10/24", type: "REVENUE", valor: 300, saldo: 300, idDaConta: 2 },
    { date: "06/10/24", type: "EXPENSE", valor: 120, saldo: 180, idDaConta: 2 },
    { date: "10/10/24", type: "REVENUE", valor: 250, saldo: 430, idDaConta: 2 },
    { date: "15/10/24", type: "EXPENSE", valor: 80, saldo: 350, idDaConta: 2 },
    { date: "20/10/24", type: "REVENUE", valor: 400, saldo: 750, idDaConta: 2 },
    { date: "25/10/24", type: "EXPENSE", valor: 150, saldo: 600, idDaConta: 2 },
  ]

  // Filtrar dados pela conta selecionada
  const filteredData = monthlyData.filter(item => item.idDaConta === selectedAccount)
  
  // Dados para o gráfico de pizza (distribuição de despesas vs receitas)
  const pieChartData = [
    { name: 'Receitas', value: filteredData.filter(item => item.type === "REVENUE").reduce((sum, item) => sum + item.valor, 0) },
    { name: 'Despesas', value: filteredData.filter(item => item.type === "EXPENSE").reduce((sum, item) => sum + item.valor, 0) }
  ]
  
  // Cores para o gráfico de pizza
  const COLORS = ['#22c55e', '#ef4444']

  // Dados agrupados por semana para o gráfico de barras
  const getWeekNumber = (date: string) => {
    const d = new Date(date.split('/').reverse().join('-'))
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1)
    return Math.ceil((((d - firstDay) / 86400000) + firstDay.getDay() + 1) / 7)
  }

  const weeklyData = filteredData.reduce((acc, item) => {
    const week = getWeekNumber(item.date)
    if (!acc[week]) {
      acc[week] = { 
        week: `Semana ${week}`, 
        receitas: 0, 
        despesas: 0 
      }
    }
    
    if (item.type === "REVENUE") {
      acc[week].receitas += item.valor
    } else {
      acc[week].despesas += item.valor
    }
    
    return acc
  }, {})
  
  const barChartData = Object.values(weeklyData)

  // Dados para o gráfico de saldo acumulado
  const cumulativeBalanceData = filteredData
    .sort((a, b) => {
      // Ordenar por data
      const dateA = new Date(a.date.split('/').reverse().join('-'))
      const dateB = new Date(b.date.split('/').reverse().join('-'))
      return dateA - dateB
    })
    .map((item, index, array) => {
      // Para cada ponto, criar um objeto com a data e o saldo
      return {
        date: item.date,
        saldo: item.saldo
      }
    })

  return (
    <div className="container mx-auto py-6 px-4 bg-zinc-600">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatório Financeiro</h1>
          <p className="text-zinc-400">Análise detalhada das suas finanças - Outubro 2024</p>
        </div>
        <Link href="/main">
          <Button variant="default" className="text-white">Voltar ao Dashboard</Button>
        </Link>
      </div>

    {/*   <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Selecione a Conta</h2>
        <div className="flex gap-2">
          <Button 
            variant={selectedAccount === 1 ? "default" : "outline"} 
            onClick={() => setSelectedAccount(1)}
            className={selectedAccount === 1 ? "bg-blue-600" : "text-white"}
          >
            Conta Principal
          </Button>
          <Button 
            variant={selectedAccount === 2 ? "default" : "outline"} 
            onClick={() => setSelectedAccount(2)}
            className={selectedAccount === 2 ? "bg-blue-600" : "text-white"}
          >
            Conta Secundária
          </Button>
        </div>
      </div> */}

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-800 p-4 border-none">
          <h3 className="text-zinc-400 text-sm mb-1">Total Receitas</h3>
          <p className="text-green-500 text-2xl font-bold">
            R$ {pieChartData[0].value.toFixed(2)}
          </p>
        </Card>
        <Card className="bg-zinc-800 p-4 border-none">
          <h3 className="text-zinc-400 text-sm mb-1">Total Despesas</h3>
          <p className="text-red-500 text-2xl font-bold">
            R$ {pieChartData[1].value.toFixed(2)}
          </p>
        </Card>
        <Card className="bg-zinc-800 p-4 border-none">
          <h3 className="text-zinc-400 text-sm mb-1">Saldo Atual</h3>
          <p className="text-blue-500 text-2xl font-bold">
            R$ {(filteredData.length > 0 ? filteredData[filteredData.length - 1].saldo : 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Tabs com gráficos */}
      <Tabs defaultValue="fluxo" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
          <TabsTrigger value="semanal">Análise Semanal</TabsTrigger>
          <TabsTrigger value="saldo">Saldo Acumulado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fluxo" className="p-4 bg-zinc-800 rounded-md mt-4">
          <h3 className="text-lg mb-4 text-white">Fluxo de Caixa - Entradas e Saídas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#333",
                    border: "1px solid #555",
                    color: "#fff"
                  }}
                  formatter={(value, name) => [`R$ ${value}`, name]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke={(d: { type: string }) => d.type === "REVENUE" ? "#22c55e" : "#ef4444"} 
                  name="Valor da Transação"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="distribuicao" className="p-4 bg-zinc-800 rounded-md mt-4">
          <h3 className="text-lg mb-4 text-white">Distribuição de Receitas e Despesas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `R$ ${value}`}
                  contentStyle={{
                    backgroundColor: "#333",
                    border: "1px solid #555",
                    color: "#fff"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="semanal" className="p-4 bg-zinc-800 rounded-md mt-4">
          <h3 className="text-lg mb-4 text-white">Análise Semanal de Transações</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="week" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#333",
                    border: "1px solid #555",
                    color: "#fff"
                  }}
                  formatter={(value) => `R$ ${value}`}
                />
                <Legend />
                <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="saldo" className="p-4 bg-zinc-800 rounded-md mt-4">
          <h3 className="text-lg mb-4 text-white">Evolução do Saldo Acumulado</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cumulativeBalanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#333",
                    border: "1px solid #555",
                    color: "#fff"
                  }}
                  formatter={(value) => `R$ ${value}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Saldo"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tabela de transações */}
      <Card className="mt-6 bg-zinc-800 border-none p-4">
        <h3 className="text-lg mb-4 text-white">Detalhamento de Transações</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-zinc-300">
            <thead className="text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filteredData
                .sort((a, b) => {
                  // Ordenar por data (mais recente primeiro)
                  const dateA = new Date(a.date.split('/').reverse().join('-'))
                  const dateB = new Date(b.date.split('/').reverse().join('-'))
                  return dateB - dateA
                })
                .map((transaction, index) => (
                  <tr key={index} className="border-b border-zinc-700">
                    <td className="py-3 px-4">{transaction.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === "REVENUE" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                      }`}>
                        {transaction.type === "REVENUE" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${
                      transaction.type === "REVENUE" ? "text-green-400" : "text-red-400"
                    }`}>
                      {transaction.type === "REVENUE" ? "+" : "-"}R$ {transaction.valor.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-blue-400">R$ {transaction.saldo.toFixed(2)}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}