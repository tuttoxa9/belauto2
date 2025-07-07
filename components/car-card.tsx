"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gauge, Fuel, Settings, Eye, Car, Zap } from "lucide-react"
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white rounded-xl group hover:border-blue-300 h-full">
      <Link href={`/catalog/${car.id}`} className="block h-full">
        {/* Image Section - Компактная */}
        <div className="relative">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl">
            <FadeInImage
              src={car.imageUrls[0] || "/placeholder.svg?height=180&width=300"}
              alt={`${car.make} ${car.model}`}
              className="w-full h-40 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-xl"
            />

            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              {car.isAvailable ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 shadow-lg font-medium rounded-lg">
                  В наличии
                </Badge>
              ) : (
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 shadow-lg font-medium rounded-lg">
                  Продан
                </Badge>
              )}
            </div>

            {/* Year Badge */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold border-0 rounded-lg">
                {car.year}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Section - Компактная и структурированная */}
        <CardContent className="p-3 sm:p-4 space-y-3 flex flex-col justify-between h-[calc(100%-10rem)] sm:h-[calc(100%-11rem)]">
          {/* Title and Price */}
          <div className="space-y-2">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">
              {car.make} {car.model}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatPrice(car.price)}
              </div>
              {usdBynRate && (
                <div className="text-xs sm:text-sm font-semibold text-gray-600">
                  ≈ {convertUsdToByn(car.price, usdBynRate)} BYN
                </div>
              )}
            </div>
          </div>

          {/* Specifications - Компактная сетка */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2">
              <Gauge className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-600 font-medium truncate">Пробег</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{formatMileage(car.mileage)} км</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2">
              <Zap className="h-3 w-3 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-600 font-medium truncate">Двигатель</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{formatEngineVolume(car.engineVolume)}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2">
              <Fuel className="h-3 w-3 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-600 font-medium truncate">Топливо</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{car.fuelType}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2">
              <Car className="h-3 w-3 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-600 font-medium truncate">КПП</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{car.transmission}</div>
              </div>
            </div>
          </div>

          {/* Call to Action - Компактный */}
          <div className="pt-2 mt-auto">
            <div className="bg-blue-50 rounded-lg p-2 text-center group-hover:bg-blue-100 transition-colors">
              <div className="text-sm font-bold text-blue-600 group-hover:text-blue-700 flex items-center justify-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>Подробнее</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
