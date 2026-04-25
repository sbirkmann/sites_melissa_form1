import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CreditCard, ShieldCheck } from 'lucide-react'
import PayPalButtonClient from '@/components/PayPalButtonClient'

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const orderId = parseInt(resolvedParams.id, 10)

  if (isNaN(orderId)) {
    notFound()
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order) {
    notFound()
  }

  // Generate the direct PayPal link. Adjust 'melissarebeccafotografie' if the PayPal.me name differs.
  const paypalLink = `https://paypal.me/melissarebeccafotografie/${order.amount.toFixed(2)}`

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-color)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-20%', width: '70vw', height: '70vw',
        background: 'radial-gradient(circle, rgba(194,157,129,0.15) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1, borderRadius: '50%'
      }}></div>

      {/* Header Section */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img 
            src="https://hostedimages-cdn.aweber-static.com/MjMyNzQxNg==/original/95cd09a0325c4e5a9aa86235c0edb9c4.png" 
            alt="MelissaRebecca Fotografie" 
            style={{ height: '70px', objectFit: 'contain', display: 'block' }}
          />
        </div>
      </header>

      <div className="glass-container" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '3rem 2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#2c2c2c', marginBottom: '1rem' }}>
          Hallo {order.firstName}! 👋
        </h1>
        <p style={{ color: '#555', marginBottom: '2rem' }}>
          Vielen Dank für dein Shooting. Hier kannst du deinen offenen Betrag schnell und sicher begleichen.
        </p>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '1rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Zu zahlender Betrag
          </p>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)' }}>
            {order.amount.toFixed(2)} €
          </div>
        </div>

        <PayPalButtonClient orderId={order.id} amount={order.amount} />

        <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={16} /> Sichere Zahlung via PayPal
        </p>
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', gap: '1.5rem' }}>
        <a href="https://www.melissarebecca-fotografie.de/impressum" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#000', textDecoration: 'none' }}>
          Impressum
        </a>
        <a href="https://www.melissarebecca-fotografie.de/datenschutz" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#000', textDecoration: 'none' }}>
          Datenschutz
        </a>
      </footer>
    </main>
  )
}
