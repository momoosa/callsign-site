// "Screen saver" sign: a DVD-style logo bouncing around, leaving a rainbow trail.
// Same 30-second meeting loop as signs.js. Shown inside the landscape phone
// in the "Three ways to stand it up" section.

(function () {
  const LOOP = 30, CALL = 25;
  const W = 537, H = 380, LOGO_W = 190, LOGO_H = 104;
  const FREE_GREEN = '#3DDC84';

  // Bounce back and forth between 0 and max.
  const bounce = (p, max) => { const k = ((p % (2 * max)) + 2 * max) % (2 * max); return k < max ? k : 2 * max - k; };

  // Logo position at time t: it crosses the screen 6 times horizontally and
  // 5 times vertically over the meeting, so it hits a corner right at the end.
  function position(t) {
    t = Math.max(0, Math.min(t, CALL));
    const maxX = W - LOGO_W, maxY = H - LOGO_H;
    const px = .15 * maxX + (6 - .15) * maxX * t / CALL;
    const py = .4 * maxY + (5 - .4) * maxY * t / CALL;
    return { x: bounce(px, maxX), y: bounce(py, maxY) };
  }

  function logo(pos, color, opacity, inCall) {
    return `
    <div style="position:absolute;left:0;top:0;width:${LOGO_W}px;height:${LOGO_H}px;transform:translate(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px);opacity:${opacity};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:${color}">
      <div style="font-family:var(--font-display);font-size:32px;font-weight:800;font-style:italic;letter-spacing:-.045em;line-height:.95;white-space:nowrap">${inCall ? 'IN A CALL' : 'FREE'}</div>
      <div style="width:160px;height:34px;border-radius:50%;background:${color};color:#000;display:flex;align-items:center;justify-content:center;font-size:13.5px;font-weight:800;letter-spacing:.12em;white-space:nowrap">${inCall ? 'BACK 15:30' : 'COME IN'}</div>
    </div>`;
  }

  function render(seconds) {
    const T = seconds % LOOP, inCall = T < CALL, tc = Math.min(T, CALL), q = tc / CALL;
    const rem = Math.round((1 - q) * 5421);
    const clock = `${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, '0')}`;
    const hue = t => Math.round((t * 38) % 360);

    let logos = '';
    for (let k = 18; k >= 1; k--) {       // the fading trail, oldest first
      const t = tc - k * .08;
      logos += logo(position(t), `hsl(${hue(t)},95%,64%)`, inCall ? +(.5 * (1 - k / 19)).toFixed(2) : 0, inCall);
    }
    logos += logo(position(tc), inCall ? `hsl(${hue(tc)},95%,64%)` : FREE_GREEN, 1, inCall);

    return `
    <div style="position:relative;width:${W}px;height:${H}px;border-radius:30px;overflow:hidden;background:#000;color:#fff">
      ${logos}
      <div style="position:absolute;left:24px;right:24px;top:20px;display:flex;justify-content:space-between;gap:12px;font-family:var(--font-mono);font-size:13.5px;font-weight:800;letter-spacing:.1em;color:rgba(255,255,255,.7)">
        <div>LEAVING A TRAIL</div><div style="font-variant-numeric:tabular-nums">${inCall ? `${clock} LEFT` : 'COME IN'}</div>
      </div>
    </div>`;
  }

  window.Screensaver = { render };
})();
