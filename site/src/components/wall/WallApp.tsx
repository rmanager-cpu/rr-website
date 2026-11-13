'use client';

import { HistoryWall } from './HistoryWall';
import { localAdapter, supabaseAdapter } from './adapters';
import { loadFrames, loadSections, WALL_ASSETS } from './data';

// The Wall, built into the website (it used to be its own app in a frame from another address, which
// some iPhones refused to show). Stories go straight into the hub's wall_submissions table with the
// publishable key; row-level security lets the public add rows and nothing else. Nothing is ever dropped.

const sections = loadSections();
const frames = loadFrames();

const URL_ = process.env.NEXT_PUBLIC_WALL_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_WALL_SUPABASE_KEY;
const adapter = URL_ && KEY ? supabaseAdapter(URL_, KEY) : localAdapter;

export default function WallApp() {
  return <HistoryWall sections={sections} frames={frames} adapter={adapter} assetBase={WALL_ASSETS} initialSectionId="wall" />;
}
