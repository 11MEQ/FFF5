"use client"

import { useState } from "react"
import DrinksList from "@/components/drinks/drinks-list"
import DrinkForm from "@/components/drinks/drink-form"

export default function DrinksPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">المشروبات والمخزون</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + مشروب جديد
        </button>
      </div>

      {showForm && (
        <DrinkForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            setRefreshKey((prev) => prev + 1)
            setShowForm(false)
          }}
        />
      )}
      <DrinksList key={refreshKey} />
    </div>
  )
}
