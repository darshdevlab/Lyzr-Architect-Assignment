// A visual invitation only: it never activates a link or takes keyboard focus.
let cleanup = () => {};
let dismissed = false;

export function setupHomeGuide(active) {
  cleanup();
  cleanup = () => {};
  if (!active || dismissed) return;
  const name = document.querySelector('#intro-name span');
  const explore = document.querySelector('.intro-path[href="#explore"]');
  if (!name || !explore) return;
  const events = new AbortController();
  let timer;
  let frame;
  let pointer;
  let resting = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const place = (x, y) => {
    if (!pointer) return;
    pointer.style.left = `${Math.max(6, Math.min(innerWidth - 38, x))}px`;
    pointer.style.top = `${Math.max(6, Math.min(innerHeight - 38, y))}px`;
  };
  const destination = () => {
    const box = explore.querySelector('.path-action').getBoundingClientRect();
    return { x: box.left + Math.min(box.width * 0.6, 175), y: box.top + box.height / 2 };
  };
  const track = () => {
    if (!resting) return;
    const p = destination();
    // Hide the pointer when the actual target is outside the viewport.
    pointer.hidden = p.y < 0 || p.y > innerHeight;
    place(p.x, p.y);
  };
  const stop = () => {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    events.abort();
    pointer?.remove();
    explore.classList.remove('home-guide-target');
  };
  cleanup = stop;
  const dismiss = () => { dismissed = true; stop(); };
  for (const event of ['pointerdown', 'keydown', 'wheel', 'touchstart']) {
    window.addEventListener(event, dismiss, { capture: true, passive: true, signal: events.signal });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  }, { signal: events.signal });
  window.addEventListener('resize', track, { signal: events.signal });
  window.addEventListener('scroll', track, { passive: true, signal: events.signal });
  timer = setTimeout(() => {
    if (!document.body.classList.contains('landing') || document.hidden) return stop();
    pointer = document.createElement('div');
    pointer.className = 'home-guide-pointer';
    pointer.setAttribute('aria-hidden', 'true');
    pointer.innerHTML = '<span class="home-guide-cursor"></span><span class="home-guide-ripple"></span>';
    document.body.append(pointer);
    const start = name.getBoundingClientRect();
    place(start.right + 10, start.bottom - 16);
    if (reducedMotion.matches) {
      resting = true;
      explore.classList.add('home-guide-target');
      track();
      return;
    }
    timer = setTimeout(() => {
      const origin = pointer.getBoundingClientRect();
      const startScroll = window.scrollY;
      const card = explore.getBoundingClientRect();
      const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const endScroll = Math.max(0, Math.min(maximum, startScroll + card.top - Math.max(90, (innerHeight - card.height) / 2)));
      const started = performance.now();
      function move(now) {
        const progress = Math.min(1, (now - started) / 2400);
        const ease = progress * progress * (3 - 2 * progress);
        window.scrollTo({ top: startScroll + (endScroll - startScroll) * ease, behavior: 'instant' });
        const end = destination();
        place(origin.left + (end.x - origin.left) * ease, origin.top + (end.y - origin.top) * ease);
        if (progress < 1) frame = requestAnimationFrame(move);
        else {
          resting = true;
          pointer.classList.add('is-clicking');
          explore.classList.add('home-guide-target');
          track();
        }
      }
      frame = requestAnimationFrame(move);
    }, 850);
  }, 3000);
}
