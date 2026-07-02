"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Video, HelpCircle, Download, FileCheck2, FileUp, RefreshCw, AlertCircle } from "lucide-react"

interface ManualModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ManualModal({ isOpen, onClose }: ManualModalProps) {
  const steps = [
    {
      icon: <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      text: "Descargue la plantilla Excel usando el botón 'Descargar Plantilla' en la barra superior."
    },
    {
      icon: <FileCheck2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      text: "Diligencie la información requerida, prestando atención a los campos obligatorios (Tratamiento, Nombres, Departamento y Municipio)."
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      text: "Asegúrese de rellenar al menos la Dirección física o el Correo electrónico para cada registro."
    },
    {
      icon: <FileUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      text: "Arrastre su archivo Excel a la zona de carga o haga clic para seleccionarlo desde su computador."
    },
    {
      icon: <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      text: "Haga clic en 'Validar Archivo' y revise detalladamente el resumen estadístico y el listado de errores."
    },
    {
      icon: <FileCheck2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      text: "Corrija los errores marcados y vuelva a subir el archivo hasta obtener un resultado de validación exitoso."
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-slate-200/80 shadow-2xl dark:border-slate-800/80">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            <HelpCircle className="h-5 w-5 text-indigo-500" />
            Guía y Manual de Usuario
          </DialogTitle>
          <DialogDescription>
            Siga estas instrucciones para validar sus listas de distribución masiva de forma correcta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Video Tutorial Callout */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-100/50 dark:border-indigo-950/40 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20">
              <Video className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm md:text-base">¿Prefieres un videotutorial?</h4>
              <p className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300">
                Hemos preparado un video corto explicando el funcionamiento paso a paso.
              </p>
              <a
                href="/manual.mp4"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-4 mt-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver video instructivo ahora
              </a>
            </div>
          </div>

          {/* Pasos a seguir */}
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase mb-4">
              Instrucciones del Proceso:
            </h3>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all"
                >
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{idx + 1}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{step.icon}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

