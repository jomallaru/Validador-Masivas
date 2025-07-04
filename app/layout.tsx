import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Validador Masivas',
  description: 'Validación de Excel masiva',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
