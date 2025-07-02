"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MapPin, Settings, X } from "lucide-react"

interface LocationZoneControlProps {
  userLocation: { lat: number; lng: number } | null
  searchRadius: number
  onRadiusChange: (radius: number) => void
  eventsInZone: number
  totalEvents: number
}

export function LocationZoneControl({
  userLocation,
  searchRadius,
  onRadiusChange,
  eventsInZone,
  totalEvents,
}: LocationZoneControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const radiusOptions = [
    { value: 0.5, label: "500m" },
    { value: 1, label: "1km" },
    { value: 2, label: "2km" },
    { value: 5, label: "5km" },
    { value: 10, label: "10km" },
    { value: 25, label: "25km" },
  ]

  const getRadiusLabel = (radius: number) => {
    if (radius < 1) return `${radius * 1000}m`
    return `${radius}km`
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg relative"
          size="sm"
          disabled={!userLocation}
        >
          <Settings className="w-4 h-4 mr-2" />
          Zone: {getRadiusLabel(searchRadius)}
          {userLocation && (
            <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
              {eventsInZone}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              Zone de recherche
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Current Status */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Zone actuelle</h3>
              <Badge variant="default" className="bg-purple-500">
                {getRadiusLabel(searchRadius)}
              </Badge>
            </div>
            {userLocation ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">📍 Centré sur votre position actuelle</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Événements dans la zone:</span>
                  <span className="font-semibold text-purple-600">
                    {eventsInZone} sur {totalEvents}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-600">
                ⚠️ Activez votre géolocalisation pour utiliser cette fonctionnalité
              </p>
            )}
          </div>

          {/* Radius Slider */}
          {userLocation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Rayon de recherche</h3>
                <span className="text-lg font-bold text-purple-600">{getRadiusLabel(searchRadius)}</span>
              </div>

              <div className="px-2">
                <Slider
                  value={[searchRadius]}
                  onValueChange={(value) => onRadiusChange(value[0])}
                  max={25}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>500m</span>
                  <span>25km</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Options */}
          {userLocation && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Options rapides</h3>
              <div className="grid grid-cols-3 gap-2">
                {radiusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={searchRadius === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onRadiusChange(option.value)}
                    className={
                      searchRadius === option.value ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-transparent"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Zone Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ À propos des zones</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Seuls les événements dans votre zone sont affichés</li>
              <li>• La zone se déplace avec votre position</li>
              <li>• Réduisez le rayon pour des résultats plus précis</li>
              <li>• Augmentez le rayon pour découvrir plus d'événements</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onRadiusChange(2)}
              className="flex-1 bg-transparent"
              disabled={!userLocation}
            >
              Réinitialiser (2km)
            </Button>
            <Button onClick={() => setIsOpen(false)} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              Appliquer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
