import { dbReady } from '@/lib/db/pool';
import { listPages, venioSpaces } from '@/lib/events/store';
import { createEvent } from '../../../actions';
import { EventForm } from '../../../EventForm';

export default async function NewEvent() {
  const ready = await dbReady();
  const [pages, spaces] = await Promise.all([listPages(), venioSpaces()]);
  return (
    <>
      <h1>Add to Calendar</h1>
      <p className="help">This adds to the public What’s On calendar on the website. Private parties and weddings go in Venio, not here.</p>
      <EventForm action={createEvent} pages={pages} spaces={spaces} mode="new" dbReady={ready} />
    </>
  );
}
