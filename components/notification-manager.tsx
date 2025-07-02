"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, X, MapPin, Clock, Euro, Users } from "lucide-react"
import { isWithinRadius } from "@/utils/distance"

interface NotificationSettings {
  enabled: boolean
  browserNotifications: boolean
  soundEnabled: boolean
  categories: string[]
  minRadius: number
  maxRadius: number
}

interface EventNotification {
  id: string
  event: any
  timestamp: Date
  distance: number
  isRead: boolean
}

interface NotificationManagerProps {
  userLocation: { lat: number; lng: number } | null
  searchRadius: number
  allEvents: any[]
  onNewEventAlert?: (event: any) => void
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  browserNotifications: false,
  soundEnabled: true,
  categories: ["music", "art", "social", "coffee"],
  minRadius: 0.5,
  maxRadius: 25,
}

export function NotificationManager({
  userLocation,
  searchRadius,
  allEvents,
  onNewEventAlert,
}: NotificationManagerProps) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [notifications, setNotifications] = useState<EventNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [lastEventCheck, setLastEventCheck] = useState<Date>(new Date())
  const [hasPermission, setHasPermission] = useState<boolean>(false)

  // Check for browser notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted")
    }
  }, [])

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setHasPermission(permission === "granted")
      if (permission === "granted") {
        setSettings((prev) => ({ ...prev, browserNotifications: true }))
      }
    }
  }

  // Simulate new events appearing (in real app, this would come from API/WebSocket)
  useEffect(() => {
    if (!settings.enabled || !userLocation) return

    const interval = setInterval(() => {
      // Simulate a new event appearing randomly
      if (Math.random() < 0.3) {
        // 30% chance every 30 seconds
        const newEvent = generateRandomEvent(userLocation, searchRadius)
        if (newEvent) {
          handleNewEvent(newEvent)
        }
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [settings.enabled, userLocation, searchRadius])

  // Check for new events in the current zone
  const checkForNewEvents = useCallback(() => {
    if (!settings.enabled || !userLocation) return

    const now = new Date()
    const eventsInZone = allEvents.filter((event) => {
      // Check if event is in zone
      const inZone = isWithinRadius(userLocation.lat, userLocation.lng, event.lat, event.lng, searchRadius)
      // Check if event category is enabled
      const categoryEnabled = settings.categories.includes(event.category)
      // Simulate "new" events (in real app, you'd check creation timestamp)
      const isNew = Math.random() < 0.1 // 10% chance to be considered "new"

      return inZone && categoryEnabled && isNew
    })

    eventsInZone.forEach((event) => {
      handleNewEvent(event)
    })

    setLastEventCheck(now)
  }, [settings, userLocation, searchRadius, allEvents])

  // Generate a random event for simulation
  const generateRandomEvent = (location: { lat: number; lng: number }, radius: number) => {
    const eventTypes = [
      {
        name: "Pop-up Bar",
        category: "social",
        type: "Bar",
        description: "Bar éphémère avec cocktails créatifs",
        price: "Gratuit",
      },
      {
        name: "Street Art Tour",
        category: "art",
        type: "Visite",
        description: "Découverte du street art local",
        price: "5€",
      },
      {
        name: "Acoustic Session",
        category: "music",
        type: "Concert",
        description: "Session acoustique intimiste",
        price: "8€",
      },
      {
        name: "Coffee Tasting",
        category: "coffee",
        type: "Dégustation",
        description: "Dégustation de cafés d'exception",
        price: "12€",
      },
    ]

    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    // Generate random location within radius
    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * radius * 0.8 // Within 80% of radius
    const deltaLat = (distance / 111) * Math.cos(angle) // Rough conversion
    const deltaLng = (distance / (111 * Math.cos((location.lat * Math.PI) / 180))) * Math.sin(angle)

    return {
      id: Date.now() + Math.random(),
      name: randomType.name,
      location: "Près de vous",
      time: "Maintenant",
      category: randomType.category,
      type: randomType.type,
      description: randomType.description,
      price: randomType.price,
      attendees: Math.floor(Math.random() * 50) + 10,
      friends: [],
      lat: location.lat + deltaLat,
      lng: location.lng + deltaLng,
      isNew: true,
    }
  }

  // Handle new event detection
  const handleNewEvent = (event: any) => {
    if (!userLocation) return

    const distance = isWithinRadius(userLocation.lat, userLocation.lng, event.lat, event.lng, searchRadius)
      ? Math.round(
          Math.sqrt(
            Math.pow(userLocation.lat - event.lat, 2) * 111 * 111 +
              Math.pow(userLocation.lng - event.lng, 2) * 111 * 111 * Math.cos((userLocation.lat * Math.PI) / 180),
          ) * 100,
        ) / 100
      : 0

    const notification: EventNotification = {
      id: `${event.id}-${Date.now()}`,
      event,
      timestamp: new Date(),
      distance,
      isRead: false,
    }

    setNotifications((prev) => [notification, ...prev.slice(0, 9)]) // Keep last 10

    // Play notification sound
    if (settings.soundEnabled) {
      playNotificationSound()
    }

    // Show browser notification
    if (settings.browserNotifications && hasPermission) {
      showBrowserNotification(event, distance)
    }

    // Callback to parent
    onNewEventAlert?.(event)
  }

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      })
    } catch (error) {
      // Ignore audio errors
    }
  }

  // Show browser notification
  const showBrowserNotification = (event: any, distance: number) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return

    const notification = new Notification(`🎉 Nouvel événement près de vous!`, {
      body: `${event.name} - ${distance}km • ${event.time}`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `event-${event.id}`,
      requireInteraction: false,
      silent: false,
    })

    notification.onclick = () => {
      window.focus()
      setShowNotifications(true)
      notification.close()
    }

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000)
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        onClick={() => setShowNotifications(true)}
        className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg relative"
        size="sm"
      >
        {settings.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Sheet */}
      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />
                Notifications ({unreadCount})
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4 py-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={checkForNewEvents} className="flex-1 bg-transparent">
                Vérifier maintenant
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllNotifications} className="flex-1 bg-transparent">
                Tout effacer
              </Button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune notification</p>
                  <p className="text-sm">Les nouveaux événements apparaîtront ici</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all ${
                      notification.isRead ? "opacity-60" : "border-purple-200 bg-purple-50"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{notification.event.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {notification.event.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{notification.event.description}</p>

                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{notification.distance}km de vous</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{notification.event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="w-3 h-3" />
                          <span>{notification.event.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>{notification.event.attendees} participants</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">
                          {notification.timestamp.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!notification.isRead && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-gray-900">Paramètres notifications</SheetTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="font-medium">
                Activer les notifications
              </Label>
              <Switch
                id="notifications-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            {/* Browser Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-notifications" className="font-medium">
                  Notifications navigateur
                </Label>
                <Switch
                  id="browser-notifications"
                  checked={settings.browserNotifications && hasPermission}
                  onCheckedChange={(checked) => {
                    if (checked && !hasPermission) {
                      requestNotificationPermission()
                    } else {
                      setSettings((prev) => ({ ...prev, browserNotifications: checked }))
                    }
                  }}
                  disabled={!settings.enabled}
                />
              </div>
              {!hasPermission && (
                <p className="text-xs text-amber-600">
                  ⚠️ Autorisez les notifications dans votre navigateur pour recevoir des alertes
                </p>
              )}
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled" className="font-medium">
                Son des notifications
              </Label>
              <Switch
                id="sound-enabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                disabled={!settings.enabled}
              />
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label className="font-medium">Types d'événements</Label>
              <div className="space-y-2">
                {[
                  { id: "music", label: "Musique & Concerts", icon: "🎵" },
                  { id: "art", label: "Art & Expositions", icon: "🎨" },
                  { id: "social", label: "Bars & Social", icon: "🍺" },
                  { id: "coffee", label: "Café & Dégustation", icon: "☕" },
                ].map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <Label htmlFor={`category-${category.id}`} className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </Label>
                    <Switch
                      id={`category-${category.id}`}
                      checked={settings.categories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        setSettings((prev) => ({
                          ...prev,
                          categories: checked
                            ? [...prev.categories, category.id]
                            : prev.categories.filter((c) => c !== category.id),
                        }))
                      }}
                      disabled={!settings.enabled}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">ℹ️ Comment ça marche</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Notifications quand de nouveaux événements apparaissent dans votre zone</li>
                <li>• Vérification automatique toutes les 30 secondes</li>
                <li>• Filtrage par catégories sélectionnées</li>
                <li>• Historique des 10 dernières notifications</li>
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
