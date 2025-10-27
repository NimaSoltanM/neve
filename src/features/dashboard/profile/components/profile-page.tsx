import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile } from '../actions/get-profile.action'
import { updateProfile } from '../actions/update-profile.action'
import { useState } from 'react'
import { User, Upload, X } from 'lucide-react'
import { FileUpload } from '@/features/shared/upload/components/file-upload'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { t, dir } = useI18n()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  })

  // Update form when data loads
  const user = data?.user
  if (user && !formData.firstName && !isEditing) {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    })
  }

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setIsEditing(false)
      toast.success(t('profile.updateSuccess'))
    },
    onError: () => {
      toast.error(t('profile.updateError'))
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
      },
    })
  }

  const handleAvatarUpload = (url: string) => {
    updateMutation.mutate({
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: url,
      },
    })
    setShowAvatarUpload(false)
  }

  const handleRemoveAvatar = () => {
    updateMutation.mutate({
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: null,
      },
    })
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  const initials =
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div dir={dir} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.editProfile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {initials || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                >
                  <Upload className="h-4 w-4 me-2" />
                  {t('profile.uploadAvatar')}
                </Button>
                {user?.avatar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-4 w-4 me-2" />
                    {t('profile.removeAvatar')}
                  </Button>
                )}
              </div>
              {showAvatarUpload && (
                <div className="pt-2">
                  <FileUpload
                    category="avatars"
                    maxSize={5}
                    accept="image/*" // Simple string
                    onChange={(file) => {
                      // Correct prop with typed parameter
                      if (file && !Array.isArray(file)) {
                        handleAvatarUpload(file.url)
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('profile.personalInfo')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('profile.accountInfo')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('profile.phoneNumber')}</Label>
                <Input value={user?.phoneNumber || ''} disabled dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.memberSince')}</Label>
                <Input
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : ''
                  }
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                {t('common.edit')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? t('profile.saving')
                    : t('profile.saveChanges')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || '',
                    })
                  }}
                  disabled={updateMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-10 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
