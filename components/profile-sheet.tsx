"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Settings, Users, Heart, Calendar, X, Plus } from "lucide-react"

const user = {
  name: "Alex",
  avatar: "A",
  interests: ["Musique", "Art", "Café"],
  friends: 12,
  savedEvents: 5,
  attendedEvents: 23,
}

const friendsActivity = [
  { name: "Paul", activity: "va à Apéro DJ Canal", time: "maintenant" },
  { name: "Marie", activity: "a sauvegardé Quiz Night", time: "il y a 2h" },
  { name: "Sophie", activity: "va à Expo Street Art", time: "ce soir" },
  { name: "Tom", activity: "a participé à Coffee Cupping", time: "hier" },
]

interface ProfileSheetProps {
  open: boolean
  onClose: () => void
}

export function ProfileSheet({ open, onClose }: ProfileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md z-[9999] bg-white">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900">Profil</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">Membre depuis mars 2024</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{user.friends}</div>
              <div className="text-sm text-gray-600">Amis</div>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{user.savedEvents}</div>
              <div className="text-sm text-gray-600">Sauvegardés</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{user.attendedEvents}</div>
              <div className="text-sm text-gray-600">Participés</div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                  {interest}
                </Badge>
              ))}
              <Button variant="outline" size="sm" className="h-6 px-2 bg-transparent">
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Friends Activity */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Activité des amis</h3>
            <div className="space-y-3">
              {friendsActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {activity.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.name}</span> {activity.activity}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="w-4 h-4 mr-3" />
              Gérer mes amis
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Heart className="w-4 h-4 mr-3" />
              Événements sauvegardés
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Calendar className="w-4 h-4 mr-3" />
              Mon historique
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Settings className="w-4 h-4 mr-3" />
              Paramètres
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
