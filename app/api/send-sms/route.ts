import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    // Validation des données
    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "Numéro de téléphone et message requis" }, { status: 400 })
    }

    // Configuration Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.log("⚠️ Variables d'environnement Twilio manquantes")
      return NextResponse.json({ error: "Configuration SMS manquante" }, { status: 500 })
    }

    // Créer l'authentification Twilio
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    // Envoyer le SMS via l'API Twilio
    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: twilioPhoneNumber,
        To: phoneNumber,
        Body: message,
      }),
    })

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json()
      console.error("❌ Erreur Twilio:", errorData)
      return NextResponse.json({ error: "Échec de l'envoi du SMS" }, { status: 500 })
    }

    const result = await twilioResponse.json()
    console.log("✅ SMS envoyé:", result.sid)

    return NextResponse.json({
      success: true,
      sid: result.sid,
      status: result.status,
    })
  } catch (error) {
    console.error("❌ Erreur API SMS:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
