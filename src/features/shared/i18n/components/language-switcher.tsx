import { useI18n } from '../context'
import { LOCALES } from '../constants'
import type { Locale } from '../constants'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const languages: Record<Locale, string> = {
    en: 'English',
    fa: 'فارسی',
  }

  return (
    <div className="flex gap-2">
      {LOCALES.map((lang) => (
        <Button
          key={lang}
          variant={locale === lang ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLocale(lang)}
        >
          {languages[lang]}
        </Button>
      ))}
    </div>
  )
}
