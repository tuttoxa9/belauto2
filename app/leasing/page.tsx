"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Car, CheckCircle, Building, TrendingDown, Shield, DollarSign, Clock, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Heart, Calendar, Check } from "lucide-react"
import { doc, getDoc, addDoc, collection, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"
import LeasingConditions from "@/components/leasing-conditions"
import LeasingCalculator from "@/components/leasing-calculator"

interface LeasingPageSettings {
  title: string
  subtitle: string
  description: string
  benefits: Array<{
    icon: string
    title: string
    description: string
  }>
  leasingCompanies: Array<{
    name: string
    logoUrl: string
    minAdvance: number
    maxTerm: number
  }>
  conditions?: Array<{
    icon: string
    title: string
    description: string
  }>
  additionalNote?: string
}

export default function LeasingPage() {
  const [settings, setSettings] = useState<LeasingPageSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const [calculator, setCalculator] = useState({
    carPrice: [80000],
    advance: [16000],
    leasingTerm: [36],
    residualValue: [20],
  })

  const [leasingForm, setLeasingForm] = useState({
    clientType: "organization", // "organization" или "individual"
    // Поля для организации
    companyName: "",
    contactPerson: "",
    unp: "",
    // Поля для физ. лица
    fullName: "",
    // Общие поля
    phone: "+375",
    email: "",
    carPrice: "",
    advance: "",
    leasingTerm: "",
    company: "",
    message: "",
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const doc_ref = doc(db, "pages", "leasing")
      const doc_snap = await getDoc(doc_ref)

      if (doc_snap.exists()) {
        const data = doc_snap.data() as LeasingPageSettings
        console.log("Loaded leasing data:", data)
        setSettings(data)
      } else {
        // Default fallback data only if no data exists
        const defaultData: LeasingPageSettings = {
          title: "Автомобиль в лизинг – выгодное решение для сохранения финансовой гибкости",
          subtitle: "Пользуйтесь автомобилем, оплачивая его стоимость по частям, и наслаждайтесь комфортом без лишних хлопот",
          description: "Лизинг автомобилей - это удобный способ получить транспорт для бизнеса без больших первоначальных затрат. Налоговые льготы, гибкие условия и возможность выкупа.",
          benefits: [],
          leasingCompanies: [],
          conditions: [
            {
              icon: "car",
              title: "Возраст автомобиля",
              description: "Авто от 2000 года выпуска"
            },
            {
              icon: "calendar",
              title: "Срок лизинга",
              description: "Срок лизинга до 10 лет"
            },
            {
              icon: "dollar-sign",
              title: "Валюта договора",
              description: "Валюта: USD, EUR"
            },
            {
              icon: "check-circle",
              title: "Досрочное погашение",
              description: "Досрочное погашение после 6 месяцев без штрафных санкций"
            }
          ],
          additionalNote: "Все дополнительные вопросы обсуждаемы с каждым клиентом индивидуально"
        }
        setSettings(defaultData)
        // Also save to Firebase for future use
        try {
          await setDoc(doc(db, "pages", "leasing"), defaultData)
        } catch (error) {
          console.error("Error saving default data:", error)
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyPayment = () => {
    const carPrice = calculator.carPrice[0]
    const advance = calculator.advance[0]
    const term = calculator.leasingTerm[0]
    const residualValue = (carPrice * calculator.residualValue[0]) / 100

    const leasingAmount = carPrice - advance - residualValue
    const monthlyPayment = leasingAmount / term

    return monthlyPayment
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
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
      await addDoc(collection(db, "leads"), {
        ...leasingForm,
        type: "leasing_request",
        status: "new",
        createdAt: new Date(),
      })

      // Отправляем уведомление в Telegram
      try {
        const clientName = leasingForm.clientType === "individual"
          ? leasingForm.fullName
          : leasingForm.contactPerson;

        await fetch('/api/send-telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: clientName,
            phone: leasingForm.phone,
            email: leasingForm.email,
            carPrice: leasingForm.carPrice,
            downPayment: leasingForm.advance,
            loanTerm: leasingForm.leasingTerm,
            message: leasingForm.message,
            clientType: leasingForm.clientType,
            companyName: leasingForm.companyName,
            unp: leasingForm.unp,
            type: 'leasing_request',
          }),
        })
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError)
      }

      setLeasingForm({
        clientType: "organization",
        companyName: "",
        contactPerson: "",
        unp: "",
        fullName: "",
        phone: "+375",
        email: "",
        carPrice: "",
        advance: "",
        leasingTerm: "",
        company: "",
        message: "",
      })
      alert("Заявка на лизинг отправлена! Мы свяжемся с вами в ближайшее время.")
    } catch (error) {
      console.error("Ошибка отправки заявки:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "trending-down":
        return TrendingDown
      case "shield":
        return Shield
      case "building":
        return Building
      case "dollar-sign":
        return DollarSign
      case "clock":
        return Clock
      case "file-text":
        return FileText
      case "users":
        return Users
      case "zap":
        return Zap
      case "award":
        return Award
      case "target":
        return Target
      case "briefcase":
        return Briefcase
      case "trending-up":
        return TrendingUp
      case "handshake":
        return Handshake
      case "check-square":
        return CheckSquare
      case "coins":
        return Coins
      case "timer":
        return Timer
      case "heart":
        return Heart
      case "calendar":
        return Calendar
      default:
        return Car
    }
  }

  const monthlyPayment = calculateMonthlyPayment()
  const residualValue = (calculator.carPrice[0] * calculator.residualValue[0]) / 100
  const totalPayments = monthlyPayment * calculator.leasingTerm[0] + calculator.advance[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-1 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Header skeleton */}
          <div className="text-center mb-12">
            <div className="w-96 h-10 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="w-80 h-6 bg-gray-200 rounded animate-pulse mx-auto mb-6"></div>
            <div className="w-full max-w-3xl h-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          {/* Two column layout skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator skeleton */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-full h-32 bg-green-50 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Form skeleton */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
                <div className="w-full h-12 bg-green-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Partners and benefits skeleton */}
          <div className="py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="w-full h-24 bg-white rounded border animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="w-56 h-8 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="space-y-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Не удалось загрузить информацию о лизинге</p>
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
            <li className="text-gray-900">Лизинг</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{settings?.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{settings?.subtitle}</p>
          <p className="text-gray-700 max-w-3xl mx-auto">{settings?.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Лизинговый калькулятор */}
          <div>
            <LeasingCalculator />
          </div>

          {/* Форма заявки на лизинг */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-6 w-6 mr-2" />
                  Заявка на лизинг
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Выбор типа клиента */}
                  <div>
                    <Label>Тип клиента</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="organization"
                          checked={leasingForm.clientType === "organization"}
                          onChange={(e) => setLeasingForm({ ...leasingForm, clientType: e.target.value })}
                          className="text-blue-600"
                        />
                        <span>Организация</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="individual"
                          checked={leasingForm.clientType === "individual"}
                          onChange={(e) => setLeasingForm({ ...leasingForm, clientType: e.target.value })}
                          className="text-blue-600"
                        />
                        <span>Физ. лицо</span>
                      </label>
                    </div>
                  </div>

                  {/* Поля для организации */}
                  {leasingForm.clientType === "organization" && (
                    <>
                      <div>
                        <Label htmlFor="companyName">Название организации</Label>
                        <Input
                          id="companyName"
                          value={leasingForm.companyName}
                          onChange={(e) => setLeasingForm({ ...leasingForm, companyName: e.target.value })}
                          placeholder="ООО 'Ваша компания'"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactPerson">Контактное лицо</Label>
                          <Input
                            id="contactPerson"
                            value={leasingForm.contactPerson}
                            onChange={(e) => setLeasingForm({ ...leasingForm, contactPerson: e.target.value })}
                            placeholder="Иванов Иван Иванович"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="unp">УНП</Label>
                          <Input
                            id="unp"
                            value={leasingForm.unp}
                            onChange={(e) => setLeasingForm({ ...leasingForm, unp: e.target.value })}
                            placeholder="123456789"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Поля для физ. лица */}
                  {leasingForm.clientType === "individual" && (
                    <div>
                      <Label htmlFor="fullName">ФИО</Label>
                      <Input
                        id="fullName"
                        value={leasingForm.fullName}
                        onChange={(e) => setLeasingForm({ ...leasingForm, fullName: e.target.value })}
                        placeholder="Иванов Иван Иванович"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Номер телефона</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={leasingForm.phone}
                          onChange={(e) => setLeasingForm({ ...leasingForm, phone: formatPhoneNumber(e.target.value) })}
                          placeholder="+375XXXXXXXXX"
                          required
                          className="pr-10"
                        />
                        {isPhoneValid(leasingForm.phone) && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={leasingForm.email}
                        onChange={(e) => setLeasingForm({ ...leasingForm, email: e.target.value })}
                        placeholder="your@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carPrice">Стоимость автомобиля ($)</Label>
                      <Input
                        id="carPrice"
                        type="number"
                        value={leasingForm.carPrice}
                        onChange={(e) => setLeasingForm({ ...leasingForm, carPrice: e.target.value })}
                        placeholder="80000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="advance">Авансовый платеж ($)</Label>
                      <Input
                        id="advance"
                        type="number"
                        value={leasingForm.advance}
                        onChange={(e) => setLeasingForm({ ...leasingForm, advance: e.target.value })}
                        placeholder="16000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="leasingTerm">Срок лизинга (месяцев)</Label>
                      <Select
                        value={leasingForm.leasingTerm}
                        onValueChange={(value) => setLeasingForm({ ...leasingForm, leasingTerm: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите срок" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 месяцев</SelectItem>
                          <SelectItem value="24">24 месяца</SelectItem>
                          <SelectItem value="36">36 месяцев</SelectItem>
                          <SelectItem value="48">48 месяцев</SelectItem>
                          <SelectItem value="60">60 месяцев</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="company">Лизинговая компания</Label>
                      <Select
                        value={leasingForm.company}
                        onValueChange={(value) => setLeasingForm({ ...leasingForm, company: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите компанию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="belleasing">БелЛизинг</SelectItem>
                          <SelectItem value="leasingcenter">Лизинг-Центр</SelectItem>
                          <SelectItem value="autoleasing">АвтоЛизинг</SelectItem>
                          <SelectItem value="any">Любая компания</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Дополнительная информация</Label>
                    <Input
                      id="message"
                      value={leasingForm.message}
                      onChange={(e) => setLeasingForm({ ...leasingForm, message: e.target.value })}
                      placeholder="Расскажите о ваших пожеланиях..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Отправить заявку на лизинг
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>





        {/* Лизинговые компании и Преимущества */}
        <section className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Лизинговые компании (слева) */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши лизинговые партнеры</h2>
                <p className="text-gray-600">Работаем с ведущими лизинговыми компаниями Беларуси</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings?.leasingCompanies?.map((company, index) => (
                  <Card key={index} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-green-500 hover:border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-green-100 group-hover:to-green-200 transition-colors">
                          <img
                            src={company.logoUrl ? getCachedImageUrl(company.logoUrl) : "/placeholder.svg"}
                            alt={company.name}
                            className="h-8 w-10 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {company.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-gray-600">от {company.minAdvance}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="text-gray-600">до {company.maxTerm} мес.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Дополнительная информация */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Персональные условия</h4>
                    <p className="text-sm text-gray-600">
                      Обращайтесь к нам для получения индивидуального предложения с учётом ваших потребностей
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Преимущества и Условия (справа) */}
            <div className="space-y-12">
              {/* Преимущества */}
              {settings?.benefits && settings.benefits.length > 0 && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Преимущества лизинга</h2>
                  </div>

                  <div className="space-y-6">
                    {settings.benefits.map((benefit, index) => {
                      const IconComponent = getIcon(benefit.icon)
                      return (
                        <div key={index} className="flex items-start space-x-4 group">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Условия лизинга */}
              <div>
                <LeasingConditions
                  conditions={settings?.conditions}
                  additionalNote={settings?.additionalNote}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
