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

// === Validar formato de entidad ===
const isValidEntidadFormat = (entidad: string): boolean => {
  // Solo acepta letras, números, espacios, punto (.) y ampersand (&)
  const entidadRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.&()]+$/
  return entidadRegex.test(entidad)
}

// === Validar formato de cargo ===
const isValidCargoFormat = (cargo: string): boolean => {
  // Solo acepta letras, espacios y puntos
  const cargoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s().]+$/
  return cargoRegex.test(cargo)
}

// === Validar una fila individual ===
export const validateRow = (row: any, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = []

  console.log(`\n=== VALIDANDO FILA ${rowIndex} ===`)

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

  // === Validar Entidad (CONDICIONAL) ===
  const entidad = getFieldValue(row, "Entidad")
  if (entidad) {
    if (entidad.length > 100) {
      console.log("❌ ERROR: Entidad muy larga")
      errors.push({
        row: rowIndex,
        field: "Entidad",
        message: "El campo Entidad no puede exceder 100 caracteres",
        severity: "error",
      })
    } else if (!isValidEntidadFormat(entidad)) {
      console.log("❌ ERROR: Entidad contiene caracteres no permitidos")
      errors.push({
        row: rowIndex,
        field: "Entidad",
        message: "El campo Entidad solo acepta letras, números, espacios, punto (.) y ampersand (&)",
        severity: "error",
      })
    }
  }

  // === Validar Cargo (CONDICIONAL) ===
  const cargo = getFieldValue(row, "Cargo")
  if (cargo) {
    if (cargo.length > 100) {
      console.log("❌ ERROR: Cargo muy largo")
      errors.push({
        row: rowIndex,
        field: "Cargo",
        message: "El campo Cargo no puede exceder 100 caracteres",
        severity: "error",
      })
    } else if (!isValidCargoFormat(cargo)) {
      console.log("❌ ERROR: Cargo contiene caracteres no permitidos")
      errors.push({
        row: rowIndex,
        field: "Cargo",
        message: "El campo Cargo solo acepta letras, espacios y puntos",
        severity: "error",
      })
    }
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

// Validar Dirección
if (direccion) {
    if (direccion.length > 100) {
        console.log("❌ ERROR: Dirección muy larga")
        errors.push({
            row: rowIndex,
            field: "Dirección",
            message: "La dirección no puede exceder 100 caracteres",
            severity: "error",
        })
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜ0-9\s.#\-,º""–°]+$/.test(direccion)) {
        console.log("❌ ERROR: Dirección contiene caracteres no permitidos")
        errors.push({
            row: rowIndex,
            field: "Dirección",
            message: "La dirección solo permite letras, números, espacios, puntos, guiones y numeral (#)",
            severity: "error",
        })
    }
}

// Validar Email
if (email) {
    let emailErrors = []
    
    // Verificar longitud máxima
    if (email.length > 200) {
        console.log("❌ ERROR: Email muy largo")
        emailErrors.push("no puede exceder 200 caracteres")
    }

    // Verificar que no tenga espacios
    if (email.includes(" ")) {
        console.log("❌ ERROR: Email contiene espacios")
        emailErrors.push("no se permiten espacios (separe múltiples correos con comas sin espacios)")
    }

    // Separar múltiples emails y validar cada uno
    const emails = email.split(",").map(e => e.trim())
    
    for (const emailAddr of emails) {
        if (emailAddr) { // Solo validar si no está vacío
            // Verificar que contenga la letra ñ (no permitida)
            if (/[ñÑ]/.test(emailAddr)) {
                console.log(`❌ ERROR: Email contiene letra ñ: "${emailAddr}"`)
                emailErrors.push(`"${emailAddr}" no puede contener la letra ñ`)
            }
            
            // Validación básica de formato de email
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!emailRegex.test(emailAddr)) {
                console.log(`❌ ERROR: Email inválido "${emailAddr}"`)
                emailErrors.push(`formato incorrecto en "${emailAddr}"`)
            }
            
            // Verificar caracteres permitidos específicos para emails
            if (!/^[a-zA-Z0-9._@-]+$/.test(emailAddr)) {
                console.log(`❌ ERROR: Email contiene caracteres no permitidos: "${emailAddr}"`)
                emailErrors.push(`"${emailAddr}" contiene caracteres no permitidos`)
            }
            
            // Validaciones adicionales más específicas
            if (emailAddr.startsWith('.') || emailAddr.endsWith('.')) {
                console.log(`❌ ERROR: Email no puede empezar o terminar con punto: "${emailAddr}"`)
                emailErrors.push(`"${emailAddr}" no puede empezar o terminar con punto`)
            }
            
            if (emailAddr.includes('..')) {
                console.log(`❌ ERROR: Email no puede tener puntos consecutivos: "${emailAddr}"`)
                emailErrors.push(`"${emailAddr}" no puede tener puntos consecutivos`)
            }
            
            if (emailAddr.split('@').length !== 2) {
                console.log(`❌ ERROR: Email debe tener exactamente un @: "${emailAddr}"`)
                emailErrors.push(`"${emailAddr}" debe tener exactamente un símbolo @`)
            }
        }
    }
    
    // Si hay errores de email, agregar un solo error con todos los problemas
    if (emailErrors.length > 0) {
        errors.push({
            row: rowIndex,
            field: "Email",
            message: `Errores en email: ${emailErrors.join(', ')}`,
            severity: "error",
        })
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