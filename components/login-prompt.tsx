"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Heart, Users, User } from "lucide-react"
import Link from "next/link"

interface LoginPromptProps {
  open: boolean
  onClose: () => void
  feature: "favorites" | "friends" | "profile"
}

const featureConfig = {
  favorites: {
    icon: Heart,
    title: "Sauvegardez vos événements préférés",
    description: "Créez votre collection personnelle d'événements et retrouvez-les facilement dans votre agenda.",
    benefits: [
      "💝 Sauvegardez vos événements favoris",
      "📅 Synchronisez avec votre calendrier",
      "🔔 Recevez des rappels personnalisés",
    ],
  },
  friends: {
    icon: Users,
    title: "Découvrez où sont vos amis",
    description: "Partagez vos sorties avec vos amis et découvrez les événements qu'ils prévoient d'aller.",
    benefits: [
      "👥 Voir les activités de vos amis",
      "📍 Partager votre localisation",
      "🎉 Rejoindre des événements ensemble",
    ],
  },
  profile: {
    icon: User,
    title: "Personnalisez votre expérience",
    description: "Créez votre profil pour accéder à toutes les fonctionnalités sociales de Virée.",
    benefits: ["⚙️ Personnaliser vos préférences", "🏆 Suivre vos sorties", "🌟 Obtenir des recommandations"],
  },
}

export function LoginPrompt({ open, onClose, feature }: LoginPromptProps) {
  const config = featureConfig[feature]
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">{config.title}</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {config.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col space-y-2">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full text-gray-500">
            Continuer sans compte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
