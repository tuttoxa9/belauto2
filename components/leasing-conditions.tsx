"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Car, Calendar, DollarSign, CheckCircle, Clock, CreditCard, Shield, Users, FileText } from "lucide-react"

interface LeasingCondition {
  icon: string
  title: string
  description: string
}

interface LeasingConditionsProps {
  conditions?: LeasingCondition[]
  additionalNote?: string
}

export default function LeasingConditions({ conditions, additionalNote }: LeasingConditionsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "car":
        return Car
      case "calendar":
        return Calendar
      case "dollar-sign":
        return DollarSign
      case "check-circle":
        return CheckCircle
      case "clock":
        return Clock
      case "credit-card":
        return CreditCard
      case "shield":
        return Shield
      case "users":
        return Users
      case "file-text":
        return FileText
      default:
        return CheckCircle
    }
  }

  if (!conditions || conditions.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Условия лизинга</h2>
        <p className="text-gray-600 text-sm mb-6">
          Основные условия получения автомобиля в лизинг
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {conditions.map((condition, index) => {
          const IconComponent = getIcon(condition.icon)
          return (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconComponent className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{condition.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {condition.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {additionalNote && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">Индивидуальный подход</h4>
              <p className="text-gray-600 text-xs">
                {additionalNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
