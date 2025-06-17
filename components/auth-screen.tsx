"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, ArrowLeft, Smartphone, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { smsService } from "@/lib/sms-service"
import React from "react"

interface AuthScreenProps {
  onLogin: (user: any) => void
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [step, setStep] = useState<"phone" | "verification">("phone")
  const [userName, setUserName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+221")
  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Utiliser useRef pour éviter les re-créations
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Générer un code de vérification aléatoire
  const generateVerificationCode = useCallback(() => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }, [])

  // Fonction pour démarrer le compte à rebours
  const startCountdown = useCallback(() => {
    // Nettoyer le timer existant
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    setCountdown(60)
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Envoyer le SMS de vérification
  const sendSMS = useCallback(async () => {
    setIsLoading(true)

    try {
      // Générer le code
      const code = generateVerificationCode()
      setSentCode(code)

      // Formater le numéro de téléphone
      const fullPhoneNumber = smsService.formatPhoneNumber(countryCode, phoneNumber)

      // Valider le numéro
      if (!smsService.validatePhoneNumber(fullPhoneNumber)) {
        alert("Format de numéro de téléphone invalide")
        setIsLoading(false)
        return
      }

      // Envoyer le SMS
      const success = await smsService.sendVerificationSMS(fullPhoneNumber, code)

      if (success) {
        setStep("verification")
        startCountdown()
      } else {
        alert("Erreur lors de l'envoi du SMS. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'envoi du SMS. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }, [countryCode, phoneNumber, generateVerificationCode, startCountdown])

  const handlePhoneSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!userName.trim() || !phoneNumber.trim()) {
        alert("Veuillez remplir tous les champs")
        return
      }

      if (phoneNumber.length < 8) {
        alert("Numéro de téléphone invalide")
        return
      }

      await sendSMS()
    },
    [userName, phoneNumber, sendSMS],
  )

  const handleVerificationSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (verificationCode !== sentCode) {
        alert("Code de vérification incorrect")
        return
      }

      const user = {
        nom: userName.trim(),
        telephone: smsService.formatPhoneNumber(countryCode, phoneNumber.trim()),
        description: "Salut ! J'utilise WhatsApp.",
        dateInscription: new Date().toLocaleDateString("fr-FR"),
        isOnline: true,
      }

      onLogin(user)
    },
    [verificationCode, sentCode, userName, countryCode, phoneNumber, onLogin],
  )

  const handleResendCode = useCallback(async () => {
    if (countdown > 0) return
    await sendSMS()
  }, [countdown, sendSMS])

  const handleBack = useCallback(() => {
    setStep("phone")
    setVerificationCode("")
    setSentCode("")
    setCountdown(0)

    // Nettoyer le timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }, [])

  // Nettoyer le timer au démontage du composant
  React.useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-[#111b21]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#202c33] border-[#2a3942] shadow-xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center animate-pulse-slow">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold text-white"
            >
              WhatsApp
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-400"
            >
              {step === "phone" ? "Connectez-vous pour commencer" : "Vérification du numéro"}
            </motion.p>
          </CardHeader>

          <CardContent>
            {step === "phone" ? (
              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-4"
              >
                {/* Indicateur de mode SMS */}
                <div className="flex items-center justify-center space-x-2 mb-4 p-3 bg-[#2a3942] rounded-lg">
                  <Shield className="w-4 h-4 text-[#00a884]" />
                  <span className="text-sm text-gray-300">
                    {process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID ? "SMS réels activés" : "Mode simulation"}
                  </span>
                </div>

                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">
                    Nom d'utilisateur
                  </label>
                  <Input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Votre nom"
                    className="bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="flex">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-2 border border-[#2a3942] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#00a884] bg-[#2a3942] text-white"
                    >
                      <option value="+221">🇸🇳 +221</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+212">🇲🇦 +212</option>
                      <option value="+213">🇩🇿 +213</option>
                      <option value="+216">🇹🇳 +216</option>
                    </select>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Votre numéro"
                      className="rounded-l-none border-l-0 bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    <Smartphone className="w-3 h-3 inline mr-1" />
                    Format international requis (ex: 771234567)
                  </p>
                </div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="submit" className="w-full gradient-button" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Envoi du SMS...
                      </div>
                    ) : (
                      "Envoyer le code SMS"
                    )}
                  </Button>
                </motion.div>

                {/* Informations sur la configuration */}
                {!process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <p className="text-xs text-yellow-400">
                      💡 <strong>Mode simulation :</strong> Le code sera affiché dans la console. Pour recevoir de vrais
                      SMS, configurez Twilio.
                    </p>
                  </div>
                )}
              </motion.form>
            ) : (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-gray-300 hover:text-white hover:bg-[#2a3942] mr-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-300 text-sm">Retour</span>
                </div>

                <div className="text-center mb-6">
                  <p className="text-gray-300 text-sm mb-2">
                    {process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID
                      ? "Nous avons envoyé un code de vérification par SMS au"
                      : "Code de vérification généré pour"}
                  </p>
                  <p className="text-white font-medium">
                    {countryCode} {phoneNumber}
                  </p>
                  {!process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID && (
                    <p className="text-yellow-400 text-xs mt-2 p-2 bg-yellow-900/20 rounded">
                      📱 Code de test : <strong>{sentCode}</strong>
                    </p>
                  )}
                </div>

                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-300 mb-1">
                      Code de vérification
                    </label>
                    <Input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Entrez le code à 6 chiffres"
                      maxLength={6}
                      className="bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884] text-center text-lg tracking-widest"
                      required
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button type="submit" className="w-full gradient-button">
                      Vérifier le code
                    </Button>
                  </motion.div>
                </form>

                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Vous n'avez pas reçu le code ?</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-[#00a884] hover:text-[#008069] hover:bg-[#2a3942]"
                  >
                    {countdown > 0 ? `Renvoyer dans ${countdown}s` : "Renvoyer le code"}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
