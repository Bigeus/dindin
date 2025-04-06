"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  value: number
  variant: "green" | "red"
  title?: string
  className?: string
}

export function ProgressIndicator({
  value,
  variant,
  title,
}: ProgressIndicatorProps) {
  // Garante que o valor esteja entre 0 e 100
  const normalizedValue = Math.max(0, Math.min(100, value))

  // Lógica para o título dependendo da variante
  const getGreenRiskLevel = (percentage: number) => {
    if (percentage < 45) return "Nível de Saldo Diário: Baixo"
    if (percentage >= 45 && percentage <= 65) return "Nível de Saldo Diário: Médio"
    return "Nível de Saldo Diário: Alto"
  }

  const getRedRiskLevel = (percentage: number) => {
    if (percentage < 20) return "Alerta de Saldo: Risco baixo"
    if (percentage >= 20 && percentage <= 50) return "Alerta de Saldo: Risco moderado"
    return "Alerta de Saldo: Risco considerável"
  }

  // Define o título com base na variante
  const displayTitle = title || (
    variant === "green" 
      ? getGreenRiskLevel(normalizedValue)
      : getRedRiskLevel(normalizedValue)
  )

  return (
    <div className="w-full">
      <div className={cn("flex rounded-lg w-full", variant === "green" ? "bg-green-800" : "bg-red-900")}>
        <div className="p-4 flex-grow">
          <h3 className="text-xl font-semibold text-white">{displayTitle}</h3>
        </div>
      </div>
      <Progress className="h-2 -mt-2" value={normalizedValue} variant={variant} style={{height: "30px", borderTopLeftRadius: 0}}/>
    </div>
  )
}
