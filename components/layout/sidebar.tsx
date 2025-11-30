"use client"

import { LayoutDashboard, Clock, Package, Coffee, BarChart3, Settings, Users, Menu, Receipt, ShoppingCart, PieChart } from "lucide-react"
import NotesSidebar from "./notes-sidebar"
import { useState } from "react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  userRole: string
}

const navItems = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { id: "sessions", label: "الجلسات النشطة", icon: Clock, roles: ["admin", "staff"] },
  { id: "packages", label: "الباقات", icon: Package, roles: ["admin", "staff"] },
  { id: "package-clients", label: "عملاء الباقات", icon: Users, roles: ["admin", "staff"] },
  { id: "drinks", label: "المشروبات والمخزون", icon: Coffee, roles: ["admin", "staff"] },
  { id: "subscriptions", label: "اشتراكات المستخدمين", icon: Users, roles: ["admin", "staff"] },
  { id: "notes", label: "الملاحظات", icon: BarChart3, roles: ["admin", "staff"] },
  { id: "reports", label: "التقارير", icon: BarChart3, roles: ["admin"] },
  { id: "settings", label: "الإعدادات", icon: Settings, roles: ["admin"] },
  { id: "expenses", label: "المصروفات", icon: Receipt, roles: ["admin"] },
  { id: "purchases", label: "المشتريات", icon: ShoppingCart, roles: ["admin"] },
  { id: "finance", label: "إحصائيات المالية", icon: PieChart, roles: ["admin"] },
]

export default function Sidebar({ currentPage, onPageChange, userRole }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleOverlayClick = () => setSidebarOpen(false)
  const handleMenuClick = () => setSidebarOpen(true)
  const handleNavClick = (id: string) => {
    onPageChange(id)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* زر القائمة للهواتف */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary text-white rounded-md p-2 shadow-md"
        onClick={handleMenuClick}
        aria-label="فتح القائمة الجانبية"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* الخلفية للهواتف */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* القائمة الجانبية */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[rgba(255,246,76,1)] border-r border-border transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <div>
              <h1 className="font-bold text-text">HUB CLUB</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems
              .filter((item) => item.roles.includes(userRole))
              .map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? "bg-primary text-white" : "text-text hover:bg-bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
          </nav>
  </div>
  </div>
    </>
  )
}
