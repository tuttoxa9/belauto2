"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, CreditCard, CheckCircle, Building, Percent, Clock, Loader2, DollarSign, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Heart, Shield, TrendingDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { doc, getDoc, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import CreditConditions from "@/components/credit-conditions"
import { getCachedImageUrl } from "@/lib/image-cache"

interface CreditPageSettings {
  title: string
  subtitle: string
  description: string
  benefits: Array<{
    icon: string
    title: string
    description: string
  }>
  partners: Array<{
    name: string
    logoUrl: string
    minRate: number
    maxTerm: number
  }>
}

export default function CreditPage() {
  const [settings, setSettings] = useState<CreditPageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(false)
  const usdBynRate = useUsdBynRate()

  const [calculator, setCalculator] = useState({
    carPrice: [50000],
    downPayment: [15000],
    loanTerm: [36],
    interestRate: [15],
  })

  const [creditForm, setCreditForm] = useState({
    name: "",
    phone: "",
    email: "",
    carPrice: "",
    downPayment: "",
    loanTerm: "",
    bank: "",
    message: "",
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const doc_ref = doc(db, "pages", "credit")
      const doc_snap = await getDoc(doc_ref)

      if (doc_snap.exists()) {
        setSettings(doc_snap.data() as CreditPageSettings)
      } else {
        // Default fallback data only if no data exists
        setSettings({
          title: "Автокредит на выгодных условиях",
          subtitle: "Получите кредит на автомобиль мечты уже сегодня",
          description: "Мы работаем с ведущими банками Беларуси и поможем вам получить автокредит на самых выгодных условиях.",
          benefits: [],
          partners: []
        })
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyPayment = () => {
    const principal = calculator.carPrice[0] - calculator.downPayment[0]
    const monthlyRate = calculator.interestRate[0] / 100 / 12
    const numPayments = calculator.loanTerm[0]

    if (monthlyRate === 0) {
      return principal / numPayments
    }

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)

    return monthlyPayment
  }

  const formatCurrency = (amount: number) => {
    if (isBelarusianRubles && usdBynRate) {
      return new Intl.NumberFormat("ru-BY", {
        style: "currency",
        currency: "BYN",
        minimumFractionDigits: 0,
      }).format(amount * usdBynRate)
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCreditMinValue = () => {
    return isBelarusianRubles ? 3000 : 1000
  }

  const getCreditMaxValue = () => {
    return isBelarusianRubles ? 300000 : 100000
  }

  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)

    if (!usdBynRate) return

    if (checked) {
      // Переключение на BYN
      setCalculator({
        ...calculator,
        carPrice: [Math.round(calculator.carPrice[0] * usdBynRate)],
        downPayment: [Math.round(calculator.downPayment[0] * usdBynRate)]
      })
    } else {
      // Переключение на USD
      setCalculator({
        ...calculator,
        carPrice: [Math.round(calculator.carPrice[0] / usdBynRate)],
        downPayment: [Math.round(calculator.downPayment[0] / usdBynRate)]
      })
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
      await addDoc(collection(db, "leads"), {
        ...creditForm,
        type: "credit_request",
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
            ...creditForm,
            type: 'credit_request',
          }),
        })
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError)
      }

      setCreditForm({
        name: "",
        phone: "",
        email: "",
        carPrice: "",
        downPayment: "",
        loanTerm: "",
        bank: "",
        message: "",
      })
      alert("Заявка на кредит отправлена! Мы свяжемся с вами в ближайшее время.")
    } catch (error) {
      console.error("Ошибка отправки заявки:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "percent":
        return Percent
      case "clock":
        return Clock
      case "building":
        return Building
      case "dollar-sign":
        return DollarSign
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
      case "shield":
        return Shield
      case "trending-down":
        return TrendingDown
      default:
        return CreditCard
    }
  }

  const monthlyPayment = calculateMonthlyPayment()
  const totalAmount = monthlyPayment * calculator.loanTerm[0]
  const overpayment = totalAmount - (calculator.carPrice[0] - calculator.downPayment[0])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Загружаем информацию о кредитах</h2>
          <p className="text-gray-600">Подготавливаем для вас самые выгодные предложения...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Не удалось загрузить информацию о кредитах</p>
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
            <li className="text-gray-900">Кредит</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{settings?.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{settings?.subtitle}</p>
          <p className="text-gray-700 max-w-3xl mx-auto">{settings?.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Кредитный калькулятор */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-6 w-6 mr-2" />
                  Кредитный калькулятор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div>
                  <Label>Стоимость автомобиля: {formatCurrency(calculator.carPrice[0])}</Label>
                  <Slider
                    value={calculator.carPrice}
                    onValueChange={(value) => setCalculator({ ...calculator, carPrice: value })}
                    max={getCreditMaxValue()}
                    min={getCreditMinValue()}
                    step={isBelarusianRubles ? 500 : 1000}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Первоначальный взнос: {formatCurrency(calculator.downPayment[0])}</Label>
                  <Slider
                    value={calculator.downPayment}
                    onValueChange={(value) => setCalculator({ ...calculator, downPayment: value })}
                    max={calculator.carPrice[0] * 0.8}
                    min={calculator.carPrice[0] * 0.1}
                    step={isBelarusianRubles ? 200 : 500}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Срок кредита: {calculator.loanTerm[0]} мес.</Label>
                  <Slider
                    value={calculator.loanTerm}
                    onValueChange={(value) => setCalculator({ ...calculator, loanTerm: value })}
                    max={84}
                    min={12}
                    step={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Процентная ставка: {calculator.interestRate[0]}%</Label>
                  <Slider
                    value={calculator.interestRate}
                    onValueChange={(value) => setCalculator({ ...calculator, interestRate: value })}
                    max={25}
                    min={10}
                    step={0.25}
                    className="mt-2"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Сумма кредита:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculator.carPrice[0] - calculator.downPayment[0])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ежемесячный платеж:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Общая сумма выплат:</span>
                    <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Переплата:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(overpayment)}</span>
                  </div>
                  {!isBelarusianRubles && usdBynRate && (
                    <div className="pt-2 mt-2 border-t border-blue-200">
                      <div className="text-sm text-blue-700">
                        Ежемесячный платеж: ≈ {convertUsdToByn(monthlyPayment, usdBynRate)} BYN
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Форма заявки на кредит */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-6 w-6 mr-2" />
                  Заявка на кредит
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ваше имя</Label>
                      <Input
                        id="name"
                        value={creditForm.name}
                        onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                        placeholder="Введите ваше имя"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Номер телефона</Label>
                      <Input
                        id="phone"
                        value={creditForm.phone}
                        onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="+375 XX XXX-XX-XX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={creditForm.email}
                      onChange={(e) => setCreditForm({ ...creditForm, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carPrice">Стоимость автомобиля ($)</Label>
                      <Input
                        id="carPrice"
                        type="number"
                        value={creditForm.carPrice}
                        onChange={(e) => setCreditForm({ ...creditForm, carPrice: e.target.value })}
                        placeholder="50000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="downPayment">Первоначальный взнос ($)</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={creditForm.downPayment}
                        onChange={(e) => setCreditForm({ ...creditForm, downPayment: e.target.value })}
                        placeholder="15000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loanTerm">Срок кредита (месяцев)</Label>
                      <Select
                        value={creditForm.loanTerm}
                        onValueChange={(value) => setCreditForm({ ...creditForm, loanTerm: value })}
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
                          <SelectItem value="72">72 месяца</SelectItem>
                          <SelectItem value="84">84 месяца</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bank">Предпочитаемый банк</Label>
                      <Select
                        value={creditForm.bank}
                        onValueChange={(value) => setCreditForm({ ...creditForm, bank: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите банк" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings?.partners?.map((partner) => (
                            <SelectItem
                              key={partner.name}
                              value={partner.name.toLowerCase().replace(/[\s-]/g, '')}
                              className="pr-16"
                            >
                              <div className="flex items-center justify-between w-full relative">
                                <div className="flex items-center gap-2">
                                  {partner.logoUrl && (
                                    <Image
                                      src={getCachedImageUrl(partner.logoUrl)}
                                      alt={`${partner.name} логотип`}
                                      width={20}
                                      height={20}
                                      className="object-contain rounded"
                                    />
                                  )}
                                  <span>{partner.name}</span>
                                </div>
                                <span className="absolute right-2 text-sm font-semibold text-slate-600">{partner.minRate}%</span>
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="any">Любой банк</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Дополнительная информация</Label>
                    <Input
                      id="message"
                      value={creditForm.message}
                      onChange={(e) => setCreditForm({ ...creditForm, message: e.target.value })}
                      placeholder="Расскажите о ваших пожеланиях..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Отправить заявку на кредит
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Банки-партнеры и Преимущества */}
        <section className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Банки-партнеры (слева) */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши банки-партнеры</h2>
                <p className="text-gray-600">Работаем с ведущими банками Беларуси</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings?.partners?.map((partner, index) => (
                  <Card key={index} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                          <img
                            src={partner.logoUrl || "/placeholder.svg"}
                            alt={partner.name}
                            className="h-8 w-10 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {partner.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-gray-600">от {partner.minRate}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="text-gray-600">до {partner.maxTerm} мес.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Дополнительная информация */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building className="h-4 w-4 text-blue-600" />
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
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Преимущества автокредита</h2>
                </div>

                <div className="space-y-6">
                  {settings?.benefits?.map((benefit, index) => {
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

              {/* Условия кредитования */}
              <div>
                <CreditConditions />
              </div>
            </div>
          </div>
        </section>


      </div>
    </div>
  )
}
