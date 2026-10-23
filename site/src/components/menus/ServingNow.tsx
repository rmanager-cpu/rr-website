'use client';

import { useEffect, useState } from 'react';
import type { Hours } from '@/lib/menus/store';

/** "Serving now" chip, from the menu's hours in Tahoe City time. Shown only in the browser. */
export function ServingNow({ hours }: { hours: Hours[] }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.find((p) => p.type === 'weekday')!.value) + 1;
      const now = `${parts.find((p) => p.type === 'hour')!.value}:${parts.find((p) => p.type === 'minute')!.value}`;
      setOn(hours.some((h) => h.days.includes(wd) && now >= h.start && now < h.end));
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [hours]);
  if (!on) return null;
  return <span className="serving-now">Serving now</span>;
}
