// 3D iPhone Duo mockup, drawn with CSS transforms on a 760×600 stage.
//
//   Duo.frame('tent')   → folded like a tent, outer display facing the room
//   Duo.frame('laptop') → open like a laptop, with call controls on the flat half
//
// The frame is drawn once. Its screen (.duo-screen) is filled separately with
// Duo.screen(name, seconds), so the hero can swap signs without redrawing the phone.

(function () {
  const SILVER = ['#F4F5F6', '#B9BDC1', '#7E8388'];   // light → dark finish
  const YAW = 26;                                     // degrees the phone is turned
  const [F1, F2, F3] = SILVER;
  const METAL = `linear-gradient(160deg,${F1},${F2} 55%,${F3})`;
  const DISPLAY = 'font-family:var(--font-display)';

  // The thin metal sides of each half, seen edge-on.
  const EDGES = `
    <div style="position:absolute;left:0;top:48px;bottom:48px;width:13px;background:linear-gradient(90deg,${F3},${F1} 50%,${F3});transform-origin:0 50%;transform:rotateY(90deg)"></div>
    <div style="position:absolute;right:0;top:48px;bottom:48px;width:13px;background:linear-gradient(90deg,${F3},${F2} 50%,${F3});transform-origin:100% 50%;transform:rotateY(-90deg)"></div>`;

  const POSES = {
    tent: {
      hingeY: 110, pitch: -8, shadowBottom: 60,
      front: { top: 0, height: 403, pad: '4px', radius: '10px 10px 46px 46px', origin: '50% 0', transform: 'rotateX(31deg)' },
      bezel: { pad: '7px', radius: '7px 7px 42px 42px' },
      screenRadius: '3px 3px 35px 35px',
      camera: 'right:18px;bottom:18px',
    },
    laptop: {
      hingeY: 410, pitch: -22, shadowBottom: 10,
      front: { top: -392, height: 392, pad: '4px 4px 0', radius: '46px 46px 0 0', origin: '50% 100%', transform: 'rotateX(6deg)' },
      bezel: { pad: '7px 7px 0', radius: '42px 42px 0 0' },
      screenRadius: '35px 35px 0 0',
      camera: 'right:18px;top:18px',
    },
  };

  // Tent pose: the back half, leaning away, plus the hinge along the top.
  const TENT_BACK = `
    <div style="position:absolute;left:-280px;top:0;width:560px;height:403px;padding:4px;border-radius:10px 10px 46px 46px;background:${METAL};transform-style:preserve-3d;transform-origin:50% 0;transform:rotateX(-31deg)">
      ${EDGES}
      <div style="width:100%;height:100%;border-radius:7px 7px 42px 42px;background:linear-gradient(200deg,#1A1D20,#050607 60%)"></div>
    </div>
    <div style="position:absolute;left:-281px;top:-5px;width:562px;height:10px;border-radius:99px;background:linear-gradient(180deg,${F1},${F3});transform:translateZ(1px)"></div>`;

  // Laptop pose: the flat half on the desk, showing mute and camera controls.
  const LAPTOP_BASE = `
    <div style="position:absolute;left:-280px;top:0;width:560px;height:392px;padding:0 4px 4px;border-radius:0 0 46px 46px;background:${METAL};transform-origin:50% 0;transform:rotateX(90deg)">
      <div style="padding:0 7px 7px;border-radius:0 0 42px 42px;background:#000">
        <div style="position:relative;width:538px;height:381px;border-radius:0 0 35px 35px;overflow:hidden;background:#0B0C0E">
          <div style="position:absolute;left:0;right:0;top:0;height:14px;background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,0));z-index:2"></div>
          <div style="height:100%;padding:26px 28px 30px;display:flex;flex-direction:column;gap:18px;color:#fff;background:linear-gradient(180deg,#123543,#061219)">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <div style="${DISPLAY};font-size:28px;font-weight:800;letter-spacing:-.038em">Design review</div>
              <div style="font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;color:#5ED2F0">23:41 left</div>
            </div>
            <div style="flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
              <div style="border-radius:24px;background:#D93A2B;display:flex;flex-direction:column;justify-content:space-between;padding:18px">
                <div style="font-size:13.5px;font-weight:700;letter-spacing:.13em;color:rgba(255,255,255,.8)">MIC</div>
                <div style="${DISPLAY};font-size:34px;font-weight:800;letter-spacing:-.045em">Muted</div>
              </div>
              <div style="border-radius:24px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);display:flex;flex-direction:column;justify-content:space-between;padding:18px">
                <div style="font-size:13.5px;font-weight:700;letter-spacing:.13em;color:rgba(255,255,255,.6)">CAMERA</div>
                <div style="${DISPLAY};font-size:34px;font-weight:800;letter-spacing:-.045em">On</div>
              </div>
              <div style="border-radius:24px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;${DISPLAY};font-size:28px;font-weight:800;letter-spacing:-.038em">+5 min</div>
              <div style="border-radius:24px;background:#F4F6F7;color:#0B0C0E;display:flex;align-items:center;justify-content:center;${DISPLAY};font-size:28px;font-weight:800;letter-spacing:-.038em">Leave call</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  function frame(poseName) {
    const p = POSES[poseName] || POSES.tent, f = p.front;
    return `
    <div style="position:relative;width:760px;height:600px;perspective:1800px;perspective-origin:50% 40%">
      <div style="position:absolute;left:50%;bottom:${p.shadowBottom}px;width:640px;height:90px;margin-left:-320px;border-radius:50%;background:radial-gradient(closest-side,rgba(8,40,52,.34),rgba(8,40,52,0));filter:blur(8px)"></div>
      <div style="position:absolute;left:50%;top:${p.hingeY}px;width:0;height:0;transform-style:preserve-3d;transform:rotateX(${p.pitch}deg) rotateY(${YAW}deg)">
        ${poseName === 'laptop' ? '' : TENT_BACK}
        <div style="position:absolute;left:-280px;top:${f.top}px;width:560px;height:${f.height}px;padding:${f.pad};border-radius:${f.radius};background:${METAL};box-shadow:inset 0 1px 0 rgba(255,255,255,.7);transform-style:preserve-3d;transform-origin:${f.origin};transform:${f.transform}">
          ${EDGES}
          <div style="padding:${p.bezel.pad};border-radius:${p.bezel.radius};background:#000">
            <div style="position:relative;width:538px;height:381px;border-radius:${p.screenRadius};overflow:hidden;background:#000;color:#fff">
              <div class="duo-screen" style="position:absolute;inset:0"></div>
              <div style="position:absolute;${p.camera};width:22px;height:22px;border-radius:99px;background:#050607;box-shadow:inset 0 0 0 2px #1C1F23"></div>
              <div style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.14),rgba(255,255,255,0) 38%)"></div>
            </div>
          </div>
        </div>
        ${poseName === 'laptop' ? LAPTOP_BASE : ''}
      </div>
    </div>`;
  }

  // Screens that only exist on the Duo mockup. Everything else comes from signs.js.
  const SCREENS = {
    // A card bouncing around, changing colour each time it hits an edge.
    dvd(t) {
      const maxX = 538 - 200, maxY = 381 - 120;
      const bounce = (p, m) => { const k = p % (2 * m); return k < m ? k : 2 * m - k; };
      const hits = Math.floor(t * 70 / maxX) + Math.floor(t * 52 / maxY);
      const color = ['#D93A2B', '#0A7EA4', '#8A4FA0', '#D0682E'][hits % 4];
      return `
      <div style="position:relative;height:100%;background:#000;overflow:hidden">
        <div style="position:absolute;left:${bounce(t * 70, maxX).toFixed(1)}px;top:${bounce(t * 52, maxY).toFixed(1)}px;width:200px;height:120px;border-radius:14px;background:${color};padding:14px 16px;display:flex;flex-direction:column;justify-content:flex-end">
          <div style="${DISPLAY};font-size:30px;font-weight:800;letter-spacing:-.04em;line-height:1">In a call</div>
          <div style="font-size:13.5px;font-weight:600;margin-top:4px">Back at 15:30</div>
        </div>
      </div>`;
    },

    // The side facing you in laptop mode: time left, agenda, and a "you're muted" warning.
    yourside(t) {
      const talking = (t % 6) > 3.2;   // pretend you start talking while muted
      const meter = Signs.repeat(28, i => {
        const level = talking ? Math.abs(Math.sin(t * 9 + i * .7)) * (.35 + .65 * Math.abs(Math.sin(i * 1.3 + t))) : .08;
        return `<div style="flex:1;height:${Math.max(3, Math.round(level * 22))}px;border-radius:99px;background:${talking ? 'rgba(11,12,14,.75)' : 'rgba(255,255,255,.35)'}"></div>`;
      });
      const agendaRow = (time, text, style, timeStyle = '') => `
        <div style="display:flex;gap:10px;padding:8px 0;border-top:1px solid rgba(255,255,255,.12);font-size:15px;${style}">
          <div style="font-variant-numeric:tabular-nums;${timeStyle}">${time}</div><div>${text}</div>
        </div>`;
      return `
      <div style="position:relative;height:100%;padding:26px 28px 22px;display:grid;grid-template-columns:170px minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;gap:18px 24px;background:#0B0C0E">
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
          <div style="position:relative;width:160px;height:160px;border-radius:99px;background:conic-gradient(#5ED2F0 0 268deg,rgba(255,255,255,.12) 268deg 360deg)">
            <div style="position:absolute;inset:12px;border-radius:99px;background:#0B0C0E;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div style="${DISPLAY};font-size:40px;font-weight:800;letter-spacing:-.045em;font-variant-numeric:tabular-nums">23:41</div>
              <div style="font-size:12px;font-weight:700;letter-spacing:.13em;color:rgba(255,255,255,.55)">LEFT</div>
            </div>
          </div>
          <div style="text-align:center">
            <div style="font-size:12px;font-weight:700;letter-spacing:.13em;color:rgba(255,255,255,.5)">NEXT · 16:00</div>
            <div style="font-size:15px;font-weight:700;margin-top:2px">1:1 with Sam</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;min-width:0">
          <div style="${DISPLAY};font-size:24px;font-weight:800;letter-spacing:-.035em">Design review</div>
          <div style="font-size:12px;font-weight:700;letter-spacing:.13em;color:rgba(255,255,255,.5)">AGENDA · FROM THE INVITE</div>
          <div style="display:flex;flex-direction:column">
            ${agendaRow('14:00', '<s>Recap of last sprint</s>', 'color:rgba(255,255,255,.45)')}
            ${agendaRow('14:40', 'Onboarding flow, v3', 'font-weight:700', 'color:#5ED2F0')}
            ${agendaRow('15:10', 'Decisions and owners', 'color:rgba(255,255,255,.75)')}
          </div>
        </div>
        <div style="grid-column:1 / -1;display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:16px;background:${talking ? '#FFB347' : 'rgba(255,255,255,.08)'}">
          <div style="font-size:12px;font-weight:700;letter-spacing:.13em;color:${talking ? '#0B0C0E' : 'rgba(255,255,255,.6)'};white-space:nowrap">${talking ? 'YOU’RE MUTED' : 'MIC MUTED'}</div>
          <div style="flex:1;display:flex;gap:3px;align-items:center;height:22px">${meter}</div>
        </div>
      </div>`;
    },
  };

  // Signs from signs.js are shown paused at one moment, e.g. the countdown at 23:41.
  const PAUSED_AT = 18.446;

  function screen(name, seconds) {
    if (SCREENS[name]) return SCREENS[name](seconds + 3);
    if (name === 'free') return Signs.render('busy', 27);   // the busy sign after the meeting
    return Signs.render(name, PAUSED_AT);
  }

  const isAnimated = name => name in SCREENS;

  window.Duo = { frame, screen, isAnimated };
})();
