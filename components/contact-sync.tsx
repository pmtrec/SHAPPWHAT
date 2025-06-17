"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Users, Shield, ArrowLeft, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface ContactSyncProps {
  onSync: () => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function ContactSync({ onSync, onCancel, isLoading }: ContactSyncProps) {
  const [step, setStep] = useState<"permission" | "syncing" | "complete">("permission")
  const [syncedCount, setSyncedCount] = useState(0)

  const handleSync = async () => {
    setStep("syncing")
    try {
      await onSync()
      setSyncedCount(Math.floor(Math.random() * 50) + 10) // Simulation
      setStep("complete")
      setTimeout(() => {
        onCancel()
      }, 2000)
    } catch (error) {
      console.error("Erreur de synchronisation:", error)
      setStep("permission")
    }
  }

  return (
    <div className="flex-1 bg-[#0b141a] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
        <Card className="bg-[#202c33] border-[#2a3942]">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-300">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-white">Synchroniser les contacts</CardTitle>
              <div></div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "permission" && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 mx-auto bg-[#00a884] rounded-full flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Synchroniser vos contacts</h3>
                  <p className="text-gray-400 text-sm">
                    WhatsApp va accéder à vos contacts pour vous aider à trouver vos amis qui utilisent WhatsApp.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-300">
                    <Shield className="w-5 h-5 text-[#00a884]" />
                    <span>Vos contacts sont chiffrés et sécurisés</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-300">
                    <Users className="w-5 h-5 text-[#00a884]" />
                    <span>Trouvez facilement vos amis sur WhatsApp</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleSync} className="w-full bg-[#00a884] hover:bg-[#008069]" disabled={isLoading}>
                    {isLoading ? "Synchronisation..." : "Synchroniser les contacts"}
                  </Button>
                  <Button variant="ghost" onClick={onCancel} className="w-full text-gray-300">
                    Ignorer pour le moment
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "syncing" && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 mx-auto bg-[#00a884] rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Smartphone className="w-12 h-12 text-white" />
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Synchronisation en cours...</h3>
                  <p className="text-gray-400 text-sm">Recherche de vos contacts sur WhatsApp</p>
                </div>

                <div className="w-full bg-[#2a3942] rounded-full h-2">
                  <motion.div
                    className="bg-[#00a884] h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </motion.div>
            )}

            {step === "complete" && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 mx-auto bg-[#00a884] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Synchronisation terminée !</h3>
                  <p className="text-gray-400 text-sm">{syncedCount} contacts trouvés sur WhatsApp</p>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[#00a884] text-2xl font-bold"
                >
                  ✓
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
