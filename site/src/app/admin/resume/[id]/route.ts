import { isSignedIn } from '@/lib/admin/session';
import { resumeFile } from '@/lib/events/store';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** An applicant's resume, for staff signed in to /admin only. Always a download, never shown inline. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isSignedIn()) return new Response('Sign in at /admin first.', { status: 401 });
  if (!UUID.test(params.id)) return new Response('Not found', { status: 404 });
  const file = await resumeFile(params.id).catch(() => null);
  if (!file) return new Response('Not found', { status: 404 });
  const name = file.filename.replace(/["\\r\n]/g, '_');
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      'Content-Type': file.mime,
      'Content-Disposition': `attachment; filename="${name}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
