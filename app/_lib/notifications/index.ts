import { sendEmail } from "./email"
import { sendWhatsApp } from "./whatsapp"
import {
  NotificationBookingData,
  getConfirmationEmailTemplate,
  getReminderEmailTemplate,
  getCancellationEmailTemplate,
  getWhatsAppMessageText,
} from "./templates"

export const notifyBookingConfirmation = async (
  data: NotificationBookingData,
) => {
  const emailTemplate = getConfirmationEmailTemplate(data)
  const whatsappText = getWhatsAppMessageText("CONFIRMATION", data)

  const promises: Promise<any>[] = []

  if (data.clientEmail) {
    promises.push(
      sendEmail({
        to: data.clientEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    )
  }

  const phoneTarget = data.clientWhatsapp || data.clientPhone
  if (phoneTarget) {
    promises.push(
      sendWhatsApp({
        to: phoneTarget,
        message: whatsappText,
      }),
    )
  }

  await Promise.allSettled(promises)
}

export const notifyBookingReminder = async (data: NotificationBookingData) => {
  const emailTemplate = getReminderEmailTemplate(data)
  const whatsappText = getWhatsAppMessageText("REMINDER", data)

  const promises: Promise<any>[] = []

  if (data.clientEmail) {
    promises.push(
      sendEmail({
        to: data.clientEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    )
  }

  const phoneTarget = data.clientWhatsapp || data.clientPhone
  if (phoneTarget) {
    promises.push(
      sendWhatsApp({
        to: phoneTarget,
        message: whatsappText,
      }),
    )
  }

  await Promise.allSettled(promises)
}

export const notifyBookingCancellation = async (
  data: NotificationBookingData,
) => {
  const emailTemplate = getCancellationEmailTemplate(data)
  const whatsappText = getWhatsAppMessageText("CANCELLATION", data)

  const promises: Promise<any>[] = []

  if (data.clientEmail) {
    promises.push(
      sendEmail({
        to: data.clientEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    )
  }

  const phoneTarget = data.clientWhatsapp || data.clientPhone
  if (phoneTarget) {
    promises.push(
      sendWhatsApp({
        to: phoneTarget,
        message: whatsappText,
      }),
    )
  }

  await Promise.allSettled(promises)
}
