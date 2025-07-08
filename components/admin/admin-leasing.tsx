"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, Plus, Trash2, Building } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUpload from "./image-upload"

interface LeasingBenefit {
  icon: string
  title: string
  description: string
}

interface LeasingCompany {
  name: string
  logoUrl: string
  minAdvance: number
  maxTerm: number
}

interface LeasingCondition {
  icon: string
  title: string
  description: string
}

interface LeasingPageData {
  title: string
  subtitle: string
  description: string
  benefits: LeasingBenefit[]
  leasingCompanies: LeasingCompany[]
  conditions: LeasingCondition[]
  additionalNote: string
}

export default function AdminLeasing() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [leasingData, setLeasingData] = useState<LeasingPageData>({
    title: "Автомобиль в лизинг – выгодное решение для сохранения финансовой гибкости",
    subtitle: "Пользуйтесь автомобилем, оплачивая его стоимость по частям, и наслаждайтесь комфортом без лишних хлопот",
    description: "Лизинг автомобилей - это удобный способ получить транспорт для бизнеса без больших первоначальных затрат. Налоговые льготы, гибкие условия и возможность выкупа.",
    benefits: [
      {
        icon: "trending-down",
        title: "Низкий первоначальный взнос",
        description: "От 10% от стоимости автомобиля",
      },
      {
        icon: "shield",
        title: "Налоговые льготы",
        description: "Лизинговые платежи включаются в расходы",
      },
      {
        icon: "building",
        title: "Для юридических лиц",
        description: "Специальные условия для бизнеса",
      },
    ],
    leasingCompanies: [
      {
        name: "БелЛизинг",
        logoUrl: "",
        minAdvance: 10,
        maxTerm: 60,
      },
      {
        name: "Лизинг-Центр",
        logoUrl: "",
        minAdvance: 15,
        maxTerm: 48,
      },
      {
        name: "АвтоЛизинг",
        logoUrl: "",
        minAdvance: 20,
        maxTerm: 36,
      },
    ],
    conditions: [
      {
        icon: "car",
        title: "Возраст автомобиля",
        description: "От 2000 года выпуска"
      },
      {
        icon: "calendar",
        title: "Срок лизинга",
        description: "До 10 лет"
      },
      {
        icon: "dollar-sign",
        title: "Валюта договора",
        description: "USD, EUR"
      },
      {
        icon: "check-circle",
        title: "Досрочное погашение",
        description: "После 6 месяцев без штрафных санкций"
      }
    ],
    additionalNote: "Все дополнительные вопросы обсуждаемы с каждым клиентом индивидуально"
  })

  useEffect(() => {
    loadLeasingData()
  }, [])

  const loadLeasingData = async () => {
    try {
      const leasingDoc = await getDoc(doc(db, "pages", "leasing"))
      if (leasingDoc.exists()) {
        const data = leasingDoc.data() as LeasingPageData
        // Убеждаемся, что массивы не undefined
        setLeasingData({
          ...data,
          benefits: data.benefits || [],
          leasingCompanies: data.leasingCompanies || [],
          conditions: data.conditions || [],
          additionalNote: data.additionalNote || "Все дополнительные вопросы обсуждаемы с каждым клиентом индивидуально"
        })
      }
    } catch (error) {
      console.error("Ошибка загрузки данных лизинга:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveLeasingData = async () => {
    try {
      setSaving(true)
      console.log("Saving leasing data:", leasingData)
      await setDoc(doc(db, "pages", "leasing"), leasingData)
      alert("Данные успешно сохранены!")
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка при сохранении данных")
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    const defaultData: LeasingPageData = {
      title: "Автомобиль в лизинг – выгодное решение для сохранения финансовой гибкости",
      subtitle: "Пользуйтесь автомобилем, оплачивая его стоимость по частям, и наслаждайтесь комфортом без лишних хлопот",
      description: "Лизинг автомобилей - это удобный способ получить транспорт для бизнеса без больших первоначальных затрат. Налоговые льготы, гибкие условия и возможность выкупа.",
      benefits: [
        {
          icon: "trending-down",
          title: "Низкий первоначальный взнос",
          description: "От 10% от стоимости автомобиля",
        },
        {
          icon: "shield",
          title: "Налоговые льготы",
          description: "Лизинговые платежи включаются в расходы",
        },
        {
          icon: "building",
          title: "Для юридических лиц",
          description: "Специальные условия для бизнеса",
        },
        {
          icon: "file-text",
          title: "Минимум документов",
          description: "Упрощенный пакет документов для оформления",
        },
      ],
      leasingCompanies: [
        {
          name: "БелЛизинг",
          logoUrl: "",
          minAdvance: 10,
          maxTerm: 60,
        },
        {
          name: "Лизинг-Центр",
          logoUrl: "",
          minAdvance: 15,
          maxTerm: 48,
        },
        {
          name: "АвтоЛизинг",
          logoUrl: "",
          minAdvance: 20,
          maxTerm: 36,
        },
      ],
      conditions: [
        {
          icon: "car",
          title: "Возраст автомобиля",
          description: "От 2000 года выпуска"
        },
        {
          icon: "calendar",
          title: "Срок лизинга",
          description: "До 10 лет"
        },
        {
          icon: "dollar-sign",
          title: "Валюта договора",
          description: "USD, EUR"
        },
        {
          icon: "check-circle",
          title: "Досрочное погашение",
          description: "После 6 месяцев без штрафных санкций"
        }
      ],
      additionalNote: "Все дополнительные вопросы обсуждаемы с каждым клиентом индивидуально"
    }
    setLeasingData(defaultData)
    try {
      await setDoc(doc(db, "pages", "leasing"), defaultData)
      alert("Данные сброшены к значениям по умолчанию и сохранены!")
    } catch (error) {
      console.error("Ошибка сброса данных:", error)
      alert("Ошибка при сбросе данных")
    }
  }

  const addBenefit = () => {
    setLeasingData({
      ...leasingData,
      benefits: [
        ...(leasingData.benefits || []),
        {
          icon: "building",
          title: "",
          description: "",
        },
      ],
    })
  }

  const updateBenefit = (index: number, field: keyof LeasingBenefit, value: string) => {
    const updatedBenefits = [...(leasingData.benefits || [])]
    updatedBenefits[index] = { ...updatedBenefits[index], [field]: value }
    setLeasingData({ ...leasingData, benefits: updatedBenefits })
  }

  const removeBenefit = (index: number) => {
    const updatedBenefits = (leasingData.benefits || []).filter((_, i) => i !== index)
    setLeasingData({ ...leasingData, benefits: updatedBenefits })
  }

  const addLeasingCompany = () => {
    setLeasingData({
      ...leasingData,
      leasingCompanies: [
        ...(leasingData.leasingCompanies || []),
        {
          name: "",
          logoUrl: "",
          minAdvance: 10,
          maxTerm: 60,
        },
      ],
    })
  }

  const updateLeasingCompany = (index: number, field: keyof LeasingCompany, value: string | number) => {
    const updatedCompanies = [...(leasingData.leasingCompanies || [])]
    updatedCompanies[index] = { ...updatedCompanies[index], [field]: value }
    setLeasingData({ ...leasingData, leasingCompanies: updatedCompanies })
  }

  const removeLeasingCompany = (index: number) => {
    const updatedCompanies = (leasingData.leasingCompanies || []).filter((_, i) => i !== index)
    setLeasingData({ ...leasingData, leasingCompanies: updatedCompanies })
  }

  const addCondition = () => {
    setLeasingData({
      ...leasingData,
      conditions: [
        ...(leasingData.conditions || []),
        {
          icon: "check-circle",
          title: "",
          description: "",
        },
      ],
    })
  }

  const updateCondition = (index: number, field: keyof LeasingCondition, value: string) => {
    const updatedConditions = [...(leasingData.conditions || [])]
    updatedConditions[index] = { ...updatedConditions[index], [field]: value }
    setLeasingData({ ...leasingData, conditions: updatedConditions })
  }

  const removeCondition = (index: number) => {
    const updatedConditions = (leasingData.conditions || []).filter((_, i) => i !== index)
    setLeasingData({ ...leasingData, conditions: updatedConditions })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Building className="h-6 w-6 mr-2" />
            Управление страницей лизинга
          </h2>
          <p className="text-gray-600">Настройка контента и партнеров для страницы лизинга</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetToDefaults} variant="outline">
            Сбросить к умолчаниям
          </Button>
          <Button onClick={saveLeasingData} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок страницы</Label>
            <Input
              id="title"
              value={leasingData.title}
              onChange={(e) => setLeasingData({ ...leasingData, title: e.target.value })}
              placeholder="Заголовок страницы лизинга"
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Подзаголовок</Label>
            <Input
              id="subtitle"
              value={leasingData.subtitle}
              onChange={(e) => setLeasingData({ ...leasingData, subtitle: e.target.value })}
              placeholder="Подзаголовок страницы"
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={leasingData.description}
              onChange={(e) => setLeasingData({ ...leasingData, description: e.target.value })}
              placeholder="Описание лизинговых услуг"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Преимущества лизинга */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Преимущества лизинга
            <Button onClick={addBenefit} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить преимущество
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(leasingData.benefits || []).map((benefit, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Преимущество {index + 1}</h4>
                <Button onClick={() => removeBenefit(index)} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Иконка</Label>
                  <Select
                    value={benefit.icon}
                    onValueChange={(value) => updateBenefit(index, "icon", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending-down">Стрелка вниз</SelectItem>
                      <SelectItem value="shield">Щит</SelectItem>
                      <SelectItem value="building">Здание</SelectItem>
                      <SelectItem value="car">Автомобиль</SelectItem>
                      <SelectItem value="calculator">Калькулятор</SelectItem>
                      <SelectItem value="check-circle">Галочка</SelectItem>
                      <SelectItem value="calendar">Календарь</SelectItem>
                      <SelectItem value="dollar-sign">Доллар</SelectItem>
                      <SelectItem value="file-text">Документ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Заголовок</Label>
                  <Input
                    value={benefit.title}
                    onChange={(e) => updateBenefit(index, "title", e.target.value)}
                    placeholder="Название преимущества"
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Input
                    value={benefit.description}
                    onChange={(e) => updateBenefit(index, "description", e.target.value)}
                    placeholder="Описание преимущества"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Лизинговые компании */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Лизинговые компании
            <Button onClick={addLeasingCompany} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить компанию
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(leasingData.leasingCompanies || []).map((company, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Компания {index + 1}</h4>
                <Button onClick={() => removeLeasingCompany(index)} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Название компании</Label>
                  <Input
                    value={company.name}
                    onChange={(e) => updateLeasingCompany(index, "name", e.target.value)}
                    placeholder="Название лизинговой компании"
                  />
                </div>
                <div>
                  <Label>Логотип компании</Label>
                  <ImageUpload
                    onImageUploaded={(url) => updateLeasingCompany(index, "logoUrl", url)}
                    currentImage={company.logoUrl}
                  />
                </div>
                <div>
                  <Label>Минимальный аванс (%)</Label>
                  <Input
                    type="number"
                    value={company.minAdvance}
                    onChange={(e) => updateLeasingCompany(index, "minAdvance", Number(e.target.value))}
                    placeholder="10"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Максимальный срок (месяцев)</Label>
                  <Input
                    type="number"
                    value={company.maxTerm}
                    onChange={(e) => updateLeasingCompany(index, "maxTerm", Number(e.target.value))}
                    placeholder="60"
                    min="1"
                    max="120"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Условия лизинга */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Условия лизинга
            <Button onClick={addCondition} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить условие
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(leasingData.conditions || []).map((condition, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Условие {index + 1}</h4>
                <Button onClick={() => removeCondition(index)} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Иконка</Label>
                  <Select
                    value={condition.icon}
                    onValueChange={(value) => updateCondition(index, "icon", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Автомобиль</SelectItem>
                      <SelectItem value="calendar">Календарь</SelectItem>
                      <SelectItem value="dollar-sign">Доллар</SelectItem>
                      <SelectItem value="check-circle">Галочка</SelectItem>
                      <SelectItem value="clock">Часы</SelectItem>
                      <SelectItem value="shield">Щит</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Заголовок</Label>
                  <Input
                    value={condition.title}
                    onChange={(e) => updateCondition(index, "title", e.target.value)}
                    placeholder="Название условия"
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Input
                    value={condition.description}
                    onChange={(e) => updateCondition(index, "description", e.target.value)}
                    placeholder="Описание условия"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <Label htmlFor="additionalNote">Дополнительная заметка</Label>
            <Textarea
              id="additionalNote"
              value={leasingData.additionalNote}
              onChange={(e) => setLeasingData({ ...leasingData, additionalNote: e.target.value })}
              placeholder="Все дополнительные вопросы обсуждаемы с каждым клиентом индивидуально"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
