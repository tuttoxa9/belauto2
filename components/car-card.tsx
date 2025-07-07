"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import FadeInImage from "@/components/fade-in-image"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"

interface CarCardProps {
  car: {
    id: string
    make: string
    model: string
    year: number
    price: number
    currency: string
    mileage: number
    engineVolume: number
    fuelType: string
    transmission: string
    imageUrls: string[]
    isAvailable: boolean
  }
}

export default function CarCard({ car }: CarCardProps) {
  const usdBynRate = useUsdBynRate()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("ru-BY").format(mileage)
  }

  const formatEngineVolume = (volume: number) => {
    // Всегда показываем с одним знаком после запятой (3.0, 2.5, 1.6)
    return volume.toFixed(1)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-slate-200 bg-white group hover:border-slate-300 h-full">
      <Link href={`/catalog/${car.id}`} className="block h-full">
        {/* Image Section */}
        <div className="relative">
          <div className="relative overflow-hidden bg-slate-100">
            <FadeInImage
              src={car.imageUrls[0] || "/placeholder.svg?height=160&width=280"}
              alt={`${car.make} ${car.model}`}
              className="w-full h-36 object-cover group-hover:scale-102 transition-transform duration-300"
            />

            {/* Status indicator */}
            <div className="absolute top-3 left-3">
              <div className={`w-2 h-2 rounded-full ${car.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            </div>

            {/* Year */}
            <div className="absolute top-3 right-3">
              <span className="bg-black/75 text-white text-xs font-medium px-2 py-1 rounded">
                {car.year}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-1 group-hover:text-slate-700 transition-colors">
              {car.make} {car.model}
            </h3>
            <div className="font-bold text-slate-900 text-xl">
              {formatPrice(car.price)}
            </div>
            {usdBynRate && (
              <div className="text-sm text-slate-500 font-medium">
                ≈ {convertUsdToByn(car.price, usdBynRate)} BYN
              </div>
            )}
          </div>

          {/* Specs - horizontal layout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Пробег</span>
              <span className="font-medium text-slate-900">{formatMileage(car.mileage)} км</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Двигатель</span>
              <span className="font-medium text-slate-900">{formatEngineVolume(car.engineVolume)} {car.fuelType}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">КПП</span>
              <span className="font-medium text-slate-900">{car.transmission}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-3"></div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${car.isAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
              {car.isAvailable ? 'В наличии' : 'Продан'}
            </span>
            <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
              <Eye className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
