'use client'

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { updateOrderStatus } from '@/app/actions';
import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

export default function PayPalButtonClient({ orderId, amount }: { orderId: number, amount: number }) {
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Client ID sicher vom Server laden (kein Build-Time-Baking)
  useEffect(() => {
    fetch('/api/paypal-config')
      .then(res => res.json())
      .then(data => {
        if (data.clientId) {
          setClientId(data.clientId);
        } else {
          setError('PayPal Client ID nicht konfiguriert.');
        }
      })
      .catch(() => setError('PayPal-Konfiguration konnte nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, []);

  if (paid) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '16px', marginTop: '1rem' }}>
        <ShieldCheck size={40} style={{ marginBottom: '1rem' }} />
        <h3>Zahlung erfolgreich!</h3>
        <p>Vielen Dank, deine Zahlung wurde bestätigt. Du kannst diese Seite nun schließen.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: '#888', fontSize: '0.9rem' }}>
        PayPal wird geladen…
      </div>
    )
  }

  if (!clientId) {
    return (
      <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
        ⚠️ {error || 'PayPal nicht verfügbar.'}
      </div>
    )
  }

  return (
    <div style={{ width: '100%', zIndex: 0, position: 'relative' }}>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <PayPalScriptProvider options={{ clientId, currency: "EUR" }}>
        <PayPalButtons 
          style={{ layout: "vertical", shape: "pill", color: "blue" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "EUR",
                    value: amount.toFixed(2),
                  },
                  description: `Fotoshooting Bestellung #${orderId}`
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              try {
                const details = await actions.order.capture();
                if (details.status === "COMPLETED") {
                  await updateOrderStatus(orderId, 'paid');
                  setPaid(true);
                } else {
                  setError("Zahlung konnte nicht abgeschlossen werden.");
                }
              } catch (e) {
                console.error(e);
                setError("Es gab ein Problem bei der Kommunikation mit PayPal.");
              }
            }
          }}
          onError={(err) => {
            console.error(err);
            setError("Ein Fehler mit PayPal ist aufgetreten.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}
