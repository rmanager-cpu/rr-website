import type { Submission, SubmissionAdapter } from './types';

const KEY = 'rr-wall-submissions';

/**
 * Prototype adapter: keeps submissions in this browser only. Swap for `endpointAdapter` once the
 * private endpoint (events app / Supabase hub) exists.
 */
export const localAdapter: SubmissionAdapter = {
  async submit(s: Submission) {
    await new Promise((r) => setTimeout(r, 450));
    try {
      const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      list.push({ ...s, at: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // storage unavailable (private mode); the prototype still shows the thank-you state
    }
  },
};

/**
 * Inserts into the Supabase hub's `wall_submissions` table with the publishable key. Row-level
 * security lets the public add rows and nothing else (see supabase/wall_submissions.sql).
 */
export function supabaseAdapter(projectUrl: string, publishableKey: string): SubmissionAdapter {
  return {
    async submit(s: Submission) {
      const res = await fetch(`${projectUrl.replace(/\/$/, '')}/rest/v1/wall_submissions`, {
        method: 'POST',
        headers: { apikey: publishableKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          frame_id: s.frameId,
          section_id: s.sectionId,
          story: s.text,
          name: s.name ?? null,
          contact: s.contact ?? null,
          page: location.href.slice(0, 500),
        }),
      });
      if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
    },
  };
}

/** Posts each submission as JSON to a private endpoint. Rejects on any non-2xx response. */
export function endpointAdapter(url: string): SubmissionAdapter {
  return {
    async submit(s: Submission) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, page: location.href }),
      });
      if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
    },
  };
}
