"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Phone, Mail, User, Calendar } from "lucide-react"

export default function AdminLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const cacheInvalidator = createCacheInvalidator('leads')

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      const leadsQuery = query(collection(db, "leads"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(leadsQuery)
      const leadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }))
      setLeads(leadsData)
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId, status) => {
    try {
      await updateDoc(doc(db, "leads", leadId), { status })
      await cacheInvalidator.onUpdate(leadId)
      loadLeads()
    } catch (error) {
      console.error("Ошибка обновления статуса:", error)
    }
  }

  const deleteLead = async (leadId) => {
    if (confirm("Удалить эту заявку?")) {
      try {
        await deleteDoc(doc(db, "leads", leadId))
        await cacheInvalidator.onDelete(leadId)
        loadLeads()
      } catch (error) {
        console.error("Ошибка удаления:", error)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "new":
        return "Новая"
      case "in_progress":
        return "В работе"
      case "completed":
        return "Завершена"
      case "cancelled":
        return "Отменена"
      default:
        return status
    }
  }

  const getTypeText = (type) => {
    switch (type) {
      case "callback":
        return "Обратный звонок"
      case "car_selection":
        return "Подбор автомобиля"
      case "credit_request":
        return "Заявка на кредит"
      case "leasing_request":
        return "Заявка на лизинг"
      default:
        return type
    }
  }

  const filteredLeads = leads.filter((lead) => {
    if (filter === "all") return true
    return lead.status === filter
  })

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Заявки клиентов</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все заявки</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="completed">Завершенные</SelectItem>
            <SelectItem value="cancelled">Отмененные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLeads && filteredLeads.map((lead) => (
          <Card key={lead.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getTypeText(lead.type)}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(lead.status)}>{getStatusText(lead.status)}</Badge>
                  <Select value={lead.status} onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новая</SelectItem>
                      <SelectItem value="in_progress">В работе</SelectItem>
                      <SelectItem value="completed">Завершена</SelectItem>
                      <SelectItem value="cancelled">Отменена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{lead.name || lead.contactPerson || "Не указано"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                  {lead.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{lead.createdAt.toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {lead.companyName && (
                    <div>
                      <span className="font-medium">Компания:</span> {lead.companyName}
                    </div>
                  )}
                  {lead.carPrice && (
                    <div>
                      <span className="font-medium">Стоимость авто:</span> ${Number(lead.carPrice).toLocaleString()}
                    </div>
                  )}
                  {lead.message && (
                    <div>
                      <span className="font-medium">Сообщение:</span>
                      <p className="text-sm text-gray-600 mt-1">{lead.message}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button size="sm" variant="outline" onClick={() => deleteLead(lead.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            {filter === "all" ? "Заявки отсутствуют" : `Нет заявок со статусом "${getStatusText(filter)}"`}
          </p>
        </div>
      )}
    </div>
  )
}
