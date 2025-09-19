import { useI18n } from '../context'
import { LOCALES } from '../constants'
import type { Locale } from '../constants'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const languages: Record<Locale, string> = {
    en: 'English',
    fa: 'فارسی',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{languages[locale]}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(val) => setLocale(val as Locale)}
        >
          {LOCALES.map((lang) => (
            <DropdownMenuRadioItem key={lang} value={lang}>
              {languages[lang]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
