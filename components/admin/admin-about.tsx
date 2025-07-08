"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Plus, Trash2, Shield, Award, Users, Car, Phone, MapPin, Clock, CheckCircle, Star, Wrench, CreditCard, DollarSign, FileText, Building, TrendingUp, Calculator, Handshake } from "lucide-react"

export default function AdminAbout() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aboutData, setAboutData] = useState({
    pageTitle: "О компании \"АвтоБел Центр\"",
    pageSubtitle: "Мы помогаем людям найти идеальный автомобиль уже более 12 лет. Наша миссия — сделать покупку автомобиля простой, безопасной и выгодной.",
    stats: [
      { label: "Довольных клиентов", value: "2500+" },
      { label: "Лет на рынке", value: "12" },
      { label: "Проданных автомобилей", value: "5000+" },
      { label: "Среднее время продажи", value: "7 дней" },
    ],
    history: {
      title: "Наша история",
      content: [
        'Компания "АвтоБел Центр" была основана в 2012 году с простой идеей: сделать покупку подержанного автомобиля максимально прозрачной и безопасной для покупателя.',
        'За годы работы мы выработали строгие стандарты отбора автомобилей, создали собственную систему проверки технического состояния и юридической чистоты каждого автомобиля в нашем каталоге.',
        'Сегодня "АвтоБел Центр" — это команда профессионалов, которая помогает тысячам белорусов найти автомобиль мечты по справедливой цене.'
      ]
    },
    principles: {
      title: "Наши принципы",
      items: [
        {
          title: "Честность и прозрачность",
          description: "Мы предоставляем полную информацию о каждом автомобиле, включая историю обслуживания и возможные недостатки.",
          icon: "shield"
        },
        {
          title: "Качество превыше всего",
          description: "Каждый автомобиль проходит тщательную проверку нашими специалистами перед попаданием в каталог.",
          icon: "award"
        },
        {
          title: "Клиент — наш приоритет",
          description: "Мы сопровождаем клиента на всех этапах покупки: от выбора до оформления документов.",
          icon: "users"
        }
      ]
    },
    services: {
      title: "Наши услуги",
      items: [
        {
          title: "Проверка автомобилей",
          description: "Комплексная диагностика технического состояния и проверка юридической чистоты",
          icon: "shield"
        },
        {
          title: "Гарантия",
          description: "Предоставляем гарантию на каждый проданный автомобиль сроком до 6 месяцев",
          icon: "award"
        },
        {
          title: "Кредитование",
          description: "Помощь в оформлении автокредита в партнерских банках на выгодных условиях",
          icon: "users"
        }
      ]
    },
    companyInfo: {
      fullName: 'ООО "Белавто Центр"',
      unp: "123456789",
      registrationDate: "15.03.2012",
      legalAddress: "г. Минск, ул. Примерная, 123",
    },
    bankDetails: {
      account: "BY12 ALFA 1234 5678 9012 3456 7890",
      bankName: 'ОАО "Альфа-Банк"',
      bik: "ALFABY2X",
      bankAddress: "г. Минск, пр. Дзержинского, 1",
    },
  })

  useEffect(() => {
    loadAboutData()
  }, [])

  const loadAboutData = async () => {
    try {
      const aboutDoc = await getDoc(doc(db, "pages", "about"))
      if (aboutDoc.exists()) {
        const data = aboutDoc.data()
        if (data) {
          setAboutData(prev => ({
            ...prev,
            ...data
          }))
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveAboutData = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "pages", "about"), aboutData)
      alert("Данные сохранены!")
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка сохранения данных")
    } finally {
      setSaving(false)
    }
  }

  const updateStat = (index, field, value) => {
    if (!aboutData?.stats) return
    const newStats = [...aboutData.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setAboutData({ ...aboutData, stats: newStats })
  }

  const updateHistoryParagraph = (index, value) => {
    if (!aboutData?.history?.content) return
    const newContent = [...aboutData.history.content]
    newContent[index] = value
    setAboutData({
      ...aboutData,
      history: { ...aboutData.history, content: newContent }
    })
  }

  const addHistoryParagraph = () => {
    setAboutData({
      ...aboutData,
      history: {
        ...aboutData.history,
        content: [...aboutData.history.content, ""]
      }
    })
  }

  const removeHistoryParagraph = (index) => {
    if (!aboutData?.history?.content) return
    const newContent = aboutData.history.content.filter((_, i) => i !== index)
    setAboutData({
      ...aboutData,
      history: { ...aboutData.history, content: newContent }
    })
  }

  const updatePrinciple = (index, field, value) => {
    if (!aboutData?.principles?.items) return
    const newPrinciples = [...aboutData.principles.items]
    newPrinciples[index] = { ...newPrinciples[index], [field]: value }
    setAboutData({
      ...aboutData,
      principles: { ...aboutData.principles, items: newPrinciples }
    })
  }

  const addPrinciple = () => {
    setAboutData({
      ...aboutData,
      principles: {
        ...aboutData.principles,
        items: [...aboutData.principles.items, { title: "", description: "", icon: "shield" }]
      }
    })
  }

  const removePrinciple = (index) => {
    if (!aboutData?.principles?.items) return
    const newPrinciples = aboutData.principles.items.filter((_, i) => i !== index)
    setAboutData({
      ...aboutData,
      principles: { ...aboutData.principles, items: newPrinciples }
    })
  }

  const updateService = (index, field, value) => {
    if (!aboutData?.services?.items) return
    const newServices = [...aboutData.services.items]
    newServices[index] = { ...newServices[index], [field]: value }
    setAboutData({
      ...aboutData,
      services: { ...aboutData.services, items: newServices }
    })
  }

  const addService = () => {
    setAboutData({
      ...aboutData,
      services: {
        ...aboutData.services,
        items: [...aboutData.services.items, { title: "", description: "", icon: "shield" }]
      }
    })
  }

  const removeService = (index) => {
    if (!aboutData?.services?.items) return
    const newServices = aboutData.services.items.filter((_, i) => i !== index)
    setAboutData({
      ...aboutData,
      services: { ...aboutData.services, items: newServices }
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-24 h-10 bg-purple-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="w-full h-64 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-full h-32 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-48 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-full h-48 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Страница "О нас"</h2>
        <Button onClick={saveAboutData} disabled={saving} className="bg-gradient-to-r from-purple-500 to-blue-500">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Сохранить
        </Button>
      </div>

      <div className="space-y-6">
        {/* Заголовки страницы */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Заголовки страницы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Заголовок страницы</Label>
              <Input
                value={aboutData?.pageTitle || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    pageTitle: e.target.value,
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="О компании..."
              />
            </div>
            <div>
              <Label className="text-white">Подзаголовок страницы</Label>
              <Textarea
                value={aboutData?.pageSubtitle || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    pageSubtitle: e.target.value,
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
                placeholder="Описание компании..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Статистика */}
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aboutData?.stats?.map((stat, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Название</Label>
                    <Input
                      value={stat?.label || ''}
                      onChange={(e) => updateStat(index, "label", e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Значение</Label>
                    <Input
                      value={stat?.value || ''}
                      onChange={(e) => updateStat(index, "value", e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Информация о компании */}
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Информация о компании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Полное наименование</Label>
                <Input
                  value={aboutData?.companyInfo?.fullName || ''}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      companyInfo: { ...aboutData.companyInfo, fullName: e.target.value },
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">УНП</Label>
                <Input
                  value={aboutData?.companyInfo?.unp || ''}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      companyInfo: { ...aboutData.companyInfo, unp: e.target.value },
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Дата регистрации</Label>
                <Input
                  value={aboutData?.companyInfo?.registrationDate || ''}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      companyInfo: { ...aboutData.companyInfo, registrationDate: e.target.value },
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Юридический адрес</Label>
                <Input
                  value={aboutData?.companyInfo?.legalAddress || ''}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      companyInfo: { ...aboutData.companyInfo, legalAddress: e.target.value },
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* История компании */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">История компании</CardTitle>
                <div className="mt-2">
                  <Label className="text-white text-sm">Заголовок секции</Label>
                  <Input
                    value={aboutData?.history?.title || ''}
                    onChange={(e) =>
                      setAboutData({
                        ...aboutData,
                        history: { ...aboutData.history, title: e.target.value },
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
              <Button onClick={addHistoryParagraph} size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Добавить абзац
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aboutData?.history?.content?.map((paragraph, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Абзац {index + 1}</Label>
                  {(aboutData?.history?.content?.length || 0) > 1 && (
                    <Button
                      onClick={() => removeHistoryParagraph(index)}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={paragraph}
                  onChange={(e) => updateHistoryParagraph(index, e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Принципы компании */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Принципы компании</CardTitle>
                <div className="mt-2">
                  <Label className="text-white text-sm">Заголовок секции</Label>
                  <Input
                    value={aboutData?.principles?.title || ''}
                    onChange={(e) =>
                      setAboutData({
                        ...aboutData,
                        principles: { ...aboutData.principles, title: e.target.value },
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
              <Button onClick={addPrinciple} size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Добавить принцип
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aboutData?.principles?.items?.map((principle, index) => (
              <div key={index} className="p-4 bg-slate-700/50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Принцип {index + 1}</h4>
                  <Button
                    onClick={() => removePrinciple(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-white">Заголовок</Label>
                    <Input
                      value={principle?.title || ''}
                      onChange={(e) => updatePrinciple(index, "title", e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Иконка</Label>
                    <Select value={principle?.icon || 'shield'} onValueChange={(value) => updatePrinciple(index, "icon", value)}>
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                        <SelectValue placeholder="Выберите иконку" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="shield" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Защита</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="award" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4" />
                            <span>Награда</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="users" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Люди</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="car" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Автомобиль</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="phone" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>Телефон</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="mappin" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Карта</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="clock" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Время</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="checkcircle" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Проверка</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="star" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>Звезда</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="wrench" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4" />
                            <span>Инструмент</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="creditcard" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Кредит</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dollarsign" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Деньги</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="filetext" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Документ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="building" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>Здание</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="calculator" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Calculator className="h-4 w-4" />
                            <span>Калькулятор</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="handshake" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Handshake className="h-4 w-4" />
                            <span>Рукопожатие</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white">Описание</Label>
                    <Textarea
                      value={principle?.description || ''}
                      onChange={(e) => updatePrinciple(index, "description", e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Услуги компании */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Услуги компании</CardTitle>
                <div className="mt-2">
                  <Label className="text-white text-sm">Заголовок секции</Label>
                  <Input
                    value={aboutData?.services?.title || ''}
                    onChange={(e) =>
                      setAboutData({
                        ...aboutData,
                        services: { ...aboutData.services, title: e.target.value },
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
              <Button onClick={addService} size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Добавить услугу
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aboutData?.services?.items?.map((service, index) => (
              <div key={index} className="p-4 bg-slate-700/50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Услуга {index + 1}</h4>
                  <Button
                    onClick={() => removeService(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-white">Заголовок</Label>
                    <Input
                      value={service?.title || ''}
                      onChange={(e) => updateService(index, "title", e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Иконка</Label>
                    <Select value={service?.icon || 'shield'} onValueChange={(value) => updateService(index, "icon", value)}>
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                        <SelectValue placeholder="Выберите иконку" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="shield" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Защита</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="award" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4" />
                            <span>Награда</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="users" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Люди</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="car" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Автомобиль</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="phone" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>Телефон</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="mappin" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Карта</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="clock" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Время</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="checkcircle" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Проверка</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="star" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>Звезда</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="wrench" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4" />
                            <span>Инструмент</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="creditcard" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Кредит</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dollarsign" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Деньги</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="filetext" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Документ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="building" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>Здание</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="calculator" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Calculator className="h-4 w-4" />
                            <span>Калькулятор</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="handshake" className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <Handshake className="h-4 w-4" />
                            <span>Рукопожатие</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white">Описание</Label>
                    <Textarea
                      value={service?.description || ''}
                      onChange={(e) => updateService(index, "description", e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Банковские реквизиты */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Банковские реквизиты</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Расчетный счет</Label>
              <Input
                value={aboutData?.bankDetails?.account || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    bankDetails: { ...aboutData.bankDetails, account: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Банк</Label>
              <Input
                value={aboutData?.bankDetails?.bankName || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    bankDetails: { ...aboutData.bankDetails, bankName: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">БИК</Label>
              <Input
                value={aboutData?.bankDetails?.bik || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    bankDetails: { ...aboutData.bankDetails, bik: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Адрес банка</Label>
              <Input
                value={aboutData?.bankDetails?.bankAddress || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    bankDetails: { ...aboutData.bankDetails, bankAddress: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
