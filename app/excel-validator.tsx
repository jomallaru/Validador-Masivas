"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import * as XLSX from "xlsx"
import type { ExcelRow, ValidationResult, ValidationError } from "./types/validation"
import { validateExcelData } from "./utils/validation"
import { normalizeRowData, validateColumns } from "./utils/column-mapper"
import Header from "./components/header"
import Footer from "./components/footer"
import ManualModal from "./components/manual-modal"

const downloadExcelTemplate = () => {
  alert("Función de descarga de plantilla - próximamente disponible")
}

export default function ExcelValidator() {
  const [file, setFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [rawData, setRawData] = useState<any[]>([])
  const [columnInfo, setColumnInfo] = useState<{
    isValid: boolean
    missingColumns: string[]
    foundColumns: string[]
  } | null>(null)
  const [showManual, setShowManual] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setValidationResult(null)
      setExcelData([])
    }
  }

  const processExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array", cellDates: true })

          console.log("Hojas disponibles:", workbook.SheetNames)

          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // Obtener el rango de datos
          const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1")
          console.log("Rango de datos:", worksheet["!ref"])
          console.log("Filas detectadas:", range.e.r + 1)

          // Convertir a JSON con opciones específicas
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Usar números como headers temporalmente
            defval: "", // Valor por defecto para celdas vacías
            blankrows: false, // Omitir filas completamente vacías
          })

          console.log("Datos en bruto (primeras 3 filas):", jsonData.slice(0, 3))
          console.log("Total de filas leídas:", jsonData.length)

          if (jsonData.length === 0) {
            throw new Error("El archivo no contiene datos")
          }

          // Obtener los headers de la primera fila
          const headers = jsonData[0] as string[]
          console.log("Headers detectados:", headers)

          // Filtrar filas vacías y convertir a objetos
          const dataRows = jsonData.slice(1).filter((row: any) => {
            // Una fila se considera vacía si todos sus valores están vacíos
            return Array.isArray(row) && row.some((cell) => cell && cell.toString().trim() !== "")
          })

          console.log("Filas de datos después de filtrar vacías:", dataRows.length)

          // Convertir arrays a objetos usando los headers
          const objectData = dataRows.map((row: any[], index: number) => {
            const obj: any = {}
            headers.forEach((header, colIndex) => {
              if (header && header.toString().trim()) {
                const cellValue = row[colIndex]
                obj[header.toString().trim()] = cellValue ? cellValue.toString().trim() : ""
              }
            })

            // Log de las primeras 3 filas para debug
            if (index < 3) {
              console.log(`Fila ${index + 2} procesada:`, obj)
            }

            return obj
          })

          console.log("Datos finales procesados:", objectData.length, "filas")

          // Normalizar los datos
          const normalizedData = objectData.map((row, index) => {
            const normalized = normalizeRowData(row)

            // Log de las primeras 3 filas normalizadas
            if (index < 3) {
              console.log(`Fila ${index + 2} normalizada:`, normalized)
            }

            return normalized
          })

          console.log("Datos normalizados finales:", normalizedData.length, "filas")

          resolve(normalizedData)
        } catch (error) {
          console.error("Error procesando Excel:", error)
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Error al leer el archivo"))
      reader.readAsArrayBuffer(file)
    })
  }

  const validateFile = async () => {
    if (!file) return

    setIsValidating(true)
    try {
      const data = await processExcelFile(file)

      console.log("=== RESUMEN DE PROCESAMIENTO ===")
      console.log("Archivo:", file.name)
      console.log("Tamaño:", (file.size / 1024).toFixed(1), "KB")
      console.log("Filas procesadas:", data.length)
      console.log("Primeras 2 filas de datos:")
      data.slice(0, 2).forEach((row, i) => {
        console.log(`Fila ${i + 2}:`, row)
      })

      setRawData(data)

      // Validar columnas
      if (data.length > 0) {
        const columns = Object.keys(data[0])
        const columnValidation = validateColumns(columns)
        setColumnInfo(columnValidation)

        console.log("Validación de columnas:", columnValidation)

        if (!columnValidation.isValid) {
          setValidationResult({
            isValid: false,
            errors: [
              {
                row: 0,
                field: "Columnas",
                message: `Faltan las siguientes columnas obligatorias: ${columnValidation.missingColumns.join(", ")}`,
                severity: "error",
              },
            ],
            totalRows: 0,
            validRows: 0,
          })
          return
        }
      }

      setExcelData(data)

      // AQUÍ ES DONDE SE EJECUTA LA VALIDACIÓN PRINCIPAL
      console.log("Ejecutando validación de datos...")
      const result = validateExcelData(data)
      console.log("Resultado de validación:", result)
      setValidationResult(result)
    } catch (error) {
      console.error("Error al procesar el archivo:", error)
      setValidationResult({
        isValid: false,
        errors: [
          {
            row: 0,
            field: "Archivo",
            message: "Error al procesar el archivo Excel. Verifique que el formato sea correcto.",
            severity: "error",
          },
        ],
        totalRows: 0,
        validRows: 0,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const getErrorsByField = () => {
    if (!validationResult) return {}

    const errorsByField: { [key: string]: number } = {}
    validationResult.errors.forEach((error) => {
      errorsByField[error.field] = (errorsByField[error.field] || 0) + 1
    })

    return errorsByField
  }

  const getErrorsByRow = () => {
    if (!validationResult) return {}

    const errorsByRow: { [key: number]: ValidationError[] } = {}
    validationResult.errors.forEach((error) => {
      if (!errorsByRow[error.row]) {
        errorsByRow[error.row] = []
      }
      errorsByRow[error.row].push(error)
    })

    return errorsByRow
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onDownloadTemplate={downloadExcelTemplate} onShowManual={() => setShowManual(true)} />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6" />
              Validación de Archivo
            </CardTitle>
            <CardDescription>Sube tu archivo Excel para validar los datos según las especificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excel-file">Archivo Excel</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button onClick={validateFile} disabled={isValidating} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {isValidating ? "Validando..." : "Validar Archivo"}
                </Button>
              </div>
            )}

            {isValidating && (
              <div className="space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-gray-600 text-center">Procesando y validando archivo...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {validationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                Resultado de Validación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{validationResult.totalRows}</div>
                  <div className="text-sm text-gray-600">Total de filas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{validationResult.validRows}</div>
                  <div className="text-sm text-gray-600">Filas válidas</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{validationResult.errors.length}</div>
                  <div className="text-sm text-gray-600">Total de errores</div>
                </div>
              </div>

              {validationResult.isValid ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ¡Excelente! El archivo está correctamente diligenciado y cumple con todas las especificaciones.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    El archivo contiene errores que deben ser corregidos antes de proceder.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {validationResult && !validationResult.isValid && (
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="errors">Lista de Errores</TabsTrigger>
              <TabsTrigger value="fields">Errores por Campo</TabsTrigger>
              <TabsTrigger value="rows">Errores por Fila</TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Todos los Errores Detectados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertTriangle
                          className={`h-5 w-5 mt-0.5 ${error.severity === "error" ? "text-red-500" : "text-yellow-500"}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={error.severity === "error" ? "destructive" : "secondary"}>
                              Fila {error.row}
                            </Badge>
                            <Badge variant="outline">{error.field}</Badge>
                            <Badge
                              variant={error.severity === "error" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {error.severity === "error" ? "Error" : "Advertencia"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{error.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Errores por Campo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo</TableHead>
                        <TableHead>Cantidad de Errores</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(getErrorsByField()).map(([field, count]) => (
                        <TableRow key={field}>
                          <TableCell className="font-medium">{field}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{count}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rows" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Errores Agrupados por Fila</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(getErrorsByRow()).map(([rowStr, errors]) => {
                      const row = Number.parseInt(rowStr, 10)
                      return (
                        <div key={row} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="destructive">Fila {row}</Badge>
                            <span className="text-sm text-gray-600">
                              ({errors.length} {errors.length === 1 ? "error" : "errores"})
                            </span>
                          </h4>
                          <div className="space-y-2">
                            {errors.map((error, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {error.field}
                                </Badge>
                                <Badge
                                  variant={error.severity === "error" ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {error.severity === "error" ? "Error" : "Advertencia"}
                                </Badge>
                                <span className="text-gray-700">{error.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />

      <ManualModal isOpen={showManual} onClose={() => setShowManual(false)} />
    </div>
  )
}
