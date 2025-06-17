"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, MapPin, Navigation } from "lucide-react"
import { motion } from "framer-motion"

interface LocationPickerProps {
  onLocationSelect: (location: any) => void
  onClose: () => void
}

export function LocationPicker({ onLocationSelect, onClose }: LocationPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          }
          onLocationSelect(location)
          setIsGettingLocation(false)
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error)
          setIsGettingLocation(false)
          // Utiliser une position par défaut (Dakar)
          const defaultLocation = {
            latitude: 14.6928,
            longitude: -17.4467,
            accuracy: 1000,
            timestamp: Date.now(),
            isDefault: true,
          }
          onLocationSelect(defaultLocation)
        },
      )
    } else {
      setIsGettingLocation(false)
      alert("La géolocalisation n'est pas supportée par ce navigateur")
    }
  }

  const predefinedLocations = [
    { name: "Dakar, Sénégal", latitude: 14.6928, longitude: -17.4467 },
    { name: "Place de l'Indépendance", latitude: 14.6937, longitude: -17.4441 },
    { name: "Aéroport LSS", latitude: 14.7397, longitude: -17.4902 },
    { name: "Université Cheikh Anta Diop", latitude: 14.6692, longitude: -17.4731 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-[#202c33] rounded-lg shadow-xl border border-gray-700 w-96 max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-medium">Partager la position</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <Button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full bg-[#00a884] hover:bg-[#008069] text-white"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isGettingLocation ? "Localisation..." : "Ma position actuelle"}
          </Button>

          <div>
            <h4 className="text-gray-300 text-sm font-medium mb-2">Lieux populaires</h4>
            <div className="space-y-2">
              {predefinedLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => onLocationSelect(location)}
                  className="w-full text-left p-2 hover:bg-[#2a3942] rounded transition-colors"
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-[#00a884] mr-2" />
                    <span className="text-white text-sm">{location.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
