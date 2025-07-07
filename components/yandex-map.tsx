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
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Загрузка карты...</p>
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
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Загрузка карты...</p>
          </div>
        </div>
      )}
    </div>
  )
}
