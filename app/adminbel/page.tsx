"use client"
import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Settings, Car, FileText, MessageSquare, Users, Building, CreditCard, Star, Shield } from "lucide-react"
import AdminSettings from "@/components/admin/admin-settings"
import AdminCars from "@/components/admin/admin-cars"
import AdminStories from "@/components/admin/admin-stories"
import AdminLeads from "@/components/admin/admin-leads"
import AdminAbout from "@/components/admin/admin-about"
import AdminCredit from "@/components/admin/admin-credit"
import AdminContacts from "@/components/admin/admin-contacts"
import AdminReviews from "@/components/admin/admin-reviews"
import AdminPrivacy from "@/components/admin/admin-privacy"
import AdminLeasing from "@/components/admin/admin-leasing"

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password)
    } catch {
      setLoginError("Неверный email или пароль")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Ошибка выхода:", error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md bg-gray-50 border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Image src="/logo.png" alt="Белавто Центр" width={64} height={64} className="object-contain" />
            </div>
            <CardTitle className="text-gray-900 text-2xl">Админ-панель</CardTitle>
            <p className="text-gray-600">Белавто Центр</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>
              {loginError && <div className="text-red-400 text-sm text-center">{loginError}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Войти в админ-панель
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Шапка админки */}
      <header className="bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg">
                <Image src="/logo.png" alt="Белавто Центр" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Админ-панель</h1>
                <p className="text-sm text-gray-600">Белавто Центр</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <div className="container px-4 py-8">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10 bg-gray-100 border-gray-200">
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
            <TabsTrigger
              value="cars"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Автомобили</span>
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Новости</span>
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Заявки</span>
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">О нас</span>
            </TabsTrigger>
            <TabsTrigger
              value="credit"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Кредит</span>
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Контакты</span>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Отзывы</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Политика</span>
            </TabsTrigger>
            <TabsTrigger
              value="leasing"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
            >
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Лизинг</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <AdminSettings />
          </TabsContent>
          <TabsContent value="cars" className="mt-6">
            <AdminCars />
          </TabsContent>
          <TabsContent value="stories" className="mt-6">
            <AdminStories />
          </TabsContent>
          <TabsContent value="leads" className="mt-6">
            <AdminLeads />
          </TabsContent>
          <TabsContent value="about" className="mt-6">
            <AdminAbout />
          </TabsContent>
          <TabsContent value="credit" className="mt-6">
            <AdminCredit />
          </TabsContent>
          <TabsContent value="contacts" className="mt-6">
            <AdminContacts />
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <AdminReviews />
          </TabsContent>
          <TabsContent value="privacy" className="mt-6">
            <AdminPrivacy />
          </TabsContent>
          <TabsContent value="leasing" className="mt-6">
            <AdminLeasing />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
