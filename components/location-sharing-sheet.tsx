"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, Clock, Share2, Eye, EyeOff } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface Friend {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  location?: {
    lat: number
    lng: number
    address: string
    lastUpdated: Date
  }
  sharingWithMe: boolean
  iCanSeeLocation: boolean
}

const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Paul",
    avatar: "P",
    isOnline: true,
    location: {
      lat: 48.8708,
      lng: 2.3628,
      address: "Canal Saint-Martin, Paris",
      lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    sharingWithMe: true,
    iCanSeeLocation: true,
  },
  {
    id: "2",
    name: "Marie",
    avatar: "M",
    isOnline: true,
    location: {
      lat: 48.8708,
      lng: 2.3628,
      address: "Canal Saint-Martin, Paris",
      lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    sharingWithMe: true,
    iCanSeeLocation: true,
  },
  {
    id: "3",
    name: "Sophie",
    avatar: "S",
    isOnline: true,
    location: {
      lat: 48.8606,
      lng: 2.3522,
      address: "Le Marais, Paris",
      lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    sharingWithMe: true,
    iCanSeeLocation: true,
  },
  {
    id: "4",
    name: "Alex",
    avatar: "A",
    isOnline: false,
    sharingWithMe: false,
    iCanSeeLocation: false,
  },
  {
    id: "5",
    name: "Tom",
    avatar: "T",
    isOnline: true,
    sharingWithMe: false,
    iCanSeeLocation: false,
  },
]

interface LocationSharingSheetProps {
  open: boolean
  onClose: () => void
  isShared: boolean
  onToggleSharing: (shared: boolean) => void
}

export function LocationSharingSheet({ open, onClose, isShared, onToggleSharing }: LocationSharingSheetProps) {
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(isShared)
  const [shareWithAll, setShareWithAll] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to Paris center if geolocation fails
          setUserLocation({ lat: 48.8566, lng: 2.3522 })
        },
      )
    } else {
      // Default to Paris center if geolocation is not supported
      setUserLocation({ lat: 48.8566, lng: 2.3522 })
    }
  }, [])

  const toggleLocationSharing = useCallback(
    (enabled: boolean) => {
      hapticFeedback.selection()
      setIsLocationSharingEnabled(enabled)
      onToggleSharing(enabled)
      if (!enabled) {
        // Stop sharing with all friends
        setFriends((prev) =>
          prev.map((friend) => ({
            ...friend,
            sharingWithMe: false,
          })),
        )
      }
    },
    [onToggleSharing],
  )

  const toggleShareWithFriend = useCallback((friendId: string, share: boolean) => {
    hapticFeedback.selection()
    setFriends((prev) => prev.map((friend) => (friend.id === friendId ? { ...friend, sharingWithMe: share } : friend)))
  }, [])

  const toggleShareWithAll = useCallback(
    (shareAll: boolean) => {
      hapticFeedback.selection()
      setShareWithAll(shareAll)
      if (isLocationSharingEnabled) {
        setFriends((prev) =>
          prev.map((friend) => ({
            ...friend,
            sharingWithMe: shareAll,
          })),
        )
      }
    },
    [isLocationSharingEnabled],
  )

  const getTimeAgo = useCallback((date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}min`
    const hours = Math.floor(minutes / 60)
    return `Il y a ${hours}h`
  }, [])

  const handleClose = () => {
    hapticFeedback.sheetClose()
    onClose()
  }

  const handleConfirm = () => {
    hapticFeedback.success()
    console.log(
      "Location shared with:",
      friends.filter((f) => f.sharingWithMe).map((f) => f.name),
    )
    onClose()
  }

  const onlineFriends = friends.filter((f) => f.isOnline)
  const friendsWithLocation = friends.filter((f) => f.location && f.iCanSeeLocation)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-500" />
              Partage de position
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} haptic="tap">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* User Location Status */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Ma position</h3>
              <Badge variant={userLocation ? "default" : "secondary"} className={userLocation ? "bg-green-500" : ""}>
                {userLocation ? "Activée" : "Désactivée"}
              </Badge>
            </div>
            {userLocation && (
              <p className="text-sm text-gray-600 mb-3">📍 Position détectée et prête à être partagée</p>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="location-sharing" className="text-sm font-medium">
                Partager ma position
              </Label>
              <Switch
                id="location-sharing"
                checked={isLocationSharingEnabled && !!userLocation}
                onCheckedChange={toggleLocationSharing}
                disabled={!userLocation}
              />
            </div>
          </div>

          {/* Quick Share Options */}
          {isLocationSharingEnabled && userLocation && (
            <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-200">
              <h3 className="font-semibold text-gray-900">Options rapides</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="share-all" className="text-sm font-medium">
                  Partager avec tous mes amis en ligne
                </Label>
                <Switch id="share-all" checked={shareWithAll} onCheckedChange={toggleShareWithAll} />
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-300">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Amis ({onlineFriends.length} en ligne)</h3>
              <Badge variant="outline" className="text-xs">
                {friendsWithLocation.length} positions visibles
              </Badge>
            </div>

            <div className="space-y-3">
              {friends.map((friend, index) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 animate-in fade-in-0 slide-in-from-left-2"
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                          {friend.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          friend.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{friend.name}</p>
                      {friend.location && friend.iCanSeeLocation ? (
                        <div className="text-xs text-gray-500">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {friend.location.address}
                          </p>
                          <p className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(friend.location.lastUpdated)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">{friend.isOnline ? "En ligne" : "Hors ligne"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Location visibility indicator */}
                    {friend.location && friend.iCanSeeLocation && <Eye className="w-4 h-4 text-green-500" />}
                    {friend.isOnline && !friend.iCanSeeLocation && <EyeOff className="w-4 h-4 text-gray-400" />}

                    {/* Share toggle */}
                    {friend.isOnline && (
                      <Switch
                        checked={friend.sharingWithMe && isLocationSharingEnabled}
                        onCheckedChange={(checked) => toggleShareWithFriend(friend.id, checked)}
                        disabled={!isLocationSharingEnabled || !userLocation}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500">
            <h4 className="font-medium text-blue-900 mb-2">🔒 Confidentialité</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Votre position n'est partagée qu'avec les amis sélectionnés</li>
              <li>• Vous pouvez arrêter le partage à tout moment</li>
              <li>• Les positions sont mises à jour en temps réel</li>
              <li>• Aucune donnée n'est stockée de façon permanente</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent" haptic="tap">
              Fermer
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              disabled={!isLocationSharingEnabled || !userLocation}
              haptic="success"
            >
              Confirmer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
