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
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

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

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data.success) {
        onSuccess({
          needsProfile: !!data.needsProfile,
          userId: data.userId!,
        })
      } else {
        toast.error(t(data.errorKey))
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
    onSuccess: () => {
      toast.success(t('auth.codeSent'))
      setResendTimer(120)
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
                    <InputOTPGroup dir="ltr" className="text-5xl">
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
