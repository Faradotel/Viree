"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Filter, Music, Palette, Coffee, Users } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
}

const filterCategories = [
  {
    id: "music",
    label: "Concerts & Musique",
    icon: Music,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Concerts, DJ sets, sessions live",
  },
  {
    id: "art",
    label: "Art & Expositions",
    icon: Palette,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    description: "Galeries, vernissages, street art",
  },
  {
    id: "social",
    label: "Bars & Social",
    icon: Users,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Apéros, soirées, rencontres",
  },
  {
    id: "coffee",
    label: "Café & Dégustation",
    icon: Coffee,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "Coffee shops, dégustations, ateliers",
  },
]

export function FilterSheet({ open, onClose, selectedFilters, onFiltersChange }: FilterSheetProps) {
  const handleClose = () => {
    hapticFeedback.sheetClose()
    onClose()
  }

  const handleFilterToggle = (filterId: string) => {
    hapticFeedback.selection()
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter((f) => f !== filterId)
      : [...selectedFilters, filterId]
    onFiltersChange(newFilters)
  }

  const handleClearAll = () => {
    hapticFeedback.impact()
    onFiltersChange([])
  }

  const handleSelectAll = () => {
    hapticFeedback.success()
    onFiltersChange(filterCategories.map((cat) => cat.id))
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-500" />
              Filtres
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} haptic="tap">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Filter Summary */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Filtres actifs</h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {selectedFilters.length} / {filterCategories.length}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {selectedFilters.length === 0
                ? "Aucun filtre sélectionné - tous les événements sont affichés"
                : `${selectedFilters.length} catégorie${selectedFilters.length > 1 ? "s" : ""} sélectionnée${selectedFilters.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedFilters.length === filterCategories.length}
              className="flex-1 bg-transparent"
              haptic="success"
            >
              Tout sélectionner
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedFilters.length === 0}
              className="flex-1 bg-transparent"
              haptic="impact"
            >
              Tout effacer
            </Button>
          </div>

          {/* Filter Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Types d'événements</h3>
            <div className="space-y-3">
              {filterCategories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedFilters.includes(category.id)

                return (
                  <div
                    key={category.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      isSelected
                        ? `${category.color} border-current shadow-sm scale-[1.02]`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleFilterToggle(category.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={category.id}
                        checked={isSelected}
                        onCheckedChange={() => handleFilterToggle(category.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={category.id}
                          className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer"
                        >
                          <Icon className="w-5 h-5" />
                          {category.label}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Filters Preview */}
          {selectedFilters.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Aperçu des filtres</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFilters.map((filterId) => {
                  const category = filterCategories.find((cat) => cat.id === filterId)
                  if (!category) return null

                  const Icon = category.icon
                  return (
                    <Badge
                      key={filterId}
                      className={`${category.color} flex items-center gap-1 px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity duration-200`}
                      onClick={() => handleFilterToggle(filterId)}
                    >
                      <Icon className="w-3 h-3" />
                      {category.label}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              haptic="success"
            >
              Appliquer les filtres
              {selectedFilters.length > 0 && (
                <Badge className="ml-2 bg-white/20 text-white">{selectedFilters.length}</Badge>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Comment utiliser les filtres</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sélectionnez les types d'événements qui vous intéressent</li>
              <li>• Les filtres s'appliquent à la carte et à la liste</li>
              <li>• Combinez plusieurs filtres pour affiner votre recherche</li>
              <li>• Effacez tous les filtres pour voir tous les événements</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
