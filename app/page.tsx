"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapView } from "@/components/map-view"
import { EventFeed } from "@/components/event-feed"
import { EventSheet } from "@/components/event-sheet"
import { ProfileSheet } from "@/components/profile-sheet"
import { Map, List, User, Calendar } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState("map")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchRadius, setSearchRadius] = useState<number>(2)

  const handleEventSelect = (event: any) => {
    hapticFeedback.press()
    setSelectedEvent(event)
  }

  const handleTabChange = (value: string) => {
    hapticFeedback.selection()
    setActiveTab(value)
  }

  const handleProfileOpen = () => {
    hapticFeedback.tap()
    setShowProfile(true)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-[200]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Virée</h1>
            <p className="text-xs text-gray-500">Découvrez Paris autrement</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedFilters.length > 0 && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {selectedFilters.length} filtre{selectedFilters.length > 1 ? "s" : ""}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfileOpen}
            className="hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
            haptic="tap"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="map" className="h-full m-0 p-0">
              <MapView onEventSelect={handleEventSelect} />
            </TabsContent>

            <TabsContent value="feed" className="h-full m-0 p-0">
              <EventFeed
                onEventSelect={handleEventSelect}
                userLocation={userLocation}
                searchRadius={searchRadius}
                selectedFilters={selectedFilters}
                onFiltersChange={setSelectedFilters}
              />
            </TabsContent>

            <TabsContent value="calendar" className="h-full m-0 p-4">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendrier</h3>
                <p className="text-gray-600">Vos événements sauvegardés apparaîtront ici</p>
              </div>
            </TabsContent>
          </div>

          {/* Bottom Navigation - Fixed with highest z-index */}
          <div className="bg-white border-t border-gray-200 relative z-[300]">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-2 h-auto">
              <TabsTrigger
                value="map"
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 transition-all duration-200"
                haptic="selection"
              >
                <Map className="w-5 h-5" />
                <span className="text-xs font-medium">Carte</span>
              </TabsTrigger>

              <TabsTrigger
                value="feed"
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 transition-all duration-200"
                haptic="selection"
              >
                <List className="w-5 h-5" />
                <span className="text-xs font-medium">Liste</span>
              </TabsTrigger>

              <TabsTrigger
                value="calendar"
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 transition-all duration-200"
                haptic="selection"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-medium">Agenda</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </main>

      {/* Event Details Sheet */}
      <EventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      {/* Profile Sheet */}
      <ProfileSheet open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}
