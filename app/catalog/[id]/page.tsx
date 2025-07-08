"use client"

export const runtime = 'edge'

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { doc, getDoc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Gauge,
  Fuel,
  Settings,
  Car,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  CheckCircle,
  Calculator,
  Building2,
  MapPin,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  Check
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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

interface PartnerBank {
  id: number;
  name: string;
  logo: string;
  rate: number;
  minDownPayment: number;
  maxTerm: number;
  features: string[];
  color: string;
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
  const [isCreditOpen, setIsCreditOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "+375", message: "" })
  const [callbackForm, setCallbackForm] = useState({ name: "", phone: "+375" })
  const [creditForm, setCreditForm] = useState({ name: "", phone: "+375", message: "" })
  const [isCreditFormOpen, setIsCreditFormOpen] = useState(false)
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  // Состояние кредитного калькулятора
  const [creditAmount, setCreditAmount] = useState([75000])
  const [downPayment, setDownPayment] = useState([20000])
  const [loanTerm, setLoanTerm] = useState([60])
  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null)
  // Состояние для валюты
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(false)
  // Touch events для свайпов на мобильных устройствах
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    if (params.id) {
      loadCarData(params.id as string)
    }
    // Load partner banks from Firestore
    loadPartnerBanks()
    // Load contact data for error message
    loadContactData()
  }, [params.id])

  // Сброс значений калькулятора при открытии модального окна кредита
  useEffect(() => {
    if (isCreditOpen && car) {
      const price = car.price
      if (isBelarusianRubles && usdBynRate) {
        setCreditAmount([Math.round(price * 0.8 * usdBynRate)])
        setDownPayment([Math.round(price * 0.2 * usdBynRate)])
      } else {
        setCreditAmount([price * 0.8])
        setDownPayment([price * 0.2])
      }
      setLoanTerm([60])
    }
  }, [isCreditOpen, car, isBelarusianRubles, usdBynRate])

  const loadPartnerBanks = async () => {
    try {
      setLoadingBanks(true)
      const creditDoc = await getDoc(doc(db, "pages", "credit"))
      if (creditDoc.exists() && creditDoc.data()?.partners) {
        const partners = creditDoc.data()?.partners
        // Convert partners to the format we need
        const formattedPartners = partners.map((partner: any, index: number) => ({
          id: index + 1,
          name: partner.name,
          logo: partner.logoUrl || "",
          rate: partner.minRate,
          minDownPayment: 15, // Default value
          maxTerm: partner.maxTerm,
          features: ["Выгодные условия", "Быстрое одобрение"],
          color: ["emerald", "blue", "purple", "red"][index % 4] // Cycle through colors
        }))
        setPartnerBanks(formattedPartners)
        // Set the first bank as default selected bank if there are any banks
        if (formattedPartners.length > 0) {
          setSelectedBank(formattedPartners[0])
        }
      } else {
        console.warn("Банки-партнеры не найдены в Firestore")
        setPartnerBanks([])
      }
    } catch (error) {
      console.error("Ошибка загрузки банков-партнеров:", error)
      setPartnerBanks([])
    } finally {
      setLoadingBanks(false)
    }
  }

  const loadContactData = async () => {
    try {
      const contactsDoc = await getDoc(doc(db, "pages", "contacts"))
      if (contactsDoc.exists()) {
        const data = contactsDoc.data()
        setContactPhone(data?.phone || "+375 29 123-45-67")
      } else {
        setContactPhone("+375 29 123-45-67") // fallback phone
      }
    } catch (error) {
      console.error("Ошибка загрузки контактных данных:", error)
      setContactPhone("+375 29 123-45-67") // fallback phone
    }
  }

  const loadCarData = async (carId: string) => {
    try {
      setLoading(true)
      const carDoc = await getDoc(doc(db, "cars", carId))
      if (carDoc.exists()) {
        const carData = { id: carDoc.id, ...carDoc.data() }
        setCar(carData as Car)
        setCarNotFound(false)
        // Устанавливаем значения калькулятора по умолчанию
        const price = carData.price || 95000
        setCreditAmount([price * 0.8])
        setDownPayment([price * 0.2])
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
    if (isBelarusianRubles && usdBynRate) {
      return new Intl.NumberFormat("ru-BY", {
        style: "currency",
        currency: "BYN",
        minimumFractionDigits: 0,
      }).format(price * usdBynRate)
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getCreditMinValue = () => {
    return isBelarusianRubles ? 3000 : 1000
  }

  const getCreditMaxValue = () => {
    if (isBelarusianRubles && usdBynRate) {
      return car ? car.price * usdBynRate : 200000
    }
    return car ? car.price : 200000
  }

  const getCurrentCreditAmount = () => {
    if (isBelarusianRubles && usdBynRate) {
      return creditAmount[0] * usdBynRate
    }
    return creditAmount[0]
  }

  const getCurrentDownPayment = () => {
    if (isBelarusianRubles && usdBynRate) {
      return downPayment[0] * usdBynRate
    }
    return downPayment[0]
  }

  // При переключении валюты пересчитываем значения
  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)

    if (!car || !usdBynRate) return

    if (checked) {
      // Переключение на BYN
      setCreditAmount([Math.round(car.price * 0.8 * usdBynRate)])
      setDownPayment([Math.round(car.price * 0.2 * usdBynRate)])
    } else {
      // Переключение на USD
      setCreditAmount([car.price * 0.8])
      setDownPayment([car.price * 0.2])
    }
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("ru-BY").format(mileage)
  }

  const formatEngineVolume = (volume: number) => {
    // Всегда показываем с одним знаком после запятой (3.0, 2.5, 1.6)
    return volume.toFixed(1)
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

  // Расчет ежемесячного платежа
  const calculateMonthlyPayment = () => {
    if (!selectedBank) return 0
    const principal = getCurrentCreditAmount()
    const rate = selectedBank.rate / 100 / 12
    const term = loanTerm[0]
    if (rate === 0) return principal / term
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    return monthlyPayment
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "leads"), {
        ...bookingForm,
        carId: params.id,
        carInfo: `${car?.make} ${car?.model} ${car?.year}`,
        type: "booking",
        status: "new",
        createdAt: new Date(),
      })
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
      await addDoc(collection(db, "leads"), {
        ...callbackForm,
        carId: params.id,
        carInfo: `${car?.make} ${car?.model} ${car?.year}`,
        type: "callback",
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

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Сохраняем в Firestore
      await addDoc(collection(db, "leads"), {
        ...creditForm,
        carId: params.id,
        carInfo: `${car?.make} ${car?.model} ${car?.year}`,
        type: "credit",
        status: "new",
        createdAt: new Date(),
        creditAmount: getCurrentCreditAmount(),
        downPayment: getCurrentDownPayment(),
        loanTerm: loanTerm[0],
        selectedBank: selectedBank?.name || "",
        monthlyPayment: calculateMonthlyPayment(),
        currency: isBelarusianRubles ? "BYN" : "USD"
      })

      // Отправляем уведомление в Telegram
      try {
        await fetch('/api/send-telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: creditForm.name,
            phone: creditForm.phone,
            message: creditForm.message,
            carMake: car?.make,
            carModel: car?.model,
            carYear: car?.year,
            carId: params.id,
            carPrice: isBelarusianRubles ? getCurrentCreditAmount() + getCurrentDownPayment() : car?.price,
            downPayment: getCurrentDownPayment(),
            loanTerm: loanTerm[0],
            bank: selectedBank?.name || "Не выбран",
            type: 'credit_request'
          })
        })
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError)
      }

      setIsCreditFormOpen(false)
      setCreditForm({ name: "", phone: "+375", message: "" })
      alert("Заявка на кредит отправлена! Мы свяжемся с вами в ближайшее время.")
    } catch (error) {
      console.error("Ошибка отправки заявки на кредит:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (car?.imageUrls?.length || 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (car?.imageUrls?.length || 1)) % (car?.imageUrls?.length || 1))
  }

  // Минимальное расстояние для свайпа
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && car?.imageUrls && car.imageUrls.length > 1) {
      nextImage()
    }
    if (isRightSwipe && car?.imageUrls && car.imageUrls.length > 1) {
      prevImage()
    }
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
            {/* Левая колонка: Галерея + Компактные характеристики */}
            <div className="lg:col-span-7 space-y-4">
              {/* Галерея изображений */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div
                  className="relative h-72 sm:h-96 lg:h-[500px] select-none"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
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
                {/* Миниатюры */}
                {car.imageUrls && car.imageUrls.length > 1 && (
                  <div className="p-4 bg-slate-50">
                    <div className="flex space-x-2 overflow-x-auto">
                      {car.imageUrls.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Image
                            src={getCachedImageUrl(url)}
                            alt={`${car.make} ${car.model} - фото ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* НОВЫЙ КОМПАКТНЫЙ БЛОК ТЕХНИЧЕСКИХ ХАРАКТЕРИСТИК ДЛЯ МОБИЛЬНОЙ ВЕРСИИ */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-slate-600" />
                  Основные характеристики
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                    <Gauge className="h-4 w-4 text-slate-600 mx-auto mb-1" />
                    <div className="text-xs text-slate-600 font-medium mb-1">Пробег</div>
                    <div className="font-bold text-slate-900 text-xs">{formatMileage(car.mileage)} км</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                    <Fuel className="h-4 w-4 text-slate-600 mx-auto mb-1" />
                    <div className="text-xs text-slate-600 font-medium mb-1">Двигатель</div>
                    <div className="font-bold text-slate-900 text-xs leading-tight">
                      {formatEngineVolume(car.engineVolume)}<br/>{car.fuelType}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                    <Settings className="h-4 w-4 text-slate-600 mx-auto mb-1" />
                    <div className="text-xs text-slate-600 font-medium mb-1">КПП</div>
                    <div className="font-bold text-slate-900 text-xs">{car.transmission}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                    <Car className="h-4 w-4 text-slate-600 mx-auto mb-1" />
                    <div className="text-xs text-slate-600 font-medium mb-1">Привод</div>
                    <div className="font-bold text-slate-900 text-xs">{car.driveTrain}</div>
                  </div>
                </div>


              </div>

              {/* Вкладки (перемещены после характеристик) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid grid-cols-3 bg-slate-50 rounded-t-xl p-1 w-full h-auto">
                    <TabsTrigger value="description" className="rounded-lg font-medium text-xs sm:text-sm py-2 px-0.5 sm:px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">
                      Описание
                    </TabsTrigger>
                    <TabsTrigger value="equipment" className="rounded-lg font-medium text-xs sm:text-sm py-2 px-0.5 sm:px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">
                      Комплектация
                    </TabsTrigger>
                    <TabsTrigger value="credit" className="rounded-lg font-medium text-xs sm:text-sm py-2 px-0.5 sm:px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">
                      Кредит
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="p-4 min-h-[200px]">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-3">Описание автомобиля</h4>
                        <p className="text-slate-700 text-sm leading-relaxed mb-4">{car.description}</p>
                      </div>

                      {/* Интегрированные характеристики */}
                      {car.specifications && (
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-3">Технические характеристики</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(car.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg text-sm">
                                <span className="text-slate-600 font-medium">{key}</span>
                                <span className="text-slate-900 font-semibold">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>



                  <TabsContent value="equipment" className="p-4 min-h-[200px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {car.features && car.features.length > 0 ? car.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-slate-700 font-medium">{feature}</span>
                        </div>
                      )) : (
                        <p className="text-slate-500 col-span-2 text-center py-4">Комплектация не указана</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="credit" className="p-4 min-h-[200px]">
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-base font-bold text-slate-900 mb-3">Расчет кредита</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Ежемесячный платеж</div>
                            <div className="text-lg font-bold text-slate-900">
                              {selectedBank ? formatPrice(calculateMonthlyPayment()) : "Выберите банк"}
                            </div>
                            {selectedBank && usdBynRate && (
                              <div className="text-sm font-medium text-slate-600">
                                ≈ {convertUsdToByn(calculateMonthlyPayment(), usdBynRate)} BYN
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Общая сумма</div>
                            <div className="text-base font-semibold text-slate-600">
                              {selectedBank ? formatPrice(calculateMonthlyPayment() * loanTerm[0] + downPayment[0]) : "Выберите банк"}
                            </div>
                            {selectedBank && usdBynRate && (
                              <div className="text-sm font-medium text-slate-600">
                                ≈ {convertUsdToByn(calculateMonthlyPayment() * loanTerm[0] + downPayment[0], usdBynRate)} BYN
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => setIsCreditOpen(true)}
                          className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white text-sm"
                          size="sm"
                        >
                          <CreditCard className="h-3 w-3 mr-2" />
                          Подробнее о кредите
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Боковая панель: Характеристики для десктопа + Кнопки */}
            <div className="lg:col-span-5 space-y-6">

              {/* Ключевые характеристики - только для десктопа */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-100 p-6">
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
                  <Dialog open={isCreditOpen} onOpenChange={setIsCreditOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" size="lg">
                        <Calculator className="h-4 w-4 mr-2" />
                        Рассчитать кредит
                      </Button>
                    </DialogTrigger>
                  </Dialog>

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

        {/* Диалоги */}
        <Dialog open={isCreditOpen} onOpenChange={setIsCreditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Кредитный калькулятор</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Калькулятор */}
              <div className="space-y-6">
                {/* Переключатель валюты */}
                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <Checkbox
                    id="currency-switch"
                    checked={isBelarusianRubles}
                    onCheckedChange={handleCurrencyChange}
                  />
                  <Label htmlFor="currency-switch" className="text-sm font-medium">
                    В белорусских рублях
                  </Label>
                </div>

                <div className="space-y-3">
                  <Label>Стоимость автомобиля</Label>
                  <Input
                    type="number"
                    value={isBelarusianRubles && usdBynRate ? Math.round(car.price * usdBynRate) : car.price}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Сумма кредита</Label>
                  <Input
                    type="number"
                    value={creditAmount[0]}
                    onChange={(e) => setCreditAmount([Number(e.target.value)])}
                    min={getCreditMinValue()}
                    max={getCreditMaxValue()}
                    step={isBelarusianRubles ? 100 : 1000}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Первоначальный взнос</Label>
                  <Input
                    type="number"
                    value={downPayment[0]}
                    onChange={(e) => setDownPayment([Number(e.target.value)])}
                    min={isBelarusianRubles && usdBynRate ? car.price * 0.1 * usdBynRate : car.price * 0.1}
                    max={isBelarusianRubles && usdBynRate ? car.price * 0.5 * usdBynRate : car.price * 0.5}
                    step={isBelarusianRubles ? 100 : 1000}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Срок кредита (месяцев)</Label>
                  <Input
                    type="number"
                    value={loanTerm[0]}
                    onChange={(e) => setLoanTerm([Number(e.target.value)])}
                    min={12}
                    max={96}
                    step={6}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Банк</Label>
                  {partnerBanks.length > 0 ? (
                    <Select
                      value={selectedBank?.id?.toString()}
                      onValueChange={(value) =>
                        setSelectedBank(partnerBanks.find(b => b.id === parseInt(value)) || partnerBanks[0])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите банк">
                          {selectedBank && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                {selectedBank.logo && (
                                  <Image
                                    src={getCachedImageUrl(selectedBank.logo)}
                                    alt={`${selectedBank.name} логотип`}
                                    width={20}
                                    height={20}
                                    className="object-contain rounded"
                                  />
                                )}
                                <span>{selectedBank.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-slate-600">{selectedBank.rate}%</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {partnerBanks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id.toString()} className="relative pr-16">
                            <div className="flex items-center gap-2 w-full">
                              {bank.logo && (
                                <Image
                                  src={getCachedImageUrl(bank.logo)}
                                  alt={`${bank.name} логотип`}
                                  width={20}
                                  height={20}
                                  className="object-contain rounded flex-shrink-0"
                                />
                              )}
                              <span className="truncate pr-8">{bank.name}</span>
                            </div>
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-slate-600">{bank.rate}%</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : loadingBanks ? (
                    <div className="text-center py-2">
                      <div className="w-full h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse mx-auto"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">Банки-партнеры не найдены</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Результат */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4">Результат расчета</h4>
                {selectedBank ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-slate-500">Ежемесячный платеж</div>
                      <div className="text-3xl font-bold text-slate-900">
                        {isBelarusianRubles
                          ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateMonthlyPayment())
                          : formatPrice(calculateMonthlyPayment())
                        }
                      </div>
                      {!isBelarusianRubles && usdBynRate && (
                        <div className="text-xl font-semibold text-slate-700">
                          ≈ {convertUsdToByn(calculateMonthlyPayment(), usdBynRate)} BYN
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500">Переплата</div>
                        <div className="font-semibold">
                          {isBelarusianRubles
                            ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateMonthlyPayment() * loanTerm[0] - getCurrentCreditAmount())
                            : formatPrice(calculateMonthlyPayment() * loanTerm[0] - creditAmount[0])
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Общая сумма</div>
                        <div className="font-semibold">
                          {isBelarusianRubles
                            ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateMonthlyPayment() * loanTerm[0] + getCurrentDownPayment())
                            : formatPrice(calculateMonthlyPayment() * loanTerm[0] + downPayment[0])
                          }
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <div className="text-sm font-semibold text-slate-700 mb-2">Банк {selectedBank.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>Ставка: {selectedBank.rate}%</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 mt-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Максимальный срок: {selectedBank.maxTerm} мес.</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6"
                      onClick={() => setIsCreditFormOpen(true)}
                    >
                      Подать заявку на кредит
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    {loadingBanks ? (
                      <div className="w-full space-y-4">
                        <div className="w-full h-12 bg-slate-200 rounded animate-pulse"></div>
                        <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse mx-auto"></div>
                        <div className="w-1/2 h-4 bg-slate-200 rounded animate-pulse mx-auto"></div>
                      </div>
                    ) : partnerBanks.length === 0 ? (
                      <>
                        <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                        <p className="text-slate-700 font-medium">Банки-партнеры не найдены</p>
                        <p className="text-slate-500 text-sm mt-2">Пожалуйста, обратитесь к менеджеру для получения информации о кредитовании</p>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-10 w-10 text-slate-400 mb-4" />
                        <p className="text-slate-700 font-medium">Выберите банк</p>
                        <p className="text-slate-500 text-sm mt-2">Для расчета кредита выберите банк из списка</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

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

        {/* Диалог кредитной заявки */}
        <Dialog open={isCreditFormOpen} onOpenChange={setIsCreditFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Подать заявку на кредит</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="creditName">Ваше имя</Label>
                <Input
                  id="creditName"
                  value={creditForm.name}
                  onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="creditPhone">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="creditPhone"
                    value={creditForm.phone}
                    onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                    placeholder="+375XXXXXXXXX"
                    required
                    className="pr-10"
                  />
                  {isPhoneValid(creditForm.phone) && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="creditMessage">Комментарий (необязательно)</Label>
                <Textarea
                  id="creditMessage"
                  value={creditForm.message}
                  onChange={(e) => setCreditForm({ ...creditForm, message: e.target.value })}
                  placeholder="Дополнительная информация..."
                />
              </div>

              {/* Показываем данные о выбранном кредите */}
              {selectedBank && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-slate-900">Параметры кредита:</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Автомобиль:</span>
                      <span className="font-medium">{car?.make} {car?.model} {car?.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Сумма кредита:</span>
                      <span className="font-medium">{formatPrice(getCurrentCreditAmount())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Первоначальный взнос:</span>
                      <span className="font-medium">{formatPrice(getCurrentDownPayment())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Срок:</span>
                      <span className="font-medium">{loanTerm[0]} мес.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Банк:</span>
                      <span className="font-medium">{selectedBank.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ежемесячный платеж:</span>
                      <span className="font-medium text-blue-600">{formatPrice(calculateMonthlyPayment())}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Отправить заявку
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
