import type { ValidationError, ValidationResult } from "../types/validation"
import { getDepartamentos, getMunicipiosByDepartamento } from "../data/colombia-locations"

const getFieldValue = (row: any, fieldName: string): string => {
  const value = row[fieldName]
  if (value === null || value === undefined) {
    return ""
  }
  return value.toString().trim()
}

// Validación de formato para nombres y apellidos
const isValidNameFormat = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
  return nameRegex.test(name)
}

export const validateRow = (row: any, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = []

  console.log(`\n=== VALIDANDO FILA ${rowIndex} ===`)
  console.log("Campos disponibles:", Object.keys(row))

  // === Validar Tratamiento (OBLIGATORIO) ===
  const tratamiento = getFieldValue(row, "Tratamiento")
  console.log(`Tratamiento: "${tratamiento}"`)
  if (!tratamiento) {
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

  // === Validar Tipo de Destinatario (OBLIGATORIO para validar otros campos) ===
  const tipoDestinatario = getFieldValue(row, "Tipo de Destinatario")
  console.log(`Tipo de Destinatario: "${tipoDestinatario}"`)


  // === Validar Dirección y Email (Condicionales) ===
  const direccion = getFieldValue(row, "Dirección")
  const email = getFieldValue(row, "Email")

  console.log(`Dirección: "${direccion}"`)
  console.log(`Email: "${email}"`)

  if (!direccion && !email) {
    console.log("❌ ERROR: Debe diligenciar al menos Dirección o Email")
    errors.push({
      row: rowIndex,
      field: "Dirección",
      message: "Debe diligenciar una dirección física o un correo electrónico",
      severity: "error",
    })
  }

  if (direccion) {
    if (direccion.length > 100) {
      console.log("❌ ERROR: Dirección excede 100 caracteres")
      errors.push({
        row: rowIndex,
        field: "Dirección",
        message: "La dirección no puede exceder 100 caracteres",
        severity: "error",
      })
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.#\-,º""–°]+$/.test(direccion)) {
      console.log("❌ ERROR: Dirección contiene caracteres no permitidos")
      errors.push({
        row: rowIndex,
        field: "Dirección",
        message: "La dirección solo permite letras, números, espacios, puntos, guiones y numeral (#)",
        severity: "error",
      })
    } else {
      console.log("✅ Dirección válida")
    }
  }

  if (email) {
    if (email.length > 200) {
      console.log("❌ ERROR: Email excede 200 caracteres")
      errors.push({
        row: rowIndex,
        field: "Email",
        message: "El campo Email no puede exceder 200 caracteres",
        severity: "error",
      })
    }

    if (email.includes(" ")) {
      console.log("❌ ERROR: Email contiene espacios")
      errors.push({
        row: rowIndex,
        field: "Email",
        message: "No se permiten espacios en la lista de correos. Separe múltiples correos con comas sin espacios.",
        severity: "error",
      })
    }

    const emails = email.split(",").map(e => e.trim())
    for (const emailAddr of emails) {
      if (emailAddr && !emailAddr.includes("@")) {
        console.log(`❌ ERROR: Email incorrecto "${emailAddr}"`)
        errors.push({
          row: rowIndex,
          field: "Email",
          message: `Email parece incorrecto: ${emailAddr}`,
          severity: "error",
        })
      }
    }
  }

    // === Validar Nombres y Apellidos ===
  const nombres = getFieldValue(row, "Nombres y Apellidos")
  console.log(`Nombres y Apellidos: "${nombres}"`)
  if (!nombres) {
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo Nombres y Apellidos es obligatorio",
      severity: "error",
    })
  } else if (nombres.length > 100) {
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo no puede exceder 100 caracteres",
      severity: "error",
    })
  } else if (!isValidNameFormat(nombres)) {
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo solo acepta letras y espacios",
      severity: "error",
    })
  } else {
    console.log("✅ Nombres y Apellidos válidos")
  }

  // === Validar Departamento ===
  const departamento = getFieldValue(row, "Departamento")
  console.log(`Departamento: "${departamento}"`)
  if (!departamento) {
    errors.push({
      row: rowIndex,
      field: "Departamento",
      message: "El campo Departamento es obligatorio",
      severity: "error",
    })
  } else {
    const departamentosValidos = getDepartamentos()
    if (!departamentosValidos.includes(departamento)) {
      errors.push({
        row: rowIndex,
        field: "Departamento",
        message: `El departamento "${departamento}" no existe en la lista oficial`,
        severity: "error",
      })
    } else {
      console.log("✅ Departamento válido")
    }
  }

  // === Validar Municipio ===
  const municipio = getFieldValue(row, "Municipio")
  console.log(`Municipio: "${municipio}"`)
  if (!municipio) {
    errors.push({
      row: rowIndex,
      field: "Municipio",
      message: "El campo Municipio es obligatorio",
      severity: "error",
    })
  } else if (departamento) {
    const validMunicipios = getMunicipiosByDepartamento(departamento)
    if (!validMunicipios.includes(municipio)) {
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

  // === Validar Teléfono (Opcional) ===
  const telefono = getFieldValue(row, "Teléfono")
  if (telefono) {
    const telefonos = telefono.split(",").map(t => t.trim())
    for (const tel of telefonos) {
      if (tel.length < 6 || tel.length > 10) {
        errors.push({
          row: rowIndex,
          field: "Teléfono",
          message: `Teléfono parece incorrecto (6-10 dígitos): ${tel}`,
          severity: "warning",
        })
      }
    }
  }

  // === Validar Celular (Opcional) ===
  const celular = getFieldValue(row, "Celular")
  if (celular) {
    const celulares = celular.split(",").map(c => c.trim())
    for (const cel of celulares) {
      if (cel.length !== 10) {
        errors.push({
          row: rowIndex,
          field: "Celular",
          message: `Celular parece incorrecto (10 dígitos): ${cel}`,
          severity: "warning",
        })
      }
    }
  }

  console.log(`Total de errores fila ${rowIndex}: ${errors.length}`)
  return errors
}

export const validateExcelData = (data: any[]): ValidationResult => {
  console.log("\n🚀 === INICIANDO VALIDACIÓN ===")
  console.log("Filas a validar:", data.length)

  if (!data || data.length === 0) {
    return {
      isValid: false,
      errors: [{
        row: 0,
        field: "Datos",
        message: "No hay datos para validar",
        severity: "error",
      }],
      totalRows: 0,
      validRows: 0,
    }
  }

  const allErrors: ValidationError[] = []

  data.forEach((row, index) => {
    const rowNumber = index + 2 // Excel: +2 por encabezado
    const rowErrors = validateRow(row, rowNumber)
    allErrors.push(...rowErrors)
  })

  const errorRows = new Set(allErrors.map(e => e.row))
  const validRows = data.length - errorRows.size

  console.log("\n📊 === RESUMEN VALIDACIÓN ===")
  console.log(`Total de errores: ${allErrors.length}`)
  console.log(`Filas con errores: ${errorRows.size}`)
  console.log(`Filas válidas: ${validRows}`)

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    totalRows: data.length,
    validRows,
  }
}
