"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, UploadCloud } from "lucide-react"
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
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setValidationResult(null)
      setExcelData([])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const selectedFile = e.dataTransfer.files?.[0]
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase()
      if (fileExt === "xlsx" || fileExt === "xls") {
        setFile(selectedFile)
        setValidationResult(null)
        setExcelData([])
      } else {
        alert("Por favor, suba un archivo Excel válido (.xlsx o .xls)")
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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
          const objectData = (dataRows as any[][]).map((row, index) => {
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div className="w-full">
        <Header onDownloadTemplate={downloadExcelTemplate} onShowManual={() => setShowManual(true)} />

        <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          <Card className="border-slate-200/80 shadow-md dark:border-slate-800/80 overflow-hidden">
            <CardHeader className="bg-slate-50/60 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 py-5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                Cargue y Validación de Archivo
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Sube tu archivo Excel para validar la consistencia de los datos según las especificaciones de envío masivo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="excel-file" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Selecciona tu archivo de contactos
                </Label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                    isDragging
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-400 scale-[1.01]"
                      : file
                      ? "border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5 dark:border-emerald-600"
                      : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-indigo-500/50"
                  }`}
                >
                  <input
                    id="excel-file"
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400 animate-pulse">
                      <FileSpreadsheet className="h-10 w-10" />
                    </div>
                  ) : (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 transition-transform">
                      <UploadCloud className="h-10 w-10" />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {file ? file.name : "Arrastra y suelta tu archivo Excel aquí"}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {file
                        ? `Archivo cargado (${(file.size / 1024).toFixed(1)} KB)`
                        : "o haz clic para explorar en tu equipo"}
                    </p>
                  </div>
                  
                  {!file && (
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                      Soporta formatos .xlsx, .xls
                    </span>
                  )}
                </div>
              </div>

              {file && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/10 dark:to-teal-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-slate-200 text-sm">{file.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tamaño: {(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => { setFile(null); setValidationResult(null); }} 
                      disabled={isValidating}
                      className="flex-1 sm:flex-none rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 h-11 font-medium bg-white dark:bg-slate-900 dark:border-slate-800"
                    >
                      Quitar
                    </Button>
                    <Button 
                      onClick={validateFile} 
                      disabled={isValidating} 
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 dark:shadow-none transition-all rounded-xl h-11 font-semibold flex items-center justify-center gap-2 px-5"
                    >
                      <Upload className="h-4 w-4" />
                      {isValidating ? "Validando..." : "Validar Archivo"}
                    </Button>
                  </div>
                </div>
              )}

              {isValidating && (
                <div className="space-y-3 p-5 border border-slate-100 dark:border-slate-800/40 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
                      Validando filas y formatos...
                    </span>
                    <span className="animate-pulse">Procesando...</span>
                  </div>
                  <Progress value={85} className="h-2 w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {validationResult && (
            <Card className="overflow-hidden border-slate-200/80 shadow-lg dark:border-slate-800/80">
              <CardHeader className="bg-slate-50/60 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 py-5">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  )}
                  Resultado de Validación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-5 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl transition-all hover:shadow-md">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-indigo-950 dark:text-indigo-100 tracking-tight">
                        {validationResult.totalRows}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Filas</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl transition-all hover:shadow-md">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                        {validationResult.validRows}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filas Válidas</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 rounded-2xl transition-all hover:shadow-md">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-rose-950 dark:text-rose-100 tracking-tight">
                        {validationResult.errors.length}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Errores</div>
                    </div>
                  </div>
                </div>

                {validationResult.isValid ? (
                  <Alert className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/10 dark:border-emerald-900/40 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <AlertDescription className="text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
                      ¡Excelente! El archivo está correctamente diligenciado y cumple con todas las especificaciones de formato.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-rose-200 bg-rose-50/40 dark:bg-rose-950/10 dark:border-rose-900/40 p-4 rounded-xl flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5" />
                    <AlertDescription className="text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                      El archivo contiene errores o inconsistencias que deben ser corregidos antes de proceder con el cargue.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {validationResult && !validationResult.isValid && (
            <Tabs defaultValue="errors" className="w-full space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-12">
                <TabsTrigger 
                  value="errors"
                  className="rounded-lg font-semibold text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm"
                >
                  Lista de Errores
                </TabsTrigger>
                <TabsTrigger 
                  value="fields"
                  className="rounded-lg font-semibold text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm"
                >
                  Errores por Campo
                </TabsTrigger>
                <TabsTrigger 
                  value="rows"
                  className="rounded-lg font-semibold text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm"
                >
                  Errores por Fila
                </TabsTrigger>
              </TabsList>

              <TabsContent value="errors" className="space-y-4">
                <Card className="border-slate-200/80 shadow-md dark:border-slate-800/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Todos los Errores Detectados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      {validationResult.errors.map((error, index) => (
                        <div 
                          key={index} 
                          className={`flex items-start gap-4 p-4 border rounded-xl transition-all hover:bg-slate-50/50 dark:hover:bg-slate-950/20 ${
                            error.severity === "error" 
                              ? "border-rose-100 bg-rose-50/10 dark:border-rose-950/30 dark:bg-rose-950/5" 
                              : "border-amber-100 bg-amber-50/10 dark:border-amber-950/30 dark:bg-amber-950/5"
                          }`}
                        >
                          <div className={`p-2 rounded-lg mt-0.5 ${
                            error.severity === "error" 
                              ? "bg-rose-100/60 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400" 
                              : "bg-amber-100/60 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge 
                                className="font-bold text-xs rounded-md shadow-sm"
                                variant={error.severity === "error" ? "destructive" : "secondary"}
                              >
                                Fila {error.row}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="font-medium text-xs text-slate-600 border-slate-200 bg-slate-50 dark:text-slate-300 dark:border-slate-800 dark:bg-slate-900 rounded-md"
                              >
                                {error.field}
                              </Badge>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                                error.severity === "error" 
                                  ? "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20" 
                                  : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20"
                              }`}>
                                {error.severity === "error" ? "Error" : "Advertencia"}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                              {error.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <Card className="border-slate-200/80 shadow-md dark:border-slate-800/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Resumen de Errores por Campo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 rounded-xl">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                          <TableRow>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 h-11">Campo</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 h-11">Cantidad de Errores</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(getErrorsByField()).map(([field, count]) => (
                            <TableRow key={field} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                              <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{field}</TableCell>
                              <TableCell>
                                <Badge variant="destructive" className="font-bold rounded-md px-2.5 py-0.5">
                                  {count} {count === 1 ? "error" : "errores"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rows" className="space-y-4">
                <Card className="border-slate-200/80 shadow-md dark:border-slate-800/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Errores Agrupados por Fila
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      {Object.entries(getErrorsByRow()).map(([rowStr, errors]) => {
                        const row = Number.parseInt(rowStr, 10)
                        return (
                          <div 
                            key={row} 
                            className="border border-slate-250 dark:border-slate-800/50 rounded-xl p-4 transition-all hover:bg-slate-50/30 dark:hover:bg-slate-950/20"
                          >
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2.5">
                              <Badge className="font-bold rounded-md bg-rose-600 dark:bg-rose-700">Fila {row}</Badge>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                ({errors.length} {errors.length === 1 ? "inconsistencia" : "inconsistencias"})
                              </span>
                            </h4>
                            <div className="space-y-2">
                              {errors.map((error, index) => (
                                <div key={index} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/60 dark:bg-slate-900/40 text-xs md:text-sm font-medium">
                                  <Badge 
                                    variant="outline" 
                                    className="text-[10px] px-2 py-0.5 rounded-md font-bold text-slate-600 border-slate-200 bg-white dark:text-slate-300 dark:border-slate-850 dark:bg-slate-900"
                                  >
                                    {error.field}
                                  </Badge>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                    error.severity === "error" 
                                      ? "text-rose-600 bg-rose-50 dark:text-rose-400" 
                                      : "text-amber-600 bg-amber-50 dark:text-amber-400"
                                  }`}>
                                    {error.severity === "error" ? "Error" : "Advertencia"}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300 flex-1">{error.message}</span>
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
      </div>

      <Footer />

      <ManualModal isOpen={showManual} onClose={() => setShowManual(false)} />
    </div>
  )
}
