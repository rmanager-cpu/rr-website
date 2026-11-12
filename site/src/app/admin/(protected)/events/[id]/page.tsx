import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbReady } from '@/lib/db/pool';
import { listPages, listSeries, seriesById, venioSpaces } from '@/lib/events/store';
import { deleteEventAction, saveEvent } from '../../../actions';
import { DeleteEvent, EventForm } from '../../../EventForm';

export default async function EditEvent({ params }: { params: { id: string } }) {
  const ready = await dbReady();
  const s = await seriesById(params.id);
  if (!s) notFound();
  const [pages, spaces, all] = await Promise.all([listPages(), venioSpaces(), listSeries()]);
  const page = pages.find((p) => p.id === s.pageId);
  const sharedWith = all.filter((x) => x.pageId === s.pageId && x.id !== s.id).length;
  return (
    <>
      <div className="row-actions" style={{ justifyContent: 'space-between' }}>
        <h1>{s.title}</h1>
        {page && <Link href={`/admin/pages/${page.id}`}>Edit its page →</Link>}
      </div>
      <EventForm action={saveEvent.bind(null, s.id)} pages={pages} spaces={spaces} initial={s} page={page} sharedWith={sharedWith} mode="edit" dbReady={ready} />
      {ready && <DeleteEvent action={deleteEventAction.bind(null, s.id)} />}
    </>
  );
}
