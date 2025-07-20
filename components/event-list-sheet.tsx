"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Clock, Users, Heart, X, SlidersHorizontal } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface EventListSheetProps {
  open: boolean
  onClose: () => void
  events: any[]
  onEventSelect: (event: any) => void
}

export function EventListSheet({ open, onClose, events, onEventSelect }: EventListSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"distance" | "time" | "popularity">("distance")

  const handleClose = () => {
    hapticFeedback.sheetClose()
    onClose()
  }

  const handleEventClick = (event: any) => {
    hapticFeedback.tap()
    onEventSelect(event)
    onClose()
  }

  const handleFavorite = (event: any, e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback.selection()
    console.log("Favorited:", event.name)
  }

  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      event.name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.type.toLowerCase().includes(query)
    )
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
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

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="flex-row items-center justify-between pb-4 border-b">
            <SheetTitle className="text-xl font-bold">Événements ({events.length})</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          {/* Search and Filters */}
          <div className="py-4 space-y-4 border-b">
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

            {/* Sort Options */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {sortedEvents.length} événement{sortedEvents.length > 1 ? "s" : ""}
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
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-auto py-4 space-y-3">
            {sortedEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] bg-white"
                onClick={() => handleEventClick(event)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Event Image */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={event.image || "/placeholder.svg?height=80&width=80"}
                        alt={event.name}
                        className="w-full h-full object-cover rounded-l-lg"
                      />
                      {event.isNow && (
                        <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs animate-pulse">
                          Live
                        </Badge>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">
                            {event.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                            {event.distance && <span className="flex-shrink-0">• {event.distance}km</span>}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleFavorite(event, e)}
                          className="p-1 h-auto hover:bg-red-50 flex-shrink-0 ml-2"
                        >
                          <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
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
                              event.price === "Gratuit"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
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

            {sortedEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
                <p className="text-gray-600">Essayez de modifier votre recherche</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
