"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Percent, ShieldCheck, ShieldAlert, RotateCcw } from "lucide-react"

interface SemaforoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SemaforoModal({ isOpen, onClose }: SemaforoModalProps) {
  const [inputValue, setInputValue] = useState<string>("")

  const numValue = parseFloat(inputValue)
  const isValid = !isNaN(numValue) && isFinite(numValue)
  const blueResult = isValid ? numValue * 0.7 : 0
  const redResult = isValid ? numValue * 1.2 : 0

  const formatNumber = (val: number) => {
    if (!isValid && val === 0) return "-"
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val)
  }

  const handleClear = () => {
    setInputValue("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-slate-200/80 shadow-2xl dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Calculator className="h-5 w-5" />
            </div>
            Calculadora de Tiempo
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
            Establece los límites operativos en función del numero de dias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Input Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="semaforo-input" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Valor Inicial
              </Label>
              {inputValue && (
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 gap-1 flex items-center"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpiar
                </Button>
              )}
            </div>
            <div className="relative">
              <Input
                id="semaforo-input"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pr-10 h-12 rounded-xl border-slate-200 dark:border-slate-850 dark:bg-slate-900 focus-visible:ring-indigo-500 text-base font-medium"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                días
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blue threshold (70%) */}
            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-blue-700/80 dark:text-blue-300/80 uppercase tracking-wider">
                Umbral Normal (70%)
              </span>
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight block max-w-full truncate px-1">
                {formatNumber(blueResult)}
              </span>
              <span className="text-[11px] font-medium text-blue-700/60 dark:text-blue-300/50">
                Límite inferior sugerido
              </span>
            </div>

            {/* Red threshold (120%) */}
            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-rose-700/80 dark:text-rose-300/80 uppercase tracking-wider">
                Umbral de Alerta (120%)
              </span>
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight block max-w-full truncate px-1">
                {formatNumber(redResult)}
              </span>
              <span className="text-[11px] font-medium text-rose-700/60 dark:text-rose-300/50">
                Límite superior excedido
              </span>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-semibold rounded-xl px-5 h-11 transition-all w-full sm:w-auto"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
