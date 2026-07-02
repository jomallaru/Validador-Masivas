"use client"

import { FileSpreadsheet, Download, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onDownloadTemplate: () => void
  onShowManual: () => void
}

export default function Header({ onDownloadTemplate, onShowManual }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-sm shadow-slate-100/50 dark:bg-slate-900/80 dark:border-slate-800/40 transition-all">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-inner">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                Validador de Documentos Excel
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Herramienta para la validación de listas de distribución
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button 
              variant="outline" 
              onClick={onShowManual} 
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all font-medium rounded-xl h-11"
            >
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Manual de Usuario
            </Button>
            <a
              href="/PlantillaCargueContactosPersonalizados.xlsx"
              download
              className="inline-block"
            >
              <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 hover:shadow-indigo-200/80 dark:shadow-none transition-all duration-300 font-semibold rounded-xl h-11 px-5">
                <Download className="h-4 w-4" />
                Descargar Plantilla
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

