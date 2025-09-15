// src/routes/test-upload.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { FileUpload } from '@/features/shared/upload/components/file-upload'
import { useI18n, LanguageSwitcher } from '@/features/shared/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UploadedFile } from '@/features/shared/upload/types/upload.types'

export const Route = createFileRoute('/test-upload')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t, dir } = useI18n()

  // Different test cases
  const [singleImage, setSingleImage] = useState<UploadedFile | null>(null)
  const [multipleImages, setMultipleImages] = useState<UploadedFile[]>([])
  const [document, setDocument] = useState<UploadedFile | null>(null)
  const [avatar, setAvatar] = useState<UploadedFile | null>(null)

  const handleSubmit = () => {
    console.log('=== Form Data ===')
    console.log('Single Image:', singleImage)
    console.log('Multiple Images:', multipleImages)
    console.log('Document:', document)
    console.log('Avatar:', avatar)

    alert('Check console for uploaded data!')
  }

  const resetAll = () => {
    setSingleImage(null)
    setMultipleImages([])
    setDocument(null)
    setAvatar(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={dir}>
      {/* Language Switcher */}
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      <h1 className="text-3xl font-bold">File Upload Test Page</h1>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Image</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Images</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Single Image Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                accept="image/*"
                maxSize={5}
                value={singleImage}
                onChange={(files) =>
                  setSingleImage(files as UploadedFile | null)
                }
                category="products"
              />

              {singleImage && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Uploaded Data:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(singleImage, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiple">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Images Upload (Max 5 files)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                accept="image/*"
                maxSize={10}
                multiple
                value={multipleImages}
                onChange={(files) =>
                  setMultipleImages((files as UploadedFile[]) || [])
                }
                category="gallery"
              />

              {multipleImages.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">
                    Uploaded {multipleImages.length} files:
                  </h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(multipleImages, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload (PDF only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                accept=".pdf"
                maxSize={20}
                value={document}
                onChange={(files) => setDocument(files as UploadedFile | null)}
                category="documents"
              />

              {document && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Document Data:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(document, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>Avatar Upload (Small size, square preview)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                accept="image/*"
                maxSize={2}
                value={avatar}
                onChange={(files) => setAvatar(files as UploadedFile | null)}
                category="avatars"
              />

              {avatar && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar.url}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-2"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Preview as avatar
                      </p>
                      <p className="text-xs">{avatar.name}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Avatar Data:</h3>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(avatar, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Single Image:</span>
              <p className="font-semibold">
                {singleImage ? '✅ Uploaded' : '❌ Empty'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Multiple Images:</span>
              <p className="font-semibold">{multipleImages.length} files</p>
            </div>
            <div>
              <span className="text-muted-foreground">Document:</span>
              <p className="font-semibold">
                {document ? '✅ Uploaded' : '❌ Empty'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Avatar:</span>
              <p className="font-semibold">
                {avatar ? '✅ Uploaded' : '❌ Empty'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Submit All (Check Console)
            </Button>
            <Button onClick={resetAll} variant="outline">
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Try drag & drop files into the upload areas</li>
            <li>Click to browse and select files</li>
            <li>Test file size limits (check each tab for limits)</li>
            <li>Try uploading wrong file types (e.g., image in PDF area)</li>
            <li>Delete uploaded files using the X button</li>
            <li>Switch language to test RTL layout</li>
            <li>Check console for uploaded file data structure</li>
            <li>Test multiple file upload (add files incrementally)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
