import { notFound } from 'next/navigation';
import { dbReady } from '@/lib/db/pool';
import { pageById } from '@/lib/events/store';
import { savePage } from '../../../actions';
import { PageForm } from '../../../PageForm';

export default async function EditPage({ params }: { params: { id: string } }) {
  const ready = await dbReady();
  const page = await pageById(params.id);
  if (!page) notFound();
  return (
    <>
      <div className="row-actions" style={{ justifyContent: 'space-between' }}>
        <h1>Page: {page.title}</h1>
        <a href={`/events/${page.slug}`} target="_blank">View on the site →</a>
      </div>
      <PageForm action={savePage.bind(null, page.id)} page={page} dbReady={ready} />
    </>
  );
}
