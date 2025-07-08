"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Car } from "lucide-react"
import ImageUpload from "@/components/admin/image-upload"

export default function AdminCars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCar, setEditingCar] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const cacheInvalidator = createCacheInvalidator('cars')
  const [carForm, setCarForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    mileage: "",
    engineVolume: "",
    fuelType: "",
    transmission: "",
    driveTrain: "",
    bodyType: "",
    color: "",
    description: "",
    imageUrls: [""],
    isAvailable: true,
    specifications: {
      "Двигатель": "",
      "Разгон 0-100": "",
      "Расход топлива": "",
      "Привод": "",
      "Коробка передач": "",
      "Мощность": ""
    },
    features: [],
  })

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cars"))
      const carsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCars(carsData)
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const carData = {
        ...carForm,
        price: Number(carForm.price),
        mileage: Number(carForm.mileage),
        engineVolume: parseFloat(carForm.engineVolume),
        year: Number(carForm.year),
        imageUrls: carForm.imageUrls.filter((url) => url.trim() !== ""),
        createdAt: editingCar ? editingCar.createdAt : new Date(),
        updatedAt: new Date(),
      }

      if (editingCar) {
        await updateDoc(doc(db, "cars", editingCar.id), carData)
        await cacheInvalidator.onUpdate(editingCar.id)
      } else {
        const docRef = await addDoc(collection(db, "cars"), carData)
        await cacheInvalidator.onCreate(docRef.id)
      }

      setIsDialogOpen(false)
      setEditingCar(null)
      resetForm()
      loadCars()
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка сохранения автомобиля")
    }
  }

  const handleEdit = (car) => {
    setEditingCar(car)
    setCarForm({
      ...car,
      price: car.price.toString(),
      mileage: car.mileage.toString(),
      engineVolume: car.engineVolume.toString(),
      year: car.year.toString(),
      imageUrls: car.imageUrls.length > 0 ? car.imageUrls : [""],
      specifications: car.specifications || {},
      features: car.features || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (carId) => {
    if (confirm("Удалить этот автомобиль?")) {
      try {
        await deleteDoc(doc(db, "cars", carId))
        await cacheInvalidator.onDelete(carId)
        loadCars()
      } catch (error) {
        console.error("Ошибка удаления:", error)
        alert("Ошибка удаления автомобиля")
      }
    }
  }

  const resetForm = () => {
    setCarForm({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      mileage: "",
      engineVolume: "",
      fuelType: "",
      transmission: "",
      driveTrain: "",
      bodyType: "",
      color: "",
      description: "",
      imageUrls: [""],
      isAvailable: true,
      specifications: {
        "Двигатель": "",
        "Разгон 0-100": "",
        "Расход топлива": "",
        "Привод": "",
        "Коробка передач": "",
        "Мощность": ""
      },
      features: [],
    })
  }

  const addImageUrl = () => {
    setCarForm({
      ...carForm,
      imageUrls: [...carForm.imageUrls, ""],
    })
  }

  const updateImageUrl = (index, value) => {
    const newUrls = [...carForm.imageUrls]
    newUrls[index] = value
    setCarForm({ ...carForm, imageUrls: newUrls })
  }

  const removeImageUrl = (index) => {
    const newUrls = carForm.imageUrls.filter((_, i) => i !== index)
    setCarForm({ ...carForm, imageUrls: newUrls.length > 0 ? newUrls : [""] })
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление автомобилями</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingCar(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить автомобиль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCar ? "Редактировать" : "Добавить"} автомобиль</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Марка</Label>
                  <Input
                    value={carForm.make}
                    onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Модель</Label>
                  <Input
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Год</Label>
                  <Input
                    type="number"
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Цена ($)</Label>
                  <Input
                    type="number"
                    value={carForm.price}
                    onChange={(e) => setCarForm({ ...carForm, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Пробег (км)</Label>
                  <Input
                    type="number"
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Объем двигателя (л)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={carForm.engineVolume}
                    onChange={(e) => setCarForm({ ...carForm, engineVolume: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Тип топлива</Label>
                  <Select
                    value={carForm.fuelType}
                    onValueChange={(value) => setCarForm({ ...carForm, fuelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип топлива" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Бензин">Бензин</SelectItem>
                      <SelectItem value="Дизель">Дизель</SelectItem>
                      <SelectItem value="Гибрид">Гибрид</SelectItem>
                      <SelectItem value="Электро">Электро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Коробка передач</Label>
                  <Select
                    value={carForm.transmission}
                    onValueChange={(value) => setCarForm({ ...carForm, transmission: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите КПП" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Автомат">Автомат</SelectItem>
                      <SelectItem value="Механика">Механика</SelectItem>
                      <SelectItem value="Вариатор">Вариатор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Привод</Label>
                  <Select
                    value={carForm.driveTrain}
                    onValueChange={(value) => setCarForm({ ...carForm, driveTrain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите привод" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Передний">Передний</SelectItem>
                      <SelectItem value="Задний">Задний</SelectItem>
                      <SelectItem value="Полный">Полный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Тип кузова</Label>
                  <Input
                    value={carForm.bodyType}
                    onChange={(e) => setCarForm({ ...carForm, bodyType: e.target.value })}
                    placeholder="Седан, Хэтчбек, Внедорожник..."
                  />
                </div>
                <div>
                  <Label>Цвет</Label>
                  <Input
                    value={carForm.color}
                    onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                    placeholder="Черный металлик"
                  />
                </div>
              </div>

              <div>
                <Label>Описание</Label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={carForm.description}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  placeholder="Подробное описание автомобиля..."
                />
              </div>

              <div>
                <Label>Фотографии</Label>
                <div className="grid grid-cols-2 gap-4">
                  {carForm.imageUrls.map((url, index) => (
                    <ImageUpload
                      key={index}
                      currentImage={url}
                      path="cars"
                      onUpload={(newUrl) => updateImageUrl(index, newUrl)}
                      className="col-span-1"
                    />
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={addImageUrl}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить фото
                  </Button>
                  {carForm.imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newUrls = carForm.imageUrls.slice(0, -1)
                        setCarForm({ ...carForm, imageUrls: newUrls.length > 0 ? newUrls : [""] })
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить последнее
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Характеристики</Label>
                <div className="space-y-2">
                  {Object.entries(carForm.specifications).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Название"
                        value={key}
                        onChange={(e) => {
                          const newSpecs = { ...carForm.specifications }
                          delete newSpecs[key]
                          newSpecs[e.target.value] = value
                          setCarForm({ ...carForm, specifications: newSpecs })
                        }}
                      />
                      <Input
                        placeholder="Значение"
                        value={value}
                        onChange={(e) => {
                          setCarForm({
                            ...carForm,
                            specifications: {
                              ...carForm.specifications,
                              [key]: e.target.value
                            }
                          })
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newSpecs = { ...carForm.specifications }
                          delete newSpecs[key]
                          setCarForm({ ...carForm, specifications: newSpecs })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCarForm({
                        ...carForm,
                        specifications: {
                          ...carForm.specifications,
                          "": ""
                        }
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить характеристику
                  </Button>
                </div>
              </div>

              <div>
                <Label>Комплектация</Label>
                <div className="space-y-2">
                  {carForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Особенность"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...carForm.features]
                          newFeatures[index] = e.target.value
                          setCarForm({ ...carForm, features: newFeatures })
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newFeatures = carForm.features.filter((_, i) => i !== index)
                          setCarForm({ ...carForm, features: newFeatures })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCarForm({
                        ...carForm,
                        features: [...carForm.features, ""]
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить особенность
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={carForm.isAvailable}
                  onChange={(e) => setCarForm({ ...carForm, isAvailable: e.target.checked })}
                />
                <Label htmlFor="isAvailable">В наличии</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingCar ? "Сохранить" : "Добавить"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars && cars.map((car) => (
          <Card key={car.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {car.make} {car.model}
                </h3>
                <Badge variant={car.isAvailable ? "default" : "secondary"}>
                  {car.isAvailable ? "В наличии" : "Продан"}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Год: {car.year}</p>
                <p>Цена: ${car.price?.toLocaleString()}</p>
                <p>Пробег: {car.mileage?.toLocaleString()} км</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(car)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(car.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cars.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Автомобили не добавлены</p>
        </div>
      )}
    </div>
  )
}
