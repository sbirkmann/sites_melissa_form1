'use client'

import { useState, useRef } from 'react'
import { submitLead } from '@/app/actions'

export default function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const resetForm = () => {
    setStatus('idle')
    setErrorMessage('')
    if (formRef.current) formRef.current.reset()
  }

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    setErrorMessage('')
    
    const result = await submitLead(formData)
    
    if (result?.error) {
      setStatus('error')
      setErrorMessage(result.error)
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="success-message" style={{ textAlign: 'center', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🎉 Danke für deine Anmeldung!</h3>
        <p style={{ marginBottom: '2rem' }}>Ich melde mich in Kürze bei dir.</p>
        <button onClick={resetForm} className="btn" style={{ width: '100%' }}>
          Neuer Eintrag
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="name" style={{ display: 'none' }}>Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          placeholder="Dein Vorname" 
          required 
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="email" style={{ display: 'none' }}>E-Mail</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder="Deine E-Mail Adresse" 
          required 
          className="input-field"
        />
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <input 
          type="text" 
          name="imageNumber" 
          placeholder="Bildnummern (z.B. IMG_1234, IMG_1235)" 
          className="input-field"
        />
      </div>
      
      <div style={{ marginTop: '0.5rem' }}>
        <textarea 
          name="notes"
          placeholder="Weitere Wünsche oder Anmerkungen (optional)" 
          className="input-field"
          style={{ minHeight: '100px', resize: 'vertical', paddingTop: '1rem', fontFamily: 'inherit' }}
        />
      </div>
      
      {status === 'error' && (
        <div className="error-message">{errorMessage}</div>
      )}

      <button 
        type="submit" 
        disabled={status === 'loading'}
        className="btn"
        style={{ marginTop: '1rem', width: '100%' }}
      >
        {status === 'loading' ? 'Wird gesendet...' : 'SENDEN'}
      </button>

      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem', textAlign: 'center' }}>
        Hinweis: Deine Angaben helfen mir, dein Einverständnis zum Fotoshooting zu dokumentieren. Sie werden nicht weitergegeben und nur für diesen Zweck genutzt.
      </p>
    </form>
  )
}
