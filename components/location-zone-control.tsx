"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { X, Target, MapPin, Zap } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface LocationZoneControlProps {
  userLocation: { lat: number; lng: number } | null
  searchRadius: number
  onRadiusChange: (radius: number) => void
  eventsInZone: number
  totalEvents: number
}

const radiusPresets = [
  { value: 0.5, label: "500m", description: "Très proche" },
  { value: 1, label: "1km", description: "À pied" },
  { value: 2, label: "2km", description: "Vélo" },
  { value: 5, label: "5km", description: "Transport" },
  { value: 10, label: "10km", description: "Voiture" },
]

export function LocationZoneControl({
  userLocation,
  searchRadius,
  onRadiusChange,
  eventsInZone,
  totalEvents,
}: LocationZoneControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleRadiusChange = (value: number[]) => {
    hapticFeedback.selection()
    onRadiusChange(value[0])
  }

  const handlePresetSelect = (radius: number) => {
    hapticFeedback.tap()
    onRadiusChange(radius)
  }

  const handleClose = () => {
    hapticFeedback.sheetClose()
    setIsOpen(false)
  }

  const formatRadius = (radius: number) => {
    return radius < 1 ? `${radius * 1000}m` : `${radius}km`
  }

  const getZoneDescription = (radius: number) => {
    const preset = radiusPresets.find((p) => p.value === radius)
    return preset?.description || "Personnalisé"
  }

  if (!userLocation) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg border border-gray-200 relative min-h-[44px] touch-manipulation"
          size="default"
          haptic="tap"
        >
          <Target className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Zone</span>
          <Badge className="ml-2 bg-purple-100 text-purple-700 min-h-[20px] px-2">{formatRadius(searchRadius)}</Badge>
          {eventsInZone > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
              {eventsInZone}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Zone de recherche
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              haptic="tap"
              className="min-h-[44px] min-w-[44px]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6 flex-1 overflow-y-auto">
          {/* Current Zone Status */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">Zone actuelle</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rayon:</span>
                <Badge className="bg-purple-100 text-purple-700 min-h-[24px] px-3">{formatRadius(searchRadius)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-900">{getZoneDescription(searchRadius)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Événements:</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 min-h-[24px] px-3">{eventsInZone} dans la zone</Badge>
                  {totalEvents > eventsInZone && (
                    <Badge variant="outline" className="text-xs min-h-[20px] px-2">
                      {totalEvents - eventsInZone} masqués
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold text-gray-900 mb-2 block">Ajuster le rayon</Label>
              <p className="text-sm text-gray-600 mb-4">
                Définissez la distance maximale pour voir les événements autour de vous
              </p>
            </div>

            <div className="space-y-4 px-2">
              <Slider
                value={[searchRadius]}
                onValueChange={handleRadiusChange}
                max={10}
                min={0.5}
                step={0.5}
                className="w-full touch-manipulation"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>500m</span>
                <span className="font-medium text-purple-600 text-sm">{formatRadius(searchRadius)}</span>
                <span>10km</span>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Raccourcis rapides</Label>
            <div className="grid grid-cols-2 gap-3">
              {radiusPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={searchRadius === preset.value ? "default" : "outline"}
                  size="lg"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`flex flex-col h-auto py-4 min-h-[60px] touch-manipulation ${
                    searchRadius === preset.value
                      ? "bg-purple-500 hover:bg-purple-600 text-white"
                      : "hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600"
                  } transition-all duration-200`}
                  haptic="tap"
                >
                  <span className="font-semibold text-base">{preset.label}</span>
                  <span className="text-xs opacity-80 mt-1">{preset.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Zone Impact */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Impact sur les résultats</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg touch-manipulation">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-green-800">Événements visibles</span>
                </div>
                <Badge className="bg-green-100 text-green-700 min-h-[24px] px-3">{eventsInZone}</Badge>
              </div>

              {totalEvents > eventsInZone && (
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg touch-manipulation">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                    <span className="text-sm font-medium text-gray-600">Événements masqués</span>
                  </div>
                  <Badge variant="outline" className="min-h-[24px] px-3">
                    {totalEvents - eventsInZone}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-blue-900">Conseils d'utilisation</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Zone plus petite = résultats plus précis</li>
              <li>• Zone plus grande = plus d'options</li>
              <li>• Ajustez selon votre moyen de transport</li>
              <li>• La zone s'applique à la carte et à la liste</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
