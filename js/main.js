// Wires up the page: draws the phones and signs, animates them while they're
// on screen, scales them to fit their boxes, and runs the hero carousel.
// You shouldn't need to touch this to change copy or add signs — see index.html.

(function () {
  // ---- Animation loop -------------------------------------------------------
  // Each animation fills `el` with render(seconds) every `every` ms (0 = draw once).
  // Anything scrolled off screen is paused.

  const animations = [];

  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const a = animations.find(a => a.el === entry.target);
      if (a) a.visible = entry.isIntersecting;
    }
  }, { rootMargin: '200px' });

  function draw(a, now) {
    a.last = now;
    const html = a.render(now / 1000 + a.offset);
    if (html !== a.html) { a.el.innerHTML = html; a.html = html; }
  }

  function animate(el, render, every, offset = 0) {
    const a = { el, render, every, offset, visible: true, last: 0, html: '' };
    animations.push(a);
    visibility.observe(el);
    draw(a, performance.now());
    return a;
  }

  function tick(now) {
    for (const a of animations) {
      if (a.visible && a.every && now - a.last >= a.every) draw(a, now);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---- Scale to fit ---------------------------------------------------------
  // Artwork is drawn at a fixed size (a sign is 537px wide). An element with
  // data-fit="537" gets --k = its width ÷ 537, and CSS scales the artwork by --k.

  const fitter = new ResizeObserver(entries => {
    for (const { target } of entries) target.style.setProperty('--k', target.clientWidth / target.dataset.fit);
  });
  document.querySelectorAll('[data-fit]').forEach(el => fitter.observe(el));

  // Add an inner .art element for the artwork to be drawn into.
  function art(el) {
    const inner = document.createElement('div');
    inner.className = 'art';
    el.append(inner);
    return inner;
  }

  // ---- Mount everything -----------------------------------------------------

  // <div class="sign" data-sign="countdown" data-offset="6">
  document.querySelectorAll('[data-sign]').forEach(el => {
    const name = el.dataset.sign;
    animate(art(el), t => Signs.render(name, t), 90, +el.dataset.offset || 0);
  });

  // <div class="screensaver" data-offset="6">
  document.querySelectorAll('.screensaver').forEach(el => {
    animate(el, Screensaver.render, 50, +el.dataset.offset || 0);
  });

  // <div class="duo" data-pose="tent" data-screen="countdown">
  document.querySelectorAll('.duo').forEach(el => {
    const inner = art(el);
    inner.innerHTML = Duo.frame(el.dataset.pose);
    el.screen = animate(inner.querySelector('.duo-screen'), () => '', 0);
    setDuoScreen(el, el.dataset.screen);
  });

  function setDuoScreen(duo, name) {
    const a = duo.screen;
    a.render = t => Duo.screen(name, t);
    a.every = Duo.isAnimated(name) ? 50 : 0;
    draw(a, performance.now());
  }

  // ---- Hero carousel --------------------------------------------------------
  // The dots in index.html list the slides: which sign, the status dot colour, and the caption.

  const hero = document.querySelector('.hero-visual');
  if (hero) {
    const duo = hero.querySelector('.duo');
    const dots = [...hero.querySelectorAll('.hero-dots button')];
    const statusDot = hero.querySelector('.hero-status .dot');
    const statusLabel = hero.querySelector('.hero-status .label');
    let current = 0, timer;

    function show(i) {
      current = (i + dots.length) % dots.length;
      const slide = dots[current].dataset;
      setDuoScreen(duo, slide.screen);
      statusDot.style.background = slide.color;
      statusLabel.textContent = slide.label;
      dots.forEach((d, k) => d.setAttribute('aria-current', k === current));
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), 5000);
    }

    dots.forEach((d, k) => d.addEventListener('click', () => show(k)));

    let startX = null;
    duo.addEventListener('pointerdown', e => { startX = e.clientX; });
    duo.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    });

    show(0);
  }
})();
