import sharp from 'sharp';
import { editor, isSignedIn } from '@/lib/admin/session';
import { addPhoto } from '@/lib/events/store';

const MAX_BYTES = 4_000_000;

/**
 * Takes one photo from the Add to Calendar form and stores it. Re-encoding proves it's really an image,
 * turns it the right way up, and strips the phone's location data before anything goes public.
 */
export async function POST(req: Request) {
  if (!isSignedIn()) return Response.json({ error: 'You’ve been signed out. Sign in again and retry.' }, { status: 401 });
  const input = Buffer.from(await req.arrayBuffer());
  if (!input.length || input.length > MAX_BYTES) return Response.json({ error: 'That photo is too large. Try a smaller one.' }, { status: 413 });
  let photo;
  try {
    photo = await sharp(input).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  } catch {
    return Response.json({ error: 'That file couldn’t be read as a photo. Try a JPG or PNG.' }, { status: 400 });
  }
  try {
    const url = await addPhoto(photo.data, photo.info.width, photo.info.height, editor());
    return Response.json({ url });
  } catch (e) {
    console.error('photo upload failed:', e instanceof Error ? e.message : e);
    return Response.json({ error: 'That photo didn’t save. Please try again.' }, { status: 500 });
  }
}
