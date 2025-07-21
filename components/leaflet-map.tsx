"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface Event {
  id: string
  title: string
  location: string
  coordinates: [number, number]
  category: string
  time: string
  price: string
  description: string
  attendees: number
  image: string
}

interface LeafletMapProps {
  events: Event[]
  onEventSelect: (event: Event) => void
  userLocation?: { lat: number; lng: number } | null
  searchRadius?: number
}

export function LeafletMap({ events, onEventSelect, userLocation, searchRadius = 2 }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.MarkerClusterGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const radiusCircleRef = useRef<L.Circle | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [48.8566, 2.3522], // Paris center
      zoom: 13,
      zoomControl: false,
      preferCanvas: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3,
      tileSize: 256,
      zoomOffset: 0,
    }).addTo(map)

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map)

    mapInstanceRef.current = map

    // Initialize marker cluster group
    markersRef.current = (L as any).markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount()
        let className = "marker-cluster-small"
        if (count > 10) className = "marker-cluster-medium"
        if (count > 100) className = "marker-cluster-large"

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40),
        })
      },
    })
    map.addLayer(markersRef.current)

    // Force map to resize after initialization
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }, 100)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current)
    }

    if (userLocation) {
      // Add user location marker
      const userIcon = L.divIcon({
        html: `<div class="user-location-marker">
          <div class="user-location-dot"></div>
          <div class="user-location-pulse"></div>
        </div>`,
        className: "user-location-icon",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current)

      // Pan to user location
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15)
    }
  }, [userLocation])

  // Update event markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return

    // Clear existing markers
    markersRef.current.clearLayers()

    // Add event markers
    if (events && events.length > 0) {
      events.forEach((event) => {
        if (!event.coordinates || event.coordinates.length !== 2) return

        const [lat, lng] = event.coordinates
        if (typeof lat !== "number" || typeof lng !== "number") return

        const eventType = event.category?.toLowerCase() || "autre"
        const color = categoryColors[eventType] || "#6b7280"
        const icon = categoryIcons[eventType] || "📍"

        const eventIcon = L.divIcon({
          html: `<div class="event-marker" style="background-color: ${color}">
            <span class="event-icon">${icon}</span>
          </div>`,
          className: "event-marker-container",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        const marker = L.marker([lat, lng], { icon: eventIcon })

        // Create popup content
        const friendsList =
          event.friends && event.friends.length > 0
            ? `<div class="event-popup-friends">👥 ${event.friends.join(", ")}</div>`
            : ""

        const popupContent = `
          <div class="event-popup">
            <div class="event-popup-header">
              <h3 class="event-popup-title">${event.title}</h3>
              <span class="event-popup-category" style="background-color: ${color}15; color: ${color}">
                ${icon} ${event.category}
              </span>
            </div>
            <div class="event-popup-details">
              <div class="event-popup-location">📍 ${event.location}</div>
              ${event.time ? `<div class="event-popup-time">🕐 ${event.time}</div>` : ""}
              ${event.price ? `<div class="event-popup-price">💰 ${event.price}</div>` : ""}
              <div class="event-popup-attendees">👥 ${event.attendees || 0} participants</div>
              ${friendsList}
            </div>
            <button class="event-popup-button" onclick="window.selectEvent('${event.id}')">
              Voir les détails
            </button>
          </div>
        `

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: "custom-popup",
        })

        // Add click handler
        marker.on("click", () => {
          onEventSelect(event)
        })

        markersRef.current.addLayer(marker)
      })
    }
  }, [events, onEventSelect])

  return (
    <>
      <div
        ref={mapRef}
        className={`w-full h-full z-0`}
        style={{ minHeight: "100%", height: "100vh", background: "#f8fafc" }}
      />
      <style jsx global>{`
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          background: #f8fafc;
        }

        .leaflet-tile-container {
          filter: none;
        }

        .leaflet-tile {
          filter: none;
        }

        .user-location-marker {
          position: relative;
          width: 20px;
          height: 20px;
        }

        .user-location-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background-color: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .user-location-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .event-marker {
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .event-marker:hover {
          transform: rotate(-45deg) scale(1.1);
        }

        .event-icon {
          transform: rotate(45deg);
          font-size: 14px;
        }

        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }

        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }

        .event-popup {
          padding: 16px;
          min-width: 250px;
        }

        .event-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .event-popup-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          flex: 1;
          margin-right: 8px;
        }

        .event-popup-category {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .event-popup-details {
          margin-bottom: 12px;
          font-size: 14px;
          color: #6b7280;
        }

        .event-popup-details > div {
          margin-bottom: 4px;
        }

        .event-popup-friends {
          color: #8b5cf6;
          font-weight: 500;
        }

        .event-popup-button {
          width: 100%;
          padding: 8px 16px;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .event-popup-button:hover {
          opacity: 0.9;
        }

        .marker-cluster {
          background-clip: padding-box;
          border-radius: 20px;
        }

        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
        }

        .marker-cluster span {
          line-height: 30px;
          color: white;
          font-weight: bold;
        }

        .marker-cluster-small {
          background-color: rgba(139, 92, 246, 0.6);
        }

        .marker-cluster-small div {
          background-color: rgba(139, 92, 246, 0.8);
        }

        .marker-cluster-medium {
          background-color: rgba(236, 72, 153, 0.6);
        }

        .marker-cluster-medium div {
          background-color: rgba(236, 72, 153, 0.8);
        }

        .marker-cluster-large {
          background-color: rgba(59, 130, 246, 0.6);
        }

        .marker-cluster-large div {
          background-color: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </>
  )
}

const categoryColors: { [key: string]: string } = {
  Musique: "#8B5CF6",
  Art: "#EC4899",
  Gastronomie: "#F59E0B",
  Sport: "#10B981",
  Culture: "#3B82F6",
  Nightlife: "#6366F1",
}

const categoryIcons: { [key: string]: string } = {
  Musique: "♪",
  Art: "🎨",
  Gastronomie: "🍽️",
  Sport: "⚽",
  Culture: "📚",
  Nightlife: "🌙",
}
