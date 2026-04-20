/**
 * WhatsApp link builder. Centralised so all CTAs stay in sync.
 * Replace WHATSAPP_NUMBER with the client's real number (international format, no +).
 */
export const WHATSAPP_NUMBER = "919999999999"; // TODO: update with real Softgenix number

export function buildWhatsAppUrl(message: string) {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function openWhatsApp(message: string) {
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}
