import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Melissa Rebecca | Fotografie',
  description: 'Hallo, ich bin Melissa – Fotografin für Lifestyle, Art, Beauty & mehr.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
