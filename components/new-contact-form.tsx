"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewContactFormProps {
  contacts: any[]
  onAddContact: (contact: any) => Promise<any>
  onBack: () => void
}

export function NewContactForm({ contacts, onAddContact, onBack }: NewContactFormProps) {
  const [name, setName] = useState("")
  const [telephone, setTelephone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!name.trim() || !telephone.trim()) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" })
      return
    }

    const telExists = contacts.some((c) => c.telephone === telephone)
    if (telExists) {
      setMessage({ type: "error", text: "Ce numéro existe déjà dans vos contacts." })
      return
    }

    setIsLoading(true)

    try {
      // Gérer les noms en double
      const regex = new RegExp(`^${name}(\\d+)?$`)
      const sameNameContacts = contacts.filter((c) => regex.test(c.nom))

      let contactName = name
      if (sameNameContacts.length > 0) {
        let maxNumber = 1
        sameNameContacts.forEach((contact) => {
          const match = contact.nom.match(new RegExp(`^${name}(\\d+)?$`))
          if (match && match[1]) {
            const num = Number.parseInt(match[1])
            if (num > maxNumber) maxNumber = num
          }
        })
        contactName = `${name}${maxNumber + 1}`
      }

      const contactData = {
        nom: contactName,
        telephone: telephone,
      }

      await onAddContact(contactData)

      setMessage({ type: "success", text: `Contact ajouté comme ${contactName}` })
      setName("")
      setTelephone("")

      // Retourner automatiquement après 2 secondes
      setTimeout(() => {
        onBack()
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      setMessage({ type: "error", text: "Erreur lors de l'ajout du contact" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-[#111b21] text-white h-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 text-gray-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold text-white">Nouveau contact</h2>
      </div>

      <Card className="bg-[#202c33] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Ajouter un contact</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div
              className={`flex items-center p-3 rounded-lg mb-4 ${
                message.type === "success" ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium mb-1 text-gray-300">
                Nom
              </label>
              <Input
                id="contactName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du contact"
                className="bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="contactTel" className="block text-sm font-medium mb-1 text-gray-300">
                Téléphone
              </label>
              <Input
                id="contactTel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Numéro de téléphone"
                className="bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-[#00a884] hover:bg-[#008069] text-white" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Ajout en cours...
                </div>
              ) : (
                "Ajouter le contact"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
