"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { addPackage } from "@/lib/storage"

interface PackageFormProps {
  onClose: () => void
  onSave: () => void
}

export default function PackageForm({ onClose, onSave }: PackageFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"weekly" | "monthly" | "yearly">("monthly")
  const [price, setPrice] = useState("")
  const [hours, setHours] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !price || !hours) {
      setError("من فضلك املأ جميع الحقول")
      return
    }

    addPackage({
      name,
      type,
      price: Number.parseFloat(price),
      hours: Number.parseFloat(hours),
    })

    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* العنوان العلوي */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text">إضافة باقة جديدة</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-2">اسم الباقة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="مثال: باقة شهرية أساسية"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">النوع</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="weekly">أسبوعية</option>
              <option value="monthly">شهرية</option>
              <option value="yearly">سنوية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">السعر (بالدولار)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="مثال: 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">إجمالي الساعات</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              step="0.5"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="مثال: 20"
            />
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
              إنشاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
