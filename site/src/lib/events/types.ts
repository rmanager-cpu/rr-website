export const CATEGORIES = ['happy-hour', 'food', 'music', 'holiday', 'community', 'special', 'off-site'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  'happy-hour': 'Happy hour',
  food: 'Food & drink',
  music: 'Music',
  holiday: 'Holiday',
  community: 'Community',
  special: 'Special',
  'off-site': 'Off-site',
};

export const LAYOUTS = ['standard', 'apres', 'collage'] as const;
export type Layout = (typeof LAYOUTS)[number];

/** An event's page. Every event series has exactly one; recurring events share it. */
export type EventPage = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  heroImage: string | null;
  layout: Layout;
  updatedAt: string;
};

/** One event, or one recurring series (e.g. happy hour, Monday to Friday). */
export type EventSeries = {
  id: string;
  pageId: string;
  title: string;
  category: Category;
  status: 'draft' | 'published' | 'cancelled';
  startsOn: string; // YYYY-MM-DD
  endsOn: string | null;
  startTime: string | null; // HH:MM
  endTime: string | null;
  repeat: 'none' | 'weekly';
  weekdays: number[]; // ISO, 1 = Monday … 7 = Sunday
  skipHolidays: boolean;
  skipDates: string[];
  offsite: boolean;
  location: string | null;
  note: string | null;
  ticketUrl: string | null;
  // Venio feed
  closedPrivate: boolean;
  closedRegular: boolean;
  venioSpaces: string[];
  updatedAt: string;
};

/** A single date on the calendar. */
export type Occurrence = {
  series: EventSeries;
  date: string; // YYYY-MM-DD
};

export const DEPARTMENTS = ['Front of house', 'Back of house', 'Lodge staff', 'Maintenance', 'Administrative'] as const;
export type Department = (typeof DEPARTMENTS)[number];

export type JobApplication = {
  id: string;
  createdAt: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: Department;
  status: 'new' | 'contacted' | 'hired' | 'closed';
  notes: string | null;
};
