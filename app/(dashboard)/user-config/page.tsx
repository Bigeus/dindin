"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { toast } from "sonner"

const UserConfigPage = () => {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simulando uma requisição
    setTimeout(() => {
      setIsSaving(false)
      toast("Usuário salvo com sucesso");
    }, 1000)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-zinc-800 border-zinc-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-white">Configurações de usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone:</Label>
                <Input
                  id="phone"
                  placeholder="Insira o número do telefone..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço:</Label>
                <Input
                  id="address"
                  placeholder="Insira o Endereço..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha:</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Insira a senha..."
                  className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-700" />

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento:</Label>
              <Input
                id="department"
                placeholder="Insira o cargo..."
                className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="registration">Registro de Usuário:</Label>
              <Input
                id="registration"
                placeholder="Insira o código ID..."
                className="bg-zinc-700/30 border-zinc-600 focus-visible:ring-zinc-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 pt-4">
          <div className="text-green-400 text-sm mr-auto">{isSaving ? "Salvando..." : ""}</div>
          <Button variant="outline" className="border-zinc-600 bg-gray-500 hover:bg-zinc-700 text-white">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserConfigPage

