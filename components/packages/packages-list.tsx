"use client"

import { Trash2, Edit2 } from "lucide-react"
import { getPackages, deletePackage } from "@/lib/storage"

export default function PackagesList() {
  const packages = getPackages()

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">اسم الباقة</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">النوع</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">السعر</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">عدد الساعات</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-bg-secondary transition-colors">
                <td className="px-6 py-4 text-sm text-text font-medium">{pkg.name}</td>
                <td className="px-6 py-4 text-sm text-text capitalize">
                  {pkg.type === "weekly"
                    ? "أسبوعية"
                    : pkg.type === "monthly"
                    ? "شهرية"
                    : "سنوية"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-text">${pkg.price}</td>
                <td className="px-6 py-4 text-sm text-text">{pkg.hours} ساعة</td>
                <td className="px-6 py-4 text-sm">
                  <button className="p-2 text-text-secondary hover:text-primary transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="p-2 text-text-secondary hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">لا توجد باقات حتى الآن. قم بإنشاء واحدة للبدء.</p>
        </div>
      )}
    </div>
  )
}
