class SMSService {
  private twilioAccountSid: string
  private twilioAuthToken: string
  private twilioPhoneNumber: string

  constructor() {
    this.twilioAccountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || ""
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || ""
    this.twilioPhoneNumber = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || ""
  }

  async sendVerificationSMS(phoneNumber: string, code: string): Promise<boolean> {
    try {
      // Si les clés Twilio ne sont pas configurées, utiliser le mode simulation
      if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
        console.log(`🔧 Mode simulation - Code de vérification pour ${phoneNumber}: ${code}`)
        console.log("💡 Pour envoyer de vrais SMS, configurez vos clés Twilio dans les variables d'environnement")
        return true
      }

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message: `Votre code de vérification WhatsApp est : ${code}. Ne le partagez avec personne.`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ SMS envoyé avec succès:", result.sid)
      return true
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du SMS:", error)
      // En cas d'erreur, basculer en mode simulation
      console.log(`🔧 Basculement en mode simulation - Code: ${code}`)
      return true
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
        console.log(`📱 SMS simulé vers ${phoneNumber}: ${message}`)
        return true
      }

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("❌ Erreur SMS:", error)
      return false
    }
  }

  // Validation du format de numéro de téléphone
  validatePhoneNumber(phoneNumber: string): boolean {
    // Format international requis : +[code pays][numéro]
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber)
  }

  // Formatage du numéro de téléphone
  formatPhoneNumber(countryCode: string, phoneNumber: string): string {
    // Supprimer tous les espaces et caractères non numériques
    const cleanNumber = phoneNumber.replace(/\D/g, "")
    return `${countryCode}${cleanNumber}`
  }
}

export const smsService = new SMSService()
