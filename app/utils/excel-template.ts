import * as XLSX from "xlsx"

/**
 * Genera y descarga la plantilla Excel con los encabezados
 * y dos filas de ejemplo.
 */
const downloadExcelTemplate = () => {
  // Crear datos de ejemplo para la plantilla
  const templateData = [
    {
      Tratamiento: "Sr.",
      "Nombres y Apellidos": "Juan Pérez García",
      Cargo: "Gerente",
      Entidad: "Empresa ABC",
      Departamento: "Antioquia",
      Municipio: "Medellín",
      Dirección: "Calle 123 #45-67",
      Email: "juan.perez@empresa.com",
      Teléfono: "1234567",
      Celular: "3001234567",
    },
    {
      Tratamiento: "Sra.",
      "Nombres y Apellidos": "María González López",
      Cargo: "Directora",
      Entidad: "Fundación XYZ",
      Departamento: "Bogotá, D.C.",
      Municipio: "Bogotá, D.C.",
      Dirección: "Carrera 45 #12-34",
      Email: "maria.gonzalez@fundacion.org",
      Teléfono: "7654321",
      Celular: "3109876543",
    },
  ]

  // Crear workbook
  const wb = XLSX.utils.book_new()

  // Crear worksheet con los datos de ejemplo
  const ws = XLSX.utils.json_to_sheet(templateData)

  // Ajustar ancho de columnas
  ws["!cols"] = [
    { wch: 12 }, // Tratamiento
    { wch: 25 }, // Nombres y Apellidos
    { wch: 20 }, // Cargo
    { wch: 25 }, // Entidad
    { wch: 20 }, // Departamento
    { wch: 20 }, // Municipio
    { wch: 30 }, // Dirección
    { wch: 30 }, // Email
    { wch: 12 }, // Teléfono
    { wch: 12 }, // Celular
  ]

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla")

  // Descargar archivo
  XLSX.writeFile(wb, "Plantilla_Validador_Excel.xlsx")
}

export default downloadExcelTemplate
