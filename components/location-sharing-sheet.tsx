"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  X,
  Share2,
  MapPin,
  Users,
  Plus,
  UserCheck,
  UserX,
  Navigation,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface Friend {
  id: string
  name: string
  status: "online" | "offline" | "away"
  lastSeen: string
  lat?: number
  lng?: number
  distance?: number
  isSharing: boolean
}

interface LocationSharingSheetProps {
  open: boolean
  onClose: () => void
  isShared: boolean
  onToggleSharing: (shared: boolean) => void
}

const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Marie",
    status: "online",
    lastSeen: "En ligne",
    lat: 48.8708,
    lng: 2.3628,
    distance: 0.8,
    isSharing: true,
  },
  {
    id: "2",
    name: "Paul",
    status: "online",
    lastSeen: "En ligne",
    lat: 48.8566,
    lng: 2.3522,
    distance: 1.2,
    isSharing: true,
  },
  {
    id: "3",
    name: "Sophie",
    status: "away",
    lastSeen: "Il y a 15 min",
    isSharing: false,
  },
  {
    id: "4",
    name: "Tom",
    status: "offline",
    lastSeen: "Il y a 2h",
    isSharing: false,
  },
  {
    id: "5",
    name: "Alex",
    status: "online",
    lastSeen: "En ligne",
    lat: 48.8584,
    lng: 2.3761,
    distance: 2.1,
    isSharing: true,
  },
]

export function LocationSharingSheet({ open, onClose, isShared, onToggleSharing }: LocationSharingSheetProps) {
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Get user location when sharing is enabled
  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Géolocalisation non supportée")
      return
    }

    setIsLocating(true)
    setLocationError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setUserLocation(location)
      hapticFeedback.success()
    } catch (error) {
      const errorMessage =
        error instanceof GeolocationPositionError ? getGeolocationErrorMessage(error.code) : "Erreur de géolocalisation"

      setLocationError(errorMessage)
      hapticFeedback.impact()
    } finally {
      setIsLocating(false)
    }
  }, [])

  // Helper function for geolocation error messages
  const getGeolocationErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return "Accès à la localisation refusé"
      case 2:
        return "Position indisponible"
      case 3:
        return "Délai d'attente dépassé"
      default:
        return "Erreur de géolocalisation"
    }
  }

  // Handle sharing toggle
  const handleSharingToggle = async (shared: boolean) => {
    hapticFeedback.selection()

    if (shared && !userLocation) {
      await getUserLocation()
    }

    onToggleSharing(shared)
  }

  // Handle friend invitation
  const handleInviteFriend = (friendId: string) => {
    hapticFeedback.tap()
    setFriends((prev) =>
      prev.map((friend) => (friend.id === friendId ? { ...friend, isSharing: !friend.isSharing } : friend)),
    )
  }

  // Handle close
  const handleClose = () => {
    hapticFeedback.sheetClose()
    onClose()
  }

  // Get location when component mounts if sharing is enabled
  useEffect(() => {
    if (open && isShared && !userLocation) {
      getUserLocation()
    }
  }, [open, isShared, userLocation, getUserLocation])

  const onlineFriends = friends.filter((f) => f.status === "online")
  const sharingFriends = friends.filter((f) => f.isSharing && f.lat && f.lng)
  const offlineFriends = friends.filter((f) => f.status !== "online")

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-500" />
              Partage de position
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} haptic="tap">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Location Sharing Toggle */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Ma position</h3>
              </div>
              <Switch checked={isShared} onCheckedChange={handleSharingToggle} disabled={isLocating} />
            </div>

            <div className="space-y-2">
              {isLocating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Localisation en cours...</span>
                </div>
              )}

              {locationError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{locationError}</span>
                </div>
              )}

              {isShared && userLocation && !isLocating && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Position partagée avec vos amis</span>
                </div>
              )}

              {!isShared && (
                <p className="text-sm text-gray-600">Partagez votre position pour voir vos amis sur la carte</p>
              )}
            </div>
          </div>

          {/* Friends Sharing Location */}
          {sharingFriends.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Amis à proximité ({sharingFriends.length})
                </h3>
              </div>

              <div className="space-y-3">
                {sharingFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            {friend.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{friend.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{friend.lastSeen}</span>
                          {friend.distance && (
                            <>
                              <span>•</span>
                              <span>{friend.distance.toFixed(1)}km</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInviteFriend(friend.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      haptic="tap"
                    >
                      <UserCheck className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Online Friends */}
          {onlineFriends.filter((f) => !f.isSharing).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Amis en ligne ({onlineFriends.filter((f) => !f.isSharing).length})
              </h3>

              <div className="space-y-2">
                {onlineFriends
                  .filter((f) => !f.isSharing)
                  .map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {friend.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{friend.name}</p>
                          <p className="text-sm text-gray-600">{friend.lastSeen}</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInviteFriend(friend.id)}
                        className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                        haptic="tap"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Inviter
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Offline Friends */}
          {offlineFriends.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Hors ligne ({offlineFriends.length})
              </h3>

              <div className="space-y-2">
                {offlineFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gray-400 text-white">{friend.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{friend.name}</p>
                        <p className="text-sm text-gray-500">{friend.lastSeen}</p>
                      </div>
                    </div>

                    <UserX className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">🔒 Confidentialité</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Votre position n'est partagée qu'avec vos amis</li>
              <li>• Vous pouvez arrêter le partage à tout moment</li>
              <li>• Les données de localisation ne sont pas stockées</li>
              <li>• Seuls les amis connectés peuvent voir votre position</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
