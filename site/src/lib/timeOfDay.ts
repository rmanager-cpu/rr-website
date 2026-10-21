export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];

/**
 * Which hero to show at a given moment, from the real sunrise and sunset at Tahoe City
 * (39.172° N, 120.141° W), so it follows the season: sunset is ~4:45 PM in December, ~8:30 PM in June.
 *
 *   dawn   45 min before sunrise → 2 h after
 *   day    → 1 h before sunset
 *   dusk   → 40 min after sunset
 *   night  the rest
 *
 * Self-contained on purpose (no imports, no outside names): its source is also inlined into the page
 * <head> as a tiny script that picks the hero before first paint, so there's no flash of the wrong one.
 * Sun times use the standard NOAA approximation, good to a minute or two.
 */
export function timeOfDayAt(ms: number): 'dawn' | 'day' | 'dusk' | 'night' {
  var LAT = 39.172, LON = -120.141;
  var rad = Math.PI / 180;
  var d = new Date(ms);
  var start = Date.UTC(d.getUTCFullYear(), 0, 0);
  var dayOfYear = Math.floor((ms - start) / 86400000);
  var g = (2 * Math.PI / 365) * (dayOfYear - 1);
  var eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  var decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  var cosH = Math.cos(90.833 * rad) / (Math.cos(LAT * rad) * Math.cos(decl)) - Math.tan(LAT * rad) * Math.tan(decl);
  var ha = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;
  var midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  // Sunrise/sunset in minutes after 00:00 UTC of this UTC date. Tahoe's sunset can fall after midnight
  // UTC, so check yesterday's and today's events and use whichever bracket "now".
  var riseMin = 720 - 4 * (LON + ha) - eqTime;
  var setMin = 720 - 4 * (LON - ha) - eqTime;
  var now = (ms - midnight) / 60000;
  var events = [-1440, 0, 1440].map(function (off) { return { rise: riseMin + off, set: setMin + off }; });
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    if (now >= e.rise - 45 && now < e.rise + 120) return 'dawn';
    if (now >= e.rise + 120 && now < e.set - 60) return 'day';
    if (now >= e.set - 60 && now < e.set + 40) return 'dusk';
  }
  return 'night';
}

/** The inline <head> script: sets <html data-tod="…"> before the page paints. */
export const timeOfDayBootScript = `(function(){try{var f=${timeOfDayAt.toString()};document.documentElement.dataset.tod=f(Date.now());}catch(e){document.documentElement.dataset.tod='day';}})();`;
