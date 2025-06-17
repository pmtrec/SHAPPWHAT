"use client"

import { useState, useEffect } from "react"
import { AuthScreen } from "@/components/auth-screen"
import { MainApp } from "@/components/main-app"
import { motion } from "framer-motion"

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    localStorage.setItem("currentUser", JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111b21]">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400"
          >
            Chargement...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111b21]">
      {currentUser ? <MainApp user={currentUser} onLogout={handleLogout} /> : <AuthScreen onLogin={handleLogin} />}
    </div>
  )
}
