"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save, GripVertical, Percent, Clock, Building, CreditCard, CheckCircle, DollarSign, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Heart, Shield, TrendingDown } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface CreditCondition {
  id: string
  condition: string
  icon: string
  isActive: boolean
  order: number
  createdAt: Date
}

export default function AdminCreditConditions() {
  const [conditions, setConditions] = useState<CreditCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingCondition, setEditingCondition] = useState<CreditCondition | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "percent":
        return Percent
      case "clock":
        return Clock
      case "building":
        return Building
      case "creditcard":
        return CreditCard
      case "checkcircle":
        return CheckCircle
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
        return Percent
    }
  }

  const [form, setForm] = useState({
    condition: "",
    icon: "percent",
    isActive: true,
  })

  useEffect(() => {
    loadConditions()
  }, [])

  const loadConditions = async () => {
    try {
      const docRef = doc(db, "settings", "credit-conditions")
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.conditions && Array.isArray(data.conditions)) {
          setConditions(data.conditions.sort((a: CreditCondition, b: CreditCondition) => a.order - b.order))
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки условий:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveConditions = async (updatedConditions: CreditCondition[]) => {
    try {
      setSaving(true)
      const docRef = doc(db, "settings", "credit-conditions")
      await setDoc(docRef, { conditions: updatedConditions }, { merge: true })
      setConditions(updatedConditions)
    } catch (error) {
      console.error("Ошибка сохранения условий:", error)
      alert("Ошибка сохранения. Попробуйте еще раз.")
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCondition) {
      const updatedConditions = conditions.map(condition =>
        condition.id === editingCondition.id
          ? { ...condition, ...form }
          : condition
      )
      await saveConditions(updatedConditions)
    } else {
      const newCondition: CreditCondition = {
        id: Date.now().toString(),
        ...form,
        order: conditions.length,
        createdAt: new Date(),
      }
      await saveConditions([...conditions, newCondition])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setForm({
      condition: "",
      icon: "percent",
      isActive: true,
    })
    setEditingCondition(null)
  }

  const handleEdit = (condition: CreditCondition) => {
    setEditingCondition(condition)
    setForm({
      condition: condition.condition,
      icon: condition.icon,
      isActive: condition.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (conditionId: string) => {
    if (confirm("Удалить условие?")) {
      const updatedConditions = conditions
        .filter(condition => condition.id !== conditionId)
        .map((condition, index) => ({ ...condition, order: index }))
      await saveConditions(updatedConditions)
    }
  }

  const toggleActive = async (conditionId: string) => {
    const updatedConditions = conditions.map(condition =>
      condition.id === conditionId
        ? { ...condition, isActive: !condition.isActive }
        : condition
    )
    await saveConditions(updatedConditions)
  }

  const moveCondition = async (fromIndex: number, toIndex: number) => {
    const newConditions = [...conditions]
    const [movedCondition] = newConditions.splice(fromIndex, 1)
    newConditions.splice(toIndex, 0, movedCondition)

    const updatedConditions = newConditions.map((condition, index) => ({
      ...condition,
      order: index
    }))

    await saveConditions(updatedConditions)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Условия кредитования</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить условие
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCondition ? "Редактировать условие" : "Новое условие"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="condition">Условие</Label>
                <Textarea
                  id="condition"
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  placeholder="Введите условие кредитования"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="icon">Иконка</Label>
                <Select
                  value={form.icon}
                  onValueChange={(value) => setForm({ ...form, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите иконку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Процент (Percent)</SelectItem>
                    <SelectItem value="clock">Часы (Clock)</SelectItem>
                    <SelectItem value="building">Здание (Building)</SelectItem>
                    <SelectItem value="creditcard">Кредитная карта (CreditCard)</SelectItem>
                    <SelectItem value="checkcircle">Галочка (CheckCircle)</SelectItem>
                    <SelectItem value="dollar-sign">Доллар (DollarSign)</SelectItem>
                    <SelectItem value="file-text">Документ (FileText)</SelectItem>
                    <SelectItem value="users">Пользователи (Users)</SelectItem>
                    <SelectItem value="zap">Молния (Zap)</SelectItem>
                    <SelectItem value="award">Награда (Award)</SelectItem>
                    <SelectItem value="target">Цель (Target)</SelectItem>
                    <SelectItem value="briefcase">Портфель (Briefcase)</SelectItem>
                    <SelectItem value="trending-up">Рост (TrendingUp)</SelectItem>
                    <SelectItem value="handshake">Рукопожатие (Handshake)</SelectItem>
                    <SelectItem value="check-square">Квадрат с галочкой (CheckSquare)</SelectItem>
                    <SelectItem value="coins">Монеты (Coins)</SelectItem>
                    <SelectItem value="timer">Таймер (Timer)</SelectItem>
                    <SelectItem value="heart">Сердце (Heart)</SelectItem>
                    <SelectItem value="shield">Щит (Shield)</SelectItem>
                    <SelectItem value="trending-down">Падение (TrendingDown)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <Label>Активно</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {conditions.map((condition, index) => (
          <Card key={condition.id} className={!condition.isActive ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="cursor-move">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>

                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  {(() => {
                    const IconComponent = getIcon(condition.icon)
                    return <IconComponent className="h-5 w-5 text-blue-600" />
                  })()}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-700">{condition.condition}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={condition.isActive}
                    onCheckedChange={() => toggleActive(condition.id)}
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(condition)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(condition.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {conditions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Условия не добавлены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
