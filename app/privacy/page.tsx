"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Eye, UserCheck, Lock, FileText, Calendar } from "lucide-react"

interface PrivacyData {
  title: string
  lastUpdated: string
  sections: {
    introduction: string
    dataCollection: string
    dataUsage: string
    dataSecurity: string
    userRights: string
    cookies: string
    thirdParty: string
    contact: string
  }
}

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true)
  const [privacyData, setPrivacyData] = useState<PrivacyData>({
    title: "Политика конфиденциальности",
    lastUpdated: "01.01.2024",
    sections: {
      introduction: `Настоящая Политика конфиденциальности регулирует порядок обработки и использования персональных данных пользователей сайта Белавто Центр. Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные в соответствии с требованиями законодательства Республики Беларусь.

Используя наш сайт, вы соглашаетесь с условиями данной Политики конфиденциальности. Если вы не согласны с какими-либо положениями данной политики, пожалуйста, не используйте наш сайт.`,

      dataCollection: `Мы собираем следующие виды персональных данных:

• Контактная информация (имя, номер телефона, адрес электронной почты)
• Информация о предпочтениях и интересах в области автомобилей
• Данные о посещениях сайта (IP-адрес, тип браузера, время посещения)
• Информация, предоставляемая при заполнении форм обратной связи
• Данные, необходимые для оформления сделок купли-продажи автомобилей

Сбор персональных данных осуществляется только с вашего согласия и в объеме, необходимом для предоставления наших услуг.`,

      dataUsage: `Ваши персональные данные используются для следующих целей:

• Предоставление информации об автомобилях и услугах компании
• Обработка заявок и запросов клиентов
• Связь с клиентами по вопросам покупки/продажи автомобилей
• Оформление документов при совершении сделок
• Улучшение качества наших услуг
• Направление информационных сообщений (при наличии согласия)
• Выполнение требований законодательства

Мы не используем ваши данные для целей, не указанных в данной политике, без вашего дополнительного согласия.`,

      dataSecurity: `Мы принимаем все необходимые технические и организационные меры для защиты ваших персональных данных:

• Использование современных методов шифрования данных
• Ограничение доступа к персональным данным только уполномоченным сотрудникам
• Регулярное обновление систем безопасности
• Резервное копирование данных для предотвращения их потери
• Контроль за соблюдением требований безопасности всеми сотрудниками
• Использование защищенных серверов для хранения данных

Несмотря на принимаемые меры, мы не можем гарантировать абсолютную безопасность данных при их передаче через интернет.`,

      userRights: `В соответствии с законодательством Республики Беларусь, вы имеете следующие права:

• Право на получение информации о обработке ваших персональных данных
• Право на доступ к вашим персональным данным
• Право на уточнение, исправление или дополнение ваших данных
• Право на удаление ваших персональных данных
• Право на отзыв согласия на обработку персональных данных
• Право на ограничение обработки данных
• Право на подачу жалобы в уполномоченный орган

Для реализации ваших прав обращайтесь к нам по контактным данным, указанным в конце данной политики.`,

      cookies: `Наш сайт использует файлы cookies для улучшения пользовательского опыта:

• Технические cookies - обеспечивают работу основных функций сайта
• Аналитические cookies - помогают анализировать посещаемость сайта
• Функциональные cookies - запоминают ваши предпочтения
• Рекламные cookies - показывают релевантную рекламу (при наличии согласия)

Вы можете управлять использованием cookies через настройки вашего браузера. Отключение cookies может ограничить функциональность сайта.

Мы также можем использовать веб-маяки и аналогичные технологии для сбора информации о использовании сайта.`,

      thirdParty: `Мы можем передавать ваши персональные данные третьим лицам в следующих случаях:

• Поставщикам услуг, которые помогают нам в ведении бизнеса (хостинг, аналитика)
• Государственным органам при наличии законных требований
• Партнерам при оформлении кредитных программ (с вашего согласия)
• Страховым компаниям при оформлении страхования автомобилей

Все третьи лица обязуются соблюдать конфиденциальность ваших данных и использовать их только для указанных целей.

Мы не продаем и не передаем ваши персональные данные для маркетинговых целей третьих лиц без вашего явного согласия.`,

      contact: `По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам:

Адрес: г. Минск, ул. Примерная, 123
Телефон: +375 29 123-45-67
Email: privacy@avtobusiness.by

Ответственный за обработку персональных данных:
Иванов Иван Иванович, директор ООО "Белавто Центр"

Мы рассматриваем все обращения в течение 30 дней с момента их получения и предоставляем ответ в письменном виде или по электронной почте.`
    }
  })

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const loadPrivacyData = async () => {
    try {
      const privacyDoc = await getDoc(doc(db, "pages", "privacy"))
      if (privacyDoc.exists()) {
        setPrivacyData(privacyDoc.data() as PrivacyData)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <div className="w-80 h-10 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="w-96 h-6 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          {/* Content skeleton */}
          <div className="max-w-4xl mx-auto space-y-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-200 rounded animate-pulse"></div>
                  <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
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

  const sections = [
    {
      id: 'introduction',
      title: 'Общие положения',
      icon: FileText,
      content: privacyData.sections.introduction,
      gradient: 'from-blue-50 to-white'
    },
    {
      id: 'dataCollection',
      title: 'Сбор персональных данных',
      icon: UserCheck,
      content: privacyData.sections.dataCollection,
      gradient: 'from-green-50 to-white'
    },
    {
      id: 'dataUsage',
      title: 'Использование данных',
      icon: Eye,
      content: privacyData.sections.dataUsage,
      gradient: 'from-purple-50 to-white'
    },
    {
      id: 'dataSecurity',
      title: 'Безопасность данных',
      icon: Shield,
      content: privacyData.sections.dataSecurity,
      gradient: 'from-red-50 to-white'
    },
    {
      id: 'userRights',
      title: 'Права пользователей',
      icon: Lock,
      content: privacyData.sections.userRights,
      gradient: 'from-orange-50 to-white'
    },
    {
      id: 'cookies',
      title: 'Использование cookies',
      icon: Calendar,
      content: privacyData.sections.cookies,
      gradient: 'from-yellow-50 to-white'
    },
    {
      id: 'thirdParty',
      title: 'Передача данных третьим лицам',
      icon: UserCheck,
      content: privacyData.sections.thirdParty,
      gradient: 'from-indigo-50 to-white'
    },
    {
      id: 'contact',
      title: 'Контактная информация',
      icon: FileText,
      content: privacyData.sections.contact,
      gradient: 'from-gray-50 to-white'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-blue-600">
                Главная
              </a>
            </li>
            <li>/</li>
            <li className="text-gray-900">Политика конфиденциальности</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{privacyData.title}</h1>
          <p className="text-lg text-gray-600">
            Последнее обновление: {privacyData.lastUpdated}
          </p>
        </div>

        {/* Контент */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={section.id} className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br ${section.gradient}`}>
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                </div>
                <div className="prose prose-gray max-w-none">
                  {section.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Нижний блок */}
        <Card className="mt-12 bg-gradient-to-br from-blue-50 to-white border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Согласие на обработку персональных данных
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Используя наш сайт и предоставляя свои персональные данные, вы выражаете согласие на их обработку
              в соответствии с настоящей Политикой конфиденциальности. Мы гарантируем защиту ваших данных
              и их использование исключительно для указанных целей.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
