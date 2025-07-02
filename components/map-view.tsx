"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, MapPin, Share2 } from "lucide-react"
import { FilterSheet } from "@/components/filter-sheet"
import { LocationSharingSheet } from "@/components/location-sharing-sheet"
import { LocationZoneControl } from "@/components/location-zone-control"
import { NotificationManager } from "@/components/notification-manager"
import { LeafletMap } from "@/components/leaflet-map"
import { isWithinRadius } from "@/utils/distance"

const events = [
  {
    id: 1,
    name: "Apéro DJ Canal",
    location: "Canal Saint-Martin",
    time: "18h30",
    price: "Gratuit",
    category: "music",
    type: "Concert",
    description: "DJ set au bord du canal avec vue sur les péniches",
    attendees: 45,
    friends: ["Paul", "Marie"],
    lat: 48.8708,
    lng: 2.3628,
  },
  {
    id: 2,
    name: "Expo Street Art",
    location: "Galerie Perrotin",
    time: "19h00",
    price: "12€",
    category: "art",
    type: "Exposition",
    description: "Nouvelle exposition d'artistes urbains émergents",
    attendees: 23,
    friends: ["Sophie"],
    lat: 48.8606,
    lng: 2.3522,
  },
  {
    id: 3,
    name: "Quiz Night",
    location: "The Frog & Rosbif",
    time: "20h00",
    price: "5€",
    category: "social",
    type: "Bar",
    description: "Soirée quiz en anglais avec prix à gagner",
    attendees: 67,
    friends: [],
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: 4,
    name: "Coffee Cupping",
    location: "Lomi Coffee",
    time: "17h00",
    price: "8€",
    category: "coffee",
    type: "Dégustation",
    description: "Dégustation de cafés de spécialité avec barista",
    attendees: 12,
    friends: ["Alex", "Tom"],
    lat: 48.8584,
    lng: 2.3761,
  },
  {
    id: 5,
    name: "Rooftop Party",
    location: "Montmartre",
    time: "21h00",
    price: "15€",
    category: "social",
    type: "Soirée",
    description: "Soirée sur un rooftop avec vue sur Paris",
    attendees: 89,
    friends: [],
    lat: 48.8867,
    lng: 2.3431,
  },
  {
    id: 6,
    name: "Jazz Session",
    location: "Le Procope",
    time: "20h30",
    price: "8€",
    category: "music",
    type: "Concert",
    description: "Session jazz dans un cadre historique",
    attendees: 34,
    friends: ["Marie"],
    lat: 48.8534,
    lng: 2.3387,
  },
]

interface MapViewProps {
  onEventSelect: (event: any) => void
}

export function MapView({ onEventSelect }: MapViewProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showLocationSharing, setShowLocationSharing] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [friendsWithLocation, setFriendsWithLocation] = useState<any[]>([])
  const [searchRadius, setSearchRadius] = useState<number>(2) // Default 2km radius

  // Memoize the location change handler to prevent re-renders
  const handleLocationChange = useCallback(
    (locating: boolean, error: string | null, location?: { lat: number; lng: number }) => {
      setIsLocating(locating)
      setLocationError(error)
      if (location) {
        setUserLocation(location)
      }
    },
    [],
  )

  // Memoize the friends location update handler to prevent infinite re-renders
  const handleFriendsLocationUpdate = useCallback((friends: any[]) => {
    setFriendsWithLocation(friends)
  }, [])

  // Handle new event alerts from notification manager
  const handleNewEventAlert = useCallback((event: any) => {
    // You could add additional logic here, like highlighting the new event
    console.log("New event alert:", event.name)
  }, [])

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

  // Filter friends by location radius
  const locationFilteredFriends = useMemo(() => {
    if (!userLocation) {
      return friendsWithLocation
    }

    return friendsWithLocation.filter((friend) =>
      isWithinRadius(userLocation.lat, userLocation.lng, friend.lat, friend.lng, searchRadius),
    )
  }, [friendsWithLocation, userLocation, searchRadius])

  const activeFriendsCount = locationFilteredFriends.length
  const eventsInZone = locationFilteredEvents.length
  const totalEvents = categoryFilteredEvents.length

  // Broadcast location updates to parent components
  useEffect(() => {
    if (userLocation && searchRadius) {
      const event = new CustomEvent("locationUpdate", {
        detail: { location: userLocation, radius: searchRadius },
      })
      window.dispatchEvent(event)
    }
  }, [userLocation, searchRadius])

  return (
    <div className="relative w-full h-full">
      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={() => {
            // Trigger geolocation in the map component
            const event = new CustomEvent("requestLocation")
            window.dispatchEvent(event)
          }}
          className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg"
          size="sm"
          disabled={isLocating}
        >
          <MapPin className={`w-4 h-4 mr-2 ${isLocating ? "animate-pulse" : ""}`} />
          {isLocating ? "Localisation..." : "Ma position"}
        </Button>

        <LocationZoneControl
          userLocation={userLocation}
          searchRadius={searchRadius}
          onRadiusChange={setSearchRadius}
          eventsInZone={eventsInZone}
          totalEvents={totalEvents}
        />

        <NotificationManager
          userLocation={userLocation}
          searchRadius={searchRadius}
          allEvents={events}
          onNewEventAlert={handleNewEventAlert}
        />

        <Button
          onClick={() => setShowLocationSharing(true)}
          className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg relative"
          size="sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Partager
          {activeFriendsCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
              {activeFriendsCount}
            </Badge>
          )}
        </Button>

        <Button
          onClick={() => setShowFilters(true)}
          className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg"
          size="sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="absolute top-16 right-4 z-10 flex flex-wrap gap-2 max-w-48">
          {selectedFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {filter}
            </Badge>
          ))}
        </div>
      )}

      {/* Status Messages */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        {/* OpenStreetMap Notice */}
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 max-w-sm">
          <p className="text-sm text-green-800">
            <strong>🌍 OpenStreetMap:</strong> Carte libre et gratuite!
          </p>
        </div>

        {/* Location Error */}
        {locationError && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 max-w-sm">
            <p className="text-sm text-red-800">
              <strong>⚠️ Erreur:</strong> {locationError}
            </p>
          </div>
        )}

        {/* Zone Status */}
        {userLocation && (
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 max-w-sm">
            <p className="text-sm text-purple-800">
              <strong>📍 Zone active:</strong> {searchRadius < 1 ? `${searchRadius * 1000}m` : `${searchRadius}km`}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {eventsInZone} événement{eventsInZone !== 1 ? "s" : ""} dans la zone
              {totalEvents > eventsInZone &&
                ` (${totalEvents - eventsInZone} masqué${totalEvents - eventsInZone !== 1 ? "s" : ""})`}
            </p>
          </div>
        )}

        {/* Friends Location Status */}
        {activeFriendsCount > 0 && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 max-w-sm">
            <p className="text-sm text-blue-800">
              <strong>
                👥 {activeFriendsCount} ami{activeFriendsCount > 1 ? "s" : ""}
              </strong>{" "}
              dans la zone
            </p>
          </div>
        )}
      </div>

      {/* Leaflet Map */}
      <LeafletMap
        events={locationFilteredEvents}
        friends={locationFilteredFriends}
        onEventSelect={onEventSelect}
        onLocationChange={handleLocationChange}
        userLocation={userLocation}
        searchRadius={searchRadius}
      />

      {/* Filter Sheet */}
      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
      />

      {/* Location Sharing Sheet */}
      <LocationSharingSheet
        open={showLocationSharing}
        onClose={() => setShowLocationSharing(false)}
        userLocation={userLocation}
        onFriendsLocationUpdate={handleFriendsLocationUpdate}
      />
    </div>
  )
}
