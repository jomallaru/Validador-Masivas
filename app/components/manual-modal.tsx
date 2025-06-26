"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ManualModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ManualModal({ isOpen, onClose }: ManualModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Manual de Usuario
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Manual de Usuario - Próximamente</h3>
            <p className="text-blue-800 text-sm">
              El manual detallado de usuario será agregado aquí una vez que sea proporcionado. Incluirá instrucciones
              paso a paso, ejemplos y mejores prácticas.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Instrucciones Básicas:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Descarga la plantilla Excel usando el botón "Descargar Plantilla"</li>
              <li>Completa los datos en el archivo Excel descargado</li>
              <li>
                Asegúrate de llenar los campos obligatorios: Tratamiento, Nombres y Apellidos, Departamento, Municipio
              </li>
              <li>Sube el archivo completado usando el botón "Validar Archivo"</li>
              <li>Revisa los errores reportados y corrígelos en tu archivo</li>
              <li>Repite el proceso hasta que la validación sea exitosa</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
