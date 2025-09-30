import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PhoneForm } from './phone-form'
import { OtpForm } from './otp-form'
import { ProfileForm } from './profile-form'
import { useI18n } from '@/features/shared/i18n'
import { useRouter } from '@tanstack/react-router'

type AuthStep = 'phone' | 'otp' | 'profile'

interface AuthContainerProps {
  callbackUrl?: string
}

export function AuthContainer({
  callbackUrl = '/dashboard',
}: AuthContainerProps) {
  const { t, dir } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')

  const handlePhoneSuccess = (phone: string) => {
    setPhoneNumber(phone)
    setStep('otp')
  }

  const handleOtpSuccess = (data: {
    needsProfile: boolean
    userId: string
  }) => {
    if (data.needsProfile) {
      setStep('profile')
    } else {
      router.navigate({ to: callbackUrl, reloadDocument: true })
    }
  }

  const handleBack = () => {
    setStep('phone')
  }

  const getTitle = () => {
    switch (step) {
      case 'phone':
        return t('auth.signInTitle')
      case 'otp':
        return t('auth.verifyTitle')
      case 'profile':
        return t('auth.profileTitle')
    }
  }

  const getSubtitle = () => {
    switch (step) {
      case 'phone':
        return t('auth.signInSubtitle')
      case 'otp':
        return t('auth.verifySubtitle')
      case 'profile':
        return t('auth.profileSubtitle')
    }
  }

  return (
    <Card className="w-full max-w-md" dir={dir}>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getSubtitle()}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' && <PhoneForm onSuccess={handlePhoneSuccess} />}
        {step === 'otp' && (
          <OtpForm
            phoneNumber={phoneNumber}
            onSuccess={handleOtpSuccess}
            onBack={handleBack}
          />
        )}
        {step === 'profile' && <ProfileForm callbackUrl={callbackUrl} />}
      </CardContent>
    </Card>
  )
}
