"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Plus } from "lucide-react"
import { getUsers, deleteUser, getPackages as getAllPackages } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import AddClientToPackageForm from "@/components/sessions/add-client-to-package-form"

interface User {
  id: string
  name: string
  phone: string
  college?: string
  package_id?: string
  package_hours_remaining?: number
  package_start_date?: string
  created_at?: string
}

export default function PackageClientsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editHours, setEditHours] = useState("")
  const [editPackage, setEditPackage] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const allUsers = getUsers()
    const allPackages = getAllPackages()
    const packageClients = allUsers.filter((u) => u.package_id)
    setUsers(packageClients)
    setPackages(allPackages)
  }, [refreshKey])

  const handleDelete = (userId: string) => {
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا العميل؟")) {
      deleteUser(userId)
      setRefreshKey((prev) => prev + 1)
    }
  }

  const handleEditSubmit = (userId: string) => {
    if (!editPackage) {
      alert("يرجى اختيار باقة")
      return
    }

    const allUsers = getUsers()
    const userIndex = allUsers.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      allUsers[userIndex].package_id = editPackage
      if (editHours) {
        allUsers[userIndex].package_hours_remaining = Number.parseFloat(editHours)
      }
      localStorage.setItem("users", JSON.stringify(allUsers))
    }

    setEditingUser(null)
    setEditHours("")
    setEditPackage("")
    setRefreshKey((prev) => prev + 1)
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    setRefreshKey((prev) => prev + 1)
  }

  const getPackageName = (packageId?: string) => {
    if (!packageId) return "بدون باقة"
    return packages.find((p) => p.id === packageId)?.name || "غير معروف"
  }

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">عملاء الباقات</h1>
          <p className="text-text-secondary mt-1">إدارة جميع العملاء المشتركين في الباقات</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة عميل إلى باقة
        </button>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-secondary">لا يوجد عملاء مشتركين في باقات بعد</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-secondary">
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">الاسم</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">رقم الهاتف</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">الكلية</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">الباقة</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">الساعات المتبقية</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">تاريخ البدء</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-text">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-bg-secondary transition-colors">
                  <td className="px-6 py-4 text-sm text-text">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-text">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-text">{user.college || "-"}</td>
                  <td className="px-6 py-4 text-sm text-text font-medium">{getPackageName(user.package_id)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {user.package_hours_remaining?.toFixed(1) || 0} س
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text">
                    {user.package_start_date ? new Date(user.package_start_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setEditPackage(user.package_id || "")
                          setEditHours(String(user.package_hours_remaining || 0))
                        }}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-danger/10 rounded-lg transition-colors text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة التعديل */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-text mb-4">تعديل باقة العميل</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">الباقة</label>
                <select
                  value={editPackage}
                  onChange={(e) => setEditPackage(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">اختر باقة</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {pkg.hours} س
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">الساعات المتبقية</label>
                <input
                  type="number"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  step="0.5"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-text hover:bg-bg-secondary rounded-lg transition-colors flex-1"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleEditSubmit(editingUser.id)}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex-1"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* إضافة عميل إلى باقة */}
      {showAddForm && <AddClientToPackageForm onClose={() => setShowAddForm(false)} onSave={handleAddSuccess} />}
    </div>
  )
}
