"use client"

import { useState } from "react"
import { Music, Coffee, Palette, Users } from "lucide-react"

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
    x: 45,
    y: 30,
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
    x: 65,
    y: 45,
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
    x: 25,
    y: 60,
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
    x: 80,
    y: 25,
  },
]

const friends = [
  { name: "Paul", avatar: "P", x: 45, y: 30, activity: "Apéro DJ Canal" },
  { name: "Marie", avatar: "M", x: 45, y: 30, activity: "Apéro DJ Canal" },
  { name: "Sophie", avatar: "S", x: 65, y: 45, activity: "Expo Street Art" },
  { name: "Alex", avatar: "A", x: 80, y: 25, activity: "Coffee Cupping" },
  { name: "Tom", avatar: "T", x: 80, y: 25, activity: "Coffee Cupping" },
]

const categoryIcons = {
  music: Music,
  art: Palette,
  social: Users,
  coffee: Coffee,
}

const categoryColors = {
  music: "from-purple-500 to-pink-500",
  art: "from-orange-500 to-red-500",
  social: "from-blue-500 to-cyan-500",
  coffee: "from-amber-500 to-orange-500",
}

interface MapFallbackProps {
  events: any[]
  onEventSelect: (event: any) => void
}

export function MapFallback({ events: filteredEvents, onEventSelect }: MapFallbackProps) {
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Map Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
          {/* Simulated map streets */}
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-400 opacity-50"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 opacity-50"></div>
          <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-400 opacity-50"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-gray-400 opacity-50"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 opacity-50"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-gray-400 opacity-50"></div>
        </div>
      </div>

      {/* API Key Notice */}
      <div className="absolute top-4 left-4 z-10 bg-amber-100 border border-amber-300 rounded-lg p-3 max-w-sm">
        <p className="text-sm text-amber-800">
          <strong>Demo Mode:</strong> Add your Google Maps API key to enable real maps
        </p>
      </div>

      {/* Events on Map */}
      {filteredEvents.map((event) => {
        const IconComponent = categoryIcons[event.category as keyof typeof categoryIcons]
        const colorClass = categoryColors[event.category as keyof typeof categoryColors]

        return (
          <div key={event.id} className="absolute z-20">
            <div
              className="relative cursor-pointer transform transition-all duration-200 hover:scale-110"
              style={{
                left: `${event.x}%`,
                top: `${event.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => onEventSelect(event)}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              {/* Event Pin */}
              <div
                className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-full shadow-lg flex items-center justify-center animate-pulse`}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </div>

              {/* Hover Popup */}
              {hoveredEvent === event.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl p-3 min-w-48 z-30">
                  <div className="text-sm font-semibold text-gray-900">{event.name}</div>
                  <div className="text-xs text-gray-600">{event.location}</div>
                  <div className="text-xs text-gray-600">
                    {event.time} • {event.price}
                  </div>
                  {event.friends.length > 0 && (
                    <div className="text-xs text-purple-600 mt-1">👥 {event.friends.join(", ")} y vont</div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Friends on Map */}
      {friends.map((friend, index) => (
        <div
          key={index}
          className="absolute z-10"
          style={{
            left: `${friend.x + index * 3}%`,
            top: `${friend.y + index * 3}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
            {friend.avatar}
          </div>
        </div>
      ))}
    </div>
  )
}
