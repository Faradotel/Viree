"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    L: any
  }
}

const categoryColors = {
  music: "#8b5cf6", // purple
  art: "#f97316", // orange
  social: "#3b82f6", // blue
  coffee: "#f59e0b", // amber
}

interface LeafletMapProps {
  events: any[]
  friends: any[]
  onEventSelect: (event: any) => void
  onLocationChange?: (isLocating: boolean, error: string | null, location?: { lat: number; lng: number }) => void
  userLocation?: { lat: number; lng: number } | null
  searchRadius?: number
}

export function LeafletMap({
  events,
  friends,
  onEventSelect,
  onLocationChange,
  userLocation: propUserLocation,
  searchRadius = 2,
}: LeafletMapProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(propUserLocation || null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const userMarkerRef = useRef<any>(null)
  const radiusCircleRef = useRef<any>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (!window.L) {
      const link = document.createElement("link")
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.rel = "stylesheet"
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      link.crossOrigin = ""
      document.head.appendChild(link)

      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      script.crossOrigin = ""
      script.onload = () => {
        setIsLoaded(true)
      }
      script.onerror = () => {
        console.error("Failed to load Leaflet")
      }
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && mapContainer.current && window.L && !map.current) {
      initializeMap()
    }
  }, [isLoaded])

  useEffect(() => {
    if (map.current) {
      updateMarkers()
    }
  }, [events, friends])

  // Update user location from props
  useEffect(() => {
    if (propUserLocation) {
      setUserLocation(propUserLocation)
      if (map.current) {
        addUserMarker(propUserLocation)
        updateRadiusCircle(propUserLocation, searchRadius)
      }
    }
  }, [propUserLocation, searchRadius])

  // Request user location on mount
  useEffect(() => {
    if (isLoaded && map.current && !propUserLocation) {
      // Small delay to ensure map is fully initialized
      setTimeout(() => {
        getUserLocation()
      }, 1000)
    }
  }, [isLoaded, propUserLocation])

  // Listen for location requests from parent component
  useEffect(() => {
    const handleLocationRequest = () => {
      getUserLocation()
    }

    window.addEventListener("requestLocation", handleLocationRequest)

    return () => {
      window.removeEventListener("requestLocation", handleLocationRequest)
    }
  }, [])

  const initializeMap = () => {
    if (!mapContainer.current || !window.L) return

    // Initialize map centered on Paris
    map.current = window.L.map(mapContainer.current, {
      center: [48.8566, 2.3522], // Paris coordinates [lat, lng]
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    })

    // Add OpenStreetMap tiles with custom styling
    window.L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current)

    updateMarkers()
  }

  const updateMarkers = () => {
    if (!map.current || !window.L) return

    // Clear existing markers
    markersRef.current.forEach((marker) => map.current.removeLayer(marker))
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

  const updateRadiusCircle = (location: { lat: number; lng: number }, radius: number) => {
    if (!map.current || !window.L) return

    // Remove existing radius circle
    if (radiusCircleRef.current) {
      map.current.removeLayer(radiusCircleRef.current)
    }

    // Add new radius circle
    radiusCircleRef.current = window.L.circle([location.lat, location.lng], {
      color: "#8b5cf6",
      fillColor: "#8b5cf6",
      fillOpacity: 0.1,
      radius: radius * 1000, // Convert km to meters
      weight: 2,
      dashArray: "5, 5",
    }).addTo(map.current)
  }

  const getUserLocation = () => {
    setIsLocating(true)
    setLocationError(null)
    onLocationChange?.(true, null)

    if (!navigator.geolocation) {
      const error = "La géolocalisation n'est pas supportée par ce navigateur"
      setLocationError(error)
      setIsLocating(false)
      onLocationChange?.(false, error)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLocation = { lat: latitude, lng: longitude }
        setUserLocation(newLocation)
        setIsLocating(false)
        onLocationChange?.(false, null, newLocation)

        // Center map on user location
        if (map.current) {
          map.current.setView([latitude, longitude], 14)
          addUserMarker(newLocation)
          updateRadiusCircle(newLocation, searchRadius)
        }
      },
      (error) => {
        let errorMessage = "Impossible d'obtenir votre position"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Géolocalisation refusée par l'utilisateur"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible"
            break
          case error.TIMEOUT:
            errorMessage = "Délai d'attente dépassé"
            break
        }
        setLocationError(errorMessage)
        setIsLocating(false)
        onLocationChange?.(false, errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const addUserMarker = (location: { lat: number; lng: number }) => {
    if (!map.current || !window.L) return

    // Remove existing user marker
    if (userMarkerRef.current) {
      map.current.removeLayer(userMarkerRef.current)
    }

    // Create user location icon
    const userIcon = window.L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          animation: userPulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          top: -8px;
          left: -8px;
          width: 36px;
          height: 36px;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          opacity: 0.3;
          animation: userRipple 2s infinite;
        "></div>
      `,
      className: "user-location-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    userMarkerRef.current = window.L.marker([location.lat, location.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map.current)

    userMarkerRef.current.bindTooltip("Votre position", {
      permanent: false,
      direction: "top",
    })
  }

  const createEventMarker = (event: any) => {
    const color = categoryColors[event.category as keyof typeof categoryColors]
    const icons = { music: "🎵", art: "🎨", social: "🍺", coffee: "☕" }
    const icon = icons[event.category as keyof typeof icons]

    // Create custom icon with better styling
    const customIcon = window.L.divIcon({
      html: `
      <div style="
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, ${color}, ${color}dd);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        animation: bounce 2s infinite;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${icon}
      </div>
    `,
      className: "custom-div-icon",
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    })

    // Create marker
    const marker = window.L.marker([event.lat, event.lng], { icon: customIcon }).addTo(map.current)

    // Enhanced popup content
    const popupContent = `
    <div style="padding: 12px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
      <h3 style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937; font-size: 16px;">${event.name}</h3>
      <div style="margin: 6px 0; color: #6b7280; font-size: 14px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">📍</span> ${event.location}
      </div>
      <div style="margin: 6px 0; color: #6b7280; font-size: 14px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">🕐</span> ${event.time}
      </div>
      <div style="margin: 6px 0; color: #6b7280; font-size: 14px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">💰</span> <strong>${event.price}</strong>
      </div>
      <div style="margin: 6px 0; color: #6b7280; font-size: 14px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">👥</span> ${event.attendees} participants
      </div>
      ${
        event.friends.length > 0
          ? `
        <div style="margin: 10px 0 6px 0; padding: 8px; background: ${color}15; border-radius: 6px;">
          <div style="color: ${color}; font-size: 14px; font-weight: 500;">
            👥 Tes amis: ${event.friends.join(", ")}
          </div>
        </div>
      `
          : ""
      }
      <button onclick="window.selectLeafletEvent && window.selectLeafletEvent(${event.id})" style="
        margin-top: 12px;
        padding: 8px 16px;
        background: linear-gradient(135deg, ${color}, ${color}dd);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        width: 100%;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
        Voir plus de détails
      </button>
    </div>
  `

    marker.bindPopup(popupContent, {
      maxWidth: 280,
      className: "custom-popup",
    })

    return marker
  }

  const createFriendMarker = (friend: any) => {
    // Create custom friend icon
    const friendIcon = window.L.divIcon({
      html: `
        <div style="
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        ">
          ${friend.avatar}
        </div>
      `,
      className: "friend-div-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    const marker = window.L.marker(
      [friend.lat + (Math.random() - 0.5) * 0.001, friend.lng + (Math.random() - 0.5) * 0.001],
      { icon: friendIcon },
    ).addTo(map.current)

    marker.bindTooltip(`${friend.name} - ${friend.activity}`, {
      permanent: false,
      direction: "top",
    })

    return marker
  }

  // Global function to handle event selection from popup
  useEffect(() => {
    window.selectLeafletEvent = (eventId: number) => {
      const event = events.find((e) => e.id === eventId)
      if (event) {
        onEventSelect(event)
      }
    }

    return () => {
      delete window.selectLeafletEvent
    }
  }, [events, onEventSelect])

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte OpenStreetMap...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx global>{`
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(-4px);
    }
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(139, 92, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
    }
  }
  
  @keyframes userPulse {
    0% {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
    }
    100% {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
  }
  
  @keyframes userRipple {
    0% {
      transform: scale(0.8);
      opacity: 0.3;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .custom-div-icon {
    background: none !important;
    border: none !important;
  }
  
  .friend-div-icon {
    background: none !important;
    border: none !important;
  }
  
  .user-location-icon {
    background: none !important;
    border: none !important;
  }
  
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 12px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
  }
  
  .custom-popup .leaflet-popup-tip {
    background: white !important;
  }
  
  .leaflet-container {
    font-family: system-ui, -apple-system, sans-serif !important;
  }
  
  .leaflet-control-zoom a {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(139, 92, 246, 0.2) !important;
    color: #8b5cf6 !important;
  }
  
  .leaflet-control-zoom a:hover {
    background: rgba(139, 92, 246, 0.1) !important;
    color: #7c3aed !important;
  }
`}</style>
    </>
  )
}
