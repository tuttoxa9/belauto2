"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Coins, TrendingUp } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"

interface LeasingCompany {
  name: string
  logoUrl?: string
  minAdvance: number
  maxTerm: number
  interestRate: number
}

interface LeasingCalculatorData {
  companies: LeasingCompany[]
  defaultCarPrice: number
  defaultAdvancePercent: number
  defaultTerm: number
  defaultResidualPercent: number
}

export default function LeasingCalculator() {
  const [data, setData] = useState<LeasingCalculatorData | null>(null)
  const [loading, setLoading] = useState(true)
  const usdBynRate = useUsdBynRate()

  const [calculator, setCalculator] = useState({
    carPrice: [80000],
    advance: [16000],
    leasingTerm: [36],
    residualValue: [20],
    selectedCompany: "",
  })

  useEffect(() => {
    loadCalculatorData()
  }, [])

  const loadCalculatorData = async () => {
    try {
      const docRef = doc(db, "leasing", "calculator")
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as LeasingCalculatorData
        setData(data)

        // Устанавливаем значения по умолчанию из БД
        setCalculator(prev => ({
          ...prev,
          carPrice: [data.defaultCarPrice || 80000],
          advance: [Math.round((data.defaultCarPrice || 80000) * (data.defaultAdvancePercent || 20) / 100)],
          leasingTerm: [data.defaultTerm || 36],
          residualValue: [data.defaultResidualPercent || 20],
        }))
      } else {
        // Данные по умолчанию
        const defaultData: LeasingCalculatorData = {
          companies: [
            { name: "БелЛизинг", minAdvance: 15, maxTerm: 60, interestRate: 8.5 },
            { name: "Лизинг-Центр", minAdvance: 20, maxTerm: 72, interestRate: 9.0 },
            { name: "АвтоЛизинг", minAdvance: 10, maxTerm: 48, interestRate: 7.8 },
          ],
          defaultCarPrice: 80000,
          defaultAdvancePercent: 20,
          defaultTerm: 36,
          defaultResidualPercent: 20,
        }
        setData(defaultData)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных калькулятора:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedCompany = () => {
    if (!data || !calculator.selectedCompany) return null
    return data.companies.find(c => c.name === calculator.selectedCompany)
  }

  const calculateMonthlyPayment = () => {
    const carPrice = calculator.carPrice[0]
    const advance = calculator.advance[0]
    const term = calculator.leasingTerm[0]
    const residualValue = (carPrice * calculator.residualValue[0]) / 100
    const company = getSelectedCompany()

    const leasingAmount = carPrice - advance - residualValue

    if (company && company.interestRate > 0) {
      // Расчет с процентной ставкой
      const monthlyRate = company.interestRate / 100 / 12
      const monthlyPayment = (leasingAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
                            (Math.pow(1 + monthlyRate, term) - 1)
      return monthlyPayment
    } else {
      // Простой расчет без процентов
      return leasingAmount / term
    }
  }

  const formatCurrency = (amount: number, showByn = true) => {
    const usdFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)

    if (showByn && usdBynRate) {
      const bynAmount = convertUsdToByn(amount, usdBynRate)
      return `${usdFormatted} (≈ ${bynAmount} BYN)`
    }

    return usdFormatted
  }

  const monthlyPayment = calculateMonthlyPayment()
  const residualValue = (calculator.carPrice[0] * calculator.residualValue[0]) / 100
  const totalPayments = monthlyPayment * calculator.leasingTerm[0] + calculator.advance[0]
  const totalInterest = totalPayments - calculator.carPrice[0] + residualValue

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-6 w-6 mr-2" />
            Лизинговый калькулятор
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
        <CardTitle className="flex items-center text-xl">
          <Calculator className="h-6 w-6 mr-2" />
          Лизинговый калькулятор
        </CardTitle>
        <p className="text-green-100 text-sm">Рассчитайте ежемесячный платеж в долларах и рублях</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div>
          <Label className="text-gray-700 font-medium">
            Стоимость автомобиля: {formatCurrency(calculator.carPrice[0])}
          </Label>
          <Slider
            value={calculator.carPrice}
            onValueChange={(value) => {
              const newPrice = value[0]
              const advancePercent = (calculator.advance[0] / calculator.carPrice[0]) * 100
              const newAdvance = Math.round((newPrice * advancePercent) / 100)
              setCalculator({
                ...calculator,
                carPrice: value,
                advance: [newAdvance]
              })
            }}
            max={300000}
            min={20000}
            step={5000}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$20,000</span>
            <span>$300,000</span>
          </div>
        </div>

        <div>
          <Label className="text-gray-700 font-medium">
            Авансовый платеж: {formatCurrency(calculator.advance[0])}
            <span className="text-sm text-gray-500 ml-2">
              ({Math.round((calculator.advance[0] / calculator.carPrice[0]) * 100)}%)
            </span>
          </Label>
          <Slider
            value={calculator.advance}
            onValueChange={(value) => setCalculator({ ...calculator, advance: value })}
            max={calculator.carPrice[0] * 0.5}
            min={calculator.carPrice[0] * 0.1}
            step={1000}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        <div>
          <Label className="text-gray-700 font-medium">
            Срок лизинга: {calculator.leasingTerm[0]} мес.
          </Label>
          <Slider
            value={calculator.leasingTerm}
            onValueChange={(value) => setCalculator({ ...calculator, leasingTerm: value })}
            max={84}
            min={12}
            step={6}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>12 мес.</span>
            <span>84 мес.</span>
          </div>
        </div>

        <div>
          <Label className="text-gray-700 font-medium">
            Остаточная стоимость: {calculator.residualValue[0]}%
          </Label>
          <Slider
            value={calculator.residualValue}
            onValueChange={(value) => setCalculator({ ...calculator, residualValue: value })}
            max={50}
            min={10}
            step={5}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {data && data.companies.length > 0 && (
          <div>
            <Label className="text-gray-700 font-medium">Лизинговая компания</Label>
            <Select
              value={calculator.selectedCompany}
              onValueChange={(value) => setCalculator({ ...calculator, selectedCompany: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Выберите компанию" />
              </SelectTrigger>
              <SelectContent>
                {data.companies.map((company) => (
                  <SelectItem key={company.name} value={company.name}>
                    {company.name} (ставка {company.interestRate}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center mb-4">
            <Coins className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Расчет платежей</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Авансовый платеж:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(calculator.advance[0])}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Ежемесячный платеж:</span>
              <span className="font-bold text-green-600 text-lg">
                {formatCurrency(monthlyPayment)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Остаточная стоимость:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(residualValue)}
              </span>
            </div>

            <div className="border-t border-green-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Общая сумма платежей:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalPayments)}
                </span>
              </div>

              {getSelectedCompany() && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-700">Переплата:</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(totalInterest)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {usdBynRate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center text-sm text-blue-700">
                <TrendingUp className="h-4 w-4 mr-1" />
                Курс USD/BYN: {usdBynRate.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
