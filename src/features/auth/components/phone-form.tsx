// features/auth/components/phone-form.tsx
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
import { useSetAtom } from 'jotai'
import { otpAtom } from '../stores/otp.store'
import { useState } from 'react'

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/, 'auth.invalidPhoneNumber'),
})

type PhoneFormData = z.infer<typeof phoneSchema>

interface PhoneFormProps {
  onSuccess: (phoneNumber: string) => void
}

export function PhoneForm({ onSuccess }: PhoneFormProps) {
  const { t } = useI18n()
  const setOtp = useSetAtom(otpAtom)
  const [debugCode, setDebugCode] = useState<string | null>(null)

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const sendOtpMutation = useMutation({
    mutationFn: async (input: { data: PhoneFormData }) => {
      const result = await sendOtp(input)
      return result
    },
    onSuccess: (data, variables) => {
      if (data?.code) {
        setDebugCode(data.code)
        setOtp({
          code: data.code,
          phoneNumber: variables.data.phoneNumber,
          expiresAt: Date.now() + 120000,
        })
      }

      // Always call onSuccess to move to next step
      onSuccess(variables.data.phoneNumber)
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast.error(t('common.error'))
    },
  })

  const onSubmit = (data: PhoneFormData) => {
    console.log('Form submitted with:', data)
    sendOtpMutation.mutate({ data })
  }

  return (
    <>
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

      {/* Debug display - remove in production */}
      {debugCode && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-md">
          <p className="text-sm font-medium">Debug: OTP Code is {debugCode}</p>
        </div>
      )}
    </>
  )
}
