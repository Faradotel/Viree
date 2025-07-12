"use client"

import { useEffect, useRef } from "react"
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

interface LeafletMapProps {
  events: any[]
  friends: any[]
  onEventSelect: (event: any) => void
  onLocationChange: (locating: boolean, error: string | null, location?: { lat: number; lng: number }) => void
  userLocation: { lat: number; lng: number } | null
  searchRadius: number
  enableClustering?: boolean
}

const categoryColors: Record<string, string> = {
  music: "#8b5cf6",
  social: "#3b82f6",
  art: "#ec4899",
  coffee: "#f59e0b",
}

const categoryIcons: Record<string, string> = {
  music: "🎵",
  social: "🍻",
  art: "🎨",
  coffee: "☕",
}

export function LeafletMap({
  events,
  friends,
  onEventSelect,
  onLocationChange,
  userLocation,
  searchRadius,
  enableClustering = true,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const radiusCircleRef = useRef<L.Circle | null>(null)
  const markerClusterRef = useRef<any>(null)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [48.8566, 2.3522], // Paris center
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map)

    mapRef.current = map

    // Initialize marker cluster group if clustering is enabled
    if (enableClustering) {
      markerClusterRef.current = (L as any).markerClusterGroup({
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
      map.addLayer(markerClusterRef.current)
    } else {
      markersRef.current = L.layerGroup().addTo(map)
    }

    // Listen for location requests
    const handleLocationRequest = () => {
      if ("geolocation" in navigator) {
        onLocationChange(true, null)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            onLocationChange(false, null, { lat: latitude, lng: longitude })
            map.setView([latitude, longitude], 15)
          },
          (error) => {
            let errorMessage = "Erreur de géolocalisation"
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Géolocalisation refusée"
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Position indisponible"
                break
              case error.TIMEOUT:
                errorMessage = "Délai dépassé"
                break
            }
            onLocationChange(false, errorMessage)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          },
        )
      } else {
        onLocationChange(false, "Géolocalisation non supportée")
      }
    }

    window.addEventListener("requestLocation", handleLocationRequest)

    return () => {
      window.removeEventListener("requestLocation", handleLocationRequest)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onLocationChange, enableClustering])

  // Update user location marker and radius circle
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing user marker and radius circle
    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current)
    }
    if (radiusCircleRef.current) {
      mapRef.current.removeLayer(radiusCircleRef.current)
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
      }).addTo(mapRef.current)

      // Add search radius circle
      radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: searchRadius * 1000, // Convert km to meters
        fillColor: "#8b5cf6",
        fillOpacity: 0.1,
        color: "#8b5cf6",
        weight: 2,
        opacity: 0.5,
      }).addTo(mapRef.current)
    }
  }, [userLocation, searchRadius])

  // Update event markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    if (enableClustering && markerClusterRef.current) {
      markerClusterRef.current.clearLayers()
    } else if (markersRef.current) {
      markersRef.current.clearLayers()
    }

    // Add event markers
    events.forEach((event) => {
      const color = categoryColors[event.category] || "#6b7280"
      const icon = categoryIcons[event.category] || "📍"

      const eventIcon = L.divIcon({
        html: `<div class="event-marker" style="background-color: ${color}">
          <span class="event-icon">${icon}</span>
        </div>`,
        className: "event-marker-container",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const marker = L.marker([event.lat, event.lng], { icon: eventIcon })

      // Create popup content
      const popupContent = `
        <div class="event-popup">
          <div class="event-popup-header">
            <h3 class="event-popup-title">${event.name}</h3>
            <span class="event-popup-category" style="background-color: ${color}15; color: ${color}">
              ${icon} ${event.type}
            </span>
          </div>
          <div class="event-popup-details">
            <div class="event-popup-location">📍 ${event.location}</div>
            ${event.time ? `<div class="event-popup-time">🕐 ${event.time}</div>` : ""}
            ${event.price ? `<div class="event-popup-price">💰 ${event.price}</div>` : ""}
            <div class="event-popup-attendees">👥 ${event.attendees} participants</div>
          </div>
          <button class="event-popup-button" onclick="window.selectEvent(${event.id})">
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

      // Add to appropriate layer
      if (enableClustering && markerClusterRef.current) {
        markerClusterRef.current.addLayer(marker)
      } else if (markersRef.current) {
        markersRef.current.addLayer(marker)
      }
    })

    // Add friend markers
    friends.forEach((friend) => {
      const friendIcon = L.divIcon({
        html: `<div class="friend-marker">
          <img src="/placeholder-user.jpg" alt="${friend.name}" class="friend-avatar" />
          <div class="friend-status"></div>
        </div>`,
        className: "friend-marker-container",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      const marker = L.marker([friend.lat, friend.lng], { icon: friendIcon })

      marker.bindPopup(`
        <div class="friend-popup">
          <div class="friend-popup-header">
            <img src="/placeholder-user.jpg" alt="${friend.name}" class="friend-popup-avatar" />
            <div>
              <h3 class="friend-popup-name">${friend.name}</h3>
              <p class="friend-popup-status">En ligne</p>
            </div>
          </div>
        </div>
      `)

      // Add to appropriate layer
      if (enableClustering && markerClusterRef.current) {
        markerClusterRef.current.addLayer(marker)
      } else if (markersRef.current) {
        markersRef.current.addLayer(marker)
      }
    })

    // Global function for popup buttons
    ;(window as any).selectEvent = (eventId: number) => {
      const event = events.find((e) => e.id === eventId)
      if (event) {
        onEventSelect(event)
      }
    }
  }, [events, friends, onEventSelect, enableClustering])

  return (
    <>
      <div ref={containerRef} className="w-full h-full z-0" />
      <style jsx global>{`
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

        .friend-marker {
          position: relative;
          width: 28px;
          height: 28px;
        }

        .friend-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .friend-status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border: 1px solid white;
          border-radius: 50%;
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

        .friend-popup {
          padding: 12px;
          min-width: 200px;
        }

        .friend-popup-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .friend-popup-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .friend-popup-name {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .friend-popup-status {
          font-size: 12px;
          color: #10b981;
          margin: 0;
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
