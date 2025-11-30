"use client"

import { useState, useEffect } from "react"
import { getUserSubscriptions, getUsers } from "@/lib/storage"

export default function UserSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])

  useEffect(() => {
    const subs = getUserSubscriptions()
    const users = getUsers()
    setSubscriptions(subs)
    setAllUsers(users)
  }, [])

  const getStatusBadge = (hoursRemaining: number | undefined) => {
    const hours = hoursRemaining ?? 0
    if (hours <= 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">منتهي</span>
    }
    if (hours < 5) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">منخفض</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">نشط</span>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متاح"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6 p-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">اشتراكات المستخدمين</h1>
        <p className="text-muted-foreground mt-2">إدارة اشتراكات باقات العملاء وساعات الاستخدام المتبقية</p>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الاشتراكات</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{subscriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الاشتراكات النشطة</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {subscriptions.filter((s) => (s.package_hours_remaining ?? 0) > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-amber-500 mt-2">{allUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* جدول الاشتراكات */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">جميع الاشتراكات</h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">لا توجد اشتراكات مسجلة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">اسم العميل</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">رقم الهاتف</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">الباقة</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">الساعات المتبقية</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">تاريخ البدء</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{sub.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{sub.phone}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div>
                        <p className="font-medium">{sub.packageName}</p>
                        <p className="text-xs text-muted-foreground">${sub.packageDetails?.price || "0.00"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-bold text-blue-600">{(sub.package_hours_remaining ?? 0).toFixed(2)}س</span>
                      <p className="text-xs text-muted-foreground">من {sub.packageDetails?.hours || "0"}س</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(sub.package_start_date)}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(sub.package_hours_remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
