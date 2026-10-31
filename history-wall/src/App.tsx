import { HistoryWall } from './wall/HistoryWall';
import { localAdapter, supabaseAdapter } from './wall/adapters';
import { loadFrames, loadSections } from './data';

const sections = loadSections();
const frames = loadFrames();

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const live = Boolean(SUPABASE_URL && SUPABASE_KEY);
const adapter = live ? supabaseAdapter(SUPABASE_URL!, SUPABASE_KEY!) : localAdapter;

// Embedded in the main site's History page (?embed): that page supplies the heading, so the wall drops
// its own title block and fills the frame it's given.
const embed = new URLSearchParams(location.search).has('embed');
if (embed) document.documentElement.classList.add('embed');

export function App() {
  return (
    <main className="page">
      {!embed && (
      <header className="page-head">
        <p className="page-kicker">River Ranch Lodge · Tahoe City</p>
        <h1 className="page-title">The Wall</h1>
        <p className="page-lede">Decades of River Ranch, one frame at a time. Tap any photo and tell us what you know.</p>
      </header>
      )}
      <HistoryWall
        sections={sections}
        frames={frames}
        adapter={adapter}
        assetBase={import.meta.env.BASE_URL}
        initialSectionId="wall"
      />
      {!live && <p className="page-proto">Prototype · anything sent here stays in this browser.</p>}
    </main>
  );
}
