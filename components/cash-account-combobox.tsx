"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CashAccount {
  id: string
  name: string
  balance: number
}

interface CashAccountComboboxProps {
  accounts: CashAccount[]
  value: string
  onChange: (value: string) => void
}

export function CashAccountCombobox({ accounts, value, onChange }: CashAccountComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedAccount = accounts.find((account) => account.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-zinc-700/50 border-zinc-600"
        >
          {value && selectedAccount ? selectedAccount.name : "Selecione uma conta..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-zinc-800 border-zinc-700">
        <Command className="bg-transparent">
          <CommandInput placeholder="Buscar conta..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhuma conta encontrada.</CommandEmpty>
            <CommandGroup>
              {accounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={account.name}
                  onSelect={() => {
                    onChange(account.id)
                    setOpen(false)
                  }}
                  className="text-white hover:bg-zinc-700"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === account.id ? "opacity-100" : "opacity-0")} />
                  <span>{account.name}</span>
                  <span className="ml-auto text-sm text-gray-400">R$ {account.balance.toFixed(2)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

