import CheckoutWizard from '@/components/CheckoutWizard'

export default function OrderPage() {
  return (
    <main style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-color)'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(194,157,129,0.15) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1, borderRadius: '50%'
      }}></div>
      
      <div style={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        padding: '2rem 4vw',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'center'
      }}>
        {/* Header Section */}
        <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img 
            src="https://hostedimages-cdn.aweber-static.com/MjMyNzQxNg==/original/95cd09a0325c4e5a9aa86235c0edb9c4.png" 
            alt="MelissaRebecca Fotografie" 
            style={{ height: '80px', objectFit: 'contain' }}
          />
        </header>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <a href="/" style={{ padding: '0.8rem 2rem', background: '#fff', color: '#555', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, border: '1px solid #eee' }}>
            1. Anmeldung
          </a>
          <a href="/kauf" style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 15px rgba(194, 157, 129, 0.4)' }}>
            2. Kasse / Verkauf
          </a>
        </nav>
        <div className="glass-container" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CheckoutWizard />
        </div>
      </div>
    </main>
  )
}
