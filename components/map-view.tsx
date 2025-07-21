"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddEventSheet } from "@/components/add-event-sheet"
import { EventListSheet } from "@/components/event-list-sheet"
import { Search, Target, List, Plus, Share2, Music, Coffee, Palette, PartyPopper, Gift, Clock } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/leaflet-map").then(mod => ({ default: mod.LeafletMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Chargement de la carte...</p>
      </div>
    </div>
  ),
})

// Mock events data with clustering
const mockEvents = [
  {
    id: "1",
    name: "Apéro DJ Canal",
    location: "Canal Saint-Martin",
    lat: 48.8708,
    lng: 2.3659,
    type: "Musique",
    time: "18h00 - 22h00",
    price: "Gratuit",
    attendees: 45,
    isNow: true,
    description: "DJ set au bord du canal avec vue sur les péniches",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "2",
    name: "Expo Street Art",
    location: "Belleville",
    lat: 48.8722,
    lng: 2.3767,
    type: "Art",
    time: "14h00 - 20h00",
    price: "8€",
    attendees: 23,
    description: "Découverte du street art dans les rues de Belleville",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "3",
    name: "Coffee Cupping",
    location: "Le Marais",
    lat: 48.8566,
    lng: 2.3522,
    type: "Café",
    time: "10h00 - 12h00",
    price: "15€",
    attendees: 12,
    description: "Dégustation de cafés d'exception avec un barista expert",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "4",
    name: "Quiz Night",
    location: "Bastille",
    lat: 48.8532,
    lng: 2.3692,
    type: "Bar",
    time: "20h00 - 23h00",
    price: "Gratuit",
    attendees: 67,
    description: "Soirée quiz dans une ambiance décontractée",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "5",
    name: "Marché aux Puces",
    location: "Saint-Ouen",
    lat: 48.9014,
    lng: 2.3322,
    type: "Shopping",
    time: "09h00 - 18h00",
    price: "Gratuit",
    attendees: 156,
    description: "Chasse aux trésors dans le plus grand marché aux puces du monde",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "6",
    name: "Concert Jazz",
    location: "Montmartre",
    lat: 48.8867,
    lng: 2.3431,
    type: "Musique",
    time: "21h00 - 00h00",
    price: "20€",
    attendees: 89,
    description: "Concert de jazz dans une cave historique de Montmartre",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "7",
    name: "Atelier Céramique",
    location: "République",
    lat: 48.8675,
    lng: 2.3634,
    type: "Art",
    time: "14h00 - 17h00",
    price: "35€",
    attendees: 8,
    description: "Initiation à la céramique dans un atelier d'artiste",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "8",
    name: "Brunch Rooftop",
    location: "Châtelet",
    lat: 48.8583,
    lng: 2.3472,
    type: "Bar",
    time: "11h00 - 15h00",
    price: "28€",
    attendees: 34,
    description: "Brunch avec vue panoramique sur Paris",
    image: "/placeholder.svg?height=200&width=400",
  },
]

const categories = [
  { id: "music", name: "Musique", icon: Music, color: "bg-purple-500", count: 12 },
  { id: "bar", name: "Bar", icon: PartyPopper, color: "bg-pink-500", count: 8 },
  { id: "art", name: "Art", icon: Palette, color: "bg-blue-500", count: 15 },
  { id: "cafe", name: "Café", icon: Coffee, color: "bg-orange-500", count: 6 },
  { id: "free", name: "Gratuit", icon: Gift, color: "bg-green-500", count: 23 },
]

const timeOptions = [
  { id: "now", label: "Maintenant", description: "En cours" },
  { id: "morning", label: "Matin", description: "8h - 12h" },
  { id: "afternoon", label: "Après-midi", description: "12h - 18h" },
  { id: "evening", label: "Soirée", description: "18h - 23h" },
  { id: "night", label: "Nuit", description: "23h - 2h" },
  { id: "tomorrow", label: "Demain", description: "Toute la journée" },
]

interface MapViewProps {
  onEventSelect: (event: any) => void
}

export function MapView({ onEventSelect }: MapViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showTimeFilter, setShowTimeFilter] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("now")
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showEventList, setShowEventList] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error")
      return
    }

    setLocationStatus("loading")
    hapticFeedback.tap()

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationStatus("success")
        hapticFeedback.selection()
      },
      (error) => {
        console.error("Geolocation error:", error)
        setLocationStatus("error")
        hapticFeedback.error()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  // Auto-locate on mount
  useEffect(() => {
    getUserLocation()
  }, [])

  const handleCategoryToggle = (categoryId: string) => {
    hapticFeedback.selection()
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleTimeSlotChange = (timeSlotId: string) => {
    hapticFeedback.selection()
    setSelectedTimeSlot(timeSlotId)
  }

  const handleAddEvent = () => {
    hapticFeedback.tap()
    setShowAddEvent(true)
  }

  const handleShowListToggle = () => {
    hapticFeedback.tap()
    setShowEventList(!showEventList)
  }

  const handleShare = () => {
    hapticFeedback.tap()
    if (navigator.share) {
      navigator.share({
        title: "Virée - Découvrez Paris autrement",
        text: "Découvrez les événements autour de vous avec Virée",
        url: window.location.href,
      })
    }
  }

  const handleSearchToggle = () => {
    hapticFeedback.tap()
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery("")
    }
  }

  const handleTimeFilterToggle = () => {
    hapticFeedback.tap()
    setShowTimeFilter(!showTimeFilter)
  }

  const filteredEvents = useMemo(() => {
    let filtered = mockEvents

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) => {
        const eventCategory = event.type.toLowerCase()
        const matchesCategory = selectedCategories.some((cat) => {
          if (cat === "music") return eventCategory.includes("musique")
          if (cat === "bar") return eventCategory.includes("bar") || eventCategory.includes("soirée")
          if (cat === "art") return eventCategory.includes("art") || eventCategory.includes("expo")
          if (cat === "cafe") return eventCategory.includes("café")
          if (cat === "free") return event.price === "Gratuit"
          return false
        })
        return matchesCategory
      })
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query),
      )
    }

    // Filter by time slot
    if (selectedTimeSlot === "now") {
      filtered = filtered.filter((event) => event.isNow)
    }
    // Add more time filtering logic here based on selectedTimeSlot

    return filtered
  }, [selectedCategories, searchQuery, selectedTimeSlot])

  return (
    <div className="relative h-full w-full">
      {/* Map */}
      <LeafletMap events={filteredEvents} onEventSelect={onEventSelect} userLocation={userLocation} />

      {/* Category Filters */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategories.includes(category.id)
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryToggle(category.id)}
                className={`flex items-center gap-2 whitespace-nowrap bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? `${category.color} text-white hover:opacity-90`
                    : "hover:bg-white border-gray-200 text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
                <Badge variant="secondary" className="bg-white/20 text-current text-xs">
                  {category.count}
                </Badge>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Search Input (when expanded) */}
      {showSearch && (
        <div className="absolute top-20 left-4 right-4 z-[1000]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <Input
              placeholder="Rechercher un événement, lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 bg-white/90 backdrop-blur-sm border-gray-200 focus:border-purple-500 focus:ring-purple-500 shadow-lg"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Time Filter (when expanded) */}
      {showTimeFilter && (
        <div className="absolute top-20 left-4 right-4 z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Quand ?</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {timeOptions.map((option) => {
                const isSelected = selectedTimeSlot === option.id
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSlotChange(option.id)}
                    className={`flex flex-col items-center gap-1 h-auto py-3 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : "hover:bg-gray-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs opacity-75">{option.description}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-3">
        {/* Search Button */}
        <Button
          onClick={handleSearchToggle}
          className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            showSearch || searchQuery
              ? "bg-purple-500 hover:bg-purple-600 text-white"
              : "bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Time Filter Button */}
        <Button
          onClick={handleTimeFilterToggle}
          className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            showTimeFilter || selectedTimeSlot !== "now"
              ? "bg-purple-500 hover:bg-purple-600 text-white"
              : "bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <Clock className="w-5 h-5" />
        </Button>

        {/* Geolocation Button */}
        <Button
          onClick={getUserLocation}
          disabled={locationStatus === "loading"}
          className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            locationStatus === "success"
              ? "bg-green-500 hover:bg-green-600"
              : locationStatus === "error"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white hover:bg-gray-50"
          }`}
        >
          <Target
            className={`w-5 h-5 ${
              locationStatus === "success" || locationStatus === "error" ? "text-white" : "text-gray-700"
            } ${locationStatus === "loading" ? "animate-spin" : ""}`}
          />
        </Button>

        {/* List View Button */}
        <Button
          onClick={handleShowListToggle}
          className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            showEventList ? "bg-purple-500 hover:bg-purple-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <List className="w-5 h-5" />
        </Button>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <Share2 className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Add Event Button */}
      <div className="absolute bottom-24 left-4 z-[1000]">
        <Button
          onClick={handleAddEvent}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Status Messages */}
      {locationStatus === "loading" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-700">Localisation en cours...</span>
            </div>
          </div>
        </div>
      )}

      {locationStatus === "error" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <div className="bg-red-50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full" />
              <span className="text-sm font-medium text-red-700">Impossible de vous localiser</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Counter */}
      {(selectedCategories.length > 0 || searchQuery) && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-[1000]">
          <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-lg">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""} trouvé
            {filteredEvents.length > 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Add Event Sheet */}
      <AddEventSheet open={showAddEvent} onClose={() => setShowAddEvent(false)} />

      {/* Event List Sheet */}
      <EventListSheet
        open={showEventList}
        onClose={() => setShowEventList(false)}
        events={filteredEvents}
        onEventSelect={onEventSelect}
      />
    </div>
  )
}
