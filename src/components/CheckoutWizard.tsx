'use client'

import { useState, useEffect } from 'react'
import { Euro, Banknote, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { createOrder, checkOrderStatus, updateOrderStatus } from '@/app/actions'

export default function CheckoutWizard() {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bar' | 'paypal' | null>(null)
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [imageNumbers, setImageNumbers] = useState('')
  const [notes, setNotes] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [orderStatus, setOrderStatus] = useState<string>('pending')

  // Navigation
  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)
  
  const resetForm = () => {
    setStep(1)
    setAmount('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setImageNumbers('')
    setNotes('')
    setPaymentMethod(null)
    setOrderId(null)
    setOrderStatus('pending')
  }

  const handleSelectMethod = (method: 'bar' | 'paypal') => {
    setPaymentMethod(method)
    nextStep()
  }

  const handleFinalSubmit = async () => {
    if (!paymentMethod) return
    setIsSubmitting(true)

    const res = await createOrder({
      amount: parseFloat(amount.replace(',', '.')),
      firstName,
      lastName,
      email,
      imageNumbers,
      notes,
      paymentMethod: paymentMethod
    })

    if (res.success && res.orderId) {
      setOrderId(res.orderId)
      if (paymentMethod === 'bar') {
        setOrderStatus('paid')
      }
      nextStep()
    } else {
      alert(res.error || 'Fehler beim Speichern der Bestellung.')
    }
    setIsSubmitting(false)
  }

  const handleCancelOrder = async () => {
    if (orderId) {
      await updateOrderStatus(orderId, 'cancelled')
      resetForm()
    }
  }

  // Polling for PayPal
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (step === 4 && paymentMethod === 'paypal' && orderStatus === 'pending' && orderId) {
      interval = setInterval(async () => {
        const res = await checkOrderStatus(orderId)
        if (res.status && res.status !== 'pending') {
          setOrderStatus(res.status)
        }
      }, 3000) // Poll every 3 seconds
    }
    return () => clearInterval(interval)
  }, [step, paymentMethod, orderStatus, orderId])

  // -------------------------------------------------------------
  // STEP 1: AMOUNT
  // -------------------------------------------------------------
  if (step === 1) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Eingabe Betrag</h2>
        <div style={{ position: 'relative', maxWidth: '300px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <Euro size={30} color="#888" style={{ position: 'absolute', left: '1rem' }} />
          <input 
            type="number" 
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-field"
            style={{ fontSize: '2rem', padding: '1rem 1rem 1rem 3.5rem', textAlign: 'center' }}
            autoFocus
          />
        </div>
        <button 
          onClick={nextStep} 
          disabled={!amount || parseFloat(amount) <= 0}
          className="btn" 
          style={{ marginTop: '2rem', width: '300px', fontSize: '1.2rem' }}
        >
          Weiter <ArrowRight size={20} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }} />
        </button>
      </div>
    )
  }

  // -------------------------------------------------------------
  // STEP 2: PAYMENT METHOD
  // -------------------------------------------------------------
  if (step === 2) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', justifyContent: 'center', position: 'relative' }}>
          <button onClick={prevStep} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', position: 'absolute', left: '0', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} /> <span style={{ fontSize: '1.1rem', marginLeft: '0.5rem' }}>Zurück</span>
          </button>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Zahlungsart wählen</h2>
        </div>

        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>Betrag: <strong>{amount} €</strong></p>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleSelectMethod('bar')}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
              padding: '3rem', borderRadius: '24px', border: '2px solid #e0e0e0',
              background: '#fff', cursor: 'pointer', transition: 'all 0.2s ease', width: '250px'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          >
            <Banknote size={64} color="#4CAF50" />
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Barzahlung</span>
          </button>

          <button 
            onClick={() => handleSelectMethod('paypal')}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
              padding: '3rem', borderRadius: '24px', border: '2px solid #e0e0e0',
              background: '#fff', cursor: 'pointer', transition: 'all 0.2s ease', width: '250px'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          >
            <CreditCard size={64} color="#003087" />
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>PayPal</span>
          </button>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // STEP 3: CUSTOMER FORM
  // -------------------------------------------------------------
  if (step === 3) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', justifyContent: 'center', position: 'relative' }}>
          <button onClick={prevStep} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', position: 'absolute', left: '0', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} /> <span style={{ fontSize: '1.1rem', marginLeft: '0.5rem' }}>Zurück</span>
          </button>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Kundendaten</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input type="text" placeholder="Vorname" value={firstName} onChange={e => setFirstName(e.target.value)} className="input-field" required />
            <input type="text" placeholder="Nachname" value={lastName} onChange={e => setLastName(e.target.value)} className="input-field" required />
          </div>
          <input type="email" placeholder="E-Mail Adresse" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          
          <div style={{ marginTop: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Bildnummern (z.B. IMG_1234, IMG_1235)" 
              value={imageNumbers} 
              onChange={e => setImageNumbers(e.target.value)} 
              className="input-field" 
            />
          </div>
          
          <div style={{ marginTop: '0.5rem' }}>
            <textarea 
              placeholder="Weitere Wünsche oder Anmerkungen (optional)" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              className="input-field" 
              style={{ minHeight: '100px', resize: 'vertical', paddingTop: '1rem', fontFamily: 'inherit' }}
            />
          </div>

          <button 
            onClick={handleFinalSubmit} 
            disabled={!firstName || !lastName || !email || isSubmitting}
            className="btn" 
            style={{ marginTop: '1rem', width: '100%', fontSize: '1.2rem' }}
          >
            {isSubmitting ? 'Wird gespeichert...' : 'Kauf abschließen'}
          </button>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // STEP 4: CONFIRMATION / QR CODE
  // -------------------------------------------------------------
  if (step === 4) {
    if (paymentMethod === 'bar') {
      return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'inline-flex', background: '#e8f5e9', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
            <Banknote size={64} color="#4CAF50" />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Zahlung erfolgreich!</h2>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>Der Betrag von {amount} € wurde bar bezahlt.</p>
          <button onClick={resetForm} className="btn" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
            Neuer Verkauf
          </button>
        </div>
      )
    }

    if (paymentMethod === 'paypal') {
      const payLink = typeof window !== 'undefined' ? `${window.location.origin}/pay/${orderId}` : ''

      if (orderStatus === 'paid') {
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ display: 'inline-flex', background: '#e8f5e9', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
              <CreditCard size={64} color="#4CAF50" />
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Zahlung empfangen!</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>Der Betrag wurde via PayPal bezahlt.</p>
            <button onClick={resetForm} className="btn" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
              Neuer Verkauf
            </button>
          </div>
        )
      }

      if (orderStatus === 'cancelled') {
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#f44336' }}>Kauf abgebrochen</h2>
            <button onClick={resetForm} className="btn" style={{ fontSize: '1.2rem', padding: '1rem 3rem', marginTop: '2rem' }}>
              Neuer Verkauf
            </button>
          </div>
        )
      }

      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bitte scannen für PayPal</h2>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>Betrag: <strong>{amount} €</strong></p>
          
          <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <QRCodeSVG value={payLink} size={250} />
          </div>

          <p style={{ marginTop: '2rem', color: '#888', fontStyle: 'italic' }}>
            Warte auf Zahlung... (Seite aktualisiert sich automatisch)
          </p>

          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setOrderStatus('paid')} className="btn" style={{ background: '#4CAF50' }}>
              Manuell Bestätigen
            </button>
            <button onClick={handleCancelOrder} className="btn" style={{ background: '#f44336' }}>
              Abbrechen
            </button>
          </div>
        </div>
      )
    }
  }

  return null
}
