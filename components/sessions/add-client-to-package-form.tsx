"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { addUser, getPackages } from "@/lib/storage"

interface AddClientToPackageFormProps {
  onClose: () => void
  onSave: () => void
}

export default function AddClientToPackageForm({ onClose, onSave }: AddClientToPackageFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    college: "",
    package_id: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const packages = getPackages()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!formData.name.trim()) {
        setError("اسم العميل مطلوب")
        setLoading(false)
        return
      }

      if (!formData.phone.trim()) {
        setError("رقم الهاتف مطلوب")
        setLoading(false)
        return
      }

      if (!formData.package_id) {
        setError("من فضلك اختر الباقة")
        setLoading(false)
        return
      }

      const selectedPackage = packages.find((pkg) => pkg.id === formData.package_id)
      if (!selectedPackage) {
        setError("الباقة المحددة غير موجودة")
        setLoading(false)
        return
      }

      const user = addUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        package_id: formData.package_id,
        package_hours_remaining: selectedPackage.hours,
        package_start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || "فشل في إضافة العميل إلى الباقة")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border rounded-lg">
          <h2 className="text-xl font-bold text-text">إضافة عميل إلى باقة</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-text mb-2">اسم العميل *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم العميل"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">رقم الهاتف *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="أدخل رقم الهاتف"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">الكلية / المؤسسة</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="أدخل اسم الكلية أو المؤسسة (اختياري)"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">اختر الباقة *</label>
            <select
              name="package_id"
              value={formData.package_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">اختر باقة...</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - {pkg.hours ?? 0} ساعة مقابل ${pkg.price}
                </option>
              ))}
            </select>
          </div>

          {packages.length === 0 && (
            <div className="p-4 bg-warning/10 border border-warning rounded-lg text-warning text-sm">
              لا توجد باقات متاحة حالياً. يرجى إنشاء باقات أولاً من قسم الباقات.
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text hover:bg-bg-secondary rounded-lg transition-colors flex-1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || packages.length === 0}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex-1 disabled:opacity-50"
            >
              {loading ? "جارٍ الإضافة..." : "إضافة العميل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
