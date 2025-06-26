export interface ExcelRow {
  [key: string]: any // Hacer más flexible para manejar diferentes nombres de columnas
  Tratamiento?: string
  "Nombres y Apellidos"?: string
  Cargo?: string
  Entidad?: string
  Departamento?: string
  Municipio?: string
  Dirección?: string
  Email?: string
  Teléfono?: string
  Celular?: string
}

export interface ValidationError {
  row: number
  field: string
  message: string
  severity: "error" | "warning"
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  totalRows: number
  validRows: number
}
