"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2 } from "lucide-react"

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const cacheInvalidator = createCacheInvalidator('settings')
  const [settings, setSettings] = useState({
    main: {
      companyName: "Белавто Центр",
      phone: "+375 29 123-45-67",
      email: "info@belavto.by",
      address: "г. Минск, ул. Примерная, 123",
      workingHours: "Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00",
      socialMedia: {
        instagram: "#",
        telegram: "#",
        avby: "#",
        tiktok: "#",
      },
      yandexMapsApiKey: "",
    },
    homepage: {
      heroTitle: "Найдите идеальный автомобиль с пробегом",
      heroSubtitle: "Более 500 проверенных автомобилей. Гарантия качества. Помощь в оформлении кредита.",
      heroBackgroundUrl: "/images/audi-hero.jpg",
      advantagesTitle: "Почему выбирают нас",
      ctaTitle: "Не нашли подходящий автомобиль?",
      ctaSubtitle: "Оставьте заявку, и мы подберем автомобиль специально для вас",
    },
    stories: {
      title: "Свежие поступления и новости",
      subtitle: "Следите за нашими обновлениями",
    },
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const [mainDoc, homepageDoc, storiesDoc] = await Promise.all([
        getDoc(doc(db, "settings", "main")),
        getDoc(doc(db, "settings", "homepage")),
        getDoc(doc(db, "settings", "stories")),
      ])

      setSettings({
        main: mainDoc.exists() ? mainDoc.data() : settings.main,
        homepage: homepageDoc.exists() ? homepageDoc.data() : settings.homepage,
        stories: storiesDoc.exists() ? storiesDoc.data() : settings.stories,
      })
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await Promise.all([
        setDoc(doc(db, "settings", "main"), settings.main),
        setDoc(doc(db, "settings", "homepage"), settings.homepage),
        setDoc(doc(db, "settings", "stories"), settings.stories),
      ])
      await cacheInvalidator.onUpdate('main')
      alert("Настройки сохранены!")
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка сохранения настроек")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Настройки сайта</h2>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Сохранить все
        </Button>
      </div>

      <Tabs defaultValue="main" className="w-full">
        <TabsList>
          <TabsTrigger value="main">Основные</TabsTrigger>
          <TabsTrigger value="homepage">Главная страница</TabsTrigger>
          <TabsTrigger value="stories">Новости</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Название компании</Label>
                <Input
                  value={settings.main.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, companyName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={settings.main.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: { ...settings.main, phone: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={settings.main.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: { ...settings.main, email: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Адрес</Label>
                <Input
                  value={settings.main.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, address: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Время работы</Label>
                <Input
                  value={settings.main.workingHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, workingHours: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>API ключ Яндекс.Карт</Label>
                <Input
                  type="password"
                  value={settings.main.yandexMapsApiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, yandexMapsApiKey: e.target.value },
                    })
                  }
                  placeholder="Введите API ключ Яндекс.Карт"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Социальные сети</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={settings.main.socialMedia.instagram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, instagram: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Telegram</Label>
                  <Input
                    value={settings.main.socialMedia.telegram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, telegram: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>av.by</Label>
                  <Input
                    value={settings.main.socialMedia.avby}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, avby: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>TikTok</Label>
                  <Input
                    value={settings.main.socialMedia.tiktok}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, tiktok: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Главный экран (Hero)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Заголовок</Label>
                <Input
                  value={settings.homepage.heroTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, heroTitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Подзаголовок</Label>
                <Textarea
                  value={settings.homepage.heroSubtitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, heroSubtitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>URL фонового изображения</Label>
                <Input
                  value={settings.homepage.heroBackgroundUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, heroBackgroundUrl: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Призыв к действию (CTA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Заголовок CTA</Label>
                <Input
                  value={settings.homepage.ctaTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, ctaTitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Подзаголовок CTA</Label>
                <Textarea
                  value={settings.homepage.ctaSubtitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, ctaSubtitle: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Блок новостей</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Заголовок блока</Label>
                <Input
                  value={settings.stories.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stories: { ...settings.stories, title: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Подзаголовок</Label>
                <Input
                  value={settings.stories.subtitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stories: { ...settings.stories, subtitle: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
