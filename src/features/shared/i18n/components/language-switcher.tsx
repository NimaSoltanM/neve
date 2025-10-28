import { useI18n } from '../context'
import { LOCALES } from '../constants'
import type { Locale } from '../constants'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Languages, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const languages: Record<Locale, { name: string; nativeName: string }> = {
    en: { name: 'English', nativeName: 'English' },
    fa: { name: 'Persian', nativeName: 'فارسی' },
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languages[locale].nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LOCALES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLocale(lang)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              locale === lang && 'bg-accent',
            )}
          >
            <span className="font-medium">{languages[lang].nativeName}</span>
            {locale === lang && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
