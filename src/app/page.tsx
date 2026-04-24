import LeadForm from '@/components/LeadForm'
import { Camera, Heart } from 'lucide-react'

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
        background: 'radial-gradient(circle, rgba(194,157,129,0.15) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1,
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(230,200,180,0.2) 0%, rgba(255,255,255,0) 70%)',
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
        gap: '2rem',
        width: '100%',
        justifyContent: 'center'
      }}>
        
        {/* Header Section */}
        <header style={{ textAlign: 'center' }}>
          <img 
            src="https://hostedimages-cdn.aweber-static.com/MjMyNzQxNg==/original/95cd09a0325c4e5a9aa86235c0edb9c4.png" 
            alt="Melissa Rebecca Fotografie Logo" 
            style={{ maxWidth: '250px', height: 'auto', marginBottom: '1.5rem' }} 
          />
          <h1 style={{ fontSize: '2.5rem', color: '#2c2c2c', marginBottom: '0.5rem' }}>
            Hey, schön, dass du dabei bist! 📸
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '600px', margin: '0 auto' }}>
            Ich würde super gern ein paar Fotos von dir machen – danke, dass du offen dafür bist! 🙌
          </p>
        </header>

        <div className="content-grid">
          {/* Form Section */}
          <section className="glass-container" style={{ width: '100%', height: '100%' }}>
            <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              Damit alles sauber läuft, trag bitte kurz deinen Namen und deine E-Mail-Adresse ein.
              Nach dem Absenden bekommst du eine kurze Mail. Einmal auf den Bestätigungslink klicken und schon können wir loslegen! 🎬✨
            </p>
            <LeadForm />
          </section>

          {/* About Section */}
          <section style={{ 
            background: '#fff', 
            borderRadius: '24px', 
            padding: '3rem 2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Camera size={32} color="var(--primary)" />
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Hallo, ich bin Melissa</h2>
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#666', fontWeight: 400, marginBottom: '1.5rem' }}>
              Fotografin für Lifestyle, Art, Beauty & mehr.
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#444', flex: 1 }}>
              <p>
                Manchmal entstehen spontan besondere Momente – auf der Straße, bei Events oder einfach im Alltag. 
                Diese echten, ungeplanten Augenblicke halte ich gern mit der Kamera fest.
              </p>
              <p>
                Ich gehe immer mit Respekt auf Menschen zu und veröffentliche Bilder (z.B. auf meiner Website, Instagram oder im Portfolio) nur mit deiner ausdrücklichen Zustimmung.
              </p>
              <p>
                Wenn du neugierig bist und mehr über meine Arbeit erfahren oder durch meine bisherigen Projekte stöbern möchtest – schau gern mal auf meiner Website vorbei!
              </p>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href="https://www.melissarebecca-fotografie.de" target="_blank" rel="noreferrer" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={18} /> Zur Website
              </a>
            </div>
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
        <p>Copyright 2024 © MelissaRebecca Fotografie</p>
        <div style={{ marginTop: '1rem' }}>
          <a href="/admin" style={{ fontSize: '0.8rem', color: '#ccc' }}>Admin Login</a>
        </div>
      </footer>
    </main>
  )
}
