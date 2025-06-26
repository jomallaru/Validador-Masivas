// Mapeo de posibles nombres de columnas a nombres estándar
export const COLUMN_MAPPINGS: { [key: string]: string } = {
  // Tratamiento
  tratamiento: "Tratamiento",
  Tratamiento: "Tratamiento",
  TRATAMIENTO: "Tratamiento",

  // Nombres y Apellidos
  "nombres y apellidos": "Nombres y Apellidos",
  "Nombres y Apellidos": "Nombres y Apellidos",
  "NOMBRES Y APELLIDOS": "Nombres y Apellidos",
  nombres_y_apellidos: "Nombres y Apellidos",
  nombresyapellidos: "Nombres y Apellidos",

  // Cargo
  cargo: "Cargo",
  Cargo: "Cargo",
  CARGO: "Cargo",

  // Entidad
  entidad: "Entidad",
  Entidad: "Entidad",
  ENTIDAD: "Entidad",

  // Departamento
  departamento: "Departamento",
  Departamento: "Departamento",
  DEPARTAMENTO: "Departamento",

  // Municipio
  municipio: "Municipio",
  Municipio: "Municipio",
  MUNICIPIO: "Municipio",

  // Dirección
  dirección: "Dirección",
  Dirección: "Dirección",
  DIRECCIÓN: "Dirección",
  direccion: "Dirección",
  Direccion: "Dirección",
  DIRECCION: "Dirección",

  // Email
  email: "Email",
  Email: "Email",
  EMAIL: "Email",
  correo: "Email",
  Correo: "Email",
  CORREO: "Email",
  "correo electrónico": "Email",
  "Correo Electrónico": "Email",

  // Teléfono
  teléfono: "Teléfono",
  Teléfono: "Teléfono",
  TELÉFONO: "Teléfono",
  telefono: "Teléfono",
  Telefono: "Teléfono",
  TELEFONO: "Teléfono",

  // Celular
  celular: "Celular",
  Celular: "Celular",
  CELULAR: "Celular",
  móvil: "Celular",
  Móvil: "Celular",
  MÓVIL: "Celular",
  movil: "Celular",
  Movil: "Celular",
  MOVIL: "Celular",
}

export const normalizeColumnName = (columnName: string): string => {
  const trimmed = columnName.trim()
  return COLUMN_MAPPINGS[trimmed] || trimmed
}

export const normalizeRowData = (rawRow: any): any => {
  const normalizedRow: any = {}

  Object.keys(rawRow).forEach((key) => {
    const normalizedKey = normalizeColumnName(key)
    normalizedRow[normalizedKey] = rawRow[key]
  })

  return normalizedRow
}

// Actualizar la función getRequiredColumns para que solo incluya los campos realmente obligatorios
export const getRequiredColumns = (): string[] => {
  return ["Tratamiento", "Nombres y Apellidos", "Departamento", "Municipio"]
}

export const validateColumns = (
  columns: string[],
): { isValid: boolean; missingColumns: string[]; foundColumns: string[] } => {
  const normalizedColumns = columns.map((col) => normalizeColumnName(col))
  const requiredColumns = getRequiredColumns()
  const missingColumns = requiredColumns.filter((req) => !normalizedColumns.includes(req))

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    foundColumns: normalizedColumns,
  }
}
