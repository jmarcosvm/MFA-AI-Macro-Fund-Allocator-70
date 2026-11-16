import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'MFA — Painel Macro Brasil',
  description: 'Painel interativo de leitura dos indicadores e cenários macroeconômicos do Brasil.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f4f6f8' }, { media: '(prefers-color-scheme: dark)', color: '#111820' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" suppressHydrationWarning><body className="antialiased"><ThemeProvider>{children}</ThemeProvider></body></html>
}
