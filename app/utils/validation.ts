import type { ValidationError, ValidationResult } from "../types/validation"
import { getDepartamentos, getMunicipiosByDepartamento } from "../data/colombia-locations"

const getFieldValue = (row: any, fieldName: string): string => {
  const value = row[fieldName]
  if (value === null || value === undefined) {
    return ""
  }
  const stringValue = value.toString().trim()
  return stringValue
}

// Función para validar que solo contenga letras, espacios y puntos
const isValidNameFormat = (name: string): boolean => {
  // Expresión regular que acepta solo letras (mayúsculas y minúsculas), espacios y puntos
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.]+$/
  return nameRegex.test(name)
}

export const validateRow = (row: any, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = []

  console.log(`\n=== VALIDANDO FILA ${rowIndex} ===`)
  console.log("Campos disponibles:", Object.keys(row))

  // 1. Validar Tratamiento (OBLIGATORIO)
  const tratamiento = getFieldValue(row, "Tratamiento")
  console.log(`Tratamiento: "${tratamiento}"`)
  if (!tratamiento || tratamiento.length === 0) {
    console.log("❌ ERROR: Tratamiento vacío")
    errors.push({
      row: rowIndex,
      field: "Tratamiento",
      message: "El campo Tratamiento es obligatorio",
      severity: "error",
    })
  } else {
    console.log("✅ Tratamiento válido")
  }

  // 2. Validar Nombres y Apellidos (OBLIGATORIO con reglas específicas)
  const nombres = getFieldValue(row, "Nombres y Apellidos")
  console.log(`Nombres y Apellidos: "${nombres}"`)
  if (!nombres || nombres.length === 0) {
    console.log("❌ ERROR: Nombres y Apellidos vacío")
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo Nombres y Apellidos es obligatorio",
      severity: "error",
    })
  } else if (nombres.length > 100) {
    console.log("❌ ERROR: Nombres y Apellidos muy largo")
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo no puede exceder 100 caracteres",
      severity: "error",
    })
  } else if (!isValidNameFormat(nombres)) {
    console.log("❌ ERROR: Nombres y Apellidos contiene caracteres no válidos")
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message:
        "El campo solo acepta letras mayúsculas y minúsculas, espacios y puntos. No se permiten caracteres especiales",
      severity: "error",
    })
  } else {
    console.log("✅ Nombres y Apellidos válido")
  }

  // 3. Validar Departamento (OBLIGATORIO)
  const departamento = getFieldValue(row, "Departamento")
  console.log(`Departamento: "${departamento}"`)
  if (!departamento || departamento.length === 0) {
    console.log("❌ ERROR: Departamento vacío")
    errors.push({
      row: rowIndex,
      field: "Departamento",
      message: "El campo Departamento es obligatorio",
      severity: "error",
    })
  } else {
    const departamentosValidos = getDepartamentos()
    console.log(`Verificando si "${departamento}" está en la lista de departamentos válidos`)
    if (!departamentosValidos.includes(departamento)) {
      console.log("❌ ERROR: Departamento no válido")
      console.log("Departamentos válidos disponibles:", departamentosValidos.slice(0, 5), "...")
      errors.push({
        row: rowIndex,
        field: "Departamento",
        message: `El departamento "${departamento}" no existe en la lista oficial de Colombia`,
        severity: "error",
      })
    } else {
      console.log("✅ Departamento válido")
    }
  }

  // 4. Validar Municipio (OBLIGATORIO)
  const municipio = getFieldValue(row, "Municipio")
  console.log(`Municipio: "${municipio}"`)
  if (!municipio || municipio.length === 0) {
    console.log("❌ ERROR: Municipio vacío")
    errors.push({
      row: rowIndex,
      field: "Municipio",
      message: "El campo Municipio es obligatorio",
      severity: "error",
    })
  } else if (departamento && departamento.length > 0) {
    const validMunicipios = getMunicipiosByDepartamento(departamento)
    console.log(`Verificando si "${municipio}" pertenece a "${departamento}"`)
    console.log(`Municipios válidos para ${departamento}:`, validMunicipios.slice(0, 3), "...")
    if (!validMunicipios.includes(municipio)) {
      console.log("❌ ERROR: Municipio no pertenece al departamento")
      errors.push({
        row: rowIndex,
        field: "Municipio",
        message: `El municipio "${municipio}" no pertenece al departamento "${departamento}"`,
        severity: "error",
      })
    } else {
      console.log("✅ Municipio válido")
    }
  }

  // CAMPOS OPCIONALES - Solo advertencias si tienen contenido pero formato incorrecto

  // Email (OPCIONAL)
  const email = getFieldValue(row, "Email")
  if (email && email.length > 0) {
    console.log(`Email: "${email}"`)
    const emails = email.split(",").map((e) => e.trim())
    for (const emailAddr of emails) {
      if (emailAddr && !emailAddr.includes("@")) {
        errors.push({
          row: rowIndex,
          field: "Email",
          message: `Email parece incorrecto: ${emailAddr}`,
          severity: "warning",
        })
      }
    }
  }

  // Teléfono (OPCIONAL)
  const telefono = getFieldValue(row, "Teléfono")
  if (telefono && telefono.length > 0) {
    console.log(`Teléfono: "${telefono}"`)
    const telefonos = telefono.split(",").map((t) => t.trim())
    for (const tel of telefonos) {
      if (tel && (tel.length < 6 || tel.length > 10)) {
        errors.push({
          row: rowIndex,
          field: "Teléfono",
          message: `Teléfono parece incorrecto (debe tener entre 6-10 dígitos): ${tel}`,
          severity: "warning",
        })
      }
    }
  }

  // Celular (OPCIONAL)
  const celular = getFieldValue(row, "Celular")
  if (celular && celular.length > 0) {
    console.log(`Celular: "${celular}"`)
    const celulares = celular.split(",").map((c) => c.trim())
    for (const cel of celulares) {
      if (cel && cel.length !== 10) {
        errors.push({
          row: rowIndex,
          field: "Celular",
          message: `Celular parece incorrecto (debe tener 10 dígitos): ${cel}`,
          severity: "warning",
        })
      }
    }
  }

  console.log(`Total de errores encontrados en fila ${rowIndex}:`, errors.length)
  return errors
}

export const validateExcelData = (data: any[]): ValidationResult => {
  console.log("\n🚀 === INICIANDO VALIDACIÓN DE DATOS ===")
  console.log("Número de filas a validar:", data.length)

  if (!data || data.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          row: 0,
          field: "Datos",
          message: "No hay datos para validar",
          severity: "error",
        },
      ],
      totalRows: 0,
      validRows: 0,
    }
  }

  const allErrors: ValidationError[] = []

  data.forEach((row, index) => {
    const rowNumber = index + 2 // +2 porque Excel empieza en fila 1 y hay header
    const rowErrors = validateRow(row, rowNumber)
    allErrors.push(...rowErrors)
  })

  const errorRows = new Set(allErrors.map((e) => e.row))
  const validRows = data.length - errorRows.size

  console.log("\n📊 === RESUMEN FINAL DE VALIDACIÓN ===")
  console.log("Total de errores encontrados:", allErrors.length)
  console.log("Filas con errores:", errorRows.size)
  console.log("Filas válidas:", validRows)

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    totalRows: data.length,
    validRows,
  }
}
