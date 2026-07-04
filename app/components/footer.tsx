export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/60 mt-16 dark:bg-slate-950/20 dark:border-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Validador Excel</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Herramienta especializada en la validación de documentos Excel para comunicaciones masivas del SGDEA.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-wider uppercase">Campos Obligatorios</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                Tratamiento
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                Nombres y Apellidos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                Departamento
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                Municipio
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                Correo
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-wider uppercase">Campos Opcionales / Condicionales</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                Cargo / Entidad
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                Dirección
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                Teléfono / Celular
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-300/60 dark:border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 Herramienta para la validación de listas de distribución.
          </p>
          <p className="mt-4 flex items-center justify-center gap-2 text-base tracking-wide text-slate-500 dark:text-slate-400">
            <span className="text-base">🦎</span>
            <span>
              Desarrollado por{" "}
              <a
                href="https://github.com/jomallaru"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                Tathan Llanos
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

