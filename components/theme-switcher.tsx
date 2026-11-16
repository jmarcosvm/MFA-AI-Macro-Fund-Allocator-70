'use client'

import { useTheme } from 'next-themes'
import { THEME_OPTIONS } from '@/lib/config'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return <div className="theme-switcher" role="group" aria-label="Tema de exibição">
    {THEME_OPTIONS.map((option) => <button key={option.value} type="button" aria-pressed={theme === option.value} onClick={() => setTheme(option.value)}>{option.label}</button>)}
  </div>
}
