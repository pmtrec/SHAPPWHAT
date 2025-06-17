"use client"

import { useState } from "react"
import { MessageCircle, Users, Settings, Phone, Archive, Star, Briefcase, Globe, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface SidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
  user: any
  onLogout: () => void
}

export function Sidebar({ currentSection, onSectionChange, user, onLogout }: SidebarProps) {
  const [notificationCount, setNotificationCount] = useState(39)

  const getUserInitials = (name: string) => {
    const parts = name.split(" ")
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase()
  }

  const sidebarItems = [
    {
      id: "chats",
      icon: MessageCircle,
      label: "Discussions",
      hasNotification: true,
      notificationCount: notificationCount,
    },
    {
      id: "status",
      icon: Bell,
      label: "Statuts",
      hasNotification: false,
    },
    {
      id: "calls",
      icon: Phone,
      label: "Appels",
      hasNotification: false,
    },
    {
      id: "groups",
      icon: Users,
      label: "Groupes",
      hasNotification: false,
    },
    {
      id: "communities",
      icon: Globe,
      label: "Communautés",
      hasNotification: false,
    },
    {
      id: "business",
      icon: Briefcase,
      label: "Business",
      hasNotification: false,
    },
    {
      id: "archived",
      icon: Archive,
      label: "Archivées",
      hasNotification: false,
    },
    {
      id: "starred",
      icon: Star,
      label: "Messages favoris",
      hasNotification: false,
    },
  ]

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "4rem", opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-16 bg-[#202c33] flex flex-col items-center py-4 space-y-4 border-r border-gray-700"
    >
      {sidebarItems.map((item) => (
        <div key={item.id} className="relative group">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`w-12 h-12 p-0 rounded-lg transition-all duration-300 ${
                currentSection === item.id
                  ? "bg-[#00a884] text-white hover:bg-[#008069]"
                  : "text-gray-300 hover:bg-[#2a3942] hover:text-white"
              }`}
              onClick={() => onSectionChange(item.id)}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </Button>
          </motion.div>

          {item.hasNotification && item.notificationCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="absolute -top-1 -right-1 bg-[#25d366] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {item.notificationCount > 99 ? "99+" : item.notificationCount}
            </motion.div>
          )}

          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        </div>
      ))}

      <div className="flex-1" />

      {/* Paramètres */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="group relative">
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 rounded-lg text-gray-300 hover:bg-[#2a3942] hover:text-white transition-all duration-300"
          onClick={() => onSectionChange("settings")}
          title="Paramètres"
        >
          <Settings className="w-6 h-6" />
        </Button>
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Paramètres
        </div>
      </motion.div>

      {/* Avatar utilisateur */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer group relative"
        onClick={onLogout}
        title="Déconnexion"
      >
        <Avatar className="w-10 h-10 border-2 border-[#00a884]">
          {user?.avatar ? (
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user?.nom || "User"} />
          ) : (
            <AvatarFallback className="text-white font-bold text-sm bg-gradient-to-br from-[#00a884] to-[#008069]">
              {getUserInitials(user?.nom || "User")}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Déconnexion
        </div>
      </motion.div>
    </motion.div>
  )
}
