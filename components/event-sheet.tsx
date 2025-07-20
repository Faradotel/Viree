"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { MapPin, Clock, Euro, Users, Heart, Share2, Navigation, Calendar, Star, X } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface EventSheetProps {
  event: any
  onClose: () => void
}

export function EventSheet({ event, onClose }: EventSheetProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAttending, setIsAttending] = useState(false)

  if (!event) return null

  const handleClose = () => {
    hapticFeedback.sheetClose()
    onClose()
  }

  const handleFavorite = () => {
    hapticFeedback.selection()
    setIsFavorited(!isFavorited)
  }

  const handleAttend = () => {
    hapticFeedback.tap()
    setIsAttending(!isAttending)
  }

  const handleShare = () => {
    hapticFeedback.tap()
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleGetDirections = () => {
    hapticFeedback.tap()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`
    window.open(url, "_blank")
  }

  const handleGetTickets = () => {
    hapticFeedback.press()
    console.log("Getting tickets for:", event.name)
  }

  return (
    <Sheet open={!!event} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-6" /> {/* Spacer */}
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Header */}
          <div className="relative h-48 -mx-6 mb-6">
            <img
              src={event.image || "/placeholder.svg?height=300&width=600"}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">{event.type}</Badge>
                {event.isNow && <Badge className="bg-red-500 text-white animate-pulse">En cours</Badge>}
              </div>
              <SheetTitle className="text-white text-2xl font-bold leading-tight">{event.name}</SheetTitle>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Horaires</div>
                  <div className="font-medium">{event.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Euro className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Prix</div>
                  <div className="font-medium">{event.price}</div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Localisation</h3>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{event.location}</div>
                  {event.distance && <div className="text-sm text-gray-500">À {event.distance}km de vous</div>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetDirections}
                  className="flex items-center gap-1 bg-transparent"
                >
                  <Navigation className="w-4 h-4" />
                  Itinéraire
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Participants</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {event.attendees} personnes
                </div>
              </div>
            </div>

            {/* Reviews/Rating */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Avis</h3>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="font-medium">4.2</span>
                <span className="text-sm text-gray-500">(127 avis)</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">💡 Bon à savoir</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Arrivez 15 minutes avant le début</li>
                <li>• Paiement par carte accepté</li>
                <li>• Accessible aux personnes à mobilité réduite</li>
                <li>• Vestiaire disponible</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleFavorite}
              className={`flex-1 ${isFavorited ? "bg-red-50 border-red-200 text-red-600" : ""}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Retiré" : "Sauvegarder"}
            </Button>

            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleGetTickets}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {event.price === "Gratuit" ? "Réserver" : "Billets"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
