"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Trash2, Edit, Eye, Link as LinkIcon, GripVertical } from "lucide-react"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, setDoc, getDoc } from "firebase/firestore"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

interface Story {
  id: string
  mediaUrl: string
  mediaType: "image" | "video"
  caption: string
  subtitle?: string
  linkUrl?: string
  order: number
  createdAt: Date
}

interface StoriesSettings {
  title: string
  subtitle: string
}

export default function AdminStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [settings, setSettings] = useState<StoriesSettings>({
    title: "Свежие поступления и новости",
    subtitle: "Следите за нашими обновлениями",
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [previewStory, setPreviewStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cacheInvalidator = createCacheInvalidator('stories')

  const [formData, setFormData] = useState({
    caption: "",
    subtitle: "",
    linkUrl: "",
    file: null as File | null,
  })

  useEffect(() => {
    loadStories()
    loadSettings()
  }, [])

  const loadStories = async () => {
    try {
      const storiesQuery = query(collection(db, "stories"), orderBy("order", "asc"))
      const snapshot = await getDocs(storiesQuery)
      const storiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Story[]
      setStories(storiesData)
    } catch (error) {
      console.error("Ошибка загрузки историй:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "stories"))
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as StoriesSettings)
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    }
  }

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "stories"), settings)
      alert("Настройки сохранены!")
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error)
      alert("Ошибка сохранения настроек")
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, file }))
      } else {
        alert('Пожалуйста, загрузите изображение или видео')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const timestamp = Date.now()
    const fileName = `stories/${timestamp}_${file.name}`
    const storageRef = ref(storage, fileName)

    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  const handleSubmit = async () => {
    if (!formData.file) {
      alert("Пожалуйста, загрузите файл")
      return
    }

    setUploading(true)
    try {
      const mediaUrl = await uploadFile(formData.file)
      const mediaType = formData.file.type.startsWith('image/') ? 'image' : 'video'
      const nextOrder = stories && stories.length > 0 ? Math.max(...stories.map(s => s.order)) + 1 : 1

      const docRef = await addDoc(collection(db, "stories"), {
        mediaUrl,
        mediaType,
        caption: formData.caption,
        subtitle: formData.subtitle || null,
        linkUrl: formData.linkUrl || null,
        order: nextOrder,
        createdAt: new Date(),
      })

      await cacheInvalidator.onCreate(docRef.id)
      setFormData({ caption: "", subtitle: "", linkUrl: "", file: null })
      setIsAddDialogOpen(false)
      loadStories()
      alert("История добавлена!")
    } catch (error) {
      console.error("Ошибка добавления истории:", error)
      alert("Ошибка добавления истории")
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedStory) return

    try {
      let updateData: any = {
        caption: formData.caption,
        subtitle: formData.subtitle || null,
        linkUrl: formData.linkUrl || null,
      }

      if (formData.file) {
        const mediaUrl = await uploadFile(formData.file)
        const mediaType = formData.file.type.startsWith('image/') ? 'image' : 'video'
        updateData.mediaUrl = mediaUrl
        updateData.mediaType = mediaType
      }

      await updateDoc(doc(db, "stories", selectedStory.id), updateData)
      await cacheInvalidator.onUpdate(selectedStory.id)
      setIsEditDialogOpen(false)
      setSelectedStory(null)
      setFormData({ caption: "", subtitle: "", linkUrl: "", file: null })
      loadStories()
      alert("История обновлена!")
    } catch (error) {
      console.error("Ошибка обновления истории:", error)
      alert("Ошибка обновления истории")
    }
  }

  const handleDelete = async (story: Story) => {
    try {
      await deleteDoc(doc(db, "stories", story.id))
      await cacheInvalidator.onDelete(story.id)
      loadStories()
      alert("История удалена!")
    } catch (error) {
      console.error("Ошибка удаления истории:", error)
      alert("Ошибка удаления истории")
    }
  }

  const openEditDialog = (story: Story) => {
    setSelectedStory(story)
    setFormData({
      caption: story.caption,
      subtitle: story.subtitle || "",
      linkUrl: story.linkUrl || "",
      file: null,
    })
    setIsEditDialogOpen(true)
  }

  const openPreview = (story: Story) => {
    setPreviewStory(story)
    setIsPreviewOpen(true)
  }

  if (loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      {/* Настройки секции */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки секции историй</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={settings.title}
              onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Подзаголовок</Label>
            <Input
              id="subtitle"
              value={settings.subtitle}
              onChange={(e) => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
            />
          </div>
          <Button onClick={saveSettings}>Сохранить настройки</Button>
        </CardContent>
      </Card>

      {/* Управление историями */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Истории ({stories.length})</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить историю
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Добавить новую историю</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Drag & Drop область */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Перетащите изображение или видео сюда
                  </p>
                  <p className="text-xs text-gray-500">
                    Рекомендуемое соотношение 9:16 (вертикально)
                  </p>
                  <Button variant="outline" className="mt-4" type="button">
                    Выбрать файл
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {formData.file && (
                  <div className="text-sm text-green-600">
                    Выбран файл: {formData.file.name}
                  </div>
                )}

                <div>
                  <Label htmlFor="caption">Заголовок (необязательно)</Label>
                  <Textarea
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Введите заголовок к истории..."
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Подпись под квадратиком (необязательно)</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Введите подпись под квадратиком..."
                  />
                </div>

                <div>
                  <Label htmlFor="linkUrl">Ссылка (необязательно)</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="https://example.com или /catalog"
                  />
                </div>

                <Button onClick={handleSubmit} disabled={uploading} className="w-full">
                  {uploading ? "Загрузка..." : "Добавить историю"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Истории пока не добавлены
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stories && stories.map((story) => (
                <div key={story.id} className="group relative">
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                    {story.mediaType === 'image' ? (
                      <img
                        src={story.mediaUrl}
                        alt={story.caption}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={story.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}

                    {/* Затемнение для подписи */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs line-clamp-2">{story.caption}</p>
                      {story.subtitle && (
                        <p className="text-white/80 text-xs mt-1 line-clamp-1">{story.subtitle}</p>
                      )}
                    </div>

                    {/* Значок ссылки */}
                    {story.linkUrl && (
                      <div className="absolute top-2 right-2">
                        <LinkIcon className="h-4 w-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>

                  {/* Управляющие кнопки */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openPreview(story)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditDialog(story)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить историю?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. История будет удалена навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(story)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="outline">{story.mediaType}</Badge>
                    <span className="text-xs text-gray-500">#{story.order}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать историю</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Загрузить новый файл (необязательно)
              </p>
            </div>

            {formData.file && (
              <div className="text-sm text-green-600">
                Выбран новый файл: {formData.file.name}
              </div>
            )}

            <div>
              <Label htmlFor="edit-caption">Заголовок (необязательно)</Label>
              <Textarea
                id="edit-caption"
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-subtitle">Подпись под квадратиком (необязательно)</Label>
              <Input
                id="edit-subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Введите подпись под квадратиком..."
              />
            </div>

            <div>
              <Label htmlFor="edit-linkUrl">Ссылка</Label>
              <Input
                id="edit-linkUrl"
                value={formData.linkUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="https://example.com или /catalog"
              />
            </div>

            <Button onClick={handleEdit} className="w-full">
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог предпросмотра */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md p-0 bg-black border-none">
          {previewStory && (
            <div className="relative aspect-[9/16]">
              {previewStory.mediaType === 'image' ? (
                <img
                  src={previewStory.mediaUrl}
                  alt={previewStory.caption}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={previewStory.mediaUrl}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                />
              )}

              {/* Подпись с затемнением */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm">{previewStory.caption}</p>
                {previewStory.linkUrl && (
                  <p className="text-blue-300 text-xs mt-1">
                    <LinkIcon className="h-3 w-3 inline mr-1" />
                    {previewStory.linkUrl}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
