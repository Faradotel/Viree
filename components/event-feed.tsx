"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Clock, Users, Heart, Filter, SlidersHorizontal } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

// Mock events data
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
    distance: 0.8,
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
    distance: 1.2,
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
    distance: 0.5,
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
    distance: 1.8,
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
    distance: 3.2,
  },
]

interface EventFeedProps {
  onEventSelect: (event: any) => void
  userLocation?: { lat: number; lng: number } | null
  searchRadius?: number
  selectedFilters?: string[]
  onFiltersChange?: (filters: string[]) => void
}

export function EventFeed({
  onEventSelect,
  userLocation,
  searchRadius = 5,
  selectedFilters = [],
  onFiltersChange,
}: EventFeedProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"distance" | "time" | "popularity">("distance")
  const [showFilters, setShowFilters] = useState(false)

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = mockEvents

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query),
      )
    }

    // Filter by selected categories
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((event) => {
        const eventType = event.type.toLowerCase()
        return selectedFilters.some((filter) => {
          if (filter === "music") return eventType.includes("musique")
          if (filter === "bar") return eventType.includes("bar")
          if (filter === "art") return eventType.includes("art")
          if (filter === "cafe") return eventType.includes("café")
          if (filter === "free") return event.price === "Gratuit"
          return false
        })
      })
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return (a.distance || 0) - (b.distance || 0)
        case "time":
          return a.isNow ? -1 : b.isNow ? 1 : 0
        case "popularity":
          return b.attendees - a.attendees
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedFilters, sortBy])

  const handleEventClick = (event: any) => {
    hapticFeedback.tap()
    onEventSelect(event)
  }

  const handleFavorite = (event: any, e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback.selection()
    console.log("Favorited:", event.name)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {selectedFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedFilters.length}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white"
            >
              <option value="distance">Distance</option>
              <option value="time">Heure</option>
              <option value="popularity">Popularité</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredAndSortedEvents.length} événement{filteredAndSortedEvents.length > 1 ? "s" : ""} trouvé
          {filteredAndSortedEvents.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {filteredAndSortedEvents.map((event) => (
          <Card
            key={event.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white"
            onClick={() => handleEventClick(event)}
          >
            <CardContent className="p-0">
              <div className="flex">
                {/* Event Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover rounded-l-lg"
                  />
                  {event.isNow && (
                    <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs animate-pulse">Live</Badge>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{event.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                          {event.distance && <span>• {event.distance}km</span>}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleFavorite(event, e)}
                      className="p-1 h-auto hover:bg-red-50"
                    >
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{event.attendees}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          event.price === "Gratuit" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {event.price}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres ou votre recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
