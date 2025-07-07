"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"
import { Percent, Clock, Building, CreditCard, CheckCircle, DollarSign, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Heart, Shield, TrendingDown } from "lucide-react"

interface CreditCondition {
  id: string
  condition: string
  icon: string
  isActive: boolean
  order: number
  createdAt: Date
}

export default function CreditConditions() {
  const [conditions, setConditions] = useState<CreditCondition[]>([])
  const [loading, setLoading] = useState(true)

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
          const activeConditions = data.conditions
            .filter((condition: CreditCondition) => condition.isActive)
            .sort((a: CreditCondition, b: CreditCondition) => a.order - b.order)
          setConditions(activeConditions)
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки условий кредита:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 w-64 mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!conditions.length) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Условия кредитования</h2>
        <p className="text-gray-600 text-sm mb-6">
          Основные условия получения автокредита
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {conditions.map((condition) => (
          <div
            key={condition.id}
            className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              {(() => {
                const IconComponent = getIcon(condition.icon)
                return <IconComponent className="h-4 w-4 text-blue-600" />
              })()}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed flex-1">
              {condition.condition}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle className="h-3 w-3 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">Индивидуальный подход</h4>
            <p className="text-gray-600 text-xs">
              Каждая заявка рассматривается индивидуально для поиска оптимального решения
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
