import 'server-only';
import { createHmac } from 'node:crypto';

// The website's forms, straight into Venio as leads (Alex, 2026-11-13: "Form submissions in Venio and on the
// website should be automatic"). Posts what the guest sent to Venio's /api/intake/website, signed with
// WEBSITE_LEADS_SECRET (the same value in both apps' Vercel settings): an HMAC over the time and the body, as
// rr-events/src/lib/intake/website.ts checks it. The email to events@ and the form log stay as they were, so a
// form is never lost if Venio can't be reached.

const VENIO = process.env.NEXT_PUBLIC_VENIO_URL ?? 'https://rr-events-nine.vercel.app';
const TIMEOUT_MS = 8_000;

export type VenioLeadForm = {
  form: 'wedding-date';
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: string;
  message: string;
  maybeBot: string | null;
};

export const venioLeadsReady = () => (process.env.WEBSITE_LEADS_SECRET ?? '').trim().length >= 24;

/** The lead's id in Venio, or null when it couldn't be saved there (not set up, refused, or unreachable). Never throws. */
export async function sendToVenio(lead: VenioLeadForm): Promise<string | null> {
  const secret = (process.env.WEBSITE_LEADS_SECRET ?? '').trim();
  if (secret.length < 24) return null;
  const body = JSON.stringify(lead);
  const t = Math.floor(Date.now() / 1000);
  const sig = `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;
  try {
    const res = await fetch(`${VENIO.replace(/\/$/, '')}/api/intake/website`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-rr-signature': sig },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status !== 201) {
      console.error('Venio: form not saved as a lead', res.status);
      return null;
    }
    const out = (await res.json()) as { leadId?: unknown };
    return typeof out.leadId === 'string' ? out.leadId : null;
  } catch (e) {
    console.error('Venio: could not be reached', e instanceof Error ? e.name : 'error');
    return null;
  }
}
