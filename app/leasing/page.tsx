"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Car, CheckCircle, Building, TrendingDown, Shield, Loader2, DollarSign, Clock, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Heart, Calendar } from "lucide-react"
import { doc, getDoc, addDoc, collection, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
    phone: "",
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
        phone: "",
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Загружаем информацию о лизинге</h2>
          <p className="text-gray-600">Подбираем лучшие условия для вашего бизнеса...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-green-50">
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
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {settings?.title}
            </h1>
            <p className="text-2xl text-gray-600 mb-8 font-light">
              {settings?.subtitle}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {settings?.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Лизинговый калькулятор */}
          <div>
            <LeasingCalculator />
          </div>

          {/* Форма заявки на лизинг */}
          <div>
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center text-xl">
                  <Car className="h-6 w-6 mr-2" />
                  Заявка на лизинг
                </CardTitle>
                <p className="text-blue-100 text-sm">Заполните форму для получения индивидуального предложения</p>
              </CardHeader>
              <CardContent className="p-6">
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
                      <Input
                        id="phone"
                        value={leasingForm.phone}
                        onChange={(e) => setLeasingForm({ ...leasingForm, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="+375 XX XXX-XX-XX"
                        required
                      />
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Отправить заявку на лизинг
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Условия лизинга */}
        <LeasingConditions
          conditions={settings?.conditions}
          additionalNote={settings?.additionalNote}
        />

        {/* Преимущества */}
        {settings?.benefits && settings.benefits.length > 0 && (
          <section className="py-20 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 -mx-4 mt-16">
            <div className="container px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Преимущества лизинга</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Узнайте, почему лизинг — это выгодное решение для развития вашего бизнеса
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {settings.benefits.map((benefit, index) => {
                  const IconComponent = getIcon(benefit.icon)
                  return (
                    <Card key={index} className="text-center group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
                      <CardContent className="p-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">{benefit.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Лизинговые компании */}
        {settings?.leasingCompanies && settings.leasingCompanies.length > 0 && (
          <section className="py-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 -mx-4 mt-8">
            <div className="container px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Наши партнеры по лизингу</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Работаем с ведущими лизинговыми компаниями Беларуси для обеспечения лучших условий
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {settings.leasingCompanies.map((company, index) => (
                  <Card key={index} className="text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm group hover:scale-105">
                    <CardContent className="p-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={company.logoUrl || "/placeholder.svg"}
                          alt={company.name}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900">{company.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Аванс от {company.minAdvance}%</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Срок до {company.maxTerm} месяцев</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
