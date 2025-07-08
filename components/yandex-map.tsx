"use client"

import { useEffect, useRef, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface YandexMapProps {
  address: string
  className?: string
}

declare global {
  interface Window {
    ymaps: any
  }
}

export default function YandexMap({ address, className }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    loadApiKey()
  }, [])

  const loadApiKey = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "main"))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        setApiKey(data.yandexMapsApiKey || "")
      }
    } catch (error) {
      console.error("Ошибка загрузки API ключа:", error)
    }
  }

  useEffect(() => {
    if (!apiKey) return

    // Проверяем, загружен ли уже скрипт
    if (window.ymaps) {
      initMap()
      return
    }

    // Загружаем скрипт Яндекс.Карт
    const script = document.createElement("script")
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    script.onload = () => {
      window.ymaps.ready(initMap)
    }
    document.head.appendChild(script)

    return () => {
      // Очистка при размонтировании компонента
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [apiKey, address])

  const initMap = async () => {
    if (!mapRef.current) return

    try {
      // Геокодируем адрес
      const geocodeResult = await window.ymaps.geocode(address)
      const firstGeoObject = geocodeResult.geoObjects.get(0)
      const coords = firstGeoObject.geometry.getCoordinates()

      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: coords,
        zoom: 16,
        controls: ["zoomControl", "fullscreenControl"],
      })

      // Добавляем метку
      const placemark = new window.ymaps.Placemark(
        coords,
        {
          balloonContent: `<strong>Белавто Центр</strong><br>${address}`,
          hintContent: "Белавто Центр",
        },
        {
          preset: "islands#redIcon",
        }
      )

      map.geoObjects.add(placemark)
      setMapLoaded(true)
    } catch (error) {
      console.error("Ошибка инициализации карты:", error)
    }
  }

  if (!apiKey) {
    return (
      <div className={className}>
        <div className="w-full h-full min-h-[300px] bg-gray-200 rounded-lg animate-pulse relative overflow-hidden">
          {/* Скелетон карты */}
          <div className="absolute inset-4">
            <div className="grid grid-cols-4 gap-2 h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded opacity-50 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
              ))}
            </div>
          </div>
          {/* Имитация элементов управления картой */}
          <div className="absolute top-2 right-2 space-y-1">
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          </div>
          {/* Имитация маркера */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-red-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        ref={mapRef}
        className="w-full h-full min-h-[300px] rounded-lg"
        style={{ display: mapLoaded ? "block" : "none" }}
      />
      {!mapLoaded && (
        <div className="w-full h-full min-h-[300px] bg-gray-200 rounded-lg animate-pulse relative overflow-hidden">
          {/* Скелетон карты */}
          <div className="absolute inset-4">
            <div className="grid grid-cols-4 gap-2 h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded opacity-50 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
              ))}
            </div>
          </div>
          {/* Имитация элементов управления картой */}
          <div className="absolute top-2 right-2 space-y-1">
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          </div>
          {/* Имитация маркера */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-red-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}
