"use client"

import { useState, useEffect } from "react"
import { MapView } from "@/components/map-view"
import { EventFeed } from "@/components/event-feed"
import { ProfileSheet } from "@/components/profile-sheet"
import { EventSheet } from "@/components/event-sheet"
import { LocationSharingSheet } from "@/components/location-sharing-sheet"
import { Button } from "@/components/ui/button"
import { Map, List, User, MapPin } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

export default function HomePage() {
  const [activeView, setActiveView] = useState<"map" | "feed">("map")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showLocationSharing, setShowLocationSharing] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchRadius, setSearchRadius] = useState<number>(2)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [isLocationShared, setIsLocationShared] = useState(false)

  useEffect(() => {
    // Listen for location updates from MapView
    const handleLocationUpdate = (event: CustomEvent) => {
      setUserLocation(event.detail.location)
      setSearchRadius(event.detail.radius)
    }

    window.addEventListener("locationUpdate", handleLocationUpdate as EventListener)

    return () => {
      window.removeEventListener("locationUpdate", handleLocationUpdate as EventListener)
    }
  }, [])

  const handleViewChange = (view: "map" | "feed") => {
    hapticFeedback.selection()
    setActiveView(view)
  }

  const handleProfileOpen = () => {
    hapticFeedback.press()
    setShowProfile(true)
  }

  const handleLocationSharingOpen = () => {
    hapticFeedback.tap()
    setShowLocationSharing(true)
  }

  const handleEventSelect = (event: any) => {
    hapticFeedback.press()
    setSelectedEvent(event)
  }

  const handleLocationSharingToggle = (shared: boolean) => {
    hapticFeedback.success()
    setIsLocationShared(shared)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-100 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Virée
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLocationSharingOpen}
            className="relative rounded-full"
            haptic="tap"
          >
            <MapPin className="w-5 h-5" />
            {isLocationShared && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleProfileOpen} className="rounded-full" haptic="press">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-0">
        {activeView === "feed" ? (
          <EventFeed
            onEventSelect={handleEventSelect}
            userLocation={userLocation}
            searchRadius={searchRadius}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />
        ) : (
          <MapView onEventSelect={handleEventSelect} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-t border-purple-100 px-4 py-2 z-10">
        <div className="flex justify-center gap-8">
          <Button
            variant={activeView === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewChange("map")}
            className={`flex items-center gap-2 ${
              activeView === "map" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-600"
            }`}
            haptic="selection"
          >
            <Map className="w-4 h-4" />
            Carte
          </Button>
          <Button
            variant={activeView === "feed" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewChange("feed")}
            className={`flex items-center gap-2 ${
              activeView === "feed" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-600"
            }`}
            haptic="selection"
          >
            <List className="w-4 h-4" />
            Feed
          </Button>
        </div>
      </nav>

      {/* Event Sheet */}
      {selectedEvent && <EventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {/* Profile Sheet */}
      <ProfileSheet open={showProfile} onClose={() => setShowProfile(false)} />

      {/* Location Sharing Sheet */}
      <LocationSharingSheet
        open={showLocationSharing}
        onClose={() => setShowLocationSharing(false)}
        isShared={isLocationShared}
        onToggleSharing={handleLocationSharingToggle}
      />
    </div>
  )
}
