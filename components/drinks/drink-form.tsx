"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { addDrink } from "@/lib/storage"

interface DrinkFormProps {
  onClose: () => void
  onSave: () => void
}

export default function DrinkForm({ onClose, onSave }: DrinkFormProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unlimited, setUnlimited] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !price || (!unlimited && quantity === "")) {
      setError("من فضلك املأ جميع الحقول")
      return
    }

    addDrink({
      name,
      price: Number.parseFloat(price),
      quantity: unlimited ? null : Number.parseInt(quantity),
      unlimited,
      sold: 0,
    })

    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text">إضافة مشروب جديد</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-2">اسم المشروب</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="مثلاً: قهوة، شاي"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">السعر (جنيه)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="مثلاً: 20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">الكمية المبدئية</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="مثلاً: 10"
                disabled={unlimited}
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={unlimited}
                  onChange={(e) => setUnlimited(e.target.checked)}
                />
                غير محدود
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-text hover:bg-bg-secondary rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
