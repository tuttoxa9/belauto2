"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator } from "lucide-react"
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
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(false)
  const usdBynRate = useUsdBynRate()

  const [calculator, setCalculator] = useState({
    carPrice: [50000],
    advance: [15000],
    leasingTerm: [36],
    residualValue: [20],
  })

  const [manualInputs, setManualInputs] = useState({
    carPrice: '',
    advance: '',
    leasingTerm: '',
    residualValue: '',
    selectedCompany: ''
  })

  useEffect(() => {
    loadCalculatorData()
  }, [])

  useEffect(() => {
    // Инициализируем ручные поля значениями слайдеров
    setManualInputs({
      carPrice: calculator.carPrice[0].toString(),
      advance: calculator.advance[0].toString(),
      leasingTerm: calculator.leasingTerm[0].toString(),
      residualValue: calculator.residualValue[0].toString(),
      selectedCompany: ''
    })
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
          carPrice: [data.defaultCarPrice || 50000],
          advance: [Math.round((data.defaultCarPrice || 50000) * (data.defaultAdvancePercent || 30) / 100)],
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
          defaultCarPrice: 50000,
          defaultAdvancePercent: 30,
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
    if (!data || !manualInputs.selectedCompany) return null
    return data.companies.find(c => c.name.toLowerCase().replace(/[\s-]/g, '') === manualInputs.selectedCompany)
  }

  const calculateMonthlyPayment = () => {
    const carPrice = calculator.carPrice[0]
    const advance = calculator.advance[0]
    const term = calculator.leasingTerm[0]
    const residualValue = (carPrice * calculator.residualValue[0]) / 100

    const leasingAmount = carPrice - advance - residualValue

    // Простой расчет без процентов для лизинга
    return leasingAmount / term
  }

  const formatCurrency = (amount: number) => {
    if (isBelarusianRubles) {
      return new Intl.NumberFormat("ru-BY", {
        style: "currency",
        currency: "BYN",
        minimumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getLeasingMinValue = () => {
    return isBelarusianRubles ? 3000 : 1000
  }

  const getLeasingMaxValue = () => {
    return isBelarusianRubles ? 300000 : 100000
  }

  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)

    if (!usdBynRate) return

    if (checked) {
      // Переключение на BYN
      const newCarPrice = Math.max(3000, Math.round(calculator.carPrice[0] * usdBynRate))
      const newAdvance = Math.max(300, Math.round(calculator.advance[0] * usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        advance: [newAdvance]
      })
      setManualInputs({
        ...manualInputs,
        carPrice: newCarPrice.toString(),
        advance: newAdvance.toString()
      })
    } else {
      // Переключение на USD
      const newCarPrice = Math.max(1000, Math.round(calculator.carPrice[0] / usdBynRate))
      const newAdvance = Math.max(100, Math.round(calculator.advance[0] / usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        advance: [newAdvance]
      })
      setManualInputs({
        ...manualInputs,
        carPrice: newCarPrice.toString(),
        advance: newAdvance.toString()
      })
    }
  }

  const handleManualInputChange = (field: string, value: string) => {
    setManualInputs({ ...manualInputs, [field]: value })

    const numValue = parseFloat(value) || 0

    switch (field) {
      case 'carPrice':
        const clampedCarPrice = Math.max(getLeasingMinValue(), Math.min(getLeasingMaxValue(), numValue))
        setCalculator({ ...calculator, carPrice: [clampedCarPrice] })
        break
      case 'advance':
        const minAdvance = calculator.carPrice[0] * 0.1
        const maxAdvance = calculator.carPrice[0] * 0.8
        const clampedAdvance = Math.max(minAdvance, Math.min(maxAdvance, numValue))
        setCalculator({ ...calculator, advance: [clampedAdvance] })
        break
      case 'leasingTerm':
        const clampedTerm = Math.max(12, Math.min(84, numValue))
        setCalculator({ ...calculator, leasingTerm: [clampedTerm] })
        break
      case 'residualValue':
        const clampedResidual = Math.max(10, Math.min(50, numValue))
        setCalculator({ ...calculator, residualValue: [clampedResidual] })
        break
    }
  }

  const handleCompanySelection = (companyValue: string) => {
    setManualInputs({ ...manualInputs, selectedCompany: companyValue })
  }

  const monthlyPayment = calculateMonthlyPayment()
  const leasingSum = calculator.carPrice[0] - calculator.advance[0] - (calculator.carPrice[0] * calculator.residualValue[0] / 100)
  const totalPayments = monthlyPayment * calculator.leasingTerm[0] + calculator.advance[0]
  const residualValue = (calculator.carPrice[0] * calculator.residualValue[0]) / 100

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-6 w-6 mr-2" />
          Лизинговый калькулятор
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Переключатель валюты */}
        <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
          <Checkbox
            id="currency-switch"
            checked={isBelarusianRubles}
            onCheckedChange={handleCurrencyChange}
          />
          <Label htmlFor="currency-switch" className="text-sm font-medium">
            В белорусских рублях
          </Label>
        </div>

        {/* Первая строка: Стоимость и Взнос */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Стоимость: {formatCurrency(calculator.carPrice[0])}</Label>
            <div className="space-y-1 mt-1">
              <Slider
                value={calculator.carPrice}
                onValueChange={(value) => {
                  setCalculator({ ...calculator, carPrice: value })
                  setManualInputs({ ...manualInputs, carPrice: value[0].toString() })
                }}
                max={getLeasingMaxValue()}
                min={getLeasingMinValue()}
                step={isBelarusianRubles ? 500 : 1000}
                className="h-1"
              />
              <Input
                type="number"
                placeholder="50000"
                value={manualInputs.carPrice}
                onChange={(e) => handleManualInputChange('carPrice', e.target.value)}
                className="text-xs h-8"
                min={getLeasingMinValue()}
                max={getLeasingMaxValue()}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Взнос: {formatCurrency(calculator.advance[0])}</Label>
            <div className="space-y-1 mt-1">
              <Slider
                value={calculator.advance}
                onValueChange={(value) => {
                  setCalculator({ ...calculator, advance: value })
                  setManualInputs({ ...manualInputs, advance: value[0].toString() })
                }}
                max={calculator.carPrice[0] * 0.8}
                min={calculator.carPrice[0] * 0.1}
                step={isBelarusianRubles ? 200 : 500}
                className="h-1"
              />
              <Input
                type="number"
                placeholder="15000"
                value={manualInputs.advance}
                onChange={(e) => handleManualInputChange('advance', e.target.value)}
                className="text-xs h-8"
                min={calculator.carPrice[0] * 0.1}
                max={calculator.carPrice[0] * 0.8}
              />
            </div>
          </div>
        </div>

        {/* Вторая строка: Срок и Остаточная стоимость */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Срок: {calculator.leasingTerm[0]} мес.</Label>
            <div className="space-y-1 mt-1">
              <Slider
                value={calculator.leasingTerm}
                onValueChange={(value) => {
                  setCalculator({ ...calculator, leasingTerm: value })
                  setManualInputs({ ...manualInputs, leasingTerm: value[0].toString() })
                }}
                max={84}
                min={12}
                step={3}
                className="h-1"
              />
              <Input
                type="number"
                placeholder="36"
                value={manualInputs.leasingTerm}
                onChange={(e) => handleManualInputChange('leasingTerm', e.target.value)}
                className="text-xs h-8"
                min={12}
                max={84}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Остаточная стоимость: {calculator.residualValue[0]}%</Label>
            <div className="space-y-1 mt-1">
              <Slider
                value={calculator.residualValue}
                onValueChange={(value) => {
                  setCalculator({ ...calculator, residualValue: value })
                  setManualInputs({ ...manualInputs, residualValue: value[0].toString() })
                }}
                max={50}
                min={10}
                step={5}
                className="h-1"
              />
              <Input
                type="number"
                placeholder="20"
                value={manualInputs.residualValue}
                onChange={(e) => handleManualInputChange('residualValue', e.target.value)}
                className="text-xs h-8"
                min={10}
                max={50}
              />
            </div>
          </div>
        </div>

        {/* Выбор лизинговой компании */}
        {data && data.companies.length > 0 && (
          <div>
            <Label className="text-sm">Выберите лизинговую компанию или введите ставку вручную</Label>
            <Select
              value={manualInputs.selectedCompany}
              onValueChange={handleCompanySelection}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Выберите лизинговую компанию" />
              </SelectTrigger>
              <SelectContent>
                {data.companies.map((company) => (
                  <SelectItem
                    key={company.name}
                    value={company.name.toLowerCase().replace(/[\s-]/g, '')}
                  >
                    {company.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Ввести условия вручную</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Сумма лизинга:</span>
            <span className="font-semibold">
              {formatCurrency(leasingSum)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ежемесячный платеж:</span>
            <span className="font-semibold text-blue-600">{formatCurrency(monthlyPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span>Общая сумма выплат:</span>
            <span className="font-semibold">{formatCurrency(totalPayments)}</span>
          </div>
          <div className="flex justify-between">
            <span>Остаточная стоимость:</span>
            <span className="font-semibold">{formatCurrency(residualValue)}</span>
          </div>
          {!isBelarusianRubles && usdBynRate && (
            <div className="pt-2 mt-2 border-t border-blue-200">
              <div className="text-sm text-blue-700">
                Ежемесячный платеж: ≈ {convertUsdToByn(monthlyPayment, usdBynRate)} BYN
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
