"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import Stories from "@/components/stories"
import CarCard from "@/components/car-card"
import CarCardSkeleton from "@/components/car-card-skeleton"
import FadeInImage from "@/components/fade-in-image"
import { CheckCircle, Check } from "lucide-react"
import { collection, query, orderBy, limit, getDocs, doc, getDoc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"

interface HomepageSettings {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  ctaTitle: string
  ctaSubtitle: string
}

// Моковые данные удалены

export default function HomePage() {
  const [searchForm, setSearchForm] = useState({
    make: "",
    model: "",
    priceFrom: "",
    priceTo: "",
  })

  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "+375",
  })

  const [cars, setCars] = useState([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [settings, setSettings] = useState<HomepageSettings>({
    heroTitle: "Найди свой автомобиль надежным способом",
    heroSubtitle: "Поможем вам с приобретением автомобиля",
    heroButtonText: "Посмотреть каталог",
    ctaTitle: "Не нашли подходящий автомобиль?",
    ctaSubtitle: "Оставьте заявку, и мы подберем автомобиль специально для вас",
  })

  useEffect(() => {
    loadHomepageSettings()
    loadFeaturedCars()
  }, [])

  const loadHomepageSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "homepage"))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as Partial<HomepageSettings>
        setSettings((prev) => ({
          ...prev,
          ...data,
        }))
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек главной страницы:", error)
    }
  }

  const loadFeaturedCars = async () => {
    try {
      setLoadingCars(true)
      const carsQuery = query(collection(db, "cars"), orderBy("createdAt", "desc"), limit(4))
      const snapshot = await getDocs(carsQuery)
      const carsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      if (carsData.length > 0) {
        setCars(carsData as any)
      }
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error)
    } finally {
      setLoadingCars(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchForm.make) params.set("make", searchForm.make)
    if (searchForm.model) params.set("model", searchForm.model)
    if (searchForm.priceFrom) params.set("priceFrom", searchForm.priceFrom)
    if (searchForm.priceTo) params.set("priceTo", searchForm.priceTo)

    window.location.href = `/catalog?${params.toString()}`
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Сохраняем в Firebase
      await addDoc(collection(db, "leads"), {
        ...contactForm,
        type: "car_selection",
        status: "new",
        createdAt: new Date(),
      })

      // Отправляем уведомление в Telegram
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactForm,
          type: 'car_selection'
        })
      })

      setContactForm({ name: "", phone: "+375" })
      alert("Заявка отправлена! Мы свяжемся с вами в ближайшее время.")
    } catch (error) {
      console.error("Ошибка отправки заявки:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы кроме +
    let numbers = value.replace(/[^\d+]/g, "")

    // Если нет + в начале, добавляем +375
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }

    // Берем только +375 и следующие 9 цифр максимум
    const prefix = "+375"
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)

    return prefix + afterPrefix
  }

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375")
  }

  return (
    <div className="min-h-screen bg-gray-100 homepage -mt-14">
      {/* Главный баннер */}
      <section className="relative min-h-[85vh] sm:min-h-[80vh] md:min-h-[75vh] lg:min-h-[80vh] xl:min-h-[85vh] flex items-center justify-center pt-14">

        {/* Фоновое изображение для ПК */}
        <div
          className="absolute hero-bg-desktop hidden md:block"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: '150px', // Заканчиваем фон ДО блока историй
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${getCachedImageUrl('/mainTouran.PNG')}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 90%',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Фоновое изображение для мобильных */}
        <div
          className="absolute hero-bg-mobile block md:hidden"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: '120px', // Увеличиваем отступ снизу для лучшего перехода
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${getCachedImageUrl('/mainTouran-mobile.jpg')}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top', // Изменяем позицию на center top
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="relative z-30 text-center text-white max-w-4xl mx-auto px-4 pb-40 sm:pb-32 md:pb-24 lg:pb-32 xl:pb-20 hero-content">
          <h1 className="text-hero text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 leading-tight">
            Найди свой <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">идеальный автомобиль</span> надежным способом
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-16 lg:mb-20 xl:mb-24 text-gray-100 font-medium leading-relaxed">
            {settings.heroSubtitle}
          </p>

          <div className="relative z-50">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              asChild
            >
              <a href="/catalog">{settings.heroButtonText}</a>
            </Button>
          </div>
        </div>

        {/* Закругленный переход с Stories */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[30px] z-20">
          {/* Блок "Свежие поступления и новости" интегрированный в закругление */}
          <div className="pt-3 pb-10 bg-gradient-to-b from-white to-gray-200 relative rounded-t-[30px]">
            <Stories />
          </div>
        </div>
      </section>

      {/* Блок Stories больше не нужен отдельно */}

      {/* Блок "Специальное предложение" */}
      <section className="pt-8 pb-20 bg-gray-100 relative rounded-t-[30px] -mt-6">
        <div className="container px-4">

          {loadingCars ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <CarCardSkeleton key={index} />
              ))}
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl p-12 shadow-lg max-w-md mx-auto">
                <div className="text-6xl mb-6">🚗</div>
                <h3 className="font-display text-2xl font-semibold text-gray-900 mb-4">
                  Скоро здесь появятся автомобили
                </h3>
                <p className="text-gray-600 mb-6">
                  Мы работаем над наполнением каталога лучшими предложениями
                </p>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 hover:shadow-lg transition-all duration-300"
              asChild
            >
              <a href="/catalog">Посмотреть весь каталог</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Блок призыва к действию */}
      <section className="relative pt-12 sm:pt-16 pb-32 sm:pb-40 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-[30px] sm:rounded-t-[50px] -mb-20 overflow-hidden">
        {/* Фоновое изображение автомобиля */}
        <div
          className="absolute inset-0 opacity-20 bg-no-repeat bg-center mix-blend-overlay bg-[length:90%] md:bg-[length:60%]"
          style={{
            backgroundImage: `url('${getCachedImageUrl('/car.png')}')`,
            backgroundPosition: 'center 70%',
            filter: 'brightness(0) invert(1)'
          }}
        />

        <div className="container px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{settings.ctaTitle}</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100">{settings.ctaSubtitle}</p>

            {/* Оптимизированная форма для мобильных */}
            <form onSubmit={handleContactSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center max-w-lg mx-auto">
              <div className="flex-1 sm:flex-none sm:w-32">
                <Input
                  placeholder="Имя"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="bg-white/10 backdrop-blur-md border-white/40 text-white placeholder:text-white/60 focus:border-white/80 focus:bg-white/20 h-10 sm:h-9 text-sm w-full"
                />
              </div>
              <div className="flex-1 sm:flex-none sm:w-40 relative">
                <Input
                  placeholder="+375XXXXXXXXX"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                  required
                  className="bg-white/10 backdrop-blur-md border-white/40 text-white placeholder:text-white/60 focus:border-white/80 focus:bg-white/20 h-10 sm:h-9 text-sm w-full pr-8"
                />
                {isPhoneValid(contactForm.phone) && (
                  <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                )}
              </div>
              <Button type="submit" size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-sm px-4 h-10 sm:h-9 text-sm whitespace-nowrap">
                <CheckCircle className="h-3 w-3 mr-1" />
                Отправить
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
