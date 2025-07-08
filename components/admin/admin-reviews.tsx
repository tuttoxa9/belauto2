"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
    text: "",
    carModel: "",
    status: "published",
  })

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const reviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(reviewsQuery)
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }))
      setReviews(reviewsData)
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const reviewData = {
        ...reviewForm,
        rating: Number(reviewForm.rating),
        createdAt: editingReview ? editingReview.createdAt : new Date(),
        updatedAt: new Date(),
      }

      if (editingReview) {
        await updateDoc(doc(db, "reviews", editingReview.id), reviewData)
        await cacheInvalidator.onUpdate(editingReview.id)
      } else {
        const docRef = await addDoc(collection(db, "reviews"), reviewData)
        await cacheInvalidator.onCreate(docRef.id)
      }

      setIsDialogOpen(false)
      setEditingReview(null)
      resetForm()
      loadReviews()
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка сохранения отзыва")
    }
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    setReviewForm({
      name: review.name,
      rating: review.rating,
      text: review.text,
      carModel: review.carModel || "",
      status: review.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (reviewId) => {
    if (confirm("Удалить этот отзыв?")) {
      try {
        await deleteDoc(doc(db, "reviews", reviewId))
        await cacheInvalidator.onDelete(reviewId)
        loadReviews()
      } catch (error) {
        console.error("Ошибка удаления:", error)
        alert("Ошибка удаления отзыва")
      }
    }
  }

  const resetForm = () => {
    setReviewForm({
      name: "",
      rating: 5,
      text: "",
      carModel: "",
      status: "published",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Опубликован"
      case "pending":
        return "На модерации"
      case "rejected":
        return "Отклонен"
      default:
        return status
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return <div className="text-center py-8 text-white">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Управление отзывами</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingReview(null)
              }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить отзыв
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{editingReview ? "Редактировать" : "Добавить"} отзыв</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white">Имя клиента</Label>
                <Input
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div>
                <Label className="text-white">Рейтинг</Label>
                <Select
                  value={reviewForm.rating.toString()}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, rating: Number(value) })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex items-center space-x-2">
                          <span>{rating}</span>
                          <div className="flex">{renderStars(rating)}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Модель автомобиля (опционально)</Label>
                <Input
                  value={reviewForm.carModel}
                  onChange={(e) => setReviewForm({ ...reviewForm, carModel: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Текст отзыва</Label>
                <Textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label className="text-white">Статус</Label>
                <Select
                  value={reviewForm.status}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, status: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="published">Опубликован</SelectItem>
                    <SelectItem value="pending">На модерации</SelectItem>
                    <SelectItem value="rejected">Отклонен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                  {editingReview ? "Сохранить" : "Добавить"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews && reviews.map((review) => (
          <Card key={review.id} className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-white">{review.name}</h3>
                    <div className="flex">{renderStars(review.rating)}</div>
                    <Badge className={getStatusColor(review.status)}>{getStatusText(review.status)}</Badge>
                  </div>
                  {review.carModel && <p className="text-sm text-slate-400 mb-2">Автомобиль: {review.carModel}</p>}
                  <p className="text-slate-300 mb-3">{review.text}</p>
                  <p className="text-xs text-slate-500">{review.createdAt.toLocaleDateString("ru-RU")}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(review)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(review.id)}
                    className="border-slate-600 text-white hover:bg-slate-700"
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
          <User className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-400">Отзывы не добавлены</p>
        </div>
      )}
    </div>
  )
}
