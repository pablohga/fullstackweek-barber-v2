interface SendWhatsAppParams {
  to: string | null | undefined
  message: string
}

export const sendWhatsApp = async ({ to, message }: SendWhatsAppParams) => {
  if (!to) return

  const apiUrl = process.env.WHATSAPP_API_URL
  const apiKey = process.env.WHATSAPP_API_KEY

  // Clean phone number (digits only)
  const cleanPhone = to.replace(/\D/g, "")
  if (!cleanPhone) return

  if (!apiUrl || !apiKey) {
    console.log(`[WhatsApp Mock] To: ${cleanPhone} | Message:\n${message}`)
    return
  }

  try {
    // Generic abstraction for WhatsApp APIs (e.g. Z-API / Evolution / Meta Cloud)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        apikey: apiKey, // Support common providers like Z-API
      },
      body: JSON.stringify({
        phone: cleanPhone,
        message,
        number: cleanPhone,
        text: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[WhatsApp API Error]", response.status, errorText)
    } else {
      console.log("[WhatsApp Sent Successfully to]", cleanPhone)
    }
  } catch (error) {
    console.error("[WhatsApp Send Error]", error)
    // Non-blocking: fail silently to not break booking actions
  }
}
