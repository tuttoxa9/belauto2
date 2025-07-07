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
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Условия для оформления лизинга
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Простые и прозрачные условия для получения автомобиля в лизинг
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {conditions.map((condition, index) => {
            const IconComponent = getIcon(condition.icon)
            return (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden"
              >
                <CardContent className="p-8 text-center relative">
                  {/* Decorative background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon container with animated gradient */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl group-hover:from-blue-200 group-hover:via-indigo-200 group-hover:to-purple-200 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <IconComponent className="h-10 w-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-900 transition-colors duration-300">
                    {condition.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {condition.description}
                  </p>

                  {/* Decorative border that appears on hover */}
                  <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform -translate-x-1/2 group-hover:w-16 transition-all duration-500" />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {additionalNote && (
          <div className="text-center">
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <p className="text-gray-800 font-semibold text-lg max-w-2xl">
                {additionalNote}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
