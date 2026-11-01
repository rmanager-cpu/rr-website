import Image from 'next/image';
import { spaces } from '@/content/spaces';

/** The event spaces as photo tiles, on Celebrate and Spaces. */
export function SpaceGrid() {
  return (
    <div className="space-grid">
      {spaces.map((s) => (
        <div key={s.name} className="space">
          {s.photo ? (
            <Image src={s.photo.src} alt={s.photo.alt} width={s.photo.width} height={s.photo.height} sizes="(max-width: 600px) 100vw, 300px" />
          ) : (
            <div className="ph" role="img" aria-label={`Photo coming soon: ${s.name}`}>Photo coming soon</div>
          )}
          <h3 className="space__name">{s.name}</h3>
          <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{s.line}</p>
        </div>
      ))}
    </div>
  );
}
