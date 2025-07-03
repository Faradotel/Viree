"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MapPin, Users, X, ExternalLink } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface EventSheetProps {
  event: any
  onClose: () => void
}

export function EventSheet({ event, onClose }: EventSheetProps) {
  if (!event) return null

  const handleClose = () => {
    hapticFeedback.sheetClose()
    onClose()
  }

  const handleSave = () => {
    hapticFeedback.selection()
    console.log("Event saved:", event.name)
  }

  const handleShare = () => {
    hapticFeedback.tap()
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: `${event.description}`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      console.log("Link copied to clipboard")
    }
  }

  const handleGetTickets = () => {
    hapticFeedback.press()
    console.log("Getting tickets for:", event.name)
  }

  const handleAddToCalendar = () => {
    hapticFeedback.tap()
    console.log("Adding to calendar:", event.name)
  }

  return (
    <Sheet open={!!event} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900">Détails de l'événement</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} haptic="tap">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6 overflow-y-auto">
          {/* Event Image */}
          <div className="relative animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-100">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-48 object-cover rounded-lg shadow-sm"
            />
            {event.isNow && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white animate-pulse">
                En cours
              </Badge>
            )}
            <Badge className="absolute top-3 right-3 bg-white/90 text-gray-700">
              {event.type}
            </Badge>
          </div>

          {/* Event Details */}
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h2>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Horaires</p>
                  <p className="text-sm text-gray-600">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Lieu</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Participants</p>
                  <p className="text-sm text-gray-600">{event.attendees} personnes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 text-purple-500 font-bold">€</div>
                <div>
                  <p className="font-medium text-gray-900">Prix</p>
                  <p className="text-sm text-gray-600">{event.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Friends Going */}
          {event.friends && event.friends.length > 0 && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
              <h3 className="font-semibold text-gray-900 mb-3">
                Amis qui y vont ({event.friends.length})
              </h3>
              <div className="flex items-center gap-3">
                {event.friends.map((friend: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 cursor-pointer"
                    onClick={() => hapticFeedback.tap()}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                        {friend[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">{friend}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400">
            <div className="flex gap-3">
              <Button
                onClick={handleGetTickets}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                haptic="press"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {event.price === "Gratuit" ? "Réserver" : "Acheter des billets"}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                \
