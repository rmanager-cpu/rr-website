// Runs inside the browser after fonts load. For each printed page it finds the loosest
// setting that still fits, using one dial t:
//   t = -1        roomy: spacing and type grow to fill a short page
//   t =  0        the theme's designed sizes
//   t =  0 → 0.5  spacing tightens (type untouched)
//   t = 0.5 → 1   type shrinks down to the floor
// If a page doesn't fit at t = 1, it's reported as over, with how many items to cut.
window.__fitMenu = function fitMenu(cfg) {
  const { sMin, sMax = 1.3, gMin = 0.35, gMax = 2.4 } = cfg;

  const dial = (t) => {
    if (t < 0) return { s: 1 + -t * (sMax - 1), g: 1 + -t * (gMax - 1) };
    if (t <= 0.5) return { s: 1, g: 1 - (t / 0.5) * (1 - gMin) };
    return { s: 1 - ((t - 0.5) / 0.5) * (1 - (cfg.__sMinPage ?? sMin)), g: gMin };
  };

  const report = [];
  for (const el of document.querySelectorAll('.page')) {
    const content = el.querySelector('.content');
    const flow = el.querySelector('.flow');
    const multi = el.classList.contains('cols-2');
    // A page may set its own minimum type size (data-min-type-pt); convert it to a scale floor.
    const pageMin = parseFloat(el.dataset.minTypePt || '0');
    const sMinPage = pageMin ? pageMin / cfg.basePt : sMin;
    const cornerPx = parseFloat(el.dataset.cornerIn || '0') * 96; // CSS px per inch
    const pageBox = el.getBoundingClientRect();
    // True if any line of text would sit under a corner pocket (a right triangle with legs cornerPx).
    const hitsCorner = () => {
      if (!cornerPx) return false;
      const range = document.createRange();
      const walker = document.createTreeWalker(el.querySelector('.frame'), NodeFilter.SHOW_TEXT);
      const rects = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.nodeValue.trim()) continue;
        range.selectNodeContents(n); // text-only: one rect per line fragment
        rects.push(...range.getClientRects());
      }
      for (const r of rects) {
        if (!r.width || !r.height) continue;
        const L = r.left - pageBox.left, R = pageBox.right - r.right;
        const T = r.top - pageBox.top, B = pageBox.bottom - r.bottom;
        if (L + T < cornerPx || R + T < cornerPx || L + B < cornerPx || R + B < cornerPx) return true;
      }
      return false;
    };

    const set = (t) => {
      cfg.__sMinPage = sMinPage;
      const { s, g } = dial(t);
      el.style.setProperty('--s', s.toFixed(4));
      el.style.setProperty('--g', g.toFixed(4));
    };
    const items = [...flow.querySelectorAll('.item')];
    const fits = () => {
      if (content.clientHeight < 10) return false; // header + footer ate the page
      // Nothing may spill sideways either (a long unbreakable line gets clipped, not wrapped).
      if (flow.scrollWidth > flow.clientWidth + 1) return false;
      for (const it of items) if (it.isConnected && it.scrollWidth > it.clientWidth + 1) return false;
      const inside = multi
        ? flow.scrollWidth <= flow.clientWidth + 1 && flow.scrollHeight <= content.clientHeight + 1
        : flow.offsetHeight <= content.clientHeight + 0.5;
      return inside && !hitsCorner();
    };
    const fitsAt = (t) => { set(t); return fits(); };

    // Find the smallest t that fits (= the most generous layout).
    let t;
    if (fitsAt(-1)) t = -1;
    else if (!fitsAt(1)) t = null;
    else {
      let lo = -1, hi = 1;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (fitsAt(mid)) hi = mid; else lo = mid;
      }
      t = hi;
    }

    const label = el.dataset.label;
    if (t === null) {
      // Over the limit: count how many items must go before it fits at the floor.
      set(1);
      const overflowing = multi
        ? flow.scrollWidth > flow.clientWidth + 1 || flow.scrollHeight > content.clientHeight + 1
        : flow.offsetHeight > content.clientHeight + 0.5;
      if (!overflowing && hitsCorner()) {
        report.push({ label, fits: false, reason: 'corner', itemsOver: 0 });
        continue;
      }
      const pool = [...items];
      let removed = 0;
      while (!fits() && pool.length) { pool.pop().remove(); removed++; }
      report.push({ label, fits: false, itemsOver: removed });
      continue;
    }

    // Spare room: clone a typical item from the last section until it stops fitting,
    // once at full type size (t = 0.5) and once at the floor (t = 1).
    const pool = [...flow.querySelectorAll('.sec:last-child .item:not(.inline-group)')];
    const sample = pool[pool.length - 1] ?? flow.querySelector('.item:not(.inline-group)');
    const room = {};
    if (sample) {
      for (const [key, at] of [['fullSize', 0.5], ['atFloor', 1]]) {
        const clones = [];
        let n = 0;
        set(at);
        while (n < 80) {
          const c = sample.cloneNode(true);
          sample.parentNode.appendChild(c);
          clones.push(c);
          if (!fits()) break;
          n++;
        }
        clones.forEach((c) => c.remove());
        room[key] = n;
      }
    }

    set(t);
    cfg.__sMinPage = sMinPage;
    const { s, g } = dial(t);
    report.push({
      label,
      fits: true,
      t: +t.toFixed(3),
      typeScale: +s.toFixed(3),
      spaceScale: +g.toFixed(3),
      typeShrunk: t > 0.5,
      room,
    });
  }
  return report;
};
