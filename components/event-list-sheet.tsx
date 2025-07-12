"use client"

import { useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, Euro, Users, Navigation } from "lucide-react"
import { calculateDistance } from "@/utils/distance"
import { hapticFeedback } from "@/utils/haptics"

interface EventListSheetProps {
  open: boolean
  onClose: () => void
  events: any[]
  userLocation: { lat: number; lng: number } | null
  onEventSelect: (event: any) => void
}

const categoryColors: Record<string, string> = {
  music: "#8b5cf6",
  social: "#3b82f6",
  art: "#ec4899",
  coffee: "#f59e0b",
}

const categoryIcons: Record<string, string> = {
  music: "🎵",
  social: "🍻",
  art: "🎨",
  coffee: "☕",
}

export function EventListSheet({ open, onClose, events, userLocation, onEventSelect }: EventListSheetProps) {
  // Sort events by distance from user location
  const sortedEvents = useMemo(() => {
    if (!userLocation) return events

    return [...events].sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
      return distanceA - distanceB
    })
  }, [events, userLocation])

  const handleEventClick = (event: any) => {
    hapticFeedback.tap()
    onEventSelect(event)
    onClose()
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold text-center">Événements à proximité</SheetTitle>
          <p className="text-center text-gray-600">
            {sortedEvents.length} événement{sortedEvents.length !== 1 ? "s" : ""} trouvé
            {sortedEvents.length !== 1 ? "s" : ""}
          </p>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {sortedEvents.map((event) => {
            const distance = userLocation
              ? calculateDistance(userLocation.lat, userLocation.lng, event.lat, event.lng)
              : null

            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  {/* Event Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">{event.name}</h3>
                      <Badge
                        variant="secondary"
                        className="flex-shrink-0"
                        style={{
                          backgroundColor: `${categoryColors[event.category]}15`,
                          color: categoryColors[event.category],
                          borderColor: categoryColors[event.category],
                        }}
                      >
                        <span className="mr-1">{categoryIcons[event.category]}</span>
                        {event.type}
                      </Badge>
                    </div>

                    {/* Location and Distance */}
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                      {distance && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1 text-purple-600 font-medium">
                            <Navigation className="w-3 h-3" />
                            {formatDistance(distance)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Time and Price */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.price && (
                        <div className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          <span className={event.isFree ? "text-green-600 font-medium" : ""}>{event.price}</span>
                        </div>
                      )}
                    </div>

                    {/* Attendees and Friends */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {event.attendees} participant{event.attendees !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Friends Avatars */}
                      {event.friends && event.friends.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {event.friends.slice(0, 3).map((friend: string, index: number) => (
                              <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                <AvatarImage src={`/placeholder-user.jpg`} />
                                <AvatarFallback className="text-xs">{friend.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {event.friends.length > 3 && (
                            <span className="text-xs text-gray-500 ml-1">+{event.friends.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description Preview */}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {sortedEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos filtres ou d'élargir votre zone de recherche</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
