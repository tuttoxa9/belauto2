"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Clock, Instagram, Loader2 } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"

interface Settings {
  companyName: string
  phone: string
  email: string
  address: string
  workingHours: string
  socialMedia: {
    instagram: string
    telegram: string
    tiktok: string
    avby: string
  }
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const settingsDoc = await getDoc(doc(db, "settings", "main"))
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as Settings)
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-gray-900 text-white mb-16 md:mb-0 rounded-t-[50px] mt-8 footer-corner-fill">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Колонка 1: Логотип и слоган */}
          <div className="space-y-4">
            <Link href="/" className="flex justify-center md:justify-start">
              <Image src={getCachedImageUrl("/logo.png")} alt="Логотип" width={160} height={160} className="object-contain" />
            </Link>
            <p className="text-gray-400 text-sm">
              Надежный партнер в выборе качественного автомобиля с пробегом в Беларуси
            </p>
          </div>

          {/* Колонка 2: Карта сайта */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Навигация</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                Главная
              </Link>
              <Link href="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm">
                Каталог
              </Link>
              <Link href="/credit" className="text-gray-400 hover:text-white transition-colors text-sm">
                Кредит
              </Link>
              <Link href="/leasing" className="text-gray-400 hover:text-white transition-colors text-sm">
                Лизинг
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                О нас
              </Link>
              <Link href="/contacts" className="text-gray-400 hover:text-white transition-colors text-sm">
                Контакты
              </Link>
              <Link href="/reviews" className="text-gray-400 hover:text-white transition-colors text-sm">
                Отзывы
              </Link>
            </nav>
          </div>

          {/* Колонка 3: Контактная информация */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Контакты</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400 text-sm">Загрузка адреса...</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">{settings?.address || "Адрес не указан"}</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400 text-sm">Загрузка телефона...</span>
                  </div>
                ) : (
                  <a
                    href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {settings?.phone || "Телефон не указан"}
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400 text-sm">Загрузка email...</span>
                  </div>
                ) : (
                  <a
                    href={`mailto:${settings?.email || ""}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {settings?.email || "Email не указан"}
                  </a>
                )}
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400 text-sm">Загрузка времени работы...</span>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    {settings?.workingHours ? (
                      settings.workingHours.split(", ").map((line, index) => (
                        <div key={index}>{line}</div>
                      ))
                    ) : (
                      "Время работы не указано"
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Колонка 4: Социальные сети */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Мы в соцсетях</h3>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-gray-400 text-sm">Загрузка соцсетей...</span>
              </div>
            ) : (
              <div className="flex space-x-4">
                <a href={settings?.socialMedia?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href={settings?.socialMedia?.telegram || "#"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                  </svg>
                </a>
                <a href={settings?.socialMedia?.tiktok || "#"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.10-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Колонка 5: av.by */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Наша страница на av.by</h3>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-gray-400 text-sm">Загрузка...</span>
              </div>
            ) : (
              <a href={settings?.socialMedia?.avby || "#"} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Image
                  src="/av.png"
                  alt="av.by"
                  width={120}
                  height={90}
                  className="object-contain hover:opacity-80 transition-opacity"
                />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Нижняя строка */}
      <div className="border-t border-gray-800">
        <div className="container px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} {loading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Загрузка...
                </span>
              ) : (
                settings?.companyName || "Компания"
              )}. Все права защищены.
            </p>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
