"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Star, User } from "lucide-react"

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const cacheInvalidator = createCacheInvalidator('reviews')
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
    is_approved: true,
  })

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingReview) {
        // Обновление существующего отзыва
        const { error } = await supabase
          .from('reviews')
          .update({
            name: reviewForm.name,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            is_approved: reviewForm.is_approved,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReview.id)

        if (error) throw error
      } else {
        // Создание нового отзыва
        const { error } = await supabase
          .from('reviews')
          .insert([{
            name: reviewForm.name,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            is_approved: reviewForm.is_approved
          }])

        if (error) throw error
      }

      await cacheInvalidator.invalidateCache()
      await loadReviews()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Ошибка сохранения отзыва:", error)
      alert("Ошибка сохранения отзыва")
    }
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    setReviewForm({
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      is_approved: review.is_approved,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (reviewId) => {
    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      await cacheInvalidator.invalidateCache()
      await loadReviews()
    } catch (error) {
      console.error("Ошибка удаления отзыва:", error)
      alert("Ошибка удаления отзыва")
    }
  }

  const toggleApproval = async (review) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          is_approved: !review.is_approved,
          updated_at: new Date().toISOString()
        })
        .eq('id', review.id)

      if (error) throw error

      await cacheInvalidator.invalidateCache()
      await loadReviews()
    } catch (error) {
      console.error("Ошибка изменения статуса отзыва:", error)
      alert("Ошибка изменения статуса отзыва")
    }
  }

  const resetForm = () => {
    setEditingReview(null)
    setReviewForm({
      name: "",
      rating: 5,
      comment: "",
      is_approved: true,
    })
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Отзывы</h2>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Отзывы</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить отзыв
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingReview ? "Редактировать отзыв" : "Добавить отзыв"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Имя</Label>
                <Input
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Рейтинг</Label>
                <Select
                  value={reviewForm.rating.toString()}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, rating: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex items-center space-x-2">
                          <span>{rating}</span>
                          <div className="flex">
                            {renderStars(rating)}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Отзыв</Label>
                <Textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div>
                <Label>Статус</Label>
                <Select
                  value={reviewForm.is_approved ? "approved" : "pending"}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, is_approved: value === "approved" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Одобрен</SelectItem>
                    <SelectItem value="pending">На модерации</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingReview ? "Сохранить" : "Добавить"}
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
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{review.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <Badge variant={review.is_approved ? "default" : "secondary"}>
                      {review.is_approved ? "Одобрен" : "На модерации"}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleApproval(review)}
                  >
                    {review.is_approved ? "Скрыть" : "Одобрить"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(review)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет отзывов</h3>
          <p className="text-gray-500">Добавьте первый отзыв для отображения</p>
        </div>
      )}
    </div>
  )
}
