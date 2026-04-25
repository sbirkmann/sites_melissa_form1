'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitLead(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const imageNumbersRaw = formData.getAll('imageNumber') as string[]
  const imageNumbers = imageNumbersRaw.filter(val => val.trim() !== '').join(', ')
  const notes = formData.get('notes') as string || ''

  if (!name || !email) {
    return { error: 'Bitte fülle alle Felder aus.' }
  }

  try {
    await prisma.lead.create({
      data: { 
        name, 
        email,
        imageNumbers: imageNumbers || null,
        notes: notes || null
      },
    })
    return { success: true }
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { error: 'Diese E-Mail ist bereits registriert.' }
    }
    return { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.' }
  }
}

export async function deleteLead(id: number) {
  try {
    await prisma.lead.delete({ where: { id } })
    revalidatePath('/admin')
    return { success: true }
  } catch (e: any) {
    return { error: 'Fehler beim Löschen des Eintrags.' }
  }
}

export async function createOrder(data: { amount: number, firstName: string, lastName: string, email: string, imageNumbers: string, notes: string, paymentMethod: string }) {
  try {
    const order = await prisma.order.create({
      data: {
        amount: data.amount,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        imageNumbers: data.imageNumbers || null,
        notes: data.notes || null,
        paymentMethod: data.paymentMethod,
        status: data.paymentMethod === 'bar' ? 'paid' : 'pending',
      }
    })

    // Sofort E-Mail senden bei Barzahlung
    if (data.paymentMethod === 'bar') {
      await sendOrderConfirmationEmail(order.id)
    }

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error('Create Order Error:', error)
    return { success: false, error: 'Fehler beim Erstellen der Bestellung: ' + (error.message || String(error)) }
  }
}

export async function checkOrderStatus(orderId: number) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    return { status: order?.status }
  } catch (e) {
    return { error: 'Fehler beim Abrufen des Status.' }
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    // E-Mail senden wenn Zahlung bestätigt
    if (status === 'paid') {
      await sendOrderConfirmationEmail(orderId)
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    return { error: 'Fehler beim Aktualisieren des Status.' }
  }
}

export async function deleteOrder(id: number) {
  try {
    await prisma.order.delete({ where: { id } })
    revalidatePath('/admin')
    return { success: true }
  } catch (e: any) {
    return { error: 'Fehler beim Löschen der Bestellung.' }
  }
}

// ---------------------------------------------------------------
// EMAIL SETTINGS
// ---------------------------------------------------------------

export async function getEmailSettings() {
  try {
    let settings = await prisma.emailSettings.findFirst()
    if (!settings) {
      settings = await prisma.emailSettings.create({ data: {} })
    }
    return { success: true, settings }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function saveEmailSettings(formData: FormData) {
  try {
    const existing = await prisma.emailSettings.findFirst()

    const data = {
      enabled:      formData.get('enabled') === 'true',
      smtpHost:     formData.get('smtpHost') as string || '',
      smtpPort:     parseInt(formData.get('smtpPort') as string || '587'),
      smtpUser:     formData.get('smtpUser') as string || '',
      smtpPassword: formData.get('smtpPassword') as string || '',
      smtpSecure:   formData.get('smtpSecure') === 'true',
      fromName:     formData.get('fromName') as string || '',
      fromEmail:    formData.get('fromEmail') as string || '',
      subject:      formData.get('subject') as string || 'Deine Bestellbestätigung',
      bodyHtml:     formData.get('bodyHtml') as string || '',
    }

    if (existing) {
      await prisma.emailSettings.update({ where: { id: existing.id }, data })
    } else {
      await prisma.emailSettings.create({ data })
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function sendOrderConfirmationEmail(orderId: number) {
  try {
    const settings = await prisma.emailSettings.findFirst()
    if (!settings || !settings.enabled) return { success: false, reason: 'disabled' }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false, reason: 'order not found' }

    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    })

    // Platzhalter ersetzen
    const html = settings.bodyHtml
      .replace(/\{\{firstName\}\}/g, order.firstName)
      .replace(/\{\{lastName\}\}/g, order.lastName)
      .replace(/\{\{email\}\}/g, order.email)
      .replace(/\{\{amount\}\}/g, order.amount.toFixed(2))
      .replace(/\{\{imageNumbers\}\}/g, order.imageNumbers || '-')
      .replace(/\{\{notes\}\}/g, order.notes || '-')
      .replace(/\{\{paymentMethod\}\}/g, order.paymentMethod === 'bar' ? 'Barzahlung' : 'PayPal')

    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: order.email,
      subject: settings.subject,
      html,
    })

    return { success: true }
  } catch (e: any) {
    console.error('Email send error:', e)
    return { success: false, error: e.message }
  }
}

export async function testEmailSettings(formData: FormData) {
  try {
    const nodemailer = await import('nodemailer')

    const host     = formData.get('smtpHost') as string
    const port     = parseInt(formData.get('smtpPort') as string || '587')
    const user     = formData.get('smtpUser') as string
    const pass     = formData.get('smtpPassword') as string
    const secure   = formData.get('smtpSecure') === 'true'
    const from     = `"${formData.get('fromName')}" <${formData.get('fromEmail')}>`
    const testTo   = formData.get('testEmail') as string

    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })

    await transporter.sendMail({
      from,
      to: testTo,
      subject: 'Test-Mail – MelissaRebecca POS',
      html: '<p>✅ SMTP-Verbindung funktioniert!</p>',
    })

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
