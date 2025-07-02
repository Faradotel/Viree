"use client"

import { useEffect, useRef, useState } from "react"
import { MapFallback } from "@/components/map-fallback"

declare global {
  interface Window {
    google: any
    initMap: () => void
    selectEvent: (eventId: number) => void
  }
}

const categoryColors = {
  music: "#8b5cf6", // purple
  art: "#f97316", // orange
  social: "#3b82f6", // blue
  coffee: "#f59e0b", // amber
}

interface GoogleMapProps {
  events: any[]
  friends: any[]
  onEventSelect: (event: any) => void
}

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

export function GoogleMap({ events, friends, onEventSelect }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(!!GOOGLE_MAPS_API_KEY)

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setHasApiKey(false)
      return
    }

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`
      script.async = true
      script.defer = true

      window.initMap = () => {
        setIsLoaded(true)
      }

      script.onerror = () => {
        console.error("Failed to load Google Maps")
        setHasApiKey(false)
      }

      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && mapRef.current && window.google) {
      initializeMap()
    }
  }, [isLoaded])

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers()
    }
  }, [events, friends])

  // Global function to handle event selection from info window
  useEffect(() => {
    window.selectEvent = (eventId: number) => {
      const event = events.find((e) => e.id === eventId)
      if (event) {
        onEventSelect(event)
      }
    }

    return () => {
      delete window.selectEvent
    }
  }, [events, onEventSelect])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Center on Paris
    const center = { lat: 48.8566, lng: 2.3522 }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: center,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#f5f5f5" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }, { lightness: 16 }],
        },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    })

    updateMarkers()
  }

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add event markers
    events.forEach((event) => {
      const marker = createEventMarker(event)
      markersRef.current.push(marker)
    })

    // Add friend markers
    friends.forEach((friend) => {
      const marker = createFriendMarker(friend)
      markersRef.current.push(marker)
    })
  }

  const createEventMarker = (event: any) => {
    const color = categoryColors[event.category as keyof typeof categoryColors]
    const icons = { music: "🎵", art: "🎨", social: "🍺", coffee: "☕" }
    const icon = icons[event.category as keyof typeof icons]

    const marker = new window.google.maps.Marker({
      position: { lat: event.lat, lng: event.lng },
      map: mapInstanceRef.current,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="21" fill="${color}" stroke="white" strokeWidth="3"/>
            <text x="24" y="30" textAnchor="middle" fontSize="16" fill="white">${icon}</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24),
      },
      title: event.name,
    })

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${event.name}</h3>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">📍 ${event.location}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">🕐 ${event.time}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">💰 ${event.price}</p>
          ${event.friends.length > 0 ? `<p style="margin: 8px 0 4px 0; color: ${color}; font-size: 14px;">👥 ${event.friends.join(", ")} y vont</p>` : ""}
          <button onclick="window.selectEvent(${event.id})" style="
            margin-top: 8px;
            padding: 6px 12px;
            background: linear-gradient(135deg, ${color}, ${color}dd);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
          ">Voir plus</button>
        </div>
      `,
    })

    marker.addListener("click", () => {
      // Close other info windows
      markersRef.current.forEach((m) => {
        if (m.infoWindow) m.infoWindow.close()
      })
      infoWindow.open(mapInstanceRef.current, marker)
    })

    marker.infoWindow = infoWindow
    return marker
  }

  const createFriendMarker = (friend: any) => {
    const marker = new window.google.maps.Marker({
      position: {
        lat: friend.lat + (Math.random() - 0.5) * 0.001,
        lng: friend.lng + (Math.random() - 0.5) * 0.001,
      },
      map: mapInstanceRef.current,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="url(#grad)" stroke="white" strokeWidth="2"/>
            <text x="16" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">${friend.avatar}</text>
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16),
      },
      title: `${friend.name} - ${friend.activity}`,
      zIndex: 1000,
    })

    return marker
  }

  // Show fallback if no API key or failed to load
  if (!hasApiKey) {
    return <MapFallback events={events} onEventSelect={onEventSelect} />
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-full" />
}
