"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { doc, getDoc, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react"
import YandexMap from "@/components/yandex-map"

export default function ContactsPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
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
      weekends: "Суббота - Воскресенье: 10:00 - 19:00",
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
      const contactsDoc = await getDoc(doc(db, "pages", "contacts"))
      if (contactsDoc.exists()) {
        setContactsData(contactsDoc.data() as typeof contactsData)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.startsWith("375")) {
      const formatted = numbers.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "+$1 $2 $3-$4-$5")
      return formatted
    }
    return value
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
      setContactForm({ name: "", phone: "", message: "" })
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
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
              <YandexMap address={contactsData.address} className="h-72 lg:h-80 rounded-lg overflow-hidden shadow-lg" />
            </div>

            {/* Форма обратной связи под картой */}
            <Card>
              <CardHeader>
                <CardTitle>Остались вопросы? Напишите нам</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ваше имя</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Введите ваше имя"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Номер телефона</Label>
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                      placeholder="+375 XX XXX-XX-XX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Ваше сообщение</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Расскажите, чем мы можем помочь..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Отправить сообщение
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - Контактная информация */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Контактная информация</h2>
            {/* Адрес */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-blue-50 to-white group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Адрес</h3>
                    <p className="text-gray-700 font-medium">{contactsData.address}</p>
                    <p className="text-sm text-gray-500 mt-1">{contactsData.addressNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Телефон */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-green-50 to-white group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                    <a href={`tel:${contactsData.phone.replace(/\s/g, '')}`} className="text-green-600 hover:text-green-700 font-semibold text-lg transition-colors">
                      {contactsData.phone}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{contactsData.phoneNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-purple-50 to-white group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href={`mailto:${contactsData.email}`} className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                      {contactsData.email}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{contactsData.emailNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Время работы */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-orange-50 to-white group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Время работы</h3>
                    <div className="space-y-1">
                      <p className="text-gray-700 font-medium">{contactsData.workingHours.weekdays}</p>
                      <p className="text-gray-700 font-medium">{contactsData.workingHours.weekends}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Социальные сети */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-gray-50 to-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Мы в социальных сетях</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {contactsData.socialMedia.instagram && (
                    <a
                      href={contactsData.socialMedia.instagram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-gradient-to-br from-pink-50 to-white rounded-2xl hover:shadow-md hover:scale-105 transition-all duration-300 group border-0"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Instagram</p>
                        <p className="text-xs text-gray-500 truncate">{contactsData.socialMedia.instagram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.telegram && (
                    <a
                      href={contactsData.socialMedia.telegram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl hover:shadow-md hover:scale-105 transition-all duration-300 group border-0"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Telegram</p>
                        <p className="text-xs text-gray-500 truncate">{contactsData.socialMedia.telegram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.avby && (
                    <a
                      href={contactsData.socialMedia.avby.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-gradient-to-br from-red-50 to-white rounded-2xl hover:shadow-md hover:scale-105 transition-all duration-300 group border-0"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">av.by</p>
                        <p className="text-xs text-gray-500 truncate">{contactsData.socialMedia.avby.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.tiktok && (
                    <a
                      href={contactsData.socialMedia.tiktok.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-gradient-to-br from-indigo-50 to-white rounded-2xl hover:shadow-md hover:scale-105 transition-all duration-300 group border-0"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">TikTok</p>
                        <p className="text-xs text-gray-500 truncate">{contactsData.socialMedia.tiktok.name}</p>
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
