"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Coffee, Palette, Users, MapPin, Clock, Euro, Filter } from "lucide-react"
import { FilterSheet } from "@/components/filter-sheet"
import { isWithinRadius } from "@/utils/distance"

const events = [
  {
    id: 1,
    name: "Apéro DJ Canal",
    location: "Canal Saint-Martin",
    time: "18h30",
    price: "Gratuit",
    category: "music",
    type: "Concert",
    description: "DJ set au bord du canal avec vue sur les péniches",
    attendees: 45,
    friends: ["Paul", "Marie"],
    image: "/placeholder.svg?height=200&width=300",
    isNow: true,
    lat: 48.864716,
    lng: 2.369465,
  },
  {
    id: 2,
    name: "Expo Street Art",
    location: "Galerie Perrotin",
    time: "19h00",
    price: "12€",
    category: "art",
    type: "Exposition",
    description: "Nouvelle exposition d'artistes urbains émergents",
    attendees: 23,
    friends: ["Sophie"],
    image: "/placeholder.svg?height=200&width=300",
    isNow: false,
    lat: 48.856614,
    lng: 2.360352,
  },
  {
    id: 3,
    name: "Quiz Night",
    location: "The Frog & Rosbif",
    time: "20h00",
    price: "5€",
    category: "social",
    type: "Bar",
    description: "Soirée quiz en anglais avec prix à gagner",
    attendees: 67,
    friends: [],
    image: "/placeholder.svg?height=200&width=300",
    isNow: false,
    lat: 48.869875,
    lng: 2.342097,
  },
  {
    id: 4,
    name: "Coffee Cupping",
    location: "Lomi Coffee",
    time: "17h00",
    price: "8€",
    category: "coffee",
    type: "Dégustation",
    description: "Dégustation de cafés de spécialité avec barista",
    attendees: 12,
    friends: ["Alex", "Tom"],
    image: "/placeholder.svg?height=200&width=300",
    isNow: true,
    lat: 48.886745,
    lng: 2.344286,
  },
]

const categoryIcons = {
  music: Music,
  art: Palette,
  social: Users,
  coffee: Coffee,
}

const categoryColors = {
  music: "from-purple-500 to-pink-500",
  art: "from-orange-500 to-red-500",
  social: "from-blue-500 to-cyan-500",
  coffee: "from-amber-500 to-orange-500",
}

interface EventFeedProps {
  onEventSelect: (event: any) => void
  userLocation: { lat: number; lng: number } | null
  searchRadius: number
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
}

export function EventFeed({
  onEventSelect,
  userLocation,
  searchRadius,
  selectedFilters,
  onFiltersChange,
}: EventFeedProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"now" | "popular" | "nearby">("now")

  // Filter events by category
  const categoryFilteredEvents =
    selectedFilters.length > 0 ? events.filter((event) => selectedFilters.includes(event.category)) : events

  // Filter events by location radius (same as map)
  const locationFilteredEvents = useMemo(() => {
    if (!userLocation) {
      return categoryFilteredEvents
    }

    return categoryFilteredEvents.filter((event) =>
      isWithinRadius(userLocation.lat, userLocation.lng, event.lat, event.lng, searchRadius),
    )
  }, [categoryFilteredEvents, userLocation, searchRadius])

  const sortedEvents = [...locationFilteredEvents].sort((a, b) => {
    if (sortBy === "now") return b.isNow ? 1 : -1
    if (sortBy === "popular") return b.attendees - a.attendees
    if (sortBy === "nearby" && userLocation) {
      const distanceA = isWithinRadius(userLocation.lat, userLocation.lng, a.lat, a.lng, searchRadius) ? 0 : 1
      const distanceB = isWithinRadius(userLocation.lat, userLocation.lng, b.lat, b.lng, searchRadius) ? 0 : 1
      return distanceA - distanceB
    }
    return 0
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Événements</h2>
          <Button onClick={() => setShowFilters(true)} variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === "now" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("now")}
            className={sortBy === "now" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
          >
            Maintenant
          </Button>
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
            className={sortBy === "popular" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
          >
            Populaires
          </Button>
          <Button
            variant={sortBy === "nearby" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("nearby")}
            className={sortBy === "nearby" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
          >
            Près de moi
          </Button>
        </div>

        {/* Location Status */}
        {userLocation && (
          <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              <strong>📍 Zone active:</strong> {searchRadius < 1 ? `${searchRadius * 1000}m` : `${searchRadius}km`}
            </p>
            <p className="text-xs text-purple-600">
              {locationFilteredEvents.length} événement{locationFilteredEvents.length !== 1 ? "s" : ""} dans votre zone
              {categoryFilteredEvents.length > locationFilteredEvents.length &&
                ` (${categoryFilteredEvents.length - locationFilteredEvents.length} hors zone)`}
            </p>
          </div>
        )}

        {!userLocation && (
          <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">⚠️ Activez votre géolocalisation pour filtrer par zone</p>
          </div>
        )}

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedFilters.map((filter) => (
              <Badge key={filter} variant="secondary">
                {filter}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedEvents.map((event) => {
          const IconComponent = categoryIcons[event.category as keyof typeof categoryIcons]
          const colorClass = categoryColors[event.category as keyof typeof categoryColors]

          return (
            <Card
              key={event.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              onClick={() => onEventSelect(event)}
            >
              <div className="relative">
                <img src={event.image || "/placeholder.svg"} alt={event.name} className="w-full h-48 object-cover" />
                {event.isNow && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse">
                    En cours
                  </Badge>
                )}
                <div
                  className={`absolute top-2 right-2 w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{event.name}</h3>
                  <Badge variant="outline">{event.type}</Badge>
                </div>

                <p className="text-gray-600 text-sm mb-3">{event.description}</p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Euro className="w-4 h-4" />
                    {event.price}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{event.attendees} participants</span>
                    {event.friends.length > 0 && (
                      <span className="text-sm text-purple-600 font-medium">• {event.friends.join(", ")} y vont</span>
                    )}
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Voir +
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFilters={selectedFilters}
        onFiltersChange={onFiltersChange}
      />
    </div>
  )
}
