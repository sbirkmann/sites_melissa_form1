import CheckoutWizard from '@/components/CheckoutWizard'

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(159,183,200,0.3) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1,
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(223,210,216,0.3) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1,
        borderRadius: '50%'
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
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="https://hostedimages-cdn.aweber-static.com/MjMyNzQxNg==/original/95cd09a0325c4e5a9aa86235c0edb9c4.png" 
            alt="Melissa Rebecca Fotografie Logo" 
            style={{ maxWidth: '250px', height: 'auto' }} 
          />
        </header>

        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          {/* Form Section */}
          <section className="glass-container" style={{ width: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CheckoutWizard />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#888',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        marginTop: 'auto'
      }}>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <a href="https://www.melissarebecca-fotografie.de/impressum" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#aaa', textDecoration: 'none' }}>Impressum</a>
          <a href="https://www.melissarebecca-fotografie.de/datenschutz" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#aaa', textDecoration: 'none' }}>Datenschutz</a>
          <a href="/admin" style={{ fontSize: '0.8rem', color: '#ccc', textDecoration: 'none' }}>Admin Login</a>
        </div>
      </footer>
    </main>
  )
}
