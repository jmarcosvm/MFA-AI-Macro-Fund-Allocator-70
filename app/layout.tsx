import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MFA — AI Macro Fund Allocator',
  description: 'Painel educacional de leitura do cenário macroeconômico brasileiro.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f4f6f8' }, { media: '(prefers-color-scheme: dark)', color: '#111820' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className="antialiased">{children}</body></html>
}
