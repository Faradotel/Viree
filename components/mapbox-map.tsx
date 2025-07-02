"use client"

import { useEffect, useRef, useState } from "react"
import { MapFallback } from "@/components/map-fallback"

declare global {
  interface Window {
    mapboxgl: any
  }
}

const categoryColors = {
  music: "#8b5cf6", // purple
  art: "#f97316", // orange
  social: "#3b82f6", // blue
  coffee: "#f59e0b", // amber
}

interface MapboxMapProps {
  events: any[]
  friends: any[]
  onEventSelect: (event: any) => void
}

// Replace with your Mapbox access token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

export function MapboxMap({ events, friends, onEventSelect }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasToken, setHasToken] = useState(!!MAPBOX_TOKEN)

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setHasToken(false)
      return
    }

    // Load Mapbox GL JS
    if (!window.mapboxgl) {
      const link = document.createElement("link")
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
      link.rel = "stylesheet"
      document.head.appendChild(link)

      const script = document.createElement("script")
      script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"
      script.onload = () => {
        setIsLoaded(true)
      }
      script.onerror = () => {
        console.error("Failed to load Mapbox GL JS")
        setHasToken(false)
      }
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && mapContainer.current && window.mapboxgl && !map.current) {
      initializeMap()
    }
  }, [isLoaded])

  useEffect(() => {
    if (map.current) {
      updateMarkers()
    }
  }, [events, friends])

  const initializeMap = () => {
    if (!mapContainer.current || !window.mapboxgl) return

    window.mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11", // Clean, light style
      center: [2.3522, 48.8566], // Paris coordinates [lng, lat]
      zoom: 12,
      pitch: 0,
      bearing: 0,
    })

    map.current.on("load", () => {
      updateMarkers()
    })

    // Add navigation controls
    map.current.addControl(new window.mapboxgl.NavigationControl(), "top-right")
  }

  const updateMarkers = () => {
    if (!map.current || !window.mapboxgl) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
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

    // Create custom marker element
    const el = document.createElement("div")
    el.className = "custom-marker"
    el.style.cssText = `
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, ${color}, ${color}dd);
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s ease;
      animation: pulse 2s infinite;
    `
    el.innerHTML = icon
    el.title = event.name

    // Add hover effect
    el.addEventListener("mouseenter", () => {
      el.style.transform = "scale(1.1)"
    })
    el.addEventListener("mouseleave", () => {
      el.style.transform = "scale(1)"
    })

    // Create popup
    const popup = new window.mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
    }).setHTML(`
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${event.name}</h3>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">📍 ${event.location}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">🕐 ${event.time}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">💰 ${event.price}</p>
        ${event.friends.length > 0 ? `<p style="margin: 8px 0 4px 0; color: ${color}; font-size: 14px;">👥 ${event.friends.join(", ")} y vont</p>` : ""}
        <button id="select-event-${event.id}" style="
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
    `)

    // Create marker
    const marker = new window.mapboxgl.Marker(el).setLngLat([event.lng, event.lat]).setPopup(popup).addTo(map.current)

    // Add click handler for the button inside popup
    popup.on("open", () => {
      const button = document.getElementById(`select-event-${event.id}`)
      if (button) {
        button.addEventListener("click", () => {
          onEventSelect(event)
          popup.remove()
        })
      }
    })

    return marker
  }

  const createFriendMarker = (friend: any) => {
    // Create custom friend marker element
    const el = document.createElement("div")
    el.className = "friend-marker"
    el.style.cssText = `
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #10b981, #3b82f6);
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
    `
    el.innerHTML = friend.avatar
    el.title = `${friend.name} - ${friend.activity}`

    const marker = new window.mapboxgl.Marker(el)
      .setLngLat([friend.lng + (Math.random() - 0.5) * 0.001, friend.lat + (Math.random() - 0.5) * 0.001])
      .addTo(map.current)

    return marker
  }

  // Show fallback if no token or failed to load
  if (!hasToken) {
    return <MapFallback events={events} onEventSelect={onEventSelect} />
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte Mapbox...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
          }
        }
      `}</style>
    </>
  )
}
