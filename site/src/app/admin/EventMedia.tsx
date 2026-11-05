'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { EventLink } from '@/lib/events/types';

const MAX_PHOTOS = 8;
const MAX_LINKS = 5;

/** Phone photos are huge: shrink in the browser first, so the upload is quick and fits the server's limit. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('unreadable'))), 'image/jpeg', 0.85));
}

/** Upload, reorder and remove an event's photos. The first one is the main photo. */
export function PhotoPicker({ initial, onBusy }: { initial: string[]; onBusy: (busy: boolean) => void }) {
  const [photos, setPhotos] = useState(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function add(files: FileList | null) {
    const list = [...(files ?? [])].slice(0, MAX_PHOTOS - photos.length);
    if (!list.length) return;
    setError(null);
    onBusy(true);
    for (let i = 0; i < list.length; i++) {
      setUploading(list.length - i);
      try {
        const body = await shrink(list[i]).catch(() => {
          throw new Error(`“${list[i].name}” couldn’t be read as a photo. Try a JPG or PNG.`);
        });
        const res = await fetch('/admin/photo', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error ?? 'That photo didn’t save. Please try again.');
        setPhotos((p) => [...p, data.url]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'That photo didn’t save. Please try again.');
      }
    }
    setUploading(0);
    onBusy(false);
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      <span className="q">Photos</span>
      <p className="help">The first photo is the main one. Add up to {MAX_PHOTOS}.</p>
      {error && <p className="err" role="alert">{error}</p>}
      {photos.length > 0 && (
        <ul className="ph-grid">
          {photos.map((src, i) => (
            <li key={src} className="ph-item">
              <input type="hidden" name="photos" value={src} />
              <Image src={src} alt={`Photo ${i + 1}`} width={320} height={240} unoptimized />
              {i === 0 ? <span className="tag">Main photo</span> : <button type="button" className="ph-btn" onClick={() => setPhotos((p) => [src, ...p.filter((x) => x !== src)])}>Make main</button>}
              <button type="button" className="ph-btn" onClick={() => setPhotos((p) => p.filter((x) => x !== src))}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {photos.length < MAX_PHOTOS && (
        <label className="choice" style={{ alignSelf: 'flex-start' }}>
          {uploading ? `Uploading (${uploading} left)…` : 'Add photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploading > 0}
            onChange={(e) => {
              void add(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}

/** Links to other sites, each with the words people will see. */
export function LinkRows({ initial }: { initial: EventLink[] }) {
  const [rows, setRows] = useState(() => initial.map((l, key) => ({ ...l, key })));
  const [next, setNext] = useState(initial.length);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <span className="q">Other links (optional)</span>
      {rows.map((r) => (
        <div key={r.key} className="adm-grid">
          <label className="f">Words on the link<input type="text" name="link_label" maxLength={60} defaultValue={r.label} placeholder="The band’s website" /></label>
          <label className="f">Web address<input type="text" inputMode="url" name="link_url" maxLength={400} defaultValue={r.url} placeholder="https://…" /></label>
          <button type="button" className="ph-btn" style={{ alignSelf: 'end' }} onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))}>Remove</button>
        </div>
      ))}
      {rows.length < MAX_LINKS && (
        <button
          type="button"
          className="choice"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            setRows((x) => [...x, { label: '', url: '', key: next }]);
            setNext((n) => n + 1);
          }}
        >
          Add a link
        </button>
      )}
    </div>
  );
}
