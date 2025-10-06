import { DEFAULT_THEME, THEME_STORAGE_KEY } from './constants'
import type { Theme } from './constants'

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME

  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return DEFAULT_THEME
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return

  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    root.classList.add(getSystemTheme())
  } else {
    root.classList.add(theme)
  }
}
