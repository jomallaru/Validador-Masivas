export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Validador Excel</h3>
            <p className="text-sm text-gray-600">
              Herramienta especializada en la validación de documentos Excel para comunicaciones masivas del SGDEA.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Campos Obligatorios</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tratamiento</li>
              <li>• Nombres y Apellidos</li>
              <li>• Departamento</li>
              <li>• Municipio</li>
              <li>• Email</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3"></h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cargo</li>
              <li>• Entidad</li>
              <li>• Dirección</li>              
              <li>• Teléfono</li>
              <li>• Celular</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <ul className="text-sm text-gray-500 list-none">
            <li>© 2025 Herramienta para la validación de listas de distribuccion.</li>
            <li>
              Elaborado por{" "}
              <a
                href="https://github.com/jomallaru"
                className="text-blue-600 hover:underline"
              >
                Tathan Llanos
              </a>.
            </li>
          </ul>
        </div>

     
    </div>
    </footer >
  )
}
