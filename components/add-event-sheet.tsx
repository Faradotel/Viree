"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, Euro, Users, Camera, X } from "lucide-react"
import { hapticFeedback } from "@/utils/haptics"

interface AddEventSheetProps {
  open: boolean
  onClose: () => void
}

export function AddEventSheet({ open, onClose }: AddEventSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    time: "",
    price: "",
    category: "",
    maxAttendees: "",
  })

  const handleClose = () => {
    hapticFeedback.sheetClose()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    hapticFeedback.press()
    console.log("Event created:", formData)
    // Here you would typically send the data to your backend
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="flex-row items-center justify-between pb-4 border-b">
            <SheetTitle className="text-xl font-bold">Créer un événement</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-auto py-6 space-y-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nom de l'événement *
              </Label>
              <Input
                id="name"
                placeholder="Ex: Apéro jazz au bord de Seine"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="h-12"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre événement..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Lieu *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="location"
                  placeholder="Adresse ou nom du lieu"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">
                  Heure *
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">🎵 Musique</SelectItem>
                    <SelectItem value="bar">🍻 Bar/Soirée</SelectItem>
                    <SelectItem value="art">🎨 Art/Expo</SelectItem>
                    <SelectItem value="cafe">☕ Café</SelectItem>
                    <SelectItem value="sport">⚽ Sport</SelectItem>
                    <SelectItem value="food">🍽️ Restaurant</SelectItem>
                    <SelectItem value="culture">📚 Culture</SelectItem>
                    <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Prix
                </Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="price"
                    placeholder="Gratuit ou prix en €"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>

            {/* Max Attendees */}
            <div className="space-y-2">
              <Label htmlFor="maxAttendees" className="text-sm font-medium">
                Nombre maximum de participants
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="maxAttendees"
                  type="number"
                  placeholder="Illimité si vide"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Photo de l'événement</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Cliquez pour ajouter une photo</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG jusqu'à 5MB</p>
              </div>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Créer l'événement
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
