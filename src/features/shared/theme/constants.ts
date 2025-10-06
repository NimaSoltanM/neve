export const THEMES = ['light', 'dark', 'system'] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'system'
export const THEME_STORAGE_KEY = 'neve-ui-theme'
