import { Progress } from "@/components/ui/progress";
import MainLayout from "../layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Saldo Total */}
      <div className="lg:col-span-2 bg-zinc-800 rounded-lg p-4">
        {/* <div className="flex items-center gap-2">
          <h2 className="text-xl">Transações</h2>
          <span className="text-zinc-400 text-sm">11/10/2024</span>
        </div> */}
        <div className="mb-4">
          <span className="text-zinc-400">Saldo Total: R$</span>
          <h2 className="text-5xl font-bold">3.298,66</h2>
        </div>

        <div className="mt-8">
          <h3 className="text-xl mb-4">Transações Recentes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            {[
              { date: "10/10/24", entrada: "+100,00", saida: "-50,00" },
              { date: "09/10/24", entrada: "+200,00", saida: "-65,00" },
              { date: "08/10/24", entrada: "+150,00", saida: "-20,00" },
              { date: "07/10/24", entrada: "+300,00", saida: "-100,00" },
            ].map((item, index) => (
              <div key={index} className="bg-zinc-700 rounded-lg p-3">
                <div className="text-sm font-medium">{item.date}</div>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-xs">Entrada:</span>
                    <span className="text-green-500 text-xs">{item.entrada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Saída:</span>
                    <span className="text-red-500 text-xs">{item.saida}</span>
                  </div>
                  <div className="text-xs mt-1">
                    <span>Protocolo:</span>
                    <div className="text-zinc-400 text-[10px] truncate">00{index}abcdefghijklmnop</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* BOOTOM HALF */}
          <div className="min-w-full flex flex-row justify-center gap-3">
            <Card className="p-0 w-2/3 bg-zinc-700 text-white border-none">
              <h3>Histórico</h3>
              <ScrollArea className="h-[200px] pe-3 ps-1" style={{scrollbarColor: "white"}} type="always">
                <Card className="bg-green-700 h-5 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-red-400 h-5 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-green-700 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-red-400 h-5 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-green-700 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-red-400 h-5 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-green-700 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-red-400 h-5 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-green-700 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-red-400 h-5 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-green-700 rounded-md">
                  Nota 007-09
                </Card>
                <Card className="bg-red-400 h-5 rounded-md">
                  Nota 007-09
                </Card>
              </ScrollArea>
            </Card>
            <Card className="w-1/3 bg-zinc-700 text-white border-none">
              <h3>Registrar Transação</h3>
              <Button color="green">Iniciar</Button>
            </Card>
          </div>
        </div>
      </div >

      {/* Right side panels */}
      < div className="flex flex-col gap-4" >
        {/* Comandos rápidos */}
        < div className="bg-zinc-800 rounded-lg p-4" >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
              <span className="text-xs">🔍</span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pergunte Aqui..."
                className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            {[
              "Hi Hanna! Exiba o relatório de vendas.",
              "Hi Hanna! Crie uma lista das tarefas do dia.",
              "Hi Hanna! Crie uma Tabela de clientes.",
              "Hi Hanna! Vá para as configurações.",
              "Hi Hanna! Editar usuário.",
            ].map((cmd, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-700 rounded-lg px-3 py-2">
                <span className="text-sm">{cmd}</span>
                <span className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs">?</span>
              </div>
            ))}
          </div>
        </div >

        {/* Indicadores */}
        < div className="bg-green-900/30 rounded-lg p-4" >
          <h3 className="text-xl">Nível de Saldo Diário: Médio</h3>
        </div >

        <Progress className="h-6" value={50} />

        <div className="bg-red-900/30 rounded-lg p-4">
          <h3 className="text-xl">Alerta de Saldo: Risco Baixo</h3>
        </div>
      </div >
    </div >

  )
}

