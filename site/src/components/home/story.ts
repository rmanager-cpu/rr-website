/*
 * The homepage scroll story. Ported from prototypes/home-scroll (prototype/home-scroll branch).
 *
 * One sticky stage, three equal acts after a still hero:
 *   A. hero -> Stay: the lodge photo shrinks into a frame and dissolves into the entrance; the panorama
 *      comes up behind; the hero "Stay" flies into place as the heading.
 *   B. Stay -> Dine and C. Dine -> Celebrate: the current frame opens to full screen, dissolves into the
 *      next main photo, which shrinks into its own frame while the next backdrop fades in behind.
 * Visitors who ask for reduced motion get jump cuts between the four resting states.
 *
 * Performance: one passive scroll listener, at most one render per animation frame. The stage has a
 * fixed size and `contain: strict`, so the frames' size changes never re-lay out the rest of the page.
 * Deferred photos (.hs-defer) are display:none until the visitor scrolls or the page has loaded.
 *
 * Returns a cleanup function (for React's effect).
 */

type Rect = { l: number; t: number; w: number; h: number };
type Float = { l: number; b: number; w: number; ar: number; r: number; d: number; s: number; hide?: boolean };
type Layout = { frame: Rect } & Record<string, Rect | Float>;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a)));
const hex = (h: string) => h.match(/\w\w/g)!.map((x) => parseInt(x, 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((c, i) => Math.round(lerp(c, B[i], t))).join(',')})`;
};
const C = { navy: '10263B', glacier: 'E6F1F6', paper: 'F6F5EC', ink: '10263B', charcoal: '1B2A2A', pine: '18241C' };
const FRAME_W = 9;
const NARROW = 860;

// Resting spots in viewport units. Every section uses the same kit, mirrored: one main frame and one
// supporting photo of the same size and shape (4:3), overlapping the frame's lower outside corner and
// tilted outward. Stay and Celebrate: words left, frame right. Dine: words right, frame left.
// l = left edge (vw), b = bottom edge (vh), w = width (vw), ar = height / width, r = tilt (deg),
// d = when it starts arriving (share of the act), s = how far below it starts (vh).
const FRAME_RIGHT: Rect = { l: 46, t: 11, w: 48, h: 78 };
const FRAME_LEFT: Rect = { l: 6, t: 11, w: 48, h: 78 };
const FRAME_PHONE: Rect = { l: 6, t: 10, w: 88, h: 39 };
const SUPPORT = { w: 24, ar: 0.75, b: 93, s: 130 };
const SUPPORT_PHONE = { w: 50, ar: 0.75, b: 54, s: 130 };
const onRight = (d: number): Float => ({ ...SUPPORT, l: 100 - SUPPORT.w - 2, r: 3, d });
const onLeft = (d: number): Float => ({ ...SUPPORT, l: 2, r: -3, d });
const phoneRight = (d: number): Float => ({ ...SUPPORT_PHONE, l: 100 - SUPPORT_PHONE.w - 3, r: 3, d });
const phoneLeft = (d: number): Float => ({ ...SUPPORT_PHONE, l: 3, r: -3, d });

const LAYOUT_A: Record<'wide' | 'narrow', Layout> = {
  wide: { frame: FRAME_RIGHT, skiroom: onRight(0.38) },
  narrow: { frame: FRAME_PHONE, skiroom: phoneRight(0.38) },
};
const LAYOUT_B: Record<'wide' | 'narrow', Layout> = {
  wide: { frame: FRAME_LEFT, lamb: onLeft(0.5) },
  narrow: { frame: FRAME_PHONE, lamb: phoneLeft(0.5) },
};
const LAYOUT_C: Record<'wide' | 'narrow', Layout> = {
  wide: { frame: FRAME_RIGHT, cake: onRight(0.5) },
  narrow: { frame: FRAME_PHONE, cake: phoneRight(0.5) },
};
const SPLIT = 1 / 3, SPLIT2 = 2 / 3;

export function startStory(root: HTMLElement): () => void {
  const q = <T extends HTMLElement = HTMLElement>(k: string) => root.querySelector<T>(`[data-hs="${k}"]`)!;
  const qa = (sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const track = q('track'), stage = q('stage'), frame = q('frame'), grade = q('grade'), pano = q('pano');
  const heroImg = frame.querySelector<HTMLElement>('.hs-frame__hero')!;
  const entranceImg = frame.querySelector<HTMLElement>('.hs-frame__entrance')!;
  const stayWord = q('stayWord'), staySlot = q('staySlot'), stayCopy = q('stayCopy');
  const fades = qa('[data-fade]'), cue = q('cue'), nav = q('nav');
  const barbg = q('barbg'), barWash = q('barWash'), dineCopy = q('dineCopy'), frame2 = q('frame2');
  const pondbg = q('pondbg'), pondWash = q('pondWash'), celCopy = q('celCopy'), frame3 = q('frame3');
  const floatsA = qa('[data-float]'), floatsB = qa('[data-floatb]'), floatsC = qa('[data-floatc]');
  const cv = q<HTMLCanvasElement>('flakes'), ctx = cv.getContext('2d');

  let LA = LAYOUT_A.wide, LB = LAYOUT_B.wide, LC = LAYOUT_C.wide;
  let vw = 0, vh = 0, flip = { x: 0, y: 0, s: 1 }, progress = 0, lastP = 0, actB = 0, actC = 0;
  let snowAmount = 0, snowRunning = false, scrollSpeed = 0, dpr = 1;
  let flakes: { x: number; y: number; r: number; v: number; w: number }[] = [];
  let raf = 0, snowRaf = 0, pending = false, alive = true;
  const isWide = () => LA === LAYOUT_A.wide;
  const px = (v: number) => v + 'px';

  // ---------- deferred photos ----------
  let armed = false;
  const arm = () => {
    if (armed) return;
    armed = true;
    root.classList.add('is-armed');
  };
  const armLater = () => window.setTimeout(arm, 1200);
  let armTimer = 0;
  if (document.readyState === 'complete') armTimer = armLater();
  else window.addEventListener('load', () => (armTimer = armLater()), { once: true });

  // ---------- layout ----------
  function setRect(el: HTMLElement, l: number, t: number, w: number, h: number) {
    el.style.left = px(l); el.style.top = px(t); el.style.width = px(w); el.style.height = px(h);
  }
  function placeFloats(els: HTMLElement[], lay: Layout, key: string) {
    els.forEach((f) => {
      const c = lay[f.dataset[key]!] as Float;
      f.hidden = !!c.hide;
      if (c.hide) return;
      const w = (c.w * vw) / 100, h = w * c.ar;
      setRect(f, (c.l * vw) / 100, (c.b * vh) / 100 - h, w, h);
    });
  }
  function measure() {
    vw = window.innerWidth;
    vh = stage.clientHeight || window.innerHeight;
    const k = vw <= NARROW ? 'narrow' : 'wide';
    LA = LAYOUT_A[k]; LB = LAYOUT_B[k]; LC = LAYOUT_C[k];
    placeFloats(floatsA, LA, 'float');
    placeFloats(floatsB, LB, 'floatb');
    placeFloats(floatsC, LC, 'floatc');
    const fb = LB.frame, fc = LC.frame;
    setRect(frame2, (fb.l * vw) / 100, (fb.t * vh) / 100, (fb.w * vw) / 100, (fb.h * vh) / 100);
    setRect(frame3, (fc.l * vw) / 100, (fc.t * vh) / 100, (fc.w * vw) / 100, (fc.h * vh) / 100);
    // FLIP: the hero "Stay" travels to the Stay heading slot.
    const prev = stayWord.style.transform, prevShift = stayCopy.style.translate;
    stayWord.style.transform = 'none'; stayCopy.style.translate = '0 0';
    const a = stayWord.getBoundingClientRect(), b = staySlot.getBoundingClientRect();
    stayWord.style.transform = prev; stayCopy.style.translate = prevShift;
    flip = { x: b.left - a.left, y: b.top - a.top, s: a.height ? b.height / a.height : 1 };
    sizeCanvas();
  }

  // ---------- render ----------
  function render(p: number) {
    if (reduce) p = p < SPLIT * 0.5 ? 0 : p < (SPLIT + SPLIT2) / 2 ? SPLIT : p < (SPLIT2 + 1) / 2 ? SPLIT2 : 1;
    const pa = clamp(p / SPLIT), pb = clamp((p - SPLIT) / (SPLIT2 - SPLIT)), pc = clamp((p - SPLIT2) / (1 - SPLIT2));
    actB = pb; actC = pc;
    renderA(pa, pb);
    renderB(pb, pc);
    renderC(pc);
  }

  function renderA(p: number, pb: number) {
    const out = seg(p, 0, 0.16), shrink = seg(p, 0.06, 0.5), swap = seg(p, 0.34, 0.52);
    const day = seg(p, 0.22, 0.62), copy = seg(p, 0.68, 0.92), move = seg(p, 0.1, 0.62);
    const panoIn = seg(p, 0.12, 0.32) * (1 - 0.42 * seg(p, 0.56, 0.82));
    const leave = seg(pb, 0.02, 0.26);

    const G = hex(C.navy).map((c, i) => lerp(lerp(c, hex(C.glacier)[i], day), hex(C.paper)[i], copy));
    stage.style.backgroundColor = `rgb(${G.map(Math.round).join(',')})`;

    if (pb <= 0) {
      const f = LA.frame;
      // The left edge clears first so the lettering lands on light ground, not on the photo.
      const left = lerp(0, (f.l * vw) / 100, isWide() ? seg(p, 0.04, 0.3) : shrink);
      setRect(frame, left, lerp(0, (f.t * vh) / 100, shrink), lerp(vw, ((f.l + f.w) * vw) / 100, shrink) - left, lerp(vh, (f.h * vh) / 100, shrink));
      frame.style.borderWidth = px(lerp(0, FRAME_W, shrink));
      frame.style.borderRadius = shrink > 0.5 ? '3px' : '0';
      frame.style.boxShadow = `0 30px 70px rgba(16,38,59,${(0.32 * shrink).toFixed(3)})`;
    }
    grade.style.opacity = (1 - shrink).toFixed(3);
    heroImg.style.transform = `scale(${lerp(1, 1.08, seg(p, 0, 0.4)).toFixed(4)})`;
    entranceImg.style.opacity = swap.toFixed(3);
    heroImg.style.opacity = (1 - swap * 0.999).toFixed(3);

    pano.style.opacity = (panoIn * 0.95 * (1 - seg(pb, 0.14, 0.34))).toFixed(3);
    pano.style.transform = `translateY(${lerp(6, -5, p).toFixed(2)}vh) scale(${lerp(1.18, 1.04, p).toFixed(3)})`;

    fades.forEach((el) => {
      el.style.opacity = (1 - out).toFixed(3);
      el.style.transform = `translateY(${(-out * 5).toFixed(2)}vh)`;
    });
    cue.style.opacity = (0.7 * (1 - seg(p, 0, 0.05))).toFixed(3);
    stayWord.style.transform = `translate(${(flip.x * move).toFixed(1)}px, ${(flip.y * move - leave * vh * 0.22).toFixed(1)}px) scale(${lerp(1, flip.s, move).toFixed(4)})`;
    stayWord.style.color = mix(C.paper, C.ink, isWide() ? seg(p, 0.13, 0.27) : seg(p, 0.3, 0.44));
    stayWord.style.textShadow = `0 3px 26px rgba(10,24,38,${(0.35 * (1 - day)).toFixed(3)})`;
    stayWord.style.opacity = (1 - seg(pb, 0.02, 0.16)).toFixed(3);

    floatsA.forEach((el, i) => {
      const c = LA[el.dataset.float!] as Float;
      if (c.hide) return;
      const t = seg(p, c.d, c.d + 0.3);
      const drift = (1 - t) * c.s - leave * (110 + i * 45);
      el.style.transform = `translate3d(0, ${drift.toFixed(2)}vh, 0) rotate(${lerp(c.r * 2.2, c.r, t).toFixed(2)}deg)`;
    });

    stayCopy.style.opacity = (copy * (1 - seg(pb, 0.02, 0.14))).toFixed(3);
    stayCopy.style.translate = `0 ${((1 - copy) * 18 - seg(pb, 0.02, 0.2) * vh * 0.18).toFixed(1)}px`;
    stayCopy.classList.toggle('is-on', copy > 0.6 && pb < 0.05);
    snowAmount = reduce ? 0 : seg(p, 0.005, 0.06) * (1 - seg(p, 0.45, 0.7));
  }

  // Shrink from full screen into a target rect; the edge facing the words clears first.
  function shrinkRect(r: Rect, t: number, tFast: number, wordsOnLeft: boolean): [number, number, number, number] {
    const L0 = (r.l * vw) / 100, T0 = (r.t * vh) / 100, R0 = ((r.l + r.w) * vw) / 100, B0 = ((r.t + r.h) * vh) / 100;
    const left = lerp(0, L0, wordsOnLeft ? tFast : t), right = lerp(vw, R0, wordsOnLeft ? t : tFast);
    return [left, lerp(0, T0, t), right - left, lerp(vh, B0, t) - lerp(0, T0, t)];
  }
  function growRect(r: Rect, t: number): [number, number, number, number] {
    const L0 = (r.l * vw) / 100, T0 = (r.t * vh) / 100, W0 = (r.w * vw) / 100, H0 = (r.h * vh) / 100;
    return [lerp(L0, 0, t), lerp(T0, 0, t), lerp(W0, vw, t), lerp(H0, vh, t)];
  }

  function renderB(pb: number, pc: number) {
    if (pb <= 0) {
      frame.style.opacity = '1';
      barbg.style.opacity = '0'; barWash.style.opacity = '0';
      dineCopy.style.opacity = '0'; dineCopy.classList.remove('is-on');
      frame2.style.opacity = '0';
      floatsB.forEach((el) => (el.style.transform = 'translate3d(0,200vh,0)'));
      return;
    }
    const grow = seg(pb, 0.04, 0.3), swap = seg(pb, 0.26, 0.4);
    const shrink = seg(pb, 0.38, 0.76), fast = seg(pb, 0.38, 0.6);
    const back = seg(pb, 0.36, 0.62), copy = seg(pb, 0.64, 0.88), night = seg(pb, 0.2, 0.4);

    setRect(frame, ...growRect(LA.frame, grow));
    frame.style.borderWidth = px(lerp(FRAME_W, 0, grow));
    frame.style.boxShadow = `0 30px 70px rgba(16,38,59,${(0.32 * (1 - grow)).toFixed(3)})`;
    frame.style.opacity = (1 - swap).toFixed(3);

    if (pc <= 0) {
      setRect(frame2, ...shrinkRect(LB.frame, shrink, fast, false));
      frame2.style.borderWidth = px(lerp(0, FRAME_W, shrink));
      frame2.style.opacity = swap.toFixed(3);
    }

    const gone = seg(pc, 0.36, 0.6);
    barbg.style.opacity = (back * 0.86 * (1 - gone)).toFixed(3);
    barbg.style.transform = `scale(${lerp(1.12, 1.03, back).toFixed(4)})`;
    barWash.style.opacity = (back * (1 - gone)).toFixed(3);

    const G = hex(C.paper).map((c, i) => lerp(c, hex(C.charcoal)[i], night));
    stage.style.backgroundColor = `rgb(${G.map(Math.round).join(',')})`;

    const leave = seg(pc, 0.02, 0.24);
    floatsB.forEach((el, i) => {
      const c = LB[el.dataset.floatb!] as Float;
      if (c.hide) return;
      const t = seg(pb, c.d, c.d + 0.3);
      el.style.transform = `translate3d(0, ${((1 - t) * c.s - leave * (110 + i * 45)).toFixed(2)}vh, 0) rotate(${lerp(c.r * 2.2, c.r, t).toFixed(2)}deg)`;
    });

    dineCopy.style.opacity = (copy * (1 - seg(pc, 0.02, 0.14))).toFixed(3);
    dineCopy.style.translate = `${((1 - copy) * 6).toFixed(2)}vw ${(-seg(pc, 0.02, 0.2) * 18).toFixed(2)}vh`;
    dineCopy.classList.toggle('is-on', copy > 0.6 && pc < 0.05);
  }

  function renderC(pc: number) {
    if (pc <= 0) {
      pondbg.style.opacity = '0'; pondWash.style.opacity = '0';
      celCopy.style.opacity = '0'; celCopy.classList.remove('is-on');
      frame3.style.opacity = '0';
      floatsC.forEach((el) => (el.style.transform = 'translate3d(0,200vh,0)'));
      return;
    }
    const grow = seg(pc, 0.04, 0.3), swap = seg(pc, 0.26, 0.4);
    const shrink = seg(pc, 0.38, 0.76), fast = seg(pc, 0.38, 0.6);
    const back = seg(pc, 0.36, 0.62), copy = seg(pc, 0.64, 0.88);

    setRect(frame2, ...growRect(LB.frame, grow));
    frame2.style.borderWidth = px(lerp(FRAME_W, 0, grow));
    frame2.style.opacity = (1 - swap).toFixed(3);

    setRect(frame3, ...shrinkRect(LC.frame, shrink, fast, true));
    frame3.style.borderWidth = px(lerp(0, FRAME_W, shrink));
    frame3.style.opacity = swap.toFixed(3);

    pondbg.style.opacity = (back * 0.88).toFixed(3);
    pondbg.style.transform = `scale(${lerp(1.12, 1.03, back).toFixed(4)})`;
    pondWash.style.opacity = back.toFixed(3);
    const G = hex(C.charcoal).map((c, i) => lerp(c, hex(C.pine)[i], seg(pc, 0.2, 0.4)));
    stage.style.backgroundColor = `rgb(${G.map(Math.round).join(',')})`;

    floatsC.forEach((el) => {
      const c = LC[el.dataset.floatc!] as Float;
      const t = seg(pc, c.d, c.d + 0.3);
      el.style.transform = `translate3d(0, ${((1 - t) * c.s).toFixed(2)}vh, 0) rotate(${lerp(c.r * 2.2, c.r, t).toFixed(2)}deg)`;
    });

    celCopy.style.opacity = copy.toFixed(3);
    celCopy.style.translate = `${(-(1 - copy) * 6).toFixed(2)}vw 0`;
    celCopy.classList.toggle('is-on', copy > 0.6);
  }

  function navTone() {
    const r = track.getBoundingClientRect();
    const inStory = r.bottom > vh + 2;
    const light = inStory ? progress > SPLIT * (isWide() ? 0.24 : 0.4) && actB < 0.2 && actC <= 0 : false;
    nav.classList.toggle('is-light', light);
    nav.classList.toggle('is-solid', !inStory);
    root.style.setProperty('--hs-top-band', light ? 'var(--hs-paper)' : 'var(--hs-navy)');
  }

  function update() {
    pending = false;
    if (!alive) return;
    const r = track.getBoundingClientRect();
    const len = Math.max(r.height - vh, 1);
    lastP = progress;
    progress = clamp(-r.top / len);
    scrollSpeed = Math.min(Math.abs(progress - lastP) * 60, 3);
    render(progress);
    navTone();
    if (snowAmount > 0 && !snowRunning) startSnow();
  }
  function onScroll() {
    arm();
    if (!pending) {
      pending = true;
      raf = requestAnimationFrame(update);
    }
  }

  // ---------- snow, only once the visitor starts scrolling ----------
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = vw * dpr; cv.height = vh * dpr;
    const n = vw < NARROW ? 70 : 150;
    flakes = Array.from({ length: n }, () => ({ x: Math.random() * vw, y: Math.random() * vh, r: Math.random() * 2.2 + 0.6, v: Math.random() * 0.6 + 0.35, w: Math.random() * Math.PI * 2 }));
  }
  function startSnow() {
    snowRunning = true;
    snowRaf = requestAnimationFrame(tick);
  }
  function tick() {
    if (!ctx || !alive) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    if (snowAmount <= 0.001) { snowRunning = false; return; }
    ctx.fillStyle = `rgba(246,245,236,${(0.85 * snowAmount).toFixed(3)})`;
    const boost = 1 + scrollSpeed * 2.5;
    for (const f of flakes) {
      f.w += 0.01; f.y += f.v * boost * (f.r * 0.55); f.x += Math.sin(f.w) * 0.35;
      if (f.y > vh + 4) { f.y = -4; f.x = Math.random() * vw; }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    scrollSpeed *= 0.92;
    snowRaf = requestAnimationFrame(tick);
  }

  // ---------- hero links jump to their act ----------
  function onClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-go]');
    if (!a) return;
    e.preventDefault();
    arm();
    const span = track.offsetHeight - vh;
    const at = { stay: SPLIT, dine: SPLIT2, celebrate: 1 }[a.dataset.go as 'stay' | 'dine' | 'celebrate'] ?? 0;
    window.scrollTo({ top: track.offsetTop + Math.round(span * at), behavior: reduce ? 'auto' : 'smooth' });
  }

  const onResize = () => { measure(); update(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  root.addEventListener('click', onClick);
  root.classList.add('is-live');
  onResize();
  document.fonts?.ready.then(() => alive && onResize());
  // Arrived scrolled down (back button, #anchor): show the photos straight away.
  if (window.scrollY > 0) arm();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(snowRaf);
    window.clearTimeout(armTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    root.removeEventListener('click', onClick);
  };
}
