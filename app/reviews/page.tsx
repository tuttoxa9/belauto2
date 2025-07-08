"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Star, User } from "lucide-react"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  carModel?: string
  createdAt: Date
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
      )
      const snapshot = await getDocs(reviewsQuery)
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Review[]

      setReviews(reviewsData)
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <div className="w-64 h-10 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="w-96 h-6 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          {/* Reviews grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-blue-600">
                Главная
              </a>
            </li>
            <li>/</li>
            <li className="text-gray-900">Отзывы</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Отзывы наших клиентов</h1>
          <p className="text-xl text-gray-600 mb-6">Узнайте, что говорят о нас наши довольные клиенты</p>

          {reviews.length > 0 && (
            <div className="flex items-center justify-center space-x-2">
              <div className="flex">{renderStars(Math.round(Number(getAverageRating())))}</div>
              <span className="text-lg font-semibold text-gray-900">{getAverageRating()}</span>
              <span className="text-gray-600">({reviews.length} отзывов)</span>
            </div>
          )}
        </div>

        {/* Отзывы */}
        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.name}</h3>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                  </div>

                  {review.carModel && (
                    <p className="text-sm text-blue-600 font-medium mb-2">Автомобиль: {review.carModel}</p>
                  )}

                  <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>

                  <p className="text-xs text-gray-500">
                    {review.createdAt.toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет отзывов</h3>
            <p className="text-gray-600">Станьте первым, кто оставит отзыв о нашей работе!</p>
          </div>
        )}
      </div>
    </div>
  )
}
