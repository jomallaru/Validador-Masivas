"use client"

import { FileSpreadsheet, Download, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onDownloadTemplate: () => void
  onShowManual: () => void
}

export default function Header({ onDownloadTemplate, onShowManual }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Validador de Documentos Excel</h1>
              <p className="text-sm text-gray-600">Herramienta para la validación de listas de distribuccion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onShowManual} className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manual de Usuario
            </Button>
            <a
              href="/PlantillaCargueContactosPersonalizados.xlsx"
              download
            >
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
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
