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
      <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl z-[9999] bg-white overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900">Filtres</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-600 delay-100">
            <h3 className="font-semibold text-gray-900 mb-4">Type d'événement</h3>
            <div className="space-y-4">
              {filterOptions.map((option, index) => {
                const IconComponent = option.icon
                return (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 animate-in fade-in-0 slide-in-from-left-2"
                    style={{ animationDelay: `${200 + index * 100}ms`, animationDuration: "600ms" }}
                  >
                    <Checkbox
                      id={option.id}
                      checked={selectedFilters.includes(option.id)}
                      onCheckedChange={() => handleFilterToggle(option.id)}
                      className="transition-all duration-200 hover:scale-110"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex items-center gap-3 cursor-pointer flex-1 hover:text-gray-900 transition-colors duration-200"
                    >
                      <IconComponent
                        className={`w-5 h-5 ${option.color} transition-transform duration-200 hover:scale-110`}
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t animate-in fade-in-0 slide-in-from-bottom-2 duration-600 delay-600">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1 bg-transparent hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 hover:scale-[1.02]"
            >
              Effacer tout
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              Appliquer ({selectedFilters.length})
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
