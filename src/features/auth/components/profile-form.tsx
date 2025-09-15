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
import { updateProfile } from '../actions/update-profile.action'
import { Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 characters'),
  lastName: z.string().min(2, 'Minimum 2 characters'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  callbackUrl?: string
}

export function ProfileForm({ callbackUrl = '/dashboard' }: ProfileFormProps) {
  const { t } = useI18n()
  const router = useRouter()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success(t('common.success'))
      router.navigate({ to: callbackUrl })
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate({ data })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.firstName')}</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder={t('auth.firstNamePlaceholder')}
                    className="ps-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.lastName')}</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder={t('auth.lastNamePlaceholder')}
                    className="ps-10"
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
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending && (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          )}
          {t('auth.completeProfile')}
        </Button>
      </form>
    </Form>
  )
}
