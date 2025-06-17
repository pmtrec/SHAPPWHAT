"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Smartphone, Monitor, RefreshCw, Download } from "lucide-react"
import { motion } from "framer-motion"

interface QRCodeViewProps {
  onClose: () => void
}

export function QRCodeView({ onClose }: QRCodeViewProps) {
  const [qrCode, setQrCode] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [countdown, setCountdown] = useState(30)

  // Générer un QR code simulé
  useEffect(() => {
    const generateQR = () => {
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      setQrCode(`whatsapp://web/${timestamp}/${randomString}`)
    }

    generateQR()
    const interval = setInterval(generateQR, 30000) // Renouveler toutes les 30s

    return () => clearInterval(interval)
  }, [])

  // Countdown pour le renouvellement
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Simuler une connexion après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true)
      setTimeout(onClose, 2000)
    }, 10000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleRefresh = () => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    setQrCode(`whatsapp://web/${timestamp}/${randomString}`)
    setCountdown(30)
  }

  const handleDownload = () => {
    // Simuler le téléchargement du QR code
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (ctx) {
      canvas.width = 256
      canvas.height = 256
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 256, 256)
      ctx.fillStyle = "#000000"
      ctx.font = "12px Arial"
      ctx.fillText("QR Code WhatsApp", 10, 20)

      const link = document.createElement("a")
      link.download = "whatsapp-qr.png"
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  if (isConnected) {
    return (
      <div className="flex-1 bg-[#0b141a] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-[#00a884] rounded-full flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
              ✓
            </motion.div>
          </div>
          <h3 className="text-xl font-light text-gray-300 mb-2">Connecté !</h3>
          <p className="text-gray-400">WhatsApp Web est maintenant connecté</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#0b141a] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl">
        <Card className="bg-[#202c33] border-[#2a3942]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">WhatsApp Web</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-300">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-64 h-64 mx-auto bg-white rounded-lg p-4 flex items-center justify-center">
                    {/* QR Code simulé */}
                    <div className="w-full h-full bg-black relative">
                      <div className="absolute inset-2 bg-white">
                        <div className="grid grid-cols-8 gap-1 h-full">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div key={i} className={`${Math.random() > 0.5 ? "bg-black" : "bg-white"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#202c33] px-3 py-1 rounded-full">
                    <span className="text-xs text-gray-400">Renouvellement dans {countdown}s</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-gray-300 hover:text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownload} className="text-gray-300 hover:text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Utiliser WhatsApp sur votre ordinateur</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Ouvrez WhatsApp sur votre téléphone</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">
                          Appuyez sur <strong>Menu</strong> ou <strong>Paramètres</strong> et sélectionnez{" "}
                          <strong>Appareils liés</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">
                          Pointez votre téléphone vers cet écran pour scanner le code QR
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2a3942] rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Monitor className="w-5 h-5 text-[#00a884]" />
                    <span className="text-white font-medium">Gardez votre téléphone connecté</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    WhatsApp se connecte à votre téléphone pour synchroniser les messages. Pour réduire l'utilisation
                    des données, connectez votre téléphone au Wi-Fi.
                  </p>
                </div>

                <div className="bg-[#2a3942] rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Smartphone className="w-5 h-5 text-[#00a884]" />
                    <span className="text-white font-medium">Appareils multiples</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Vous pouvez maintenant utiliser WhatsApp sur jusqu'à 4 appareils liés et 1 téléphone en même temps.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
