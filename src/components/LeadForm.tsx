'use client'

import { useState, useEffect, useRef } from 'react'
import { submitLead } from '@/app/actions'
import { Plus, Minus } from 'lucide-react'

export default function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [imageFields, setImageFields] = useState<number[]>([Date.now()])
  const formRef = useRef<HTMLFormElement>(null)

  const resetForm = () => {
    setStatus('idle')
    setErrorMessage('')
    setImageFields([Date.now()])
    if (formRef.current) formRef.current.reset()
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (status === 'success') {
      timeout = setTimeout(() => {
        resetForm()
      }, 15000)
    }
    return () => clearTimeout(timeout)
  }, [status])

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

  const addImageField = () => {
    setImageFields([...imageFields, Date.now()])
  }

  const removeImageField = (idToRemove: number) => {
    if (imageFields.length > 1) {
      setImageFields(imageFields.filter(id => id !== idToRemove))
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
        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Bildnummern (optional):</p>
        {imageFields.map((fieldId, index) => (
          <div key={fieldId} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text" 
              name="imageNumber" 
              placeholder="z.B. IMG_1234" 
              className="input-field"
              style={{ padding: '0.8rem 1rem' }}
            />
            {index === imageFields.length - 1 ? (
              <button 
                type="button" 
                onClick={addImageField}
                style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '50px', 
                  height: '50px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Plus size={24} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => removeImageField(fieldId)}
                style={{ 
                  background: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '50px', 
                  height: '50px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Minus size={24} />
              </button>
            )}
          </div>
        ))}
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
