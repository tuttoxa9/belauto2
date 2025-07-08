"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import FadeInImage from "@/components/fade-in-image"
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

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

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([])
  const [settings, setSettings] = useState<StoriesSettings>({
    title: "Свежие поступления и новости",
    subtitle: "Следите за нашими обновлениями",
  })
  const [selectedStory, setSelectedStory] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "stories"))
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as StoriesSettings)
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек историй:", error)
    }
  }

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
      // Используем моковые данные в случае ошибки
      setStories([
        {
          id: "1",
          mediaUrl: "/placeholder.svg?height=600&width=400",
          mediaType: "image",
          caption: "Новое поступление BMW X5 2020",
          order: 1,
          createdAt: new Date(),
        },
        {
          id: "2",
          mediaUrl: "/placeholder.svg?height=600&width=400",
          mediaType: "image",
          caption: "Audi A6 в отличном состоянии",
          order: 2,
          createdAt: new Date(),
        },
        {
          id: "3",
          mediaUrl: "/placeholder.svg?height=600&width=400",
          mediaType: "image",
          caption: "Mercedes-Benz C-Class готов к продаже",
          order: 3,
          createdAt: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (selectedStory !== null && isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext()
            return 0
          }
          return prev + 2
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [selectedStory, isPlaying])

  const handleStoryClick = (index: number) => {
    // Всегда открываем полноэкранный просмотр
    setSelectedStory(index)
    setCurrentIndex(index)
    setProgress(0)
    setIsPlaying(true)
    setViewedStories((prev) => new Set([...prev, stories[index].id]))
  }

  const handleFullscreenClick = () => {
    const story = stories[currentIndex]

    // Если у истории есть ссылка, переходим по ней
    if (story.linkUrl) {
      if (story.linkUrl.startsWith('http')) {
        window.open(story.linkUrl, '_blank')
      } else {
        window.location.href = story.linkUrl
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setProgress(0)
      setViewedStories((prev) => new Set([...prev, stories[nextIndex].id]))
    } else {
      setSelectedStory(null)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setProgress(0)
    }
  }

  const handleClose = () => {
    setSelectedStory(null)
    setProgress(0)
    setIsPlaying(true)
  }

  if (loading) {
    return (
      <div className="container px-4">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="flex space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                <div className="text-center mt-2 max-w-16">
                  <div className="h-3 bg-gray-300 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stories.length === 0) return null

  return (
    <>
      {/* Лента историй */}
      <div className="container px-4">
        <div className="mb-2">
          <h2 className="text-lg md:text-xl font-display font-bold text-gray-900 tracking-tight">{settings.title}</h2>
        </div>
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          {stories && stories.map((story, index) => (
            <button key={story.id} onClick={() => handleStoryClick(index)} className="flex-shrink-0 relative group">
              <div
                className={`w-16 h-16 rounded-full p-1 transition-all duration-300 border-2 ${
                  viewedStories.has(story.id) ? "border-gray-300" : "border-gradient-to-r from-purple-500 to-pink-500"
                } group-hover:scale-105`}
                style={!viewedStories.has(story.id) ? {
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  padding: '2px'
                } : {}}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <FadeInImage
                    src={story.mediaUrl || "/placeholder.svg"}
                    alt={story.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {story.mediaType === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="h-2.5 w-2.5 text-gray-800 ml-0.5" />
                  </div>
                </div>
              )}
              <div className="text-center mt-2 max-w-16">
                <p className="text-xs text-gray-600 truncate font-medium">{story.caption}</p>
                {story.subtitle && (
                  <p className="text-xs text-gray-500 truncate mt-1">{story.subtitle}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Полноэкранный просмотрщик */}
      <Dialog open={selectedStory !== null} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-0 bg-black border-none">
          {selectedStory !== null && (
            <div className="relative h-[600px] w-full">
              {/* Индикаторы прогресса */}
              <div className="absolute top-4 left-4 right-4 z-10 flex space-x-1">
                {stories && stories.map((_, index) => (
                  <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-100"
                      style={{
                        width: index < currentIndex ? "100%" : index === currentIndex ? `${progress}%` : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Контент истории */}
              <div
                className="relative h-full cursor-pointer"
                onClick={handleFullscreenClick}
              >
                {stories[currentIndex].mediaType === "image" ? (
                  <FadeInImage
                    src={stories[currentIndex].mediaUrl || "/placeholder.svg"}
                    alt={stories[currentIndex].caption}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={stories[currentIndex].mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                  />
                )}

                {/* Подпись с затемнением */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-sm font-medium">{stories[currentIndex].caption}</p>
                  {stories[currentIndex].linkUrl && (
                    <p className="text-blue-300 text-xs mt-1 flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Нажмите, чтобы перейти по ссылке
                    </p>
                  )}
                </div>
              </div>

              {/* Кнопки управления */}
              <div className="absolute inset-0 flex pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  className="flex-1 flex items-center justify-start pl-4 pointer-events-auto"
                  disabled={currentIndex === 0}
                >
                  {currentIndex > 0 && <ChevronLeft className="h-8 w-8 text-white/70 hover:text-white" />}
                </button>



                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="flex-1 flex items-center justify-end pr-4 pointer-events-auto"
                >
                  <ChevronRight className="h-8 w-8 text-white/70 hover:text-white" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
