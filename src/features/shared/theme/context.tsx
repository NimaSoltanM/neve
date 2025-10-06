import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  getSystemTheme,
} from './utils'
import type { Theme } from './constants'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme ?? getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    setStoredTheme(newTheme)
    applyTheme(newTheme)
  }, [])

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme)

    const resolved = theme === 'system' ? getSystemTheme() : theme
    setResolvedTheme(resolved)
  }, [theme])

  // Listen to system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(systemTheme)
      applyTheme('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const value: ThemeContextValue = {
    theme,
    setTheme,
    resolvedTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
