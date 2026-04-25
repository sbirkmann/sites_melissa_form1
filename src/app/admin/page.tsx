import { prisma } from '@/lib/prisma'
import { deleteLead, saveEmailSettings, testEmailSettings, getEmailSettings } from '@/app/actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>
}) {
  const params = await searchParams
  // Authentifizierung via Environment Variable
  const adminPassword = process.env.ADMIN_PASSWORD
  if (params.auth !== adminPassword) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fcfbfa' }}>
        <div className="glass-container" style={{ textAlign: 'center' }}>
          <h2>Admin Login</h2>
          <form action="/admin" method="GET" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input type="password" name="auth" placeholder="Passwort" className="input-field" />
            <button type="submit" className="btn">Login</button>
          </form>
        </div>
      </div>
    )
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
  const { settings: emailSettings } = await getEmailSettings()

  return (
    <main style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1>Admin Dashboard</h1>
        <a href="/" className="btn" style={{ padding: '0.5rem 1.5rem' }}>Zurück zur Seite</a>
      </div>

      <div className="glass-container">
        <h2 style={{ marginBottom: '2rem' }}>Eingetragene Leads ({leads.length})</h2>
        
        {leads.length === 0 ? (
          <p>Noch keine Einträge vorhanden.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>E-Mail</th>
                  <th style={{ padding: '1rem' }}>Bildnummern</th>
                  <th style={{ padding: '1rem' }}>Datum</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>{lead.name}</td>
                    <td style={{ padding: '1rem' }}>{lead.email}</td>
                    <td style={{ padding: '1rem' }}>{lead.imageNumbers || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <form action={async () => {
                        'use server'
                        await prisma.lead.delete({ where: { id: lead.id }})
                        revalidatePath('/admin')
                      }}>
                        <button type="submit" style={{ 
                          background: '#ffebee', 
                          color: '#c62828', 
                          border: 'none', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}>
                          Löschen
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-container" style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Käufe / Bestellungen ({orders.length})</h2>
        
        {orders.length === 0 ? (
          <p>Noch keine Käufe vorhanden.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Betrag</th>
                  <th style={{ padding: '1rem' }}>Bildnummern</th>
                  <th style={{ padding: '1rem' }}>Zahlung</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Datum</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>{order.firstName} {order.lastName}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{order.amount.toFixed(2)} €</td>
                    <td style={{ padding: '1rem' }}>{order.imageNumbers || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      {order.paymentMethod === 'bar' ? '💵 Bar' : '💳 PayPal'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '50px',
                        fontSize: '0.8rem',
                        background: order.status === 'paid' ? '#e8f5e9' : order.status === 'cancelled' ? '#ffebee' : '#fff3e0',
                        color: order.status === 'paid' ? '#2e7d32' : order.status === 'cancelled' ? '#c62828' : '#ef6c00'
                      }}>
                        {order.status === 'paid' ? 'Bezahlt' : order.status === 'cancelled' ? 'Abgebrochen' : 'Ausstehend'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <form action={async () => {
                        'use server'
                        await prisma.order.delete({ where: { id: order.id }})
                        revalidatePath('/admin')
                      }}>
                        <button type="submit" style={{ 
                          background: '#ffebee', color: '#c62828', border: 'none', 
                          padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'
                        }}>
                          Löschen
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* E-Mail Einstellungen */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>📧 E-Mail Einstellungen</h2>
        <div className="glass-container">
          <form action={async (formData: FormData) => {
            'use server'
            await saveEmailSettings(formData)
          }}>
            {/* Aktivieren */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: emailSettings?.enabled ? '#e8f5e9' : '#fff3e0', borderRadius: '12px' }}>
              <label style={{ fontWeight: 600, fontSize: '1.1rem' }}>E-Mail-Versand aktiv:</label>
              <select name="enabled" defaultValue={emailSettings?.enabled ? 'true' : 'false'} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}>
                <option value="true">✅ Aktiv</option>
                <option value="false">❌ Inaktiv</option>
              </select>
            </div>

            {/* SMTP */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1.5rem' }}>SMTP Server</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>Host</label>
                <input type="text" name="smtpHost" defaultValue={emailSettings?.smtpHost || ''} placeholder="smtp.example.com" className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>Port</label>
                <input type="number" name="smtpPort" defaultValue={emailSettings?.smtpPort || 587} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>Benutzername</label>
                <input type="text" name="smtpUser" defaultValue={emailSettings?.smtpUser || ''} placeholder="user@example.com" className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>Passwort</label>
                <input type="password" name="smtpPassword" defaultValue={emailSettings?.smtpPassword || ''} placeholder="••••••••" className="input-field" />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <select name="smtpSecure" defaultValue={emailSettings?.smtpSecure ? 'true' : 'false'} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="false">STARTTLS (Port 587)</option>
                  <option value="true">SSL/TLS (Port 465)</option>
                </select>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Verbindungstyp</span>
              </label>
            </div>

            {/* Absender */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Absender</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>Absender Name</label>
                <input type="text" name="fromName" defaultValue={emailSettings?.fromName || ''} placeholder="MelissaRebecca Fotografie" className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>Absender E-Mail</label>
                <input type="email" name="fromEmail" defaultValue={emailSettings?.fromEmail || ''} placeholder="hallo@example.com" className="input-field" />
              </div>
            </div>

            {/* Betreff */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Mailinhalt</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>Betreff</label>
              <input type="text" name="subject" defaultValue={emailSettings?.subject || 'Deine Bestellbestätigung'} className="input-field" />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: '#666' }}>Mail-Text (HTML)</label>

              {/* Platzhalter Info-Box */}
              <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.8rem', color: '#1a5276', fontSize: '0.95rem' }}>
                  📋 Verfügbare Platzhalter im Betreff &amp; HTML-Body:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 2rem' }}>
                  {[
                    ['{{firstName}}', 'Vorname des Kunden'],
                    ['{{lastName}}', 'Nachname des Kunden'],
                    ['{{email}}', 'E-Mail des Kunden'],
                    ['{{amount}}', 'Betrag in EUR (z.B. 49.00)'],
                    ['{{imageNumbers}}', 'Eingegebene Bildnummern'],
                    ['{{notes}}', 'Weitere Wünsche / Anmerkungen'],
                    ['{{paymentMethod}}', '"Barzahlung" oder "PayPal"'],
                  ].map(([ph, desc]) => (
                    <div key={ph} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <code style={{ background: '#dceefb', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'nowrap', color: '#1a5276' }}>{ph}</code>
                      <span style={{ fontSize: '0.82rem', color: '#555' }}>{desc}</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: '0.8rem', fontSize: '0.82rem', color: '#555' }}>
                  <strong>Beispiel:</strong> <code style={{ background: '#dceefb', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{`<p>Hallo {{firstName}}, dein Betrag von {{amount}} € wurde bezahlt.</p>`}</code>
                </p>
              </div>

              <textarea
                name="bodyHtml"
                defaultValue={emailSettings?.bodyHtml || '<p>Hallo {{firstName}},</p>\n<p>vielen Dank für deine Bestellung! 🎉</p>\n<p>Betrag: {{amount}} €<br/>Bildnummern: {{imageNumbers}}<br/>Anmerkungen: {{notes}}</p>\n<p>Herzliche Grüße,<br/>MelissaRebecca Fotografie</p>'}
                style={{ width: '100%', minHeight: '220px', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn">💾 Einstellungen speichern</button>
            </div>
          </form>

          {/* Test-Mail */}
          <form action={async (formData: FormData) => {
            'use server'
            const result = await testEmailSettings(formData)
            if (!result.success) console.error('Test-Mail Fehler:', result.error)
          }} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🧪 Test-Mail senden</h3>
            <input type="hidden" name="smtpHost" value={emailSettings?.smtpHost || ''} />
            <input type="hidden" name="smtpPort" value={emailSettings?.smtpPort || 587} />
            <input type="hidden" name="smtpUser" value={emailSettings?.smtpUser || ''} />
            <input type="hidden" name="smtpPassword" value={emailSettings?.smtpPassword || ''} />
            <input type="hidden" name="smtpSecure" value={emailSettings?.smtpSecure ? 'true' : 'false'} />
            <input type="hidden" name="fromName" value={emailSettings?.fromName || ''} />
            <input type="hidden" name="fromEmail" value={emailSettings?.fromEmail || ''} />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="email" name="testEmail" placeholder="Test-Empfänger E-Mail" className="input-field" style={{ maxWidth: '300px' }} />
              <button type="submit" className="btn" style={{ background: '#555', whiteSpace: 'nowrap' }}>📨 Test senden</button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#888',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        marginTop: '3rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <a href="https://www.melissarebecca-fotografie.de/impressum" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#000', textDecoration: 'none' }}>Impressum</a>
          <a href="https://www.melissarebecca-fotografie.de/datenschutz" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#000', textDecoration: 'none' }}>Datenschutz</a>
        </div>
      </footer>
    </main>
  )
}
