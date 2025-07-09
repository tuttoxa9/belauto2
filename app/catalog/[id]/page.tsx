"use client"

export const runtime = 'edge'

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Gauge,
  Fuel,
  Settings,
  Car,
  Phone,
  ChevronLeft,
  ChevronRight,
  Calculator,
  MapPin,
  Eye,
  Clock,
  AlertCircle,
  Check
} from "lucide-react"
import CarDetailsSkeleton from "@/components/car-details-skeleton"

// Компонент ошибки для несуществующего автомобиля
const CarNotFoundComponent = ({ contactPhone }: { contactPhone: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="mb-6">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Автомобиль не найден</h1>
        <p className="text-slate-600 mb-6">
          К сожалению, автомобиль с указанным ID не существует или произошла ошибка при загрузке данных.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Нужна помощь?</h3>
        <p className="text-slate-600 mb-4">Свяжитесь с нами для получения информации об автомобилях</p>
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <Phone className="h-5 w-5" />
          <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">
            {contactPhone}
          </a>
        </div>
      </div>

      <Button
        onClick={() => window.location.href = '/catalog'}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
      >
        Перейти к каталогу
      </Button>
    </div>
  </div>
)

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  engineVolume: number;
  fuelType: string;
  transmission: string;
  driveTrain: string;
  bodyType: string;
  color: string;
  description: string;
  imageUrls: string[];
  isAvailable: boolean;
  features: string[];
  specifications: Record<string, string>;
}

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [contactPhone, setContactPhone] = useState<string>("")
  const [carNotFound, setCarNotFound] = useState(false)
  const usdBynRate = useUsdBynRate()
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isCallbackOpen, setIsCallbackOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "+375", message: "" })
  const [callbackForm, setCallbackForm] = useState({ name: "", phone: "+375" })

  useEffect(() => {
    if (params.id) {
      loadCarData(params.id as string)
    }
    loadContactData()
  }, [params.id])

  const loadContactData = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('content')
        .eq('page', 'contacts')
        .single()

      if (error) {
        console.error("Ошибка загрузки контактных данных:", error)
        setContactPhone("+375 29 123-45-67")
        return
      }

      if (data && data.content) {
        setContactPhone(data.content.phone || "+375 29 123-45-67")
      } else {
        setContactPhone("+375 29 123-45-67")
      }
    } catch (error) {
      console.error("Ошибка загрузки контактных данных:", error)
      setContactPhone("+375 29 123-45-67")
    }
  }

  const loadCarData = async (carId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single()

      if (error) {
        console.error("Автомобиль не найден:", error)
        setCarNotFound(true)
        setCar(null)
        return
      }

      if (data) {
        // Convert Supabase format to component format
        const carData = {
          id: data.id,
          make: data.make,
          model: data.model,
          year: data.year,
          price: Number(data.price) || 0,
          currency: 'USD',
          mileage: Number(data.mileage) || 0,
          engineVolume: Number(data.engine_volume) || 0,
          fuelType: data.fuel_type,
          transmission: data.transmission,
          driveTrain: data.drive_train,
          bodyType: data.body_type,
          color: data.color,
          description: data.description,
          imageUrls: data.image_urls || [],
          isAvailable: data.is_available,
          features: data.features || [],
          specifications: data.specifications || {}
        }

        setCar(carData as Car)
        setCarNotFound(false)
      } else {
        console.error("Автомобиль не найден")
        setCarNotFound(true)
        setCar(null)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных автомобиля:", error)
      setCarNotFound(true)
      setCar(null)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("ru-BY").format(mileage)
  }

  const formatEngineVolume = (volume: number) => {
    return volume.toFixed(1)
  }

  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/[^\d+]/g, "")
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }
    const prefix = "+375"
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)
    return prefix + afterPrefix
  }

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375")
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: bookingForm.name,
          phone: bookingForm.phone,
          message: bookingForm.message,
          car_id: params.id as string,
          type: 'call',
          status: 'new'
        }])

      if (error) {
        console.error("Ошибка сохранения заявки:", error)
        alert("Произошла ошибка. Попробуйте еще раз.")
        return
      }

      // Отправляем уведомление в Telegram
      try {
        await fetch('/api/send-telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: bookingForm.name,
            phone: bookingForm.phone,
            message: bookingForm.message,
            carMake: car?.make,
            carModel: car?.model,
            carYear: car?.year,
            carId: params.id,
            type: 'car_booking'
          })
        })
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError)
      }
      setIsBookingOpen(false)
      setBookingForm({ name: "", phone: "+375", message: "" })
      alert("Заявка на бронирование отправлена! Мы свяжемся с вами в ближайшее время.")
    } catch (error) {
      console.error("Ошибка отправки заявки:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: callbackForm.name,
          phone: callbackForm.phone,
          car_id: params.id as string,
          type: 'call',
          status: 'new'
        }])

      if (error) {
        console.error("Ошибка сохранения заявки:", error)
        alert("Произошла ошибка. Попробуйте еще раз.")
        return
      }

      // Отправляем уведомление в Telegram
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...callbackForm,
          carInfo: `${car?.make} ${car?.model} ${car?.year}`,
          type: 'callback'
        })
      })
      setIsCallbackOpen(false)
      setCallbackForm({ name: "", phone: "+375" })
      alert("Заявка отправлена! Мы свяжемся с вами в ближайшее время.")
    } catch (error) {
      console.error("Ошибка отправки заявки:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (car?.imageUrls?.length || 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (car?.imageUrls?.length || 1)) % (car?.imageUrls?.length || 1))
  }

  if (loading) {
    return <CarDetailsSkeleton />
  }

  if (carNotFound) {
    return <CarNotFoundComponent contactPhone={contactPhone} />
  }

  if (!car) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            <li>
              <button
                onClick={() => router.push('/')}
                className="hover:text-slate-900 transition-colors font-medium"
              >
                Главная
              </button>
            </li>
            <li>/</li>
            <li>
              <button
                onClick={() => router.push('/catalog')}
                className="hover:text-slate-900 transition-colors font-medium"
              >
                Каталог
              </button>
            </li>
            <li>/</li>
            <li className="text-slate-900 font-semibold">
              {car.make} {car.model} {car.year}
            </li>
          </ol>
        </nav>

        {/* КОМПАКТНЫЙ ЗАГОЛОВОК */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Левая часть: Название + описание */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {car.make} {car.model}
                </h1>
                {car.isAvailable ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    В наличии
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    Продан
                  </Badge>
                )}
              </div>
              <p className="text-slate-600">{car.year} год • {car.color} • {car.bodyType}</p>
            </div>

            {/* Правая часть: Цена */}
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatPrice(car.price)}
              </div>
              {usdBynRate && (
                <div className="text-lg font-semibold text-slate-700">
                  ≈ {convertUsdToByn(car.price, usdBynRate)} BYN
                </div>
              )}
              <p className="text-sm text-slate-500">
                от {formatPrice(Math.round(car.price * 0.8 / 60))}/мес
              </p>
            </div>
          </div>
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="space-y-4">
          {/* Основной контент: Галерея + Информация + Кнопки */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Левая колонка: Галерея */}
            <div className="lg:col-span-7 space-y-4">
              {/* Галерея изображений */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative h-72 sm:h-96 lg:h-[500px] select-none">
                  <Image
                    src={getCachedImageUrl(car.imageUrls?.[currentImageIndex] || "/placeholder.svg")}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-contain bg-gradient-to-br from-slate-50 to-slate-100"
                  />

                  {/* Навигация по фотографиям */}
                  {car.imageUrls && car.imageUrls.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm rounded-full w-10 h-10 p-0"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm rounded-full w-10 h-10 p-0"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  {/* Индикатор текущего фото */}
                  {car.imageUrls && car.imageUrls.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium">
                          {currentImageIndex + 1} / {car.imageUrls.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Описание */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Описание</h3>
                <p className="text-slate-700 leading-relaxed">{car.description}</p>
              </div>
            </div>

            {/* Боковая панель: Характеристики + Кнопки */}
            <div className="lg:col-span-5 space-y-6">
              {/* Ключевые характеристики */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Основные характеристики</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <Gauge className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                    <div className="text-xs text-slate-600 font-medium mb-1">Пробег</div>
                    <div className="font-bold text-slate-900 text-sm">{formatMileage(car.mileage)} км</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <Fuel className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                    <div className="text-xs text-slate-600 font-medium mb-1">Двигатель</div>
                    <div className="font-bold text-slate-900 text-sm">{formatEngineVolume(car.engineVolume)} {car.fuelType}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <Settings className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                    <div className="text-xs text-slate-600 font-medium mb-1">КПП</div>
                    <div className="font-bold text-slate-900 text-sm">{car.transmission}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <Car className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                    <div className="text-xs text-slate-600 font-medium mb-1">Привод</div>
                    <div className="font-bold text-slate-900 text-sm">{car.driveTrain}</div>
                  </div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Действия</h3>
                <div className="space-y-3">
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline" size="lg">
                        <Eye className="h-4 w-4 mr-2" />
                        Записаться на просмотр
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline" size="lg">
                        <Phone className="h-4 w-4 mr-2" />
                        Заказать звонок
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>

              {/* Контактная информация */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Где посмотреть
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-slate-900">Автохаус Белавто Центр</div>
                    <div className="text-slate-600">г. Минск, ул. Большое Стиклево 83</div>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <div>
                      <div>Пн-Пт: 9:00-21:00</div>
                      <div>Сб-Вс: 10:00-20:00</div>
                    </div>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <div>+375 29 123-45-67</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Диалог бронирования */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Записаться на просмотр</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bookingName">Ваше имя</Label>
                <Input
                  id="bookingName"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bookingPhone">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="bookingPhone"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: formatPhoneNumber(e.target.value) })}
                    placeholder="+375XXXXXXXXX"
                    required
                    className="pr-10"
                  />
                  {isPhoneValid(bookingForm.phone) && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="bookingMessage">Комментарий</Label>
                <Textarea
                  id="bookingMessage"
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  placeholder="Удобное время для просмотра..."
                />
              </div>
              <Button type="submit" className="w-full">
                Записаться на просмотр
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог обратного звонка */}
        <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Заказать обратный звонок</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCallbackSubmit} className="space-y-4">
              <div>
                <Label htmlFor="callbackName">Ваше имя</Label>
                <Input
                  id="callbackName"
                  value={callbackForm.name}
                  onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="callbackPhone">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="callbackPhone"
                    value={callbackForm.phone}
                    onChange={(e) =>
                      setCallbackForm({ ...callbackForm, phone: formatPhoneNumber(e.target.value) })
                    }
                    placeholder="+375XXXXXXXXX"
                    required
                    className="pr-10"
                  />
                  {isPhoneValid(callbackForm.phone) && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Заказать звонок
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
