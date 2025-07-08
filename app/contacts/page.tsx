"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { doc, getDoc, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, Instagram, ExternalLink, Check } from "lucide-react"
import YandexMap from "@/components/yandex-map"
import ContactsPageSkeleton from "@/components/contacts-page-skeleton"

export default function ContactsPage() {
  const [loading, setLoading] = useState(true)
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "+375",
    message: "",
  })

  const [contactsData, setContactsData] = useState({
    title: "Контакты",
    subtitle: "Свяжитесь с нами любым удобным способом",
    address: "Минск, Большое Стиклево 83",
    addressNote: 'Рядом с торговым центром "Примерный"',
    phone: "+375 29 123-45-67",
    phoneNote: "Звонки принимаем ежедневно",
    email: "info@avtobusiness.by",
    emailNote: "Отвечаем в течение часа",
    workingHours: {
      weekdays: "Понедельник - Пятница: 9:00 - 21:00",
      weekends: "Суббота - Воскресенье: 10:00 - 20:00",
    },
    socialMedia: {
      instagram: {
        name: "@avtobusiness_by",
        url: "https://instagram.com/avtobusiness_by"
      },
      telegram: {
        name: "@avtobusiness",
        url: "https://t.me/avtobusiness"
      },
      avby: {
        name: "av.by/company/avtobusiness",
        url: "https://av.by/company/avtobusiness"
      },
      tiktok: {
        name: "@avtobusiness_by",
        url: "https://tiktok.com/@avtobusiness_by"
      },
    },
  })

  useEffect(() => {
    loadContactsData()
  }, [])

  const loadContactsData = async () => {
    try {
      // Симулируем минимальное время загрузки для лучшего UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      const contactsDoc = await getDoc(doc(db, "pages", "contacts"))
      if (contactsDoc.exists()) {
        setContactsData(contactsDoc.data() as typeof contactsData)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
    } finally {
      setLoading(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Сохраняем в Firebase
      await addDoc(collection(db, "contact-forms"), {
        ...contactForm,
        timestamp: new Date(),
        status: "new"
      })

      // Отправляем уведомление в Telegram
      try {
        await fetch('/api/send-telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...contactForm,
            type: 'contact_form',
          }),
        })
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError)
      }

      alert("Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.")
      setContactForm({ name: "", phone: "+375", message: "" })
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  if (loading) {
    return <ContactsPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="container px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Главная
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Контакты</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{contactsData.title}</h1>
          <p className="text-xl text-gray-600">{contactsData.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Левая колонка - Карта */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Где нас найти</h2>
              <YandexMap address={contactsData.address} className="h-72 lg:h-80 rounded-xl overflow-hidden shadow-xl border border-gray-200" />
            </div>

            {/* Форма обратной связи под картой */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="text-xl">Остались вопросы? Напишите нам</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">Ваше имя</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Введите ваше имя"
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">Номер телефона</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="+375XXXXXXXXX"
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                        required
                      />
                      {isPhoneValid(contactForm.phone) && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">Ваше сообщение</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Расскажите, чем мы можем помочь..."
                      rows={4}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02]">
                    Отправить сообщение
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - Контактная информация */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Контактная информация</h2>

            {/* Адрес */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Адрес</h3>
                    <p className="text-gray-700 font-semibold text-base">{contactsData.address}</p>
                    <p className="text-sm text-gray-500 mt-1">{contactsData.addressNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Телефон */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Телефон</h3>
                    <a href={`tel:${contactsData.phone.replace(/\s/g, '')}`} className="text-green-600 hover:text-green-700 font-bold text-lg transition-colors">
                      {contactsData.phone}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{contactsData.phoneNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Email</h3>
                    <a href={`mailto:${contactsData.email}`} className="text-purple-600 hover:text-purple-700 font-bold text-base transition-colors">
                      {contactsData.email}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{contactsData.emailNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Время работы */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Время работы</h3>
                    <div className="space-y-2">
                      <p className="text-gray-700 font-semibold">{contactsData.workingHours.weekdays}</p>
                      <p className="text-gray-700 font-semibold">{contactsData.workingHours.weekends}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Социальные сети */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                <CardTitle className="text-xl font-bold flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Мы в социальных сетях
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contactsData.socialMedia.instagram && (
                    <a
                      href={contactsData.socialMedia.instagram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group border border-pink-100"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">Instagram</p>
                        <p className="text-sm text-gray-600 truncate font-medium">{contactsData.socialMedia.instagram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.telegram && (
                    <a
                      href={contactsData.socialMedia.telegram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group border border-blue-100"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">Telegram</p>
                        <p className="text-sm text-gray-600 truncate font-medium">{contactsData.socialMedia.telegram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.avby && (
                    <a
                      href={contactsData.socialMedia.avby.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group border border-blue-100"
                    >
                      <div className="w-20 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md border-2 border-blue-100">
                        <Image
                          src="/av.png"
                          alt="av.by"
                          width={52}
                          height={36}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">av.by</p>
                        <p className="text-sm text-gray-600 truncate font-medium">{contactsData.socialMedia.avby.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.tiktok && (
                    <a
                      href={contactsData.socialMedia.tiktok.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-black to-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">TikTok</p>
                        <p className="text-sm text-gray-600 truncate font-medium">{contactsData.socialMedia.tiktok.name}</p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
