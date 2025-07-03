"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, BellRing, X, Settings, Volume2, VolumeX, Smartphone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { isWithinRadius } from "@/utils/distance"
import { hapticFeedback } from "@/utils/haptics"

interface NotificationSettings {
  enabled: boolean
  browserNotifications: boolean
  soundEnabled: boolean
  categories: string[]
}

interface Notification {
  id: string
  eventId: number
  eventName: string
  eventLocation: string
  eventTime: string
  eventPrice: string
  distance: number
  timestamp: Date
  read: boolean
}

interface NotificationManagerProps {
  userLocation: { lat: number; lng: number } | null
  searchRadius: number
  allEvents: any[]
  onNewEventAlert: (event: any) => void
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  browserNotifications: false,
  soundEnabled: true,
  categories: ["music", "art", "social", "coffee"],
}

const categoryLabels = {
  music: "Concerts & Musique",
  art: "Art & Expositions",
  social: "Bars & Social",
  coffee: "Café & Dégustation",
}

export function NotificationManager({
  userLocation,
  searchRadius,
  allEvents,
  onNewEventAlert,
}: NotificationManagerProps) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [lastCheckedEvents, setLastCheckedEvents] = useState<Set<number>>(new Set())
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default")

  // Check browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  // Request browser notification permission
  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission()
      setBrowserPermission(permission)
      if (permission === "granted") {
        hapticFeedback.success()
        setSettings((prev) => ({ ...prev, browserNotifications: true }))
      } else {
        hapticFeedback.impact()
      }
    }
  }

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (settings.soundEnabled) {
      try {
        // Create a simple notification sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch (error) {
        console.log("Audio notification not available")
      }
    }
  }, [settings.soundEnabled])

  // Show browser notification
  const showBrowserNotification = useCallback(
    (event: any, distance: number) => {
      if (settings.browserNotifications && browserPermission === "granted") {
        const notification = new Notification(`Nouvel événement près de vous!`, {
          body: `${event.name} à ${distance.toFixed(1)}km - ${event.price}`,
          icon: "/placeholder.svg?height=64&width=64",
          tag: `event-${event.id}`,
          requireInteraction: false,
        })

        notification.onclick = () => {
          window.focus()
          onNewEventAlert(event)
          notification.close()
        }

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000)
      }
    },
    [settings.browserNotifications, browserPermission, onNewEventAlert],
  )

  // Check for new events in zone
  const checkForNewEvents = useCallback(() => {
    if (!settings.enabled || !userLocation) return

    const eventsInZone = allEvents.filter((event) => {
      const inZone = isWithinRadius(userLocation.lat, userLocation.lng, event.lat, event.lng, searchRadius)
      const categoryEnabled = settings.categories.includes(event.category)
      const isNew = !lastCheckedEvents.has(event.id)

      return inZone && categoryEnabled && isNew
    })

    if (eventsInZone.length > 0) {
      eventsInZone.forEach((event) => {
        const distance = isWithinRadius(
          userLocation.lat,
          userLocation.lng,
          event.lat,
          event.lng,
          searchRadius,
          true,
        ) as number

        // Create notification
        const notification: Notification = {
          id: `${event.id}-${Date.now()}`,
          eventId: event.id,
          eventName: event.name,
          eventLocation: event.location,
          eventTime: event.time,
          eventPrice: event.price,
          distance,
          timestamp: new Date(),
          read: false,
        }

        setNotifications((prev) => [notification, ...prev.slice(0, 9)]) // Keep last 10

        // Trigger haptic feedback
        hapticFeedback.press()

        // Play sound
        playNotificationSound()

        // Show browser notification
        showBrowserNotification(event, distance)

        // Notify parent component
        onNewEventAlert(event)
      })

      // Update checked events
      setLastCheckedEvents((prev) => {
        const newSet = new Set(prev)
        eventsInZone.forEach((event) => newSet.add(event.id))
        return newSet
      })
    }
  }, [
    settings,
    userLocation,
    searchRadius,
    allEvents,
    lastCheckedEvents,
    playNotificationSound,
    showBrowserNotification,
    onNewEventAlert,
  ])

  // Periodic check for new events
  useEffect(() => {
    if (settings.enabled && userLocation) {
      const interval = setInterval(checkForNewEvents, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [checkForNewEvents, settings.enabled, userLocation])

  // Manual refresh
  const handleRefresh = () => {
    hapticFeedback.tap()
    checkForNewEvents()
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    hapticFeedback.selection()
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  // Clear all notifications
  const clearAll = () => {
    hapticFeedback.impact()
    setNotifications([])
  }

  // Update settings
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    hapticFeedback.selection()
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg border border-gray-200 relative"
          size="sm"
          haptic="tap"
        >
          {unreadCount > 0 ? <BellRing className="w-4 h-4 mr-2 text-purple-500" /> : <Bell className="w-4 h-4 mr-2" />}
          Alertes
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-500" />
              Notifications
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} haptic="tap">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Settings */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Paramètres</h3>
              <Settings className="w-4 h-4 text-purple-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-enabled" className="text-sm font-medium">
                  Activer les notifications
                </Label>
                <Switch
                  id="notifications-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(enabled) => updateSettings({ enabled })}
                />
              </div>

              {settings.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications" className="text-sm font-medium flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Notifications navigateur
                    </Label>
                    <div className="flex items-center gap-2">
                      {browserPermission === "default" && (
                        <Button size="sm" variant="outline" onClick={requestBrowserPermission} haptic="tap">
                          Autoriser
                        </Button>
                      )}
                      <Switch
                        id="browser-notifications"
                        checked={settings.browserNotifications && browserPermission === "granted"}
                        onCheckedChange={(enabled) => {
                          if (enabled && browserPermission !== "granted") {
                            requestBrowserPermission()
                          } else {
                            updateSettings({ browserNotifications: enabled })
                          }
                        }}
                        disabled={browserPermission === "denied"}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled" className="text-sm font-medium flex items-center gap-2">
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      Sons de notification
                    </Label>
                    <Switch
                      id="sound-enabled"
                      checked={settings.soundEnabled}
                      onCheckedChange={(soundEnabled) => updateSettings({ soundEnabled })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Category Filters */}
          {settings.enabled && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Types d'événements à surveiller</h3>
              <div className="space-y-2">
                {Object.entries(categoryLabels).map(([category, label]) => (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={`category-${category}`}
                      checked={settings.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        const newCategories = checked
                          ? [...settings.categories, category]
                          : settings.categories.filter((c) => c !== category)
                        updateSettings({ categories: newCategories })
                      }}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Alertes récentes ({notifications.length})</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleRefresh} haptic="tap">
                  Actualiser
                </Button>
                {notifications.length > 0 && (
                  <Button size="sm" variant="outline" onClick={clearAll} haptic="impact">
                    Effacer
                  </Button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification pour le moment</p>
                <p className="text-xs mt-1">Les nouveaux événements dans votre zone apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      notification.read ? "bg-gray-50 border-gray-200" : "bg-white border-purple-200 shadow-sm"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${notification.read ? "text-gray-700" : "text-gray-900"}`}>
                          {notification.eventName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {notification.eventLocation} • {notification.distance.toFixed(1)}km
                        </p>
                        <p className="text-xs text-gray-500">
                          🕐 {notification.eventTime} • {notification.eventPrice}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Comment ça marche</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vérification automatique toutes les 30 secondes</li>
              <li>• Seuls les événements dans votre zone sont surveillés</li>
              <li>• Filtrage par catégories sélectionnées</li>
              <li>• Notifications avec son et vibrations</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
