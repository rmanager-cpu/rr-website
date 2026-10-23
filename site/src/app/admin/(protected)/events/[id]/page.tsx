import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbReady } from '@/lib/db/pool';
import { listPages, seriesById, venioSpaces } from '@/lib/events/store';
import { saveEvent } from '../../../actions';
import { EventForm } from '../../../EventForm';

export default async function EditEvent({ params }: { params: { id: string } }) {
  const ready = await dbReady();
  const s = await seriesById(params.id);
  if (!s) notFound();
  const [pages, spaces] = await Promise.all([listPages(), venioSpaces()]);
  const page = pages.find((p) => p.id === s.pageId);
  return (
    <>
      <div className="row-actions" style={{ justifyContent: 'space-between' }}>
        <h1>{s.title}</h1>
        {page && <Link href={`/admin/pages/${page.id}`}>Edit its page →</Link>}
      </div>
      <EventForm action={saveEvent.bind(null, s.id)} pages={pages} spaces={spaces} initial={s} mode="edit" dbReady={ready} />
    </>
  );
}
