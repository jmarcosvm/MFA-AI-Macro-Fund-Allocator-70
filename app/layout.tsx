import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { IBM_Plex_Sans } from 'next/font/google'

const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-ibm-plex-sans' })

export const metadata: Metadata = {
  title: 'MFA — Painel Macro Brasil',
  description: 'Painel interativo de leitura dos indicadores e cenários macroeconômicos do Brasil.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F3F6FB' }, { media: '(prefers-color-scheme: dark)', color: '#0A1020' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" suppressHydrationWarning><body className={`${ibmPlexSans.variable} antialiased`}><ThemeProvider>{children}</ThemeProvider></body></html>
}
