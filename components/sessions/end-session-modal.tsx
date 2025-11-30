"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { X } from "lucide-react"
import { getDrinks, endSession, getUserByPhone } from "@/lib/storage"

interface EndSessionModalProps {
  session: any
  onClose: () => void
  onSessionEnded: () => void
}

export default function EndSessionModal({ session, onClose, onSessionEnded }: EndSessionModalProps) {
  const drinks = getDrinks()
  const [selectedDrinks, setSelectedDrinks] = useState<{ [id: string]: number }>(session.selected_drinks || {})
  const [totalPrice, setTotalPrice] = useState<string>(
    session.total_price ? String(session.total_price) : ""
  )
  const [isTotalPriceManuallySet, setIsTotalPriceManuallySet] = useState(false)
  const [modifiedHours, setModifiedHours] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const user = useMemo(() => getUserByPhone(session.phone), [session.phone])
  const hasActivePackage = user && user.package_id && user.package_hours_remaining > 0

  
  const startTime = new Date(session.start_time)
  const now = new Date()
  const durationMs = now.getTime() - startTime.getTime()
  const totalMinutes = Math.round(durationMs / (1000 * 60))
  const calculatedHours = Number((totalMinutes / 60).toFixed(2))

  const sessionHours = modifiedHours ? Number.parseFloat(modifiedHours) || calculatedHours : calculatedHours

  // حساب التكلفة حسب مدة الجلسة
  const calculatedCost = useMemo(() => {
    const hours = sessionHours

    // thresholds (hours -> price)
    const tiers: { h: number; price: number }[] = [
      { h: 1, price: 15 },
      { h: 2, price: 25 },
      { h: 3, price: 30 },
      { h: 4, price: 35 },
      { h: 6, price: 50 },
      { h: 8, price: 70 },
      { h: 12, price: 80 },
    ]

    const GRACE_HOURS = 15 / 60 // 0.25 hours

    // check tiers with a 15-minute grace: if within tier.h + grace, charge tier price
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i]
      if (hours <= t.h + GRACE_HOURS) return t.price
    }

    // if beyond last tier (12h), apply per-hour increments of 10$ with 15-min grace per hour
    const last = tiers[tiers.length - 1]
    if (hours <= last.h + GRACE_HOURS) return last.price

    const extra = hours - last.h
    // deduct first-grace window, then count full extra-hour units (each unit is 1 hour with its own 15-min grace)
    const effective = Math.max(0, extra - GRACE_HOURS)
    const extraUnits = Math.ceil(effective / 1)
    return last.price + extraUnits * 10
  }, [sessionHours])

  const drinksTotal = useMemo(() => {
    return Object.entries(selectedDrinks).reduce((sum, [drinkId, quantity]) => {
      const drink = drinks.find((d: any) => d.id === drinkId)
      return sum + (drink ? drink.price * quantity : 0)
    }, 0)
  }, [selectedDrinks, drinks])

  const finalTotal = totalPrice
    ? Number.parseFloat(totalPrice) || 0
    : (hasActivePackage ? 0 : calculatedCost) + drinksTotal

  const handleDrinkChange = (drinkId: string, quantity: number) => {
    let newDrinks
    if (quantity <= 0) {
      newDrinks = { ...selectedDrinks }
      delete newDrinks[drinkId]
    } else {
      newDrinks = {
        ...selectedDrinks,
        [drinkId]: quantity,
      }
    }
    setSelectedDrinks(newDrinks)
    // تحديث السعر تلقائيًا إذا لم يتم إدخاله يدويًا
    if (!isTotalPriceManuallySet) {
      const drinksSum = Object.entries(newDrinks).reduce((sum, [drinkId, qty]) => {
        const drink = drinks.find((d: any) => d.id === drinkId)
        return sum + (drink ? drink.price * qty : 0)
      }, 0)
      const autoTotal = (hasActivePackage ? 0 : calculatedCost) + drinksSum
      setTotalPrice(autoTotal.toFixed(2))
    }
  }

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      endSession(session.id, {
        selectedDrinks,
        sessionCost: hasActivePackage ? 0 : calculatedCost,
        drinksTotal,
        totalPrice: totalPrice ? Number.parseFloat(totalPrice) || 0 : (hasActivePackage ? 0 : calculatedCost) + drinksTotal,
        sessionHours,
      })
      onSessionEnded()
    } catch (err) {
      setError("فشل في حفظ الجلسة")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-text">إنهاء الجلسة</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSaveSession} className="p-6 space-y-6">
          {error && <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">{error}</div>}

          {/* بيانات العميل */}
          <div className="space-y-2">
            <h3 className="font-semibold text-text">بيانات العميل</h3>
            <div className="bg-bg-secondary rounded p-3 space-y-1">
              <p className="text-sm">
                <span className="text-text-secondary">الاسم:</span>{" "}
                <span className="font-medium text-text">{session.name}</span>
              </p>
              <p className="text-sm">
                <span className="text-text-secondary">رقم الهاتف:</span>{" "}
                <span className="font-medium text-text">{session.phone}</span>
              </p>
            </div>
          </div>

          {/* الاشتراك في الباقة */}
          {hasActivePackage && (
            <div className="space-y-2">
              <h3 className="font-semibold text-text">اشتراك الباقة</h3>
              <div className="bg-accent/10 rounded p-4 border border-accent/20">
                <p className="text-sm text-text-secondary mb-2">سيتم خصم الجلسة من باقة العميل</p>
                <p className="text-sm font-medium text-black">
                  الساعات المتبقية: <span className="font-bold">{user.package_hours_remaining.toFixed(2)}</span> س
                </p>
              </div>
            </div>
          )}

          {/* مدة الجلسة */}
          <div className="space-y-2">
            <h3 className="font-semibold text-text">مدة الجلسة</h3>
            <div className="space-y-2">
              <div className="bg-bg-secondary rounded p-4">
                <p className="text-xs text-text-secondary mb-1">المدة المحسوبة</p>
                <p className="text-lg font-bold text-primary">{calculatedHours} س</p>
              </div>
              {/* <label className="block text-sm text-text-secondary">تعديل الساعات (اختياري):</label>
              <input
                type="number"
                step="0.01"
                value={modifiedHours}
                onChange={(e) => setModifiedHours(e.target.value)}
                placeholder={`${calculatedHours}`}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {modifiedHours && (
                <p className="text-xs text-accent font-medium">يتم استخدام الساعات المعدلة: {sessionHours} س</p>
              )} */}
            </div>
          </div>

          {/* تكلفة الجلسة */}
          <div className="space-y-2">
            <h3 className="font-semibold text-text">تكلفة الجلسة</h3>
            <div className="bg-primary/10 rounded p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">
                  {hasActivePackage ? "خصم من الباقة:" : "تكلفة الجلسة الأساسية:"}
                </span>
                <span className="font-bold text-primary">${hasActivePackage ? "0.00" : calculatedCost}</span>
              </div>
            </div>
          </div>

          {/* المشروبات */}
          {drinks.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-text">المشروبات</h3>
              <div className="space-y-2">
                {drinks.map((drink: any) => (
                  <div key={drink.id} className="flex items-center justify-between p-3 bg-bg-secondary rounded">
                    <div>
                      <p className="font-medium text-text">{drink.name}</p>
                      <p className="text-sm text-text-secondary">${drink.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={selectedDrinks[drink.id] || 0}
                        onChange={(e) => handleDrinkChange(drink.id, Number.parseInt(e.target.value) || 0)}
                        className="w-12 px-2 py-1 border border-border rounded text-center focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {drinksTotal > 0 && (
                <div className="p-3 bg-accent/10 rounded border border-accent/20">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">إجمالي المشروبات:</span>
                    <span className="font-bold text-accent">${drinksTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* السعر الإجمالي */}
          <div className="space-y-2">
            <h3 className="font-semibold text-text">السعر الإجمالي</h3>
            <input
              type="number"
              step="0.01"
              value={totalPrice}
              onChange={(e) => {
                setTotalPrice(e.target.value)
                setIsTotalPriceManuallySet(true)
              }}
              placeholder={`${finalTotal.toFixed(2)}`}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg font-semibold"
            />
            <p className="text-xs text-text-secondary">
              السعر المحسوب: ${finalTotal.toFixed(2)} (اتركه فارغًا لاستخدام القيمة المحسوبة تلقائيًا)
            </p>
          </div>

          {/* الأزرار */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text hover:bg-bg-secondary rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {isLoading ? "جارٍ الحفظ..." : "تم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
