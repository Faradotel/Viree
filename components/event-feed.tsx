"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FilterSheet } from "@/components/filter-sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MapPin, Users, Heart, Share2, SlidersHorizontal } from "lucide-react"
import { isWithinRadius } from "@/utils/distance"
import { hapticFeedback } from "@/utils/haptics"

const events = [
  {
    id: 1,
    name: "Apéro DJ Canal",
    type: "Bars & Social",
    category: "social",
    location: "Canal Saint-Martin",
    time: "18h30 - 22h00",
    price: "Gratuit",
    attendees: 45,
    isNow: true,
    lat: 48.8708,
    lng: 2.3659,
    image: "/placeholder.svg?height=200&width=400",
    description:
      "Venez profiter d'un apéro décontracté au bord du canal avec de la musique électronique et une ambiance conviviale.",
    friends: ["Marie", "Paul"],
  },
  {
    id: 2,
    name: "Expo Street Art",
    type: "Art & Expositions",
    category: "art",
    location: "Belleville",
    time: "14h00 - 20h00",
    price: "8€",
    attendees: 23,
    isNow: false,
    lat: 48.8722,
    lng: 2.3767,
    image: "/placeholder.svg?height=200&width=400",
    description:
      "Découvrez les œuvres des artistes locaux dans cette exposition temporaire dédiée au street art parisien.",
    friends: ["Sophie"],
  },
  {
    id: 3,
    name: "Coffee Cupping",
    type: "Café & Dégustation",
    category: "coffee",
    location: "Le Marais",
    time: "10h00 - 12h00",
    price: "15€",
    attendees: 12,
    isNow: false,
    lat: 48.8566,
    lng: 2.3522,
    image: "/placeholder.svg?height=200&width=400",
    description:
      "Séance de dégustation de cafés d'exception avec un barista professionnel. Apprenez à distinguer les arômes.",
    friends: [],
  },
  {
    id: 4,
    name: "Concert Jazz",
    type: "Concerts & Musique",
    category: "music",
    location: "Saint-Germain",
    time: "21h00 - 23h30",
    price: "25€",
    attendees: 67,
    isNow: false,
    lat: 48.8534,
    lng: 2.3488,
    image: "/placeholder.svg?height=200&width=400",
    description: "Soirée jazz intimiste dans un club historique avec des musiciens renommés de la scène parisienne.",
    friends: ["Tom", "Alice"],
  },
  {
    id: 5,
    name: "Quiz Night",
    type: "Bars & Social",
    category: "social",
    location: "République",
    time: "19h00 - 22h00",
    price: "5€",
    attendees: 34,
    isNow: false,
    lat: 48.8676,
    lng: 2.3639,
    image: "/placeholder.svg?height=200&width=400",
    description:
      "Soirée quiz entre amis dans une ambiance décontractée. Formez votre équipe et tentez de remporter le prix !",
    friends: ["Marie"],
  },
]

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
  const [sortBy, setSortBy] = useState<"time" | "distance" | "popular">("time")
  const [showFilters, setShowFilters] = useState(false)

  // Filter events by category
  const categoryFilteredEvents = useMemo(() => {
    return selectedFilters.length > 0 ? events.filter((event) => selectedFilters.includes(event.category)) : events
  }, [selectedFilters])

  // Filter events by location radius
  const locationFilteredEvents = useMemo(() => {
    if (!userLocation) {
      return categoryFilteredEvents
    }

    return categoryFilteredEvents.filter((event) =>
      isWithinRadius(userLocation.lat, userLocation.lng, event.lat, event.lng, searchRadius),
    )
  }, [categoryFilteredEvents, userLocation, searchRadius])

  // Sort events
  const sortedEvents = useMemo(() => {
    const eventsWithDistance = locationFilteredEvents.map((event) => ({
      ...event,
      distance: userLocation
        ? (isWithinRadius(userLocation.lat, userLocation.lng, event.lat, event.lng, searchRadius, true) as number)
        : 0,
    }))

    switch (sortBy) {
      case "distance":
        return eventsWithDistance.sort((a, b) => a.distance - b.distance)
      case "popular":
        return eventsWithDistance.sort((a, b) => b.attendees - a.attendees)
      case "time":
      default:
        return eventsWithDistance.sort((a, b) => {
          if (a.isNow && !b.isNow) return -1
          if (!a.isNow && b.isNow) return 1
          return 0
        })
    }
  }, [locationFilteredEvents, sortBy, userLocation, searchRadius])

  const handleEventClick = (event: any) => {
    hapticFeedback.press()
    onEventSelect(event)
  }

  const handleSortChange = (newSort: "time" | "distance" | "popular") => {
    hapticFeedback.selection()
    setSortBy(newSort)
  }

  const handleFiltersOpen = () => {
    hapticFeedback.tap()
    setShowFilters(true)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={sortBy === "time" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSortChange("time")}
              className={`${
                sortBy === "time" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
              } transition-all duration-200`}
              haptic="selection"
            >
              Maintenant
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSortChange("popular")}
              className={`${
                sortBy === "popular" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
              } transition-all duration-200`}
              haptic="selection"
            >
              Populaires
            </Button>
            {userLocation && (
              <Button
                variant={sortBy === "distance" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortChange("distance")}
                className={`${
                  sortBy === "distance" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
                } transition-all duration-200`}
                haptic="selection"
              >
                Près de moi
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFiltersOpen}
            className="bg-white hover:bg-purple-50 hover:border-purple-200 transition-colors duration-200"
            haptic="tap"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
            {selectedFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                {selectedFilters.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Zone Status */}
        {userLocation && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                Zone: {searchRadius < 1 ? `${searchRadius * 1000}m` : `${searchRadius}km`} • {sortedEvents.length}{" "}
                événement{sortedEvents.length !== 1 ? "s" : ""}
              </span>
            </div>
            {selectedFilters.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Filtré par {selectedFilters.length} catégorie{selectedFilters.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600 mb-4">
              {!userLocation
                ? "Activez votre géolocalisation pour voir les événements près de vous"
                : selectedFilters.length > 0
                  ? "Essayez de modifier vos filtres ou d'agrandir votre zone de recherche"
                  : "Aucun événement dans votre zone actuellement"}
            </p>
            {selectedFilters.length > 0 && (
              <Button variant="outline" onClick={() => onFiltersChange([])} haptic="tap">
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          sortedEvents.map((event, index) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-white border border-gray-200"
              onClick={() => handleEventClick(event)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {event.isNow && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white animate-pulse">En cours</Badge>
                  )}
                  <Badge className="absolute top-3 right-3 bg-white/90 text-gray-700">{event.type}</Badge>
                  {userLocation && (
                    <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
                      {event.distance.toFixed(1)}km
                    </Badge>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{event.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-purple-600">{event.price}</span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {event.friends.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {event.friends.slice(0, 3).map((friend, i) => (
                              <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {friend[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">
                            {event.friends.length} ami{event.friends.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            hapticFeedback.tap()
                          }}
                          haptic="tap"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            hapticFeedback.tap()
                          }}
                          haptic="tap"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
