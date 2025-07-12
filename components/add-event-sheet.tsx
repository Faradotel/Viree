"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Camera, MapPin, Clock, Euro } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

const categories = [
  { id: "music", icon: "🎵", label: "Musique", color: "#8b5cf6" },
  { id: "social", icon: "🍻", label: "Bar/Soirée", color: "#3b82f6" },
  { id: "art", icon: "🎨", label: "Art/Expo", color: "#ec4899" },
  { id: "coffee", icon: "☕", label: "Café", color: "#f59e0b" },
]

interface AddEventSheetProps {
  open: boolean
  onClose: () => void
  userLocation: { lat: number; lng: number } | null
}

export function AddEventSheet({ open, onClose, userLocation }: AddEventSheetProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    category: "",
    time: "",
    price: "",
    description: "",
    image: null as File | null,
  })

  const handleNext = () => {
    if (step === 1 && formData.name && formData.location && formData.category) {
      hapticFeedback.success()
      setStep(2)
    }
  }

  const handleBack = () => {
    hapticFeedback.tap()
    setStep(1)
  }

  const handleSubmit = () => {
    hapticFeedback.success()
    // Here you would submit to your backend
    console.log("Submitting event:", formData)
    onClose()
    setStep(1)
    setFormData({
      name: "",
      location: "",
      category: "",
      time: "",
      price: "",
      description: "",
      image: null,
    })
  }

  const handleCategorySelect = (categoryId: string) => {
    hapticFeedback.selection()
    setFormData({ ...formData, category: categoryId })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      hapticFeedback.success()
      setFormData({ ...formData, image: file })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold text-center">
            {step === 1 ? "Nouvel Événement" : "Détails"}
          </SheetTitle>
          <div className="flex justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step === 1 ? "bg-purple-500" : "bg-gray-300"}`} />
            <div className={`w-3 h-3 rounded-full ${step === 2 ? "bg-purple-500" : "bg-gray-300"}`} />
          </div>
        </SheetHeader>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">
                Nom de l'événement *
              </Label>
              <Input
                id="name"
                placeholder="Ex: Apéro DJ Canal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 text-lg"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-lg font-semibold">
                Lieu *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Ex: Canal Saint-Martin"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12 text-lg pl-12"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Catégorie *</Label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    variant={formData.category === category.id ? "default" : "outline"}
                    className={`h-16 flex flex-col gap-1 ${
                      formData.category === category.id ? "border-2 shadow-lg" : "border border-gray-200"
                    }`}
                    style={{
                      borderColor: formData.category === category.id ? category.color : undefined,
                      backgroundColor: formData.category === category.id ? `${category.color}15` : undefined,
                    }}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-sm">{category.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={!formData.name || !formData.location || !formData.category}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Continuer
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-lg font-semibold">
                Horaire
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="time"
                  placeholder="Ex: 18h30"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="h-12 text-lg pl-12"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-lg font-semibold">
                Prix
              </Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="price"
                  placeholder="Ex: Gratuit ou 10€"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-12 text-lg pl-12"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre événement..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px] text-lg"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Photo (optionnelle)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{formData.image ? formData.image.name : "Ajouter une photo"}</p>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleBack} variant="outline" className="flex-1 h-12 text-lg bg-transparent">
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Publier
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
