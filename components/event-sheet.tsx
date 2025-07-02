"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MapPin, Clock, Euro, Users, ExternalLink, Heart, Share2, X } from "lucide-react"

interface EventSheetProps {
  event: any
  onClose: () => void
}

export function EventSheet({ event, onClose }: EventSheetProps) {
  if (!event) return null

  return (
    <Sheet open={!!event} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl z-[9999] bg-white overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold text-gray-900 mb-2">{event.name}</SheetTitle>
              <Badge variant="outline" className="mb-4 hover:bg-gray-50 transition-colors duration-200">
                {event.type}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          {/* Event Image */}
          <div className="relative rounded-lg overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-600 delay-100">
            <img
              src={event.image || "/placeholder.svg?height=200&width=400"}
              alt={event.name}
              className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            />
            {event.isNow && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse shadow-lg">
                En cours
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-600 delay-200">
            <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors duration-200">
              <MapPin className="w-5 h-5 text-purple-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors duration-200">
              <Clock className="w-5 h-5 text-purple-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors duration-200">
              <Euro className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">{event.price}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors duration-200">
              <Users className="w-5 h-5 text-purple-500" />
              <span>{event.attendees} participants</span>
            </div>
          </div>

          {/* Description */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-600 delay-300">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Friends Going */}
          {event.friends && event.friends.length > 0 && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-600 delay-400">
              <h3 className="font-semibold text-gray-900 mb-2">Tes amis y vont</h3>
              <div className="flex gap-2 flex-wrap">
                {event.friends.map((friend: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-purple-50 rounded-full px-3 py-1 hover:bg-purple-100 transition-all duration-200 cursor-pointer hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {friend[0]}
                    </div>
                    <span className="text-sm text-purple-700">{friend}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-600 delay-500">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Acheter sur Eventbrite
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <Heart className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
