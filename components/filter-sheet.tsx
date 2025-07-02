"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Music, Coffee, Palette, Users, X } from "lucide-react"

const filterOptions = [
  { id: "music", label: "Concerts & Musique", icon: Music, color: "text-purple-500" },
  { id: "art", label: "Art & Expositions", icon: Palette, color: "text-orange-500" },
  { id: "social", label: "Bars & Social", icon: Users, color: "text-blue-500" },
  { id: "coffee", label: "Café & Dégustation", icon: Coffee, color: "text-amber-500" },
]

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
}

export function FilterSheet({ open, onClose, selectedFilters, onFiltersChange }: FilterSheetProps) {
  const handleFilterToggle = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter((f) => f !== filterId)
      : [...selectedFilters, filterId]
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange([])
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900">Filtres</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Type d'événement</h3>
            <div className="space-y-4">
              {filterOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.id}
                      checked={selectedFilters.includes(option.id)}
                      onCheckedChange={() => handleFilterToggle(option.id)}
                    />
                    <Label htmlFor={option.id} className="flex items-center gap-3 cursor-pointer flex-1">
                      <IconComponent className={`w-5 h-5 ${option.color}`} />
                      <span className="text-gray-700">{option.label}</span>
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
              Effacer tout
            </Button>
            <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              Appliquer ({selectedFilters.length})
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
