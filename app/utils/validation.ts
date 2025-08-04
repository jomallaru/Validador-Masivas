import type { ValidationError, ValidationResult } from "../types/validation"
import { getDepartamentos, getMunicipiosByDepartamento } from "../data/colombia-locations"

// === Obtener valor de campo de forma segura ===
const getFieldValue = (row: any, fieldName: string): string => {
  const value = row[fieldName]
  return value === null || value === undefined ? "" : value.toString().trim()
}

// === Validar formato de nombres y apellidos ===
const isValidNameFormat = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
  return nameRegex.test(name)
}

// === Validar una fila individual ===
export const validateRow = (row: any, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = []

  console.log(`\n=== VALIDANDO FILA ${rowIndex} ===`)
  
  // === Validar Entidad (Condicional) ===
  const tipoPersona = getFieldValue(row, "Tipo de Persona")
  const entidad = getFieldValue(row, "Entidad")

  if (tipoPersona === "Jurídica") {
    if (!entidad) {
      console.log("❌ ERROR: Entidad vacía para persona jurídica")
      errors.push({
        row: rowIndex,
        field: "Entidad",
        message: "Para personas jurídicas debe diligenciar el nombre de la entidad o empresa",
        severity: "error",
      })
    } else {
      if (entidad.length > 100) {
        console.log("❌ ERROR: Entidad muy larga")
        errors.push({
          row: rowIndex,
          field: "Entidad",
          message: "La entidad no puede exceder 100 caracteres",
          severity: "error",
        })
      }
      const entidadRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.&]+$/
      if (!entidadRegex.test(entidad)) {
        console.log("❌ ERROR: Entidad contiene caracteres no permitidos")
        errors.push({
          row: rowIndex,
          field: "Entidad",
          message: "El campo Entidad solo permite letras, números, espacios, punto (.) y ampersand (&)",
          severity: "error",
        })
      }
    }
  } else if (tipoPersona === "Natural") {
    if (entidad.trim().toUpperCase() !== "PARTICULAR") {
      console.log("❌ ERROR: Entidad debe ser 'PARTICULAR' para persona natural")
      errors.push({
        row: rowIndex,
        field: "Entidad",
        message: "Para personas naturales debe escribir 'PARTICULAR' en el campo Entidad",
        severity: "error",
      })
    }
  }

  // === Validar Tratamiento (OBLIGATORIO) ===
  const tratamiento = getFieldValue(row, "Tratamiento")
  if (!tratamiento) {
    console.log("❌ ERROR: Tratamiento vacío")
    errors.push({
      row: rowIndex,
      field: "Tratamiento",
      message: "El campo Tratamiento es obligatorio",
      severity: "error",
    })
  }

  // === Validar Dirección y Email (al menos uno OBLIGATORIO) ===
  const direccion = getFieldValue(row, "Dirección")
  const email = getFieldValue(row, "Email")
  if (!direccion && !email) {
    console.log("❌ ERROR: Debe diligenciar Dirección o Email")
    errors.push({
      row: rowIndex,
      field: "Dirección",
      message: "Debe diligenciar una dirección física o un correo electrónico",
      severity: "error",
    })
  }

  if (direccion) {
    if (direccion.length > 100) {
      console.log("❌ ERROR: Dirección muy larga")
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
    }
  }

  if (email) {
    if (email.length > 200) {
      console.log("❌ ERROR: Email muy largo")
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
        console.log(`❌ ERROR: Email inválido "${emailAddr}"`)
        errors.push({
          row: rowIndex,
          field: "Email",
          message: `Email parece incorrecto: ${emailAddr}`,
          severity: "error",
        })
      }
    }
  }

  // === Validar Nombres y Apellidos (OBLIGATORIO) ===
  const nombres = getFieldValue(row, "Nombres y Apellidos")
  if (!nombres) {
    console.log("❌ ERROR: Nombres vacíos")
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo Nombres y Apellidos es obligatorio",
      severity: "error",
    })
  } else if (nombres.length > 100) {
    console.log("❌ ERROR: Nombres muy largos")
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo no puede exceder 100 caracteres",
      severity: "error",
    })
  } else if (!isValidNameFormat(nombres)) {
    console.log("❌ ERROR: Formato de nombres inválido")
    errors.push({
      row: rowIndex,
      field: "Nombres y Apellidos",
      message: "El campo solo acepta letras y espacios",
      severity: "error",
    })
  }

  // === Validar Departamento (OBLIGATORIO) ===
  const departamento = getFieldValue(row, "Departamento")
  if (!departamento) {
    console.log("❌ ERROR: Departamento vacío")
    errors.push({
      row: rowIndex,
      field: "Departamento",
      message: "El campo Departamento es obligatorio",
      severity: "error",
    })
  } else {
    const departamentosValidos = getDepartamentos()
    if (!departamentosValidos.includes(departamento)) {
      console.log(`❌ ERROR: Departamento inválido "${departamento}"`)
      errors.push({
        row: rowIndex,
        field: "Departamento",
        message: `El departamento "${departamento}" no existe en la lista oficial`,
        severity: "error",
      })
    }
  }

  // === Validar Municipio (OBLIGATORIO) ===
  const municipio = getFieldValue(row, "Municipio")
  if (!municipio) {
    console.log("❌ ERROR: Municipio vacío")
    errors.push({
      row: rowIndex,
      field: "Municipio",
      message: "El campo Municipio es obligatorio",
      severity: "error",
    })
  } else if (departamento) {
    const municipiosValidos = getMunicipiosByDepartamento(departamento)
    if (!municipiosValidos.includes(municipio)) {
      console.log(`❌ ERROR: Municipio no pertenece al departamento`)
      errors.push({
        row: rowIndex,
        field: "Municipio",
        message: `El municipio "${municipio}" no pertenece al departamento "${departamento}"`,
        severity: "error",
      })
    }
  }

  // === Validar Teléfono (Opcional) ===
  const telefono = getFieldValue(row, "Teléfono")
  if (telefono) {
    const telefonos = telefono.split(",").map(t => t.trim())
    for (const tel of telefonos) {
      if (tel.length < 6 || tel.length > 10) {
        console.log(`⚠️ ADVERTENCIA: Teléfono de longitud incorrecta: ${tel}`)
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
        console.log(`⚠️ ADVERTENCIA: Celular de longitud incorrecta: ${cel}`)
        errors.push({
          row: rowIndex,
          field: "Celular",
          message: `Celular parece incorrecto (10 dígitos): ${cel}`,
          severity: "warning",
        })
      }
    }
  }

  return errors
}

// === Validar todo el archivo Excel ===
export const validateExcelData = (data: any[]): ValidationResult => {
  console.log("\n🚀 === INICIANDO VALIDACIÓN ===")

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

  // === Validar cada fila individual ===
  data.forEach((row, index) => {
    const rowNumber = index + 2 // Excel: fila real considerando encabezado
    const rowErrors = validateRow(row, rowNumber)
    allErrors.push(...rowErrors)
  })

  // === Verificar correos duplicados y mostrar filas exactas ===
  const emailMap = new Map<string, number[]>()

  data.forEach((row, index) => {
    const email = getFieldValue(row, "Email").toLowerCase()
    if (email) {
      const emails = email.split(",").map(e => e.trim())
      for (const emailAddr of emails) {
        if (!emailMap.has(emailAddr)) {
          emailMap.set(emailAddr, [])
        }
        emailMap.get(emailAddr)!.push(index + 2) // +2 por encabezado
      }
    }
  })

  emailMap.forEach((rows, email) => {
    if (rows.length > 1) {
      rows.forEach(rowNumber => {
        const otrasFilas = rows.filter(r => r !== rowNumber)
        console.log(`⚠️ Duplicado: ${email} en filas ${rows}`)
        allErrors.push({
          row: rowNumber,
          field: "Email",
          message: `El correo "${email}" está repetido también en las filas: ${otrasFilas.join(", ")}`,
          severity: "warning",
        })
      })
    }
  })

  const errorRows = new Set(allErrors.map(e => e.row))
  const validRows = data.length - errorRows.size

  console.log(`📊 Total de errores: ${allErrors.length}`)
  console.log(`✅ Filas válidas: ${validRows} / ${data.length}`)

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    totalRows: data.length,
    validRows,
  }
}
