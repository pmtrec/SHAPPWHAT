"use client"

import { useState } from "react"
import { Phone, Video, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Call {
  id: string
  contactId: string
  contactName: string
  type: "voice" | "video"
  direction: "incoming" | "outgoing"
  status: "completed" | "missed" | "declined"
  timestamp: string
  duration: number
}

interface CallsViewProps {
  user: any
  contacts: any[]
  calls: Call[]
  setCalls: (calls: Call[]) => void
}

export function CallsView({ user, contacts, calls, setCalls }: CallsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCall, setActiveCall] = useState<any>(null)

  const filteredCalls = calls.filter((call) => call.contactName.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "Non répondu"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 48) {
      return "Hier"
    } else {
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    }
  }

  const getCallIcon = (call: Call) => {
    if (call.status === "missed") {
      return <PhoneMissed className="w-4 h-4 text-red-500" />
    }
    if (call.direction === "incoming") {
      return <PhoneIncoming className="w-4 h-4 text-green-500" />
    }
    return <PhoneOutgoing className="w-4 h-4 text-green-500" />
  }

  const handleCall = (contactId: string, type: "voice" | "video") => {
    const contact = contacts.find((c) => c.id === contactId)
    if (!contact) return

    const newCall: Call = {
      id: `call_${Date.now()}`,
      contactId,
      contactName: contact.nom,
      type,
      direction: "outgoing",
      status: "completed",
      timestamp: new Date().toISOString(),
      duration: Math.floor(Math.random() * 300) + 30, // Random duration between 30-330 seconds
    }

    setCalls([newCall, ...calls])
    setActiveCall({ ...newCall, contact })

    // Simulate call ending after a few seconds
    setTimeout(() => {
      setActiveCall(null)
    }, 3000)
  }

  const CallItem = ({ call }: { call: Call }) => {
    const contact = contacts.find((c) => c.id === call.contactId)

    return (
      <div className="flex items-center justify-between p-3 hover:bg-[#2a3942] rounded-lg transition-colors">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={contact?.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-[#00a884] text-white">
              {call.contactName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {getCallIcon(call)}
              <h3 className="font-medium text-white">{call.contactName}</h3>
            </div>
            <p className="text-sm text-gray-400">{formatTime(call.timestamp)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">{formatDuration(call.duration)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCall(call.contactId, call.type)}
            className="text-[#00a884] hover:bg-[#00a884]/10"
          >
            {call.type === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    )
  }

  const ContactItem = ({ contact }: { contact: any }) => (
    <div className="flex items-center justify-between p-3 hover:bg-[#2a3942] rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-[#00a884] text-white">{contact.nom.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-white">{contact.nom}</h3>
          <p className="text-sm text-gray-400">{contact.telephone}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCall(contact.id, "voice")}
          className="text-[#00a884] hover:bg-[#00a884]/10"
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCall(contact.id, "video")}
          className="text-[#00a884] hover:bg-[#00a884]/10"
        >
          <Video className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  if (activeCall) {
    return (
      <div className="flex-1 bg-[#0b141a] flex items-center justify-center">
        <div className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4">
            <AvatarImage src={activeCall.contact?.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-[#00a884] text-white text-4xl">
              {activeCall.contactName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-light text-white mb-2">{activeCall.contactName}</h2>
          <p className="text-gray-400 mb-8">
            {activeCall.type === "video" ? "Appel vidéo" : "Appel vocal"} en cours...
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setActiveCall(null)}
              className="rounded-full w-16 h-16"
            >
              <PhoneCall className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#0b141a] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#2a3942]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-light text-white">Appels</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#2a3942] border-[#3b4a54]">
              <DropdownMenuItem className="text-white hover:bg-[#3b4a54]">
                Effacer l'historique des appels
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#3b4a54]">Paramètres d'appel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#2a3942] border-[#3b4a54] text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recent" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-[#2a3942] mx-4 mt-4">
          <TabsTrigger value="recent" className="data-[state=active]:bg-[#00a884] data-[state=active]:text-white">
            Récents
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-[#00a884] data-[state=active]:text-white">
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-8">
              <PhoneCall className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucun appel récent</p>
            </div>
          ) : (
            filteredCalls.map((call) => <CallItem key={call.id} call={call} />)
          )}
        </TabsContent>

        <TabsContent value="contacts" className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts
            .filter((contact) => contact.nom.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((contact) => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
