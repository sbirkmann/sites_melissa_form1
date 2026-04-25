import { prisma } from '@/lib/prisma'
import { deleteLead } from '@/app/actions'
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

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  })

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

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#888',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        marginTop: '3rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <a href="https://www.melissarebecca-fotografie.de/impressum" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#aaa', textDecoration: 'none' }}>Impressum</a>
          <a href="https://www.melissarebecca-fotografie.de/datenschutz" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#aaa', textDecoration: 'none' }}>Datenschutz</a>
        </div>
      </footer>
    </main>
  )
}
