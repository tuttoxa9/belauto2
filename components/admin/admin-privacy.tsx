"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, Shield } from "lucide-react"

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

export default function AdminPrivacy() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [privacyData, setPrivacyData] = useState<PrivacyData>({
    title: "Политика конфиденциальности",
    lastUpdated: new Date().toLocaleDateString('ru-RU'),
    sections: {
      introduction: "",
      dataCollection: "",
      dataUsage: "",
      dataSecurity: "",
      userRights: "",
      cookies: "",
      thirdParty: "",
      contact: ""
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

  const savePrivacyData = async () => {
    setSaving(true)
    try {
      const updatedData = {
        ...privacyData,
        lastUpdated: new Date().toLocaleDateString('ru-RU')
      }
      await setDoc(doc(db, "pages", "privacy"), updatedData)
      setPrivacyData(updatedData)
      alert("Политика конфиденциальности сохранена!")
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка сохранения данных")
    } finally {
      setSaving(false)
    }
  }

  const updateSection = (sectionKey: keyof PrivacyData['sections'], value: string) => {
    setPrivacyData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  const sections = [
    {
      key: 'introduction' as keyof PrivacyData['sections'],
      title: 'Общие положения',
      description: 'Введение и основные принципы политики конфиденциальности'
    },
    {
      key: 'dataCollection' as keyof PrivacyData['sections'],
      title: 'Сбор персональных данных',
      description: 'Какие данные собираются и как'
    },
    {
      key: 'dataUsage' as keyof PrivacyData['sections'],
      title: 'Использование данных',
      description: 'Цели и способы использования персональных данных'
    },
    {
      key: 'dataSecurity' as keyof PrivacyData['sections'],
      title: 'Безопасность данных',
      description: 'Меры по защите персональных данных'
    },
    {
      key: 'userRights' as keyof PrivacyData['sections'],
      title: 'Права пользователей',
      description: 'Права субъектов персональных данных'
    },
    {
      key: 'cookies' as keyof PrivacyData['sections'],
      title: 'Использование cookies',
      description: 'Политика использования файлов cookies'
    },
    {
      key: 'thirdParty' as keyof PrivacyData['sections'],
      title: 'Передача данных третьим лицам',
      description: 'Условия передачи данных партнерам'
    },
    {
      key: 'contact' as keyof PrivacyData['sections'],
      title: 'Контактная информация',
      description: 'Контакты для обращений по вопросам конфиденциальности'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Политика конфиденциальности</h2>
            <p className="text-gray-300 text-sm">Управление содержимым политики конфиденциальности</p>
          </div>
        </div>
        <Button onClick={savePrivacyData} disabled={saving} className="bg-gradient-to-r from-purple-500 to-blue-500">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Сохранить
        </Button>
      </div>

      {/* Основные настройки */}
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Основные настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Заголовок страницы</Label>
            <Input
              value={privacyData.title}
              onChange={(e) => setPrivacyData({ ...privacyData, title: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Дата последнего обновления</Label>
            <Input
              value={privacyData.lastUpdated}
              onChange={(e) => setPrivacyData({ ...privacyData, lastUpdated: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="дд.мм.гггг"
            />
          </div>
        </CardContent>
      </Card>

      {/* Разделы */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={section.key} className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </span>
                <span>{section.title}</span>
              </CardTitle>
              <p className="text-gray-300 text-sm">{section.description}</p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={privacyData.sections[section.key]}
                onChange={(e) => updateSection(section.key, e.target.value)}
                className="bg-slate-700 border-slate-600 text-white min-h-[200px] resize-y"
                placeholder={`Введите содержимое раздела "${section.title}"`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Предварительный просмотр */}
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Быстрый предварительный просмотр</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">{privacyData.title}</h3>
            <p className="text-gray-300">Последнее обновление: {privacyData.lastUpdated}</p>
            <div className="text-gray-300 text-sm">
              <p>Количество разделов: {sections.length}</p>
              <p>Общее количество символов: {Object.values(privacyData.sections).join('').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
