/* Живой макет окна Mus3 в первом экране.
   Всё видимое — настоящие снимки копии плеера (assets/mock/*.avif, окно 1600×1000 точек, снимки в 1.5×):
   кадр окна целиком + поверх окошки (панель вида, Preferences) отдельными слоями — их можно двигать.
   Сцена — шаги: курсор едет к точке (в точках окна), нажимает, кадр сменяется. Кнопки над окном запускают сцену;
   пока окно на экране, сцены идут по кругу. Любое нажатие кнопки останавливает круг на выбранной сцене.
   Нажатие внутри окна — управление у пользователя: сцена начинается заново, нарисованный курсор прячется,
   следующий пункт подсвечен пульсирующей точкой; нажал на неё (или навёл, если шаг — наведение) — шаг выполняется. */
(() => {
  const root = document.querySelector('[data-mock]');
  if (!root) return;
  const SRC = 'assets/mock/', EXT = '.avif?5';   // ?N — версия кадров: переснял — увеличить, иначе браузер покажет старые из кэша
  const motion = document.documentElement.classList.contains('motion');

  // Окошки: размер в точках
  const P = {
    'T1-p1': [306, 354], 'T2-p1': [374, 354], 'T3-p1': [374, 354], 'T4-p1': [374, 354],
    'C1-p1': [389, 752], 'C2-p1': [389, 752], 'C3-p1': [389, 752], 'C4-p1': [389, 752],
    'R1-p1': [314, 716], 'R2-p1': [314, 716], 'R3-p1': [314, 716],
    'P-library': [780, 618], 'P-player': [780, 618], 'P-tags': [780, 618], 'P-fields': [780, 618],
    'P-appearance': [780, 618], 'P-layout': [780, 618], 'P-hotkeys': [780, 618],
  };

  /* Шаг: at — куда курсор (точки окна); rel — то же, но от угла открытого окошка; f — кадр окна после нажатия;
     open — окошко появляется [картинка, x, y]; panel — сменить картинку окошка; close — убрать; drag — утащить окошко за ручку в [x, y];
     sq — окно сжимается до квадрата (Full Cover, Visualizer) или обратно; key — подпись клавиш; hover — без нажатия; video — показать визуализатор; hold — сколько стоять после (мс) */
  const SCENES = [
    { id: 'library', label: 'Library', line: 'Folders on your Mac, right in the library. ⌘-click to combine several.',
      start: 'L0', steps: [
        { at: [62, 384], f: 'L1' },
        { at: [80, 479], f: 'L2' },
        { at: [86, 695], f: 'L3', key: '⌘ click', hold: 1800 },
      ] },
    { id: 'tagtree', label: 'Tag Tree', line: 'Shape the tree with presets: by grouping, genre, artist or anything else.',
      start: 'L3', steps: [
        { at: [231, 109], f: 'T0' },
        { at: [18, 85], f: 'T1', open: ['T1-p1', 8, 100] },
        { rel: [112, 94], f: 'T2', panel: 'T2-p1' },
        { rel: [70, 253], f: 'T3', panel: 'T3-p1' },
        { rel: [229, 308], f: 'T4', panel: 'T4-p1' },
        { at: [18, 85], f: 'T5', close: true },
        { at: [62, 133], f: 'T6', hold: 1800 },
      ] },
    { id: 'tabs', label: 'Tabs', line: 'Click an album to see its tracks. Every tab keeps its own view: artists, albums with tracks, a plain list.',
      start: 'CN', steps: [
        { at: [870, 489], f: 'C0', hold: 1500 },
        { at: [591, 52], f: 'Ct1', hold: 1300 },
        { at: [798, 52], f: 'Ct2', hold: 1300 },
        { at: [1003, 52], f: 'Ct3', hold: 1300 },
        { at: [386, 52], f: 'Ct0', hold: 1500 },
      ] },
    { id: 'views', label: 'Views', line: 'Tracks, Albums and Tracks, Artists, Album Covers. Then let the cover take the screen.',
      start: 'Ct0', steps: [
        { at: [330, 85], f: 'C4', open: ['C4-p1', 160, 100] },
        { rel: [194, 10], drag: [1203, 100] },
        { rel: [42, 58], f: 'C1', panel: 'C1-p1' },
        { rel: [258, 58], f: 'C2', panel: 'C2-p1' },
        { rel: [42, 85], f: 'C3', panel: 'C3-p1' },
        { rel: [258, 85], f: 'C4', panel: 'C4-p1' },
        { rel: [258, 110], f: 'C5', close: true, sq: true, hold: 1400 },
        { at: [324, 520], f: 'C6', hover: true, hold: 1600 },
        { at: [800, 640], video: true, key: 'Visualizer', hold: 4200 },
        { at: [800, 640], f: 'Ct0', key: 'esc', sq: false, hold: 900 },
      ] },
    { id: 'playlist', label: 'Playlist', line: 'The playing list in three views: details, thumbnails, albums with tracks.',
      start: 'R0', steps: [
        { at: [1227, 85], f: 'R1', open: ['R1-p1', 1246, 100] },
        { rel: [157, 10], drag: [930, 100] },
        { rel: [82, 85], f: 'R2', panel: 'R2-p1' },
        { rel: [222, 60], f: 'R3', panel: 'R3-p1', hold: 1600 },
        { at: [1227, 85], f: 'R4', close: true, hold: 1600 },
      ] },
    { id: 'prefs', label: 'Settings', line: 'Library, player, tags, fields, skin, layout and hotkeys. All in one window.',
      start: 'R4', steps: [
        { at: [800, 560], key: '⌘ ,', hover: true, open: ['P-library', 410, 191] },
        { rel: [78, 82], panel: 'P-player' },
        { rel: [78, 108], panel: 'P-tags' },
        { rel: [78, 134], panel: 'P-fields' },
        { rel: [78, 160], panel: 'P-appearance' },
        { rel: [78, 186], panel: 'P-layout' },
        { rel: [78, 238], panel: 'P-hotkeys', hold: 1600 },
        { rel: [20, 20], close: true, hold: 1200 },
      ] },
  ];

  // ---------- разметка ----------
  const bar = document.querySelector('[data-scenes]'), lineEl = document.querySelector('[data-scene-line]');
  const win = root.querySelector('.win'), frames = [...win.querySelectorAll('.frame')];
  const layer = root.querySelector('.layer'), layerImg = layer.querySelector('img');
  const cursor = root.querySelector('.cursor'), ring = root.querySelector('.ring'), keys = root.querySelector('.keys');
  const vis = root.querySelector('.vis'), spot = root.querySelector('.spot');
  SCENES.forEach((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = s.label; b.dataset.i = i;
    b.addEventListener('click', () => play(i, true));
    bar.append(b);
  });
  const buttons = [...bar.children];

  // ---------- загрузка ----------
  const cache = {};
  const load = n => cache[n] || (cache[n] = new Promise(r => { const im = new Image(); im.onload = im.onerror = () => r(im); im.src = SRC + n + EXT; }));
  const sceneImages = s => [s.start, ...s.steps.flatMap(t => [t.f, t.panel, t.open && t.open[0]])].filter(Boolean);

  // ---------- состояние ----------
  let front = 0, pos = [800, 620], panelAt = null, token = 0, auto = motion, current = -1, manual = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const place = (el, x, y) => { el.style.setProperty('--x', x); el.style.setProperty('--y', y); };
  const show = name => {   // кадр окна — две картинки по очереди, новая проявляется поверх
    if (!name) return;
    const back = frames[1 - front];
    back.src = SRC + name + EXT; back.classList.add('on'); frames[front].classList.remove('on'); front = 1 - front;
  };
  const openPanel = (name, x, y) => {
    const [w] = P[name]; panelAt = [x, y];
    layer.style.transition = 'none'; place(layer, x, y); layer.style.setProperty('--w', w);
    layerImg.src = SRC + name + EXT; void layer.offsetWidth; layer.style.transition = '';
    layer.classList.add('on');
  };
  const setPanel = name => { layer.style.setProperty('--w', P[name][0]); layerImg.src = SRC + name + EXT; };
  const closePanel = () => { layer.classList.remove('on'); panelAt = null; };
  const move = async (x, y, ms = 700) => {
    pos = [x, y]; cursor.style.transitionDuration = ms + 'ms'; place(cursor, x, y); await sleep(ms);
  };
  const click = () => { place(ring, pos[0], pos[1]); ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go'); };
  const say = t => { keys.textContent = t || ''; keys.classList.toggle('on', !!t); };

  const reset = s => {
    closePanel(); win.classList.remove('sq'); vis.classList.remove('on'); vis.pause(); say('');
    frames.forEach(f => f.classList.remove('on')); frames[front].src = SRC + s.start + EXT; frames[front].classList.add('on');
  };

  // ход пользователя: точка на месте нажатия, ждём нажатия (или наведения); сменилась сцена — выходим
  let waiting = null;
  const turn = (x, y, hover, my) => new Promise(r => {
    place(spot, x, y); spot.classList.add('on'); spot.classList.toggle('hover', !!hover);
    waiting = ok => { spot.classList.remove('on'); waiting = null; r(ok && my === token); };
  });
  spot.addEventListener('click', e => { e.stopPropagation(); waiting?.(true); });
  spot.addEventListener('pointerenter', () => { if (spot.classList.contains('hover')) waiting?.(true); });

  async function run(i, my) {
    const s = SCENES[i];
    await Promise.all(sceneImages(s).map(load));
    if (my !== token) return;
    reset(s);
    await sleep(500);
    for (const t of s.steps) {
      if (my !== token) return;
      const [x, y] = t.rel && panelAt ? [panelAt[0] + t.rel[0], panelAt[1] + t.rel[1]] : (t.at || pos);
      if (t.key) say(t.key);
      if (manual) { if (!await turn(x, y, t.hover, my)) return; pos = [x, y]; place(cursor, x, y); }
      else await move(x, y);
      if (my !== token) return;
      if (t.drag) {   // нажать на ручку окошка и утащить его вместе с курсором
        click(); await sleep(150);
        const [nx, ny] = t.drag, dx = nx - panelAt[0], dy = ny - panelAt[1];
        place(layer, nx, ny); panelAt = [nx, ny];
        if (manual) { pos = [x + dx, y + dy]; await sleep(900); } else await move(x + dx, y + dy, 900);
        await sleep(t.hold ?? 500);
        continue;
      }
      if (!t.hover) click();
      await sleep(120);
      if (t.video) { vis.currentTime = 0; vis.play().catch(() => {}); vis.classList.add('on'); }
      else if (vis.classList.contains('on') && t.f) { vis.classList.remove('on'); vis.pause(); }
      if ('sq' in t) win.classList.toggle('sq', t.sq);
      show(t.f);
      if (t.close) closePanel();
      if (t.open) openPanel(...t.open);
      if (t.panel) setPanel(t.panel);
      await sleep(manual ? 400 : t.hold ?? 1000);
      if (!t.video) say('');
    }
    say('');
    if (manual && my === token) {   // сцена пройдена — точка на кнопке следующей сцены не нужна: нажатие в окне начинает следующую
      lineEl.textContent = SCENES[i].line + ' Click the window for the next one.';
      ended = true;
    }
  }
  let ended = false;

  async function play(i, byUser) {
    const my = ++token; current = i; ended = false; waiting?.(false);
    if (byUser) auto = false;   // выбрал сам — круг останавливается на этой сцене
    buttons.forEach((b, k) => b.classList.toggle('on', k === i));
    lineEl.textContent = SCENES[i].line;
    await run(i, my);
    if (my !== token || !auto) return;
    await sleep(600);
    if (my === token && auto && visible) play((i + 1) % SCENES.length);
  }

  // ---------- управление у пользователя ----------
  root.addEventListener('click', () => {
    if (manual && !ended) return;   // идёт сцена — ждём нажатия на точку
    const next = manual ? (current + 1) % SCENES.length : Math.max(current, 0);
    manual = true; auto = false; root.classList.add('manual');
    play(next);
  });
  bar.addEventListener('click', () => { manual = false; root.classList.remove('manual'); }, true);   // кнопка сцены — снова показ курсором

  // ---------- круг, пока окно на экране ----------
  let visible = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && auto && current < 0) play(0);
    else if (visible && auto && current >= 0) play(current);
    else if (!visible) token++;   // ушло с экрана — остановить
  }, { threshold: .35 }).observe(root);
  if (!motion) { buttons[0].classList.add('on'); lineEl.textContent = SCENES[0].line; reset(SCENES[0]); current = 0; }
})();
