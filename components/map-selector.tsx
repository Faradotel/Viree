"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import { FilterSheet } from "@/components/filter-sheet"
import { MapboxMap } from "@/components/mapbox-map"
import { LeafletMap } from "@/components/leaflet-map"
import { MapFallback } from "@/components/map-fallback"

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
    lat: 48.8708,
    lng: 2.3628,
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
    lat: 48.8606,
    lng: 2.3522,
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
    lat: 48.8566,
    lng: 2.3522,
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
    lat: 48.8584,
    lng: 2.3761,
  },
]

const friends = [
  { name: "Paul", avatar: "P", lat: 48.8708, lng: 2.3628, activity: "Apéro DJ Canal" },
  { name: "Marie", avatar: "M", lat: 48.8708, lng: 2.3628, activity: "Apéro DJ Canal" },
  { name: "Sophie", avatar: "S", lat: 48.8606, lng: 2.3522, activity: "Expo Street Art" },
  { name: "Alex", avatar: "A", lat: 48.8584, lng: 2.3761, activity: "Coffee Cupping" },
  { name: "Tom", avatar: "T", lat: 48.8584, lng: 2.3761, activity: "Coffee Cupping" },
]

interface MapSelectorProps {
  onEventSelect: (event: any) => void
}

export function MapSelector({ onEventSelect }: MapSelectorProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [mapProvider, setMapProvider] = useState<"mapbox" | "leaflet" | "fallback">("mapbox")

  const filteredEvents =
    selectedFilters.length > 0 ? events.filter((event) => selectedFilters.includes(event.category)) : events

  const renderMap = () => {
    switch (mapProvider) {
      case "mapbox":
        return <MapboxMap events={filteredEvents} friends={friends} onEventSelect={onEventSelect} />
      case "leaflet":
        return <LeafletMap events={filteredEvents} friends={friends} onEventSelect={onEventSelect} />
      case "fallback":
        return <MapFallback events={filteredEvents} onEventSelect={onEventSelect} />
      default:
        return <MapboxMap events={filteredEvents} friends={friends} onEventSelect={onEventSelect} />
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Provider Selector */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant={mapProvider === "mapbox" ? "default" : "outline"}
          size="sm"
          onClick={() => setMapProvider("mapbox")}
          className={`text-xs ${mapProvider === "mapbox" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/90 backdrop-blur-sm"}`}
        >
          Mapbox
        </Button>
        <Button
          variant={mapProvider === "leaflet" ? "default" : "outline"}
          size="sm"
          onClick={() => setMapProvider("leaflet")}
          className={`text-xs ${mapProvider === "leaflet" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/90 backdrop-blur-sm"}`}
        >
          OpenStreetMap
        </Button>
        <Button
          variant={mapProvider === "fallback" ? "default" : "outline"}
          size="sm"
          onClick={() => setMapProvider("fallback")}
          className={`text-xs ${mapProvider === "fallback" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/90 backdrop-blur-sm"}`}
        >
          Demo
        </Button>
      </div>

      {/* Filter Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => setShowFilters(true)}
          className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg"
          size="sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="absolute top-16 right-4 z-10 flex flex-wrap gap-2 max-w-48">
          {selectedFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {filter}
            </Badge>
          ))}
        </div>
      )}

      {/* Map */}
      {renderMap()}

      {/* Filter Sheet */}
      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
      />
    </div>
  )
}
