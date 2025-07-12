"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Share2, Plus, List, Search, X, Target } from "lucide-react"
import { FilterSheet } from "@/components/filter-sheet"
import { LocationSharingSheet } from "@/components/location-sharing-sheet"
import { AddEventSheet } from "@/components/add-event-sheet"
import { EventListSheet } from "@/components/event-list-sheet"
import { LeafletMap } from "@/components/leaflet-map"
import { isWithinRadius } from "@/utils/distance"
import { hapticFeedback } from "@/utils/haptics"

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
    isFree: true,
    isNow: true,
    image: "/placeholder.svg?height=200&width=400",
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
    isFree: false,
    isNow: false,
    image: "/placeholder.svg?height=200&width=400",
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
    isFree: false,
    isNow: false,
    image: "/placeholder.svg?height=200&width=400",
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
    isFree: false,
    isNow: true,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    name: "Rooftop Party",
    location: "Montmartre",
    time: "21h00",
    price: "15€",
    category: "social",
    type: "Soirée",
    description: "Soirée sur un rooftop avec vue sur Paris",
    attendees: 89,
    friends: [],
    lat: 48.8867,
    lng: 2.3431,
    isFree: false,
    isNow: false,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 6,
    name: "Jazz Session",
    location: "Le Procope",
    time: "20h30",
    price: "Gratuit",
    category: "music",
    type: "Concert",
    description: "Session jazz dans un cadre historique",
    attendees: 34,
    friends: ["Marie"],
    lat: 48.8534,
    lng: 2.3387,
    isFree: true,
    isNow: false,
    image: "/placeholder.svg?height=200&width=400",
  },
]

const categoryFilters = [
  { id: "music", icon: "🎵", label: "Musique", color: "#8b5cf6" },
  { id: "social", icon: "🍻", label: "Bar/Soirée", color: "#3b82f6" },
  { id: "art", icon: "🎨", label: "Art/Expo", color: "#ec4899" },
  { id: "coffee", icon: "☕", label: "Café", color: "#f59e0b" },
]

const timeFilters = [
  { id: "now", label: "Maintenant", value: 0 },
  { id: "tonight", label: "Ce soir", value: 1 },
  { id: "tomorrow", label: "Demain", value: 2 },
]

interface MapViewProps {
  onEventSelect: (event: any) => void
}

export function MapView({ onEventSelect }: MapViewProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<number>(0)
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showLocationSharing, setShowLocationSharing] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showEventList, setShowEventList] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [friendsWithLocation, setFriendsWithLocation] = useState<any[]>([])
  const [searchRadius, setSearchRadius] = useState<number>(2)

  // Memoize the location change handler
  const handleLocationChange = useCallback(
    (locating: boolean, error: string | null, location?: { lat: number; lng: number }) => {
      setIsLocating(locating)
      setLocationError(error)
      if (location) {
        setUserLocation(location)
      }
    },
    [],
  )

  // Filter events based on all criteria
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) => selectedCategories.includes(event.category))
    }

    // Filter by free events
    if (showFreeOnly) {
      filtered = filtered.filter((event) => event.isFree)
    }

    // Filter by time
    if (selectedTime === 0) {
      filtered = filtered.filter((event) => event.isNow)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query),
      )
    }

    // Filter by location radius
    if (userLocation) {
      filtered = filtered.filter((event) =>
        isWithinRadius(userLocation.lat, userLocation.lng, event.lat, event.lng, searchRadius),
      )
    }

    return filtered
  }, [selectedCategories, showFreeOnly, selectedTime, searchQuery, userLocation, searchRadius])

  const handleCategoryToggle = (categoryId: string) => {
    hapticFeedback.selection()
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleRecenterMap = () => {
    hapticFeedback.tap()
    const event = new CustomEvent("requestLocation")
    window.dispatchEvent(event)
  }

  const handleAddEvent = () => {
    hapticFeedback.press()
    setShowAddEvent(true)
  }

  const handleToggleView = () => {
    hapticFeedback.selection()
    setShowEventList(true)
  }

  const handleSearchToggle = () => {
    hapticFeedback.tap()
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery("")
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Leaflet Map - Base Layer */}
      <LeafletMap
        events={filteredEvents}
        friends={friendsWithLocation}
        onEventSelect={onEventSelect}
        onLocationChange={handleLocationChange}
        userLocation={userLocation}
        searchRadius={searchRadius}
        enableClustering={true}
      />

      {/* Search Bar - Top Layer */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg"
              />
            </div>
            <Button
              onClick={handleSearchToggle}
              variant="outline"
              size="icon"
              className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg h-11 w-11"
              haptic="tap"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Category Filters - Top Layer */}
      <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          {categoryFilters.map((category) => (
            <Button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              variant={selectedCategories.includes(category.id) ? "default" : "outline"}
              size="sm"
              className={`h-10 px-3 ${
                selectedCategories.includes(category.id)
                  ? "bg-white text-gray-900 shadow-lg border-2"
                  : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200"
              } transition-all duration-200`}
              style={{
                borderColor: selectedCategories.includes(category.id) ? category.color : undefined,
                backgroundColor: selectedCategories.includes(category.id) ? `${category.color}15` : undefined,
              }}
              haptic="selection"
            >
              <span className="text-lg mr-2">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </Button>
          ))}

          {/* Free Filter */}
          <Button
            onClick={() => {
              hapticFeedback.selection()
              setShowFreeOnly(!showFreeOnly)
            }}
            variant={showFreeOnly ? "default" : "outline"}
            size="sm"
            className={`h-10 px-3 ${
              showFreeOnly
                ? "bg-green-100 text-green-800 border-2 border-green-500 shadow-lg"
                : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200"
            } transition-all duration-200`}
            haptic="selection"
          >
            <span className="text-lg mr-2">🆓</span>
            <span className="hidden sm:inline">Gratuit</span>
          </Button>
        </div>
      </div>

      {/* Time Filter Slider - Top Right Layer */}
      <div className="absolute top-20 right-4 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg pointer-events-auto">
          <div className="text-xs text-gray-600 mb-2 text-center">Moment</div>
          <div className="w-32">
            <Slider
              value={[selectedTime]}
              onValueChange={(value) => {
                hapticFeedback.selection()
                setSelectedTime(value[0])
              }}
              max={2}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Maintenant</span>
              <span>Ce soir</span>
              <span>Demain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls - Right Side Layer */}
      <div className="absolute top-32 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Recenter Button */}
        <Button
          onClick={handleRecenterMap}
          variant="outline"
          size="icon"
          className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg h-11 w-11 pointer-events-auto"
          disabled={isLocating}
          haptic="tap"
        >
          <Target className={`w-5 h-5 ${isLocating ? "animate-pulse" : ""}`} />
        </Button>

        {/* Search Toggle */}
        {!showSearch && (
          <Button
            onClick={handleSearchToggle}
            variant="outline"
            size="icon"
            className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg h-11 w-11 pointer-events-auto"
            haptic="tap"
          >
            <Search className="w-5 h-5" />
          </Button>
        )}

        {/* List View Toggle */}
        <Button
          onClick={handleToggleView}
          variant="outline"
          size="icon"
          className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg h-11 w-11 pointer-events-auto"
          haptic="selection"
        >
          <List className="w-5 h-5" />
        </Button>

        {/* Share Location */}
        <Button
          onClick={() => setShowLocationSharing(true)}
          variant="outline"
          size="icon"
          className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg h-11 w-11 pointer-events-auto"
          haptic="tap"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Add Event Button - Floating Layer */}
      <div className="absolute bottom-24 right-4 z-[1000] pointer-events-none">
        <Button
          onClick={handleAddEvent}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl h-14 w-14 rounded-full pointer-events-auto transform hover:scale-105 transition-all duration-200"
          haptic="press"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Status Messages - Bottom Left Layer */}
      <div className="absolute bottom-24 left-4 z-[1000] space-y-2 pointer-events-none max-w-xs">
        {locationError && (
          <div className="bg-red-100/95 backdrop-blur-sm border border-red-300 rounded-lg p-2 shadow-sm pointer-events-auto">
            <p className="text-xs text-red-800">⚠️ {locationError}</p>
          </div>
        )}

        {userLocation && (
          <div className="bg-purple-100/95 backdrop-blur-sm border border-purple-300 rounded-lg p-2 shadow-sm pointer-events-auto">
            <p className="text-xs text-purple-800">
              📍 {filteredEvents.length} événement{filteredEvents.length !== 1 ? "s" : ""} dans{" "}
              {searchRadius < 1 ? `${searchRadius * 1000}m` : `${searchRadius}km`}
            </p>
          </div>
        )}
      </div>

      {/* Sheets - Top Layer */}
      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFilters={selectedCategories}
        onFiltersChange={setSelectedCategories}
      />

      <LocationSharingSheet
        open={showLocationSharing}
        onClose={() => setShowLocationSharing(false)}
        userLocation={userLocation}
        onFriendsLocationUpdate={(friends) => setFriendsWithLocation(friends)}
      />

      <AddEventSheet open={showAddEvent} onClose={() => setShowAddEvent(false)} userLocation={userLocation} />

      <EventListSheet
        open={showEventList}
        onClose={() => setShowEventList(false)}
        events={filteredEvents}
        userLocation={userLocation}
        onEventSelect={onEventSelect}
      />
    </div>
  )
}
