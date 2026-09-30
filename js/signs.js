// Door signs, as shown in the "46 signs" gallery.
//
// Every sign plays the same 30-second meeting on a loop:
//   0–20s  in a call
//   20–25s wrapping up
//   25–30s free
//
// A sign is a plain function: give it the moment in the meeting (a "frame"),
// it returns the HTML for a 537×380 screen. main.js calls it a few times a
// second and swaps the HTML in when it changes. To add a sign, add a function
// to SIGNS and use its name in index.html: <div class="sign" data-sign="name">.

(function () {
  const LOOP = 30, CALL = 25;
  const RED = '#FF4A3D', AMBER = '#FFB347', GREEN = '#3DDC84', EMPTY = 'rgba(255,255,255,.14)';
  const DISPLAY = 'font-family:var(--font-display)';
  const MONO = 'font-family:var(--font-mono)';

  const pad2 = n => String(n).padStart(2, '0');
  const repeat = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');

  // Everything a sign needs to know about where we are in the meeting.
  function frame(seconds) {
    const T = seconds % LOOP;
    const q = Math.min(1, T / CALL);                   // meeting progress, 0 → 1
    const inCall = T < CALL;
    const stage = T < 20 ? 0 : T < 25 ? 1 : 2;         // 0 in call, 1 wrapping up, 2 free
    const since = [T, T - 20, T - 25][stage];          // seconds since the stage began
    const mins = 14 * 60 + Math.floor(q * 90);         // the meeting runs 14:00 → 15:30
    const rem = Math.max(0, Math.round((1 - q) * 5421));
    return {
      T, q, inCall, stage, since,
      now: `${Math.floor(mins / 60)}:${pad2(mins % 60)}`,
      left: `${Math.floor(rem / 60)}:${pad2(rem % 60)}`,
    };
  }

  const SIGNS = {
    busy(f) {
      return `
      <div style="height:100%;padding:36px 40px;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;background:${f.inCall ? '#D93A2B' : '#1E9E57'}">
        <div style="${DISPLAY};font-size:96px;font-weight:800;letter-spacing:-.045em;line-height:.98">${f.inCall ? 'In a call' : 'Free.'}</div>
        <div style="font-size:28px;font-weight:600;letter-spacing:-.02em">${f.inCall ? 'Back at 15:30.' : 'Come in.'}</div>
      </div>`;
    },

    loading(f) {
      const pct = Math.round(f.q * 100), mins = Math.max(1, Math.ceil((1 - f.q) * 90));
      return `
      <div style="height:100%;padding:36px 40px;display:flex;flex-direction:column;justify-content:flex-end;gap:16px;background:#fff;color:#0B0C0E">
        <div style="${DISPLAY};font-size:46px;font-weight:800;letter-spacing:-.04em;line-height:1.02">${f.inCall ? `Meeting ${pct}% complete` : 'Meeting complete'}</div>
        <div style="height:22px;border-radius:99px;background:rgba(11,12,14,.08);overflow:hidden">
          <div style="height:100%;width:${f.inCall ? pct : 100}%;border-radius:99px;background:${f.inCall ? '#D93A2B' : '#1E9E57'}"></div>
        </div>
        <div style="font-size:19px;font-weight:600;color:rgba(11,12,14,.62)">${f.inCall ? `About ${mins} min remaining` : 'You may now enter.'}</div>
      </div>`;
    },

    neon(f) {
      const c = f.inCall ? RED : GREEN;
      const flicker = f.since < .6 ? (Math.floor(f.T * 20) % 3 ? 1 : .2) : 1;
      return `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#140F12">
        <div style="padding:10px 34px;border-radius:30px;opacity:${flicker};box-shadow:0 0 0 4px ${c},0 0 22px ${c};${DISPLAY};font-size:110px;font-weight:800;letter-spacing:.04em;text-shadow:0 0 8px ${c},0 0 22px ${c}">${f.inCall ? 'CLOSED' : 'OPEN'}</div>
        <div style="${DISPLAY};font-size:28px;font-weight:800;letter-spacing:.08em;color:#FFC28A;text-shadow:0 0 10px rgba(255,194,138,.8)">${f.inCall ? 'BACK AT 15:30' : 'WALK RIGHT IN'}</div>
      </div>`;
    },

    onair(f) {
      const c = f.inCall ? '#FF5A4D' : 'rgba(255,255,255,.35)';
      const glow = f.inCall ? 40 + Math.sin(f.T * 3) * 20 : 0;
      return `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:#0B0C0E">
        <div style="padding:14px 40px;border-radius:24px;background:${f.inCall ? '#2A0E0C' : '#1C1D20'};box-shadow:inset 0 0 0 3px ${c},0 0 ${glow.toFixed(1)}px rgba(255,74,61,.55);${DISPLAY};font-size:110px;font-weight:800;letter-spacing:.02em;color:${c}">${f.inCall ? 'ON AIR' : 'OFF AIR'}</div>
        <div style="font-size:22px;font-weight:600;color:rgba(255,255,255,.7)">${f.inCall ? 'Recording · until 15:30' : 'Come in.'}</div>
      </div>`;
    },

    // "Human is not responding" dialogs pile up as the meeting drags on.
    human(f) {
      const dialog = (x, y, title, sub) => `
        <div style="position:absolute;left:${x}px;top:${y}px;width:330px;box-sizing:content-box;border-radius:18px;background:rgba(255,255,255,.86);box-shadow:inset 0 0 0 1px rgba(255,255,255,.95),0 14px 34px rgba(6,26,34,.3);padding:18px 20px;color:#0B0C0E;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:19px;font-weight:700;letter-spacing:-.02em">${title}</div>
          <div style="font-size:13.5px;color:rgba(11,12,14,.62)">${sub}</div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
            <div style="padding:6px 14px;border-radius:99px;background:rgba(11,12,14,.07);font-size:13.5px;font-weight:700">Wait</div>
            <div style="padding:6px 14px;border-radius:99px;background:#0B0C0E;color:#fff;font-size:13.5px;font-weight:700">Knock</div>
          </div>
        </div>`;
      const dialogs = f.inCall
        ? repeat(1 + Math.floor(f.q * 5), i => dialog(40 + i * 26, 40 + i * 30, '“Human” is not responding', 'In Design review. Try again at 15:30.'))
        : dialog(104, 120, '“Human” is responding again', 'You may enter.');
      return `<div style="position:relative;height:100%;background:linear-gradient(160deg,#33B9DE,#0A7EA4 55%,#05435A)">${dialogs}</div>`;
    },

    score(f) {
      const clock = f.inCall ? `Q${1 + Math.min(3, Math.floor(f.q * 4))} · ${f.left}` : 'FULL TIME';
      return `
      <div style="height:100%;padding:26px 30px;display:flex;flex-direction:column;align-items:center;gap:8px;background:#0B0C0E;${MONO};color:${AMBER}">
        <div style="width:100%;display:grid;grid-template-columns:1fr 1fr;font-size:19px;font-weight:800;letter-spacing:.1em;text-align:center;color:rgba(255,255,255,.7)"><div>MEETINGS</div><div>YOU</div></div>
        <div style="width:100%;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;font-size:150px;font-weight:800;line-height:1;text-align:center;text-shadow:0 0 22px rgba(255,179,71,.55);font-variant-numeric:tabular-nums">
          <div>3</div><div style="font-size:60px;color:rgba(255,179,71,.5)">–</div><div>${f.inCall ? 0 : 1}</div>
        </div>
        <div style="margin-top:auto;padding:8px 18px;border-radius:12px;background:#1C1D20;font-size:28px;font-weight:800;letter-spacing:.06em;font-variant-numeric:tabular-nums">${clock}</div>
      </div>`;
    },

    weather(f) {
      const chance = f.inCall ? Math.max(5, Math.round(95 - f.q * 90)) : 0;
      const hours = ['14:00', '15:00', '15:30', '16:00'];
      const forecast = f.inCall ? ['95%', '80%', '10%', '0%'] : ['0%', '0%', '0%', '0%'];
      return `
      <div style="height:100%;padding:26px 28px;display:flex;flex-direction:column;gap:6px;background:${f.inCall ? '#3E4C57' : '#0A7EA4'}">
        <div style="font-size:15px;font-weight:600">Alex’s desk · ${f.now}</div>
        <div style="display:flex;align-items:baseline;gap:14px">
          <div style="${DISPLAY};font-size:104px;font-weight:800;letter-spacing:-.06em;line-height:1;font-variant-numeric:tabular-nums">${chance}%</div>
          <div style="${DISPLAY};font-size:28px;font-weight:800;letter-spacing:-.038em;line-height:1.05">chance of meetings</div>
        </div>
        <div style="font-size:19px;font-weight:600">${f.inCall ? 'Heavy meetings until 15:30' : 'Clear skies. Come in.'}</div>
        <div style="margin-top:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${repeat(4, i => `<div style="border-radius:16px;padding:10px;background:rgba(255,255,255,.14);display:flex;flex-direction:column;gap:3px"><div style="font-size:12px;font-weight:700">${hours[i]}</div><div style="font-size:15px;font-weight:700">${forecast[i]}</div></div>`)}
        </div>
      </div>`;
    },

    // A virtual pet that gets hungrier the longer you're stuck in the call.
    tama(f) {
      const face = f.inCall ? (f.q > .6 ? '(>_<)' : '(o_o)') : '(^_^)';
      const bob = (Math.sin(f.T * (f.inCall ? 6 : 1.6)) * (f.inCall ? 2 : 4)).toFixed(1);
      const mood = !f.inCall ? 'Fed and happy' : f.q < .4 ? 'Content' : f.q < .75 ? 'Getting peckish' : 'Very hungry';
      const fed = f.inCall ? 4 - Math.floor(f.q * 4) : 4;
      const button = extra => `<div style="width:22px;height:22px;border-radius:99px;background:#F4F6F7;box-shadow:0 3px 0 #4A2359${extra}"></div>`;
      return `
      <div style="height:100%;padding:26px 30px;display:grid;grid-template-columns:210px minmax(0,1fr);gap:26px;align-items:center;background:#F4F6F7;color:#0B0C0E">
        <div style="height:280px;border-radius:50% 50% 46% 46% / 56% 56% 44% 44%;background:linear-gradient(160deg,#E7B7F0,#8A4FA0 60%,#4A2359);box-shadow:0 18px 44px rgba(74,35,89,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
          <div style="width:140px;height:120px;border-radius:22px;background:#C9D6A3;box-shadow:inset 0 0 0 6px #6E5A78;display:flex;align-items:center;justify-content:center;${MONO};font-size:34px;font-weight:800;color:#3A4A22;transform:translateY(${bob}px)">${face}</div>
          <div style="display:flex;gap:14px">${button('')}${button(';margin-top:10px')}${button('')}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="font-size:11.5px;font-weight:700;letter-spacing:.13em;color:rgba(11,12,14,.42)">ALEXGOTCHI</div>
          <div style="${DISPLAY};font-size:34px;font-weight:800;letter-spacing:-.045em;line-height:1.05">${mood}</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-size:13.5px;font-weight:700">Fed</div>
            <div style="display:flex;gap:6px">${repeat(4, i => `<div style="width:26px;height:26px;border-radius:11px;background:${i < fed ? '#D0682E' : 'rgba(11,12,14,.1)'}"></div>`)}</div>
          </div>
          <div style="font-size:15px;font-weight:600;line-height:1.35;color:rgba(11,12,14,.62)">${f.inCall ? 'In a call until 15:30. Snacks at the door.' : 'Come in. Snacks still welcome.'}</div>
        </div>
      </div>`;
    },

    countdown(f) {
      return `
      <div style="height:100%;padding:32px 38px;display:flex;flex-direction:column;gap:6px;background:${f.inCall ? '#D93A2B' : '#1E9E57'}">
        <div style="font-size:19px;font-weight:600">${f.inCall ? 'Design review ends in' : 'Design review is over'}</div>
        <div style="margin-top:auto;margin-bottom:6px;${DISPLAY};font-size:150px;font-weight:800;letter-spacing:-.06em;line-height:1;font-variant-numeric:tabular-nums">${f.inCall ? f.left : '0:00'}</div>
        <div style="${DISPLAY};font-size:30px;font-weight:700;letter-spacing:-.03em">${f.inCall ? 'until Alex is free' : 'Alex is free. Come in.'}</div>
      </div>`;
    },

    // Airport departures board. Letters scramble for a moment when the status changes.
    flap(f) {
      const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const row = (text, color, r) => (text + ' '.repeat(12)).slice(0, 12).split('').map((ch, i) => {
        const scrambling = f.since < .5 + i * .04 && ch !== ' ';
        const shown = ch === ' ' ? '' : scrambling ? LETTERS[(Math.floor(f.T * 14) + i * 7 + r * 3) % LETTERS.length] : ch;
        return `<div style="height:52px;border-radius:6px;background:#1C1D20;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;color:${color};box-shadow:inset 0 -26px 0 rgba(255,255,255,.03),inset 0 -1px 0 #000">${shown}</div>`;
      }).join('');
      const status = ['ON TIME', 'BOARDING', 'ARRIVED'][f.stage];
      const statusColor = ['#FFC28A', '#FFC28A', GREEN][f.stage];
      const title = ['Back at 15:30. On time.', 'Boarding. Out in 5.', 'Arrived. Come in.'][f.stage];
      return `
      <div style="height:100%;padding:30px 32px;display:flex;flex-direction:column;gap:14px;background:#0B0C0E;color:#FFC28A;${MONO}">
        <div style="display:flex;justify-content:space-between;${DISPLAY};font-size:28px;font-weight:800;letter-spacing:-.038em">
          <div>Departures</div><div style="color:rgba(255,255,255,.6);font-size:19px;font-variant-numeric:tabular-nums">${f.now}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px">${row('DESIGN REVW', '#FFC28A', 0)}</div>
        <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px">${row(status, statusColor, 1)}</div>
        <div style="margin-top:auto;${DISPLAY};font-size:28px;font-weight:800;letter-spacing:-.038em;color:#fff">${title}</div>
      </div>`;
    },

    // Video-game HUD: the meeting is the boss, and its health bar drains.
    hud(f) {
      const hp = Math.max(2, Math.round((1 - f.q * .8) * 20)), hpColor = f.q > .7 ? AMBER : RED;
      const boss = Math.round((1 - f.q) * 30);
      const c = f.inCall ? RED : GREEN;
      const blink = f.inCall ? 1 : (Math.floor(f.T * 2) % 2 ? 1 : .25);
      return `
      <div style="position:relative;height:100%;padding:26px 28px;display:flex;flex-direction:column;background:#0B0C0E;${MONO}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-size:15px;font-weight:800;letter-spacing:.1em">ALEX</div>
            <div style="display:flex;gap:3px">${repeat(20, i => `<div style="width:9px;height:16px;background:${i < hp ? hpColor : EMPTY}"></div>`)}</div>
          </div>
          <div style="font-size:15px;font-weight:800;letter-spacing:.1em;color:${AMBER};font-variant-numeric:tabular-nums">LVL 3 · ${f.now}</div>
        </div>
        <div style="margin-top:auto;display:flex;flex-direction:column;gap:12px;align-items:center">
          <div style="font-size:28px;font-weight:800;letter-spacing:.06em;color:${c};text-shadow:0 0 12px ${c}">${f.inCall ? 'BOSS: DESIGN REVIEW' : 'STAGE CLEAR'}</div>
          <div style="display:flex;gap:3px">${repeat(30, i => `<div style="width:12px;height:22px;background:${i < boss ? RED : EMPTY}"></div>`)}</div>
        </div>
        <div style="margin-top:auto;text-align:center;font-size:15px;font-weight:800;letter-spacing:.12em;opacity:${blink}">${f.inCall ? 'RESPAWN AT 15:30' : 'PRESS DOOR TO CONTINUE'}</div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 2px,transparent 2px 4px);pointer-events:none"></div>
      </div>`;
    },

    elevator(f) {
      const floor = f.inCall ? String(Math.max(1, 6 - Math.floor(f.q * 6))) : 'G';
      const arrow = f.inCall ? (Math.floor(f.T * 2) % 2 ? 1 : .3) : 0;
      const buttons = ['6', '5', '4', '3', '2', '1', 'G', '◀▶'].map(label => {
        const lit = floor === label || (!f.inCall && label === '◀▶');
        return `<div style="height:32px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:13.5px;font-weight:700;background:#2A2E33;color:${lit ? AMBER : 'rgba(255,255,255,.6)'};box-shadow:${lit ? 'inset 0 0 0 2px #FFB347,0 0 12px rgba(255,179,71,.4)' : 'none'}">${label}</div>`;
      }).join('');
      return `
      <div style="height:100%;padding:26px 30px;display:grid;grid-template-columns:1fr 1fr;gap:20px;background:#1A1D20">
        <div style="border-radius:22px;background:#0B0C0E;box-shadow:inset 0 0 0 2px #2A2E33;display:flex;align-items:center;justify-content:center;gap:14px">
          <div style="width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-top:28px solid ${AMBER};opacity:${arrow}"></div>
          <div style="${MONO};font-size:150px;font-weight:800;line-height:1;color:${AMBER};text-shadow:0 0 18px rgba(255,179,71,.6)">${floor}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">${buttons}</div>
          <div style="margin-top:auto;${DISPLAY};font-size:28px;font-weight:800;letter-spacing:-.038em;line-height:1.1">${f.inCall ? 'Going down. Doors open at 15:30.' : 'Doors open. Come in.'}</div>
        </div>
      </div>`;
    },
  };

  // render('countdown', 12.5) → HTML for the countdown sign 12.5s into the meeting.
  function render(name, seconds) {
    const sign = SIGNS[name];
    if (!sign) return `<div style="padding:20px">Unknown sign “${name}”</div>`;
    return sign(frame(seconds));
  }

  window.Signs = { render, repeat };
})();
