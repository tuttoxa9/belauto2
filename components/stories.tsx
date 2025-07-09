"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import FadeInImage from "@/components/fade-in-image"
import { supabase } from "@/lib/supabase"

interface Story {
  id: string
  title: string
  image_url: string
  link?: string
  order: number
  is_active: boolean
  created_at: string
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
      const { data, error } = await supabase
        .from('content_pages')
        .select('content')
        .eq('page', 'stories')
        .single()

      if (error) {
        console.error("Ошибка загрузки настроек историй:", error)
        return
      }

      if (data && data.content) {
        setSettings({
          title: data.content.title || "Свежие поступления и новости",
          subtitle: data.content.subtitle || "Следите за нашими обновлениями"
        })
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек историй:", error)
    }
  }

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true })

      if (error) throw error

      setStories(data || [])
    } catch (error) {
      console.error("Ошибка загрузки историй:", error)
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
    if (story.link) {
      if (story.link.startsWith('http')) {
        window.open(story.link, '_blank')
      } else {
        window.location.href = story.link
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
                    src={story.image_url || "/placeholder.svg"}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center mt-2 max-w-16">
                <p className="text-xs text-gray-600 truncate font-medium">{story.title}</p>
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
                <FadeInImage
                  src={stories[currentIndex].image_url || "/placeholder.svg"}
                  alt={stories[currentIndex].title}
                  className="w-full h-full object-cover"
                />

                {/* Подпись с затемнением */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-sm font-medium">{stories[currentIndex].title}</p>
                  {stories[currentIndex].link && (
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
