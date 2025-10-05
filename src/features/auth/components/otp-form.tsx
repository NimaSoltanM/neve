// features/auth/components/otp-form.tsx
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useI18n } from '@/features/shared/i18n'
import { verifyOtp } from '../actions/verify-otp.action'
import { sendOtp } from '../actions/send-otp.action'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAtom } from 'jotai'
import { otpAtom } from '../stores/otp.store'
import { Card } from '@/components/ui/card'

const otpSchema = z.object({
  code: z.string().length(5, 'auth.invalidCode'),
})

type OtpFormData = z.infer<typeof otpSchema>

interface OtpFormProps {
  phoneNumber: string
  onSuccess: (data: { needsProfile: boolean; userId: string }) => void
  onBack: () => void
}

export function OtpForm({ phoneNumber, onSuccess, onBack }: OtpFormProps) {
  const { t, dir } = useI18n()
  const [resendTimer, setResendTimer] = useState(120)
  const [otp, setOtp] = useAtom(otpAtom)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  })

  // REMOVED: Auto-fill effect

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data.success) {
        setOtp({ code: null, phoneNumber: null, expiresAt: null })
        onSuccess({
          needsProfile: !!data.needsProfile,
          userId: data.userId!,
        })
      } else {
        toast.error(t(data.errorKey) || t('common.error'))
        form.reset()
      }
    },
    onError: () => {
      toast.error(t('common.error'))
      form.reset()
    },
  })

  const resendMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(t(data.errorKey) || t('common.error'))
        return
      }

      if (data.code) {
        setOtp({
          code: data.code,
          phoneNumber: phoneNumber,
          expiresAt: Date.now() + 120000,
        })
      }

      toast.success(t('auth.codeSent'))
      setResendTimer(120)
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const onSubmit = (data: OtpFormData) => {
    verifyMutation.mutate({ data: { phoneNumber, code: data.code } })
  }

  const handleResend = () => {
    if (resendTimer === 0) {
      resendMutation.mutate({ data: { phoneNumber } })
    }
  }

  const handleCopyCode = () => {
    if (otp.code) {
      navigator.clipboard.writeText(otp.code)
      setCopied(true)
      toast.success('Code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <BackIcon className="me-2 h-4 w-4" />
        {t('common.back')}
      </Button>

      <p className="text-sm text-muted-foreground">
        {t('auth.verifySubtitle')}{' '}
        <span dir="ltr" className="font-medium">
          {phoneNumber}
        </span>
      </p>

      {/* Prominent OTP Display */}
      {otp.code && (
        <Card className="border-2 border-primary/30 bg-primary/5 p-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-muted-foreground">
              Development Mode - Your OTP Code:
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-mono font-bold tracking-[0.5em] text-primary">
                {otp.code}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="h-10 w-10"
              >
                {copied ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground opacity-70">
              This is only visible in development mode
            </p>
          </div>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.otpCode')}</FormLabel>
                <FormControl>
                  <InputOTP maxLength={5} {...field}>
                    <InputOTPGroup dir="ltr" className="justify-center">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending && (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            )}
            {t('auth.verifyCode')}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resendTimer > 0 || resendMutation.isPending}
          >
            {resendTimer > 0
              ? `${t('auth.resendIn')} ${resendTimer}s`
              : t('auth.resendCode')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
