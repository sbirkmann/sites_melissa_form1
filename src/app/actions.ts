'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitLead(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const imageNumbersRaw = formData.getAll('imageNumber') as string[]
  const imageNumbers = imageNumbersRaw.filter(val => val.trim() !== '').join(', ')

  if (!name || !email) {
    return { error: 'Bitte fülle alle Felder aus.' }
  }

  try {
    await prisma.lead.create({
      data: { 
        name, 
        email,
        imageNumbers: imageNumbers || null
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
    await prisma.lead.delete({
      where: { id },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (e: any) {
    return { error: 'Fehler beim Löschen des Eintrags.' }
  }
}

export async function createOrder(data: { amount: number, firstName: string, lastName: string, email: string, imageNumbers: string, paymentMethod: string }) {
  try {
    const order = await prisma.order.create({
      data: {
        amount: data.amount,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        imageNumbers: data.imageNumbers || null,
        paymentMethod: data.paymentMethod,
        status: data.paymentMethod === 'bar' ? 'paid' : 'pending',
      }
    })
    return { success: true, orderId: order.id }
  } catch (e: any) {
    console.error(e)
    return { error: 'Fehler beim Erstellen der Bestellung.' }
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
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    return { error: 'Fehler beim Aktualisieren des Status.' }
  }
}

export async function deleteOrder(id: number) {
  try {
    await prisma.order.delete({
      where: { id },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (e: any) {
    return { error: 'Fehler beim Löschen der Bestellung.' }
  }
}
