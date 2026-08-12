import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export interface NotificationBookingData {
  clientName: string
  clientEmail?: string | null
  clientPhone?: string | null
  clientWhatsapp?: string | null
  barbershopName: string
  serviceName: string
  professionalName?: string | null
  date: Date
  cancelledBy?: "client" | "barbershop"
}

export const formatBookingDateTime = (date: Date) => {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export const getConfirmationEmailTemplate = (data: NotificationBookingData) => {
  const formattedDate = formatBookingDateTime(data.date)
  const subject = `Agendamento Confirmado - ${data.barbershopName}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121214; color: #ededed; border-radius: 8px;">
      <h2 style="color: #22c55e; text-align: center;">Agendamento Confirmado! ✂️</h2>
      <p>Olá, <strong>${data.clientName}</strong>,</p>
      <p>Seu horário na barbearia <strong>${data.barbershopName}</strong> foi confirmado com sucesso.</p>
      
      <div style="background-color: #202024; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Serviço:</strong> ${data.serviceName}</p>
        ${data.professionalName ? `<p style="margin: 6px 0;"><strong>Profissional:</strong> ${data.professionalName}</p>` : ""}
        <p style="margin: 6px 0;"><strong>Data e Hora:</strong> ${formattedDate}</p>
      </div>

      <p style="color: #a1a1aa; font-size: 14px;">Caso precise cancelar ou reagendar, acesse o aplicativo BarberZone.</p>
      <p style="text-align: center; color: #71717a; font-size: 12px; margin-top: 30px;">BarberZone - Sistema de Agendamentos</p>
    </div>
  `
  const text = `Olá ${data.clientName}, seu agendamento em ${data.barbershopName} para ${data.serviceName} (${data.professionalName ? `com ${data.professionalName}` : ""}) no dia ${formattedDate} foi confirmado.`

  return { subject, html, text }
}

export const getReminderEmailTemplate = (data: NotificationBookingData) => {
  const formattedDate = formatBookingDateTime(data.date)
  const subject = `Lembrete: Seu horário na ${data.barbershopName} é em breve!`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121214; color: #ededed; border-radius: 8px;">
      <h2 style="color: #eab308; text-align: center;">Lembrete de Agendamento ⏰</h2>
      <p>Olá, <strong>${data.clientName}</strong>,</p>
      <p>Passando para lembrar do seu horário agendado em <strong>${data.barbershopName}</strong>.</p>
      
      <div style="background-color: #202024; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Serviço:</strong> ${data.serviceName}</p>
        ${data.professionalName ? `<p style="margin: 6px 0;"><strong>Profissional:</strong> ${data.professionalName}</p>` : ""}
        <p style="margin: 6px 0;"><strong>Data e Hora:</strong> ${formattedDate}</p>
      </div>

      <p style="color: #a1a1aa; font-size: 14px;">Te esperamos lá! Em caso de imprevistos, cancele com antecedência pelo app.</p>
      <p style="text-align: center; color: #71717a; font-size: 12px; margin-top: 30px;">BarberZone - Sistema de Agendamentos</p>
    </div>
  `
  const text = `Olá ${data.clientName}, lembrete do seu agendamento em ${data.barbershopName} para ${data.serviceName} em ${formattedDate}.`

  return { subject, html, text }
}

export const getCancellationEmailTemplate = (data: NotificationBookingData) => {
  const formattedDate = formatBookingDateTime(data.date)
  const subject = `Agendamento Cancelado - ${data.barbershopName}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121214; color: #ededed; border-radius: 8px;">
      <h2 style="color: #ef4444; text-align: center;">Agendamento Cancelado ❌</h2>
      <p>Olá, <strong>${data.clientName}</strong>,</p>
      <p>Informamos que o seu agendamento em <strong>${data.barbershopName}</strong> foi cancelado${data.cancelledBy === "barbershop" ? " pela barbearia" : " por você"}.</p>
      
      <div style="background-color: #202024; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Serviço:</strong> ${data.serviceName}</p>
        ${data.professionalName ? `<p style="margin: 6px 0;"><strong>Profissional:</strong> ${data.professionalName}</p>` : ""}
        <p style="margin: 6px 0;"><strong>Data e Hora:</strong> ${formattedDate}</p>
      </div>

      <p style="color: #a1a1aa; font-size: 14px;">Você pode realizar um novo agendamento a qualquer momento pelo BarberZone.</p>
      <p style="text-align: center; color: #71717a; font-size: 12px; margin-top: 30px;">BarberZone - Sistema de Agendamentos</p>
    </div>
  `
  const text = `Olá ${data.clientName}, seu agendamento em ${data.barbershopName} para ${data.serviceName} em ${formattedDate} foi cancelado.`

  return { subject, html, text }
}

export const getWhatsAppMessageText = (
  type: "CONFIRMATION" | "REMINDER" | "CANCELLATION",
  data: NotificationBookingData,
) => {
  const formattedDate = formatBookingDateTime(data.date)
  const prof = data.professionalName ? ` com *${data.professionalName}*` : ""

  switch (type) {
    case "CONFIRMATION":
      return `✂️ *BarberZone - Agendamento Confirmado!*\n\nOlá *${data.clientName}*, seu horário na *${data.barbershopName}* foi confirmado!\n\n📋 *Serviço:* ${data.serviceName}${prof}\n📅 *Data:* ${formattedDate}\n\nTe esperamos lá!`
    case "REMINDER":
      return `⏰ *BarberZone - Lembrete!*\n\nOlá *${data.clientName}*, passando para lembrar do seu horário na *${data.barbershopName}* em breve.\n\n📋 *Serviço:* ${data.serviceName}${prof}\n📅 *Data:* ${formattedDate}\n\nQualquer imprevisto, avise-nos!`
    case "CANCELLATION":
      return `❌ *BarberZone - Agendamento Cancelado*\n\nOlá *${data.clientName}*, seu agendamento na *${data.barbershopName}* para ${formattedDate} foi cancelado.`
    default:
      return `BarberZone: Atualização sobre seu agendamento em ${data.barbershopName} (${formattedDate}).`
  }
}
