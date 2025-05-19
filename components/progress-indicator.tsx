"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline"

interface ProgressIndicatorProps {
  value: number
  variant: "green" | "red"
  title?: string
  className?: string
  amount?: number // Valor monetário para exibir
  percentage?: number // Opcional: porcentagem de crescimento/decrescimento
}

export function ProgressIndicator({
  value,
  variant,
  title,
  className,
  amount,
  percentage
}: ProgressIndicatorProps) {
  // Garante que o valor esteja entre 0 e 100
  const normalizedValue = Math.max(0, Math.min(100, value))

  // Lógica para o título e mensagem dependendo da variante
  const getGreenStatus = (percentage: number) => {
    if (percentage < 35) return { title: "Receitas", message: "Abaixo do esperado" }
    if (percentage >= 35 && percentage <= 70) return { title: "Receitas", message: "Dentro do esperado" }
    return { title: "Receitas", message: "Acima do esperado" }
  }

  const getRedStatus = (percentage: number) => {
    if (percentage < 30) return { title: "Despesas", message: "Controle efetivo" }
    if (percentage >= 30 && percentage <= 60) return { title: "Despesas", message: "Situação controlada" }
    return { title: "Despesas", message: "Atenção necessária" }
  }

  // Define o status com base na variante
  const status = variant === "green" 
    ? getGreenStatus(normalizedValue)
    : getRedStatus(normalizedValue)

  // Define o título personalizado ou usa o título do status
  const displayTitle = title || status.title
  
  // Formata o valor monetário
  const formatCurrency = (value?: number) => {
    if (value === undefined) return ""
    return value.toFixed(2).replace('.', ',')
  }

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "flex rounded-t-lg w-full transition-all duration-300", 
        variant === "green" ? "bg-green-800/80" : "bg-red-900/80"
      )}>
        <div className="p-4 flex-grow flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-white">{displayTitle}</h3>
            <p className={cn(
              "text-sm",
              variant === "green" ? "text-green-300" : "text-red-300"
            )}>
              {status.message}
            </p>
          </div>
          
          {amount !== undefined && (
            <div className="text-right">
              <p className="text-xl font-bold text-white">
                R$ {formatCurrency(amount)}
              </p>
              
              {percentage !== undefined && (
                <div className={cn(
                  "flex items-center text-sm",
                  percentage >= 0 
                    ? "text-green-300" 
                    : "text-red-300"
                )}>
                  {percentage >= 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(percentage).toFixed(1)}% 
                  {percentage >= 0 ? " aumento" : " redução"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Progress 
          className={cn(
            "h-6 rounded-t-none transition-all duration-500",
            variant === "green" ? "bg-green-950" : "bg-red-950"
          )} 
          value={normalizedValue} 
          variant={variant} 
        />
        
        {/* Marcações de referência */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          <div className="h-full border-r border-white/20" style={{ width: '33.33%' }}></div>
          <div className="h-full border-r border-white/20" style={{ width: '33.33%' }}></div>
        </div>
      </div>
    </div>
  )
}