interface TransactionCardProps {
    date: string
    entrada: string
    saida: string
    protocol?: string
    index?: number
  }
  
  export function TransactionCard({ date, entrada, saida, protocol, index = 0 }: TransactionCardProps) {
    return (
      <div className="bg-zinc-700 rounded-lg p-3 h-full">
        <div className="text-sm font-medium">{date}</div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between">
            <span className="text-sm">Entrada:</span>
            <span className="text-green-500 text-sm font-semibold">{entrada}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Saída:</span>
            <span className="text-red-500 text-sm font-semibold">{saida}</span>
          </div>
          <div className="text-xs mt-1">
            <span>Protocolo:</span>
            <div className="text-zinc-400 text-[10px] truncate">{protocol || `00${index}abcdefghijklmnop`}</div>
          </div>
        </div>
      </div>
    )
  }
  
  