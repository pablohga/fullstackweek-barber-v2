import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailParams) => {
  if (!to) return

  if (
    !resend ||
    !resendApiKey ||
    resendApiKey === "re_mock_key_for_development"
  ) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject} | Body: ${text}`)
    return
  }

  try {
    const data = await resend.emails.send({
      from: "VizUAU <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text,
    })
    console.log("[Email Sent Successfully]", data)
  } catch (error) {
    console.error("[Email Send Error]", error)
    // Non-blocking: we do not rethrow so application flow continues smoothly
  }
}
