"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, CreditCard, Phone } from "lucide-react"

const dockItems = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Каталог", href: "/catalog", icon: Car },
  { name: "Кредит", href: "/credit", icon: CreditCard },
  { name: "Контакты", href: "/contacts", icon: Phone },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4">
        {dockItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 ${isActive ? "text-blue-600" : "text-gray-600"}`} />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
