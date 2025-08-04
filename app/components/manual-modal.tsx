"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ManualModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ManualModal({ isOpen, onClose }: ManualModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manual de Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección de descarga */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Manual de Usuario</h3>
            <p className="text-blue-800 text-sm">
              Puede visualizar el manual de usuario haciendo clic&nbsp;
              <a
                href="/manual.html"
                className="text-blue-700 underline hover:text-blue-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                aquí
              </a>.
            </p>
          </div>

          {/* Instrucciones básicas */}
          <div>
            <h3 className="font-semibold mb-3">Instrucciones Básicas:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Descargue la plantilla Excel usando el botón "Descargar Plantilla".</li>
              <li>Complete los datos en el archivo Excel descargado.</li>
              <li>
                Asegúrese de llenar todos los campos requeridos, de acuerdo a las instrucciones del archivo descargado.
              </li>
              <li>Suba el archivo con el botón "Elegir Archivo".</li>
              <li>Haga clic en el botón "Validar Archivo" cuando esté disponible.</li>
              <li>Revise los errores reportados y corríjalos en su archivo.</li>
              <li>Repita el proceso hasta que la validación sea exitosa.</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
