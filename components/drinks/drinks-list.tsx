"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit2 } from "lucide-react"
import { getDrinks, deleteDrink, updateDrink } from "@/lib/storage"

interface Drink {
  id: string;
  name: string;
  price: number;
  quantity: number | null; // initial stock, null if unlimited
  unlimited?: boolean;
  sold: number; // total sold
}

export default function DrinksList() {
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null)
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [newSold, setNewSold] = useState("")

  useEffect(() => {
    setDrinks(getDrinks())
  }, [])

  const handleDelete = (id: string) => {
    deleteDrink(id)
    setDrinks(getDrinks())
  }

  const handleEditClick = (drink: Drink) => {
    setEditingDrink(drink)
    setNewName(drink.name)
    setNewPrice(drink.price.toString())
  setNewQuantity(drink.quantity !== null && drink.quantity !== undefined ? drink.quantity.toString() : "")
  setNewSold(drink.sold?.toString() ?? "0")
  }

  const handleEditSave = () => {
    if (!editingDrink) return
    updateDrink(editingDrink.id, {
      name: newName,
      price: parseFloat(newPrice),
      quantity: newQuantity === "" ? null : parseInt(newQuantity),
      sold: parseInt(newSold),
    })
    setEditingDrink(null)
    setDrinks(getDrinks())
  }

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">الاسم</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">السعر</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">المخزون الأولي</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">تم البيع</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-text">تعديلات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {drinks.map((drink) => (
              <tr key={drink.id} className="hover:bg-bg-secondary transition-colors">
                <td className="px-6 py-4 text-sm text-text font-medium">{drink.name}</td>
                <td className="px-6 py-4 text-sm text-text">${drink.price?.toFixed ? drink.price.toFixed(2) : drink.price}</td>
                <td className="px-6 py-4 text-sm text-text">{drink.unlimited ? "غير محدود" : (drink.quantity ?? 0)}</td>
                <td className="px-6 py-4 text-sm text-text">{drink.sold ?? 0}</td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => handleEditClick(drink)}
                    className="p-2 text-text-secondary hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(drink.id)}
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

      {drinks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No drinks yet. Add one to get started.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingDrink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Drink</h2>

            <div className="space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-border rounded-lg p-2"
                placeholder="Drink Name"
              />
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full border border-border rounded-lg p-2"
                placeholder="Price"
              />
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full border border-border rounded-lg p-2"
                placeholder="Initial Stock"
              />
              <input
                type="number"
                value={newSold}
                onChange={(e) => setNewSold(e.target.value)}
                className="w-full border border-border rounded-lg p-2"
                placeholder="Sold Count"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setEditingDrink(null)} className="px-4 py-2 bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={handleEditSave} className="px-4 py-2 bg-primary text-white rounded-lg">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
