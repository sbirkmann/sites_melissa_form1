import { prisma } from '@/lib/prisma'
import { deleteLead } from '@/app/actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { auth?: string }
}) {
  // Simple auth for demonstration
  if (searchParams.auth !== 'admin123') {
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

  return (
    <main style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
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
    </main>
  )
}
