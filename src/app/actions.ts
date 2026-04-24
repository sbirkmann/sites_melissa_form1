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
