"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import CarCard from "@/components/car-card"
import { Filter, SlidersHorizontal } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CarCardSkeleton from "@/components/car-card-skeleton"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  driveTrain: string;
}

export default function CatalogPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    priceFrom: "",
    priceTo: "",
    make: "all",
    model: "all",
    yearFrom: "",
    yearTo: "",
    mileageFrom: "",
    mileageTo: "",
    transmission: "any",
    fuelType: "any",
    driveTrain: "any",
  })
  const [sortBy, setSortBy] = useState("price-asc")

  const applyFilters = useCallback(() => {
    const filtered = cars.filter((car) => {
      return (
        (filters.priceFrom === "" || filters.priceFrom === "0" || car.price >= Number.parseInt(filters.priceFrom)) &&
        (filters.priceTo === "" || filters.priceTo === "0" || car.price <= Number.parseInt(filters.priceTo)) &&
        (filters.make === "all" || car.make === filters.make) &&
        (filters.model === "all" || car.model === filters.model) &&
        (filters.yearFrom === "" || car.year >= Number.parseInt(filters.yearFrom)) &&
        (filters.yearTo === "" || car.year <= Number.parseInt(filters.yearTo)) &&
        (filters.mileageFrom === "" || car.mileage >= Number.parseInt(filters.mileageFrom)) &&
        (filters.mileageTo === "" || car.mileage <= Number.parseInt(filters.mileageTo)) &&
        (filters.transmission === "any" || car.transmission === filters.transmission) &&
        (filters.fuelType === "any" || car.fuelType === filters.fuelType) &&
        (filters.driveTrain === "any" || car.driveTrain === filters.driveTrain)
      )
    })

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "year-desc":
          return b.year - a.year
        case "year-asc":
          return a.year - b.year
        case "mileage-asc":
          return a.mileage - b.mileage
        case "mileage-desc":
          return b.mileage - a.mileage
        default:
          return 0
      }
    })
    setFilteredCars(filtered)
  }, [cars, filters, sortBy])

  useEffect(() => {
    loadCars()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const loadCars = async () => {
    try {
      setLoading(true)
      const snapshot = await getDocs(collection(db, "cars"))
      const carsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCars(carsData as Car[])
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      priceFrom: "",
      priceTo: "",
      make: "all",
      model: "all",
      yearFrom: "",
      yearTo: "",
      mileageFrom: "",
      mileageTo: "",
      transmission: "any",
      fuelType: "any",
      driveTrain: "any",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Главная
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Каталог</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Мобильная кнопка фильтров */}
          <div className="lg:hidden mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Фильтры</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Упрощенные фильтры только основные */}
                  <div>
                    <Label>Марка</Label>
                    <Select value={filters.make} onValueChange={(value) => setFilters({ ...filters, make: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все марки" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все марки</SelectItem>
                        <SelectItem value="BMW">BMW</SelectItem>
                        <SelectItem value="Audi">Audi</SelectItem>
                        <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Цена от ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.priceFrom}
                      onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Цена до ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.priceTo}
                      onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={applyFilters} className="flex-1">
                      Применить
                    </Button>
                    <Button onClick={resetFilters} variant="outline" className="flex-1 bg-transparent">
                      Сбросить
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Десктопные фильтры - добавить класс hidden lg:block */}
          <div className="lg:w-80 hidden lg:block">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Фильтры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Цена */}
                <div>
                  <Label className="text-sm font-medium">Цена ($)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <Label className="text-xs">От</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.priceFrom}
                        onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">До</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.priceTo}
                        onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Марка */}
                <div>
                  <Label>Марка</Label>
                  <Select value={filters.make} onValueChange={(value) => setFilters({ ...filters, make: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все марки</SelectItem>
                      <SelectItem value="BMW">BMW</SelectItem>
                      <SelectItem value="Audi">Audi</SelectItem>
                      <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                      <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                      <SelectItem value="Toyota">Toyota</SelectItem>
                      <SelectItem value="Skoda">Skoda</SelectItem>
                      <SelectItem value="Hyundai">Hyundai</SelectItem>
                      <SelectItem value="Kia">Kia</SelectItem>
                      <SelectItem value="Mazda">Mazda</SelectItem>
                      <SelectItem value="Nissan">Nissan</SelectItem>
                      <SelectItem value="Ford">Ford</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Модель */}
                <div>
                  <Label>Модель</Label>
                  <Select value={filters.model} onValueChange={(value) => setFilters({ ...filters, model: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все модели</SelectItem>
                      <SelectItem value="X5">X5</SelectItem>
                      <SelectItem value="X3">X3</SelectItem>
                      <SelectItem value="3 Series">3 Series</SelectItem>
                      <SelectItem value="5 Series">5 Series</SelectItem>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A6">A6</SelectItem>
                      <SelectItem value="Q5">Q5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Год */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Год от</Label>
                    <Input
                      type="number"
                      placeholder="2015"
                      value={filters.yearFrom}
                      onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Год до</Label>
                    <Input
                      type="number"
                      placeholder="2024"
                      value={filters.yearTo}
                      onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                    />
                  </div>
                </div>

                {/* Пробег */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Пробег от</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.mileageFrom}
                      onChange={(e) => setFilters({ ...filters, mileageFrom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Пробег до</Label>
                    <Input
                      type="number"
                      placeholder="200000"
                      value={filters.mileageTo}
                      onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })}
                    />
                  </div>
                </div>

                {/* Коробка передач */}
                <div>
                  <Label>Коробка передач</Label>
                  <Select
                    value={filters.transmission}
                    onValueChange={(value) => setFilters({ ...filters, transmission: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Любая" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Любая</SelectItem>
                      <SelectItem value="Механика">Механика</SelectItem>
                      <SelectItem value="Автомат">Автомат</SelectItem>
                      <SelectItem value="Вариатор">Вариатор</SelectItem>
                      <SelectItem value="Робот">Робот</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Тип топлива */}
                <div>
                  <Label>Тип топлива</Label>
                  <Select
                    value={filters.fuelType}
                    onValueChange={(value) => setFilters({ ...filters, fuelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Любой" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Любой</SelectItem>
                      <SelectItem value="Бензин">Бензин</SelectItem>
                      <SelectItem value="Дизель">Дизель</SelectItem>
                      <SelectItem value="Гибрид">Гибрид</SelectItem>
                      <SelectItem value="Электро">Электро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Привод */}
                <div>
                  <Label>Привод</Label>
                  <Select
                    value={filters.driveTrain}
                    onValueChange={(value) => setFilters({ ...filters, driveTrain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Любой" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Любой</SelectItem>
                      <SelectItem value="Передний">Передний</SelectItem>
                      <SelectItem value="Задний">Задний</SelectItem>
                      <SelectItem value="Полный">Полный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={applyFilters} className="flex-1">
                    Применить
                  </Button>
                  <Button onClick={resetFilters} variant="outline" className="flex-1 bg-transparent">
                    Сбросить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Основная область */}
          <div className="flex-1">
            {/* Сортировка и результаты */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Каталог автомобилей</h1>
                <p className="text-gray-600">Найдено {filteredCars.length} автомобилей</p>
              </div>
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                    <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                    <SelectItem value="year-desc">Год: сначала новые</SelectItem>
                    <SelectItem value="year-asc">Год: сначала старые</SelectItem>
                    <SelectItem value="mileage-asc">Пробег: по возрастанию</SelectItem>
                    <SelectItem value="mileage-desc">Пробег: по убыванию</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Сетка автомобилей */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <CarCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredCars && filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCars.map((car, index) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {cars.length === 0 ? "Автомобили не добавлены в каталог" : "По вашим критериям автомобили не найдены"}
                </p>
                {cars.length > 0 && (
                  <Button onClick={resetFilters} className="mt-4">
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
