'use client'

import { useLayoutEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { THEME_OPTIONS } from '@/lib/config'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const groupRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const found = THEME_OPTIONS.findIndex((option) => option.value === theme)
  // Sem tema salvo, "Sistema" é a opção ativa (padrão do provider).
  const activeIndex = found >= 0 ? found : THEME_OPTIONS.findIndex((option) => option.value === 'system')

  // Pílula: posição/largura medidas do botão ativo (os botões têm larguras diferentes);
  // o movimento em si é só CSS (transform: translateX, 200 ms).
  useLayoutEffect(() => {
    const group = groupRef.current
    const button = buttonRefs.current[activeIndex]
    if (!group || !button) return
    const place = () => {
      group.style.setProperty('--pill-x', `${button.offsetLeft}px`)
      group.style.setProperty('--pill-w', `${button.offsetWidth}px`)
      group.dataset.placed = 'true'
    }
    place()
    // A transição só liga depois da primeira posição: a pílula não "voa" na carga.
    const frame = requestAnimationFrame(() => { group.dataset.ready = 'true' })
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place)
    observer?.observe(group)
    return () => { cancelAnimationFrame(frame); observer?.disconnect() }
  }, [activeIndex])

  // A transição de cor do tema só existe durante a troca feita pelo usuário (classe temporária no <html>);
  // assim a carga da página nunca anima (sem flicker de hidratação).
  const choose = (value: string) => {
    const root = document.documentElement
    root.classList.add('theme-animating')
    setTheme(value)
    window.setTimeout(() => root.classList.remove('theme-animating'), 400)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const total = THEME_OPTIONS.length
    let next = activeIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (activeIndex + 1) % total
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (activeIndex - 1 + total) % total
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = total - 1
    else return
    event.preventDefault()
    choose(THEME_OPTIONS[next].value)
    buttonRefs.current[next]?.focus()
  }

  return <div className="theme-switcher" role="radiogroup" aria-label="Tema de exibição" ref={groupRef} onKeyDown={onKeyDown}>
    <span className="theme-pill" aria-hidden="true" />
    {THEME_OPTIONS.map((option, index) => <button key={option.value} ref={(node) => { buttonRefs.current[index] = node }} type="button" role="radio" aria-checked={index === activeIndex} tabIndex={index === activeIndex ? 0 : -1} onClick={() => choose(option.value)}>{option.label}</button>)}
  </div>
}
