'use client'

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { updateOrderStatus } from '@/app/actions';
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function PayPalButtonClient({ orderId, amount }: { orderId: number, amount: number }) {
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  
  // Wir laden die Client ID aus den Umgebungsvariablen.
  // Wenn diese noch nicht gesetzt ist, nutzen wir "sb" (Sandbox) als Fallback, damit es nicht direkt crasht.
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

  if (paid) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '16px', marginTop: '1rem' }}>
        <ShieldCheck size={40} style={{ marginBottom: '1rem' }} />
        <h3>Zahlung erfolgreich!</h3>
        <p>Vielen Dank, deine Zahlung wurde bestätigt. Du kannst diese Seite nun schließen.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', zIndex: 0, position: 'relative' }}>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      
      {clientId === 'sb' && (
        <div style={{ background: '#fff3e0', color: '#ef6c00', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ⚠️ PayPal Client ID fehlt! Bitte in der .env Datei eintragen.
        </div>
      )}

      <PayPalScriptProvider options={{ clientId: clientId, currency: "EUR" }}>
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
                  // Sicheres Update in unserer Datenbank!
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
