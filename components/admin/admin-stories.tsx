"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { uploadImageToSupabase } from "@/lib/storage"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink, GripVertical } from "lucide-react"
import ImageUpload from "./image-upload"

export default function AdminStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingStory, setEditingStory] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const cacheInvalidator = createCacheInvalidator('stories')
  const [storyForm, setStoryForm] = useState({
    title: "",
    image_url: "",
    link: "",
    order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error

      setStories(data || [])
    } catch (error) {
      console.error("Ошибка загрузки историй:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStory) {
        // Обновление существующей истории
        const { error } = await supabase
          .from('stories')
          .update({
            title: storyForm.title,
            image_url: storyForm.image_url,
            link: storyForm.link,
            order: storyForm.order,
            is_active: storyForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingStory.id)

        if (error) throw error
      } else {
        // Создание новой истории
        const { error } = await supabase
          .from('stories')
          .insert([{
            title: storyForm.title,
            image_url: storyForm.image_url,
            link: storyForm.link,
            order: storyForm.order,
            is_active: storyForm.is_active
          }])

        if (error) throw error
      }

      await cacheInvalidator.invalidateCache()
      await loadStories()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Ошибка сохранения истории:", error)
      alert("Ошибка сохранения истории")
    }
  }

  const handleEdit = (story) => {
    setEditingStory(story)
    setStoryForm({
      title: story.title,
      image_url: story.image_url,
      link: story.link || "",
      order: story.order,
      is_active: story.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (storyId) => {
    if (!confirm("Вы уверены, что хотите удалить эту историю?")) return

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)

      if (error) throw error

      await cacheInvalidator.invalidateCache()
      await loadStories()
    } catch (error) {
      console.error("Ошибка удаления истории:", error)
      alert("Ошибка удаления истории")
    }
  }

  const toggleActive = async (story) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          is_active: !story.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', story.id)

      if (error) throw error

      await cacheInvalidator.invalidateCache()
      await loadStories()
    } catch (error) {
      console.error("Ошибка изменения статуса истории:", error)
      alert("Ошибка изменения статуса истории")
    }
  }

  const resetForm = () => {
    setEditingStory(null)
    setStoryForm({
      title: "",
      image_url: "",
      link: "",
      order: stories.length,
      is_active: true,
    })
  }

  const handleImageUpload = async (file) => {
    try {
      const imageUrl = await uploadImageToSupabase(file, 'stories')
      setStoryForm({ ...storyForm, image_url: imageUrl })
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error)
      alert("Ошибка загрузки изображения")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Истории</h2>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Истории</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить историю
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStory ? "Редактировать историю" : "Добавить историю"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Заголовок</Label>
                <Input
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Изображение</Label>
                <ImageUpload
                  value={storyForm.image_url}
                  onChange={(url) => setStoryForm({ ...storyForm, image_url: url })}
                  onFileUpload={handleImageUpload}
                />
              </div>
              <div>
                <Label>Ссылка (необязательно)</Label>
                <Input
                  value={storyForm.link}
                  onChange={(e) => setStoryForm({ ...storyForm, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Порядок</Label>
                <Input
                  type="number"
                  value={storyForm.order}
                  onChange={(e) => setStoryForm({ ...storyForm, order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={storyForm.is_active}
                  onCheckedChange={(checked) => setStoryForm({ ...storyForm, is_active: checked })}
                />
                <Label>Активна</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingStory ? "Сохранить" : "Добавить"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {stories.map((story) => (
          <Card key={story.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
                <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {story.image_url ? (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{story.title}</h3>
                    <Badge variant={story.is_active ? "default" : "secondary"}>
                      {story.is_active ? "Активна" : "Неактивна"}
                    </Badge>
                    <span className="text-sm text-gray-500">Порядок: {story.order}</span>
                  </div>
                  {story.link && (
                    <div className="flex items-center space-x-1 mb-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <a
                        href={story.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate"
                      >
                        {story.link}
                      </a>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(story.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(story)}
                  >
                    {story.is_active ? "Скрыть" : "Показать"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(story)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(story.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет историй</h3>
          <p className="text-gray-500">Добавьте первую историю для отображения в слайдере</p>
        </div>
      )}
    </div>
  )
}
