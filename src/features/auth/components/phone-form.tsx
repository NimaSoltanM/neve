import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useI18n } from '@/features/shared/i18n'
import { sendOtp } from '../actions/send-otp.action'
import { Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/, 'auth.invalidPhoneNumber'),
})

type PhoneFormData = z.infer<typeof phoneSchema>

interface PhoneFormProps {
  onSuccess: (phoneNumber: string) => void
}

export function PhoneForm({ onSuccess }: PhoneFormProps) {
  const { t } = useI18n()

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const sendOtpMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data, variables) => {
      // Check if action returned success or error
      if (!data.success) {
        toast.error(t(data.errorKey)) // ✅ Translate error key
        return
      }

      // Success case
      toast.success(t('auth.codeSent'))
      console.log('code is:', data.code)

      if (data.code) {
        toast.info(`Your OTP code: ${data.code}`, {
          duration: 10000,
          action: {
            label: t('common.copy'),
            onClick: () => navigator.clipboard.writeText(data.code),
          },
        })
      }

      onSuccess(variables.data.phoneNumber)
    },
    onError: () => {
      // Network/unexpected errors only
      toast.error(t('common.error'))
    },
  })
  const onSubmit = (data: PhoneFormData) => {
    sendOtpMutation.mutate({ data })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.phoneNumber')}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    dir="ltr"
                    placeholder={t('auth.phoneNumberPlaceholder')}
                    className="ps-10"
                    maxLength={11}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={sendOtpMutation.isPending}
        >
          {sendOtpMutation.isPending && (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          )}
          {t('auth.sendCode')}
        </Button>
      </form>
    </Form>
  )
}
