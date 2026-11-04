import { profile, about, filters, projects, experience, education, screenshots, skills, awards, contact } from './data.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isMobile = () => innerWidth < 768;

function esc(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, (ch) => map[ch]);
}

function storageGet(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* storage blocked */ }
}

async function typeText(node, text, delay) {
  for (const ch of text) {
    node.textContent += ch;
    await sleep(delay);
  }
}

/* ---------- icons ---------- */

const ICON_PATHS = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  git: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-11 6"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
}

const BRAND_ICONS = {
  github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4v16h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-8.1c0-1.93-.03-4.42-2.7-4.42-2.7 0-3.1 2.1-3.1 4.28V24h-4V8z"/></svg>',
};

/* ---------- apps ---------- */

// Each app is a window. `render` returns its body HTML; `mount` wires it up
// once it is in the page and may return a cleanup function for when it closes.
const APPS = [
  { id: 'about', label: 'About', title: 'about.txt', icon: 'user', color: '#39ff88', w: 600, h: 600, render: aboutHtml, mount: mountAbout },
  { id: 'projects', label: 'Projects', title: '~/projects', icon: 'folder', color: '#ffb347', w: 880, h: 600, render: projectsHtml, mount: mountProjects },
  { id: 'experience', label: 'Experience', title: 'git log --career', icon: 'git', color: '#7aa2ff', w: 640, h: 580, render: experienceHtml },
  { id: 'skills', label: 'Skills', title: 'package.json', icon: 'box', color: '#c084fc', w: 600, h: 560, render: skillsHtml },
  { id: 'terminal', label: 'Terminal', title: 'visitor@kufiz: ~', icon: 'terminal', color: '#e6ede8', w: 560, h: 340, render: terminalHtml, mount: mountTerminal },
  { id: 'ai', label: 'KUFIZ AI', title: 'KUFIZ AI', icon: 'spark', color: '#22d3ee', w: 820, h: 580, render: aiHtml, mount: mountAi },
  { id: 'contact', label: 'Contact', title: 'contact', icon: 'mail', color: '#ff7a59', w: 880, h: 560, render: contactHtml, mount: mountContact },
];

const appById = (id) => APPS.find((a) => a.id === id);

/* ---------- window manager ---------- */

const openWindows = new Map(); // id -> { el, cleanup, opener }
let zTop = 10;
let spawnCount = 0;
let scenes = null; // the yard.js module once loaded (desktop + WebGL only)

function windowPosition(w, h, preferred) {
  if (preferred) return preferred;
  const step = (spawnCount++ % 6) * 30;
  const left = Math.min(innerWidth - w - 24, Math.max(24, innerWidth * 0.22 + step));
  const top = Math.min(innerHeight - h - 96, 64 + step);
  return { left, top: Math.max(48, top) };
}

function focusWindow(el) {
  document.querySelectorAll('.win.active').forEach((w) => w.classList.remove('active'));
  el.classList.add('active');
  el.style.zIndex = ++zTop;
}

function updateDock() {
  document.querySelectorAll('[data-dock]').forEach((btn) => {
    const win = openWindows.get(btn.dataset.dock);
    btn.classList.toggle('running', Boolean(win));
  });
}

function closeWindow(id) {
  const win = openWindows.get(id);
  if (!win) return;
  win.cleanup?.();
  win.el.remove();
  openWindows.delete(id);
  updateDock();
  win.opener?.focus?.();
}

function minimizeWindow(id) {
  const win = openWindows.get(id);
  if (!win) return;
  win.el.hidden = true;
  win.el.classList.remove('active');
}

function toggleMaximize(el) {
  el.classList.toggle('max');
}

function makeDraggable(el, bar) {
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || isMobile() || el.classList.contains('max')) return;
    const offsetX = e.clientX - el.offsetLeft;
    const offsetY = e.clientY - el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    const move = (ev) => {
      const left = Math.min(innerWidth - 80, Math.max(80 - el.offsetWidth, ev.clientX - offsetX));
      const top = Math.min(innerHeight - 80, Math.max(40, ev.clientY - offsetY));
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };
    const up = () => {
      el.classList.remove('dragging');
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
  });
  bar.addEventListener('dblclick', (e) => {
    if (!e.target.closest('button')) toggleMaximize(el);
  });
}

// Opens (or brings back) a window. `spec` is an app, or a one-off like a project.
function openWindow(spec, preferred) {
  const existing = openWindows.get(spec.id);
  if (existing) {
    existing.el.hidden = false;
    focusWindow(existing.el);
    existing.el.focus();
    return existing.el;
  }

  const w = Math.min(spec.w, innerWidth - 32);
  const h = Math.min(spec.h, innerHeight - 120);
  const pos = windowPosition(w, h, preferred);
  const el = document.createElement('section');
  el.className = `win win-${spec.id.split('-')[0]}`;
  el.id = `win-${spec.id}`;
  el.tabIndex = -1;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-labelledby', `win-${spec.id}-title`);
  el.style.cssText = `left:${pos.left}px; top:${pos.top}px; width:${w}px; height:${h}px;`;
  el.innerHTML = `
    <header class="win-bar">
      <div class="win-lights">
        <button type="button" class="light light-close" data-action="close" aria-label="Close ${esc(spec.label)}"></button>
        <button type="button" class="light light-min" data-action="min" aria-label="Minimize ${esc(spec.label)}"></button>
        <button type="button" class="light light-max" data-action="max" aria-label="Maximize ${esc(spec.label)}"></button>
      </div>
      <h2 class="win-title" id="win-${spec.id}-title">${esc(spec.title)}</h2>
      <span class="win-spacer" aria-hidden="true"></span>
    </header>
    <div class="win-body">${spec.render()}</div>`;

  $('#windows').append(el);
  const record = { el, opener: document.activeElement, cleanup: null };
  openWindows.set(spec.id, record);

  el.addEventListener('pointerdown', () => focusWindow(el));
  el.addEventListener('focusin', () => { if (!el.classList.contains('active')) focusWindow(el); });
  el.querySelector('.win-lights').addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'close') closeWindow(spec.id);
    if (action === 'min') minimizeWindow(spec.id);
    if (action === 'max') toggleMaximize(el);
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !e.target.closest('input')) {
      e.stopPropagation();
      closeWindow(spec.id);
    }
  });
  makeDraggable(el, $('.win-bar', el));

  record.cleanup = spec.mount?.(el) ?? null;
  focusWindow(el);
  el.focus({ preventScroll: true });
  updateDock();
  if (!reduceMotion) decrypt($('.win-title', el));
  return el;
}

function openApp(id, preferred) {
  const app = appById(id);
  return app ? openWindow(app, preferred) : null;
}

// Dock / menu click: open, bring forward, or minimize when it is already in front.
function toggleApp(id) {
  const win = openWindows.get(id);
  if (win && !win.el.hidden && win.el.classList.contains('active')) minimizeWindow(id);
  else openApp(id);
}

/* ---------- desktop chrome ---------- */

function renderChrome() {
  $('#hero-name').textContent = profile.name;
  $('#hero-role').textContent = `${profile.role} · ${profile.pitch}`;
  $('#hero-founder').textContent = profile.founder;
  $('#year').textContent = new Date().getFullYear();

  const tile = (app) => `<span class="app-icon" style="--app:${app.color}">${icon(app.icon)}</span>`;

  $('#dock-list').innerHTML = APPS.map((app) => `
    <li><button type="button" class="dock-btn" data-dock="${app.id}" aria-label="${esc(app.label)}">
      ${tile(app)}<span class="dock-tip">${esc(app.label)}</span>
    </button></li>`).join('');

  $('#desktop-icons').innerHTML = APPS.map((app) => `
    <li><button type="button" class="desk-icon" data-app="${app.id}">
      ${tile(app)}<span>${esc(app.label)}</span>
    </button></li>`).join('');

  $('#menu-apps').innerHTML = APPS.map((app) => `
    <li><button type="button" class="menu-item" data-app="${app.id}">${esc(app.label)}</button></li>`).join('');

  $('#dock-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dock]');
    if (btn) toggleApp(btn.dataset.dock);
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-app]');
    if (btn) openApp(btn.dataset.app);
  });
}

function startClock() {
  const clock = $('#clock');
  const tick = () => {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = now.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  tick();
  setInterval(tick, 30000);
}

/* ---------- about ---------- */

function aboutHtml() {
  const stats = profile.stats.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join('');
  const facts = profile.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  return `
    <div class="about">
      <div class="about-head">
        <svg class="about-logo" aria-hidden="true"><use href="#logo"/></svg>
        <div>
          <p class="about-name">${esc(profile.name)}</p>
          <p class="about-role">${esc(profile.role)} · Founder of <b>${esc(profile.founder)}</b></p>
        </div>
      </div>
      <p class="about-pitch">${esc(profile.pitch)}</p>
      <div class="cta">
        <button type="button" class="btn btn-solid" data-app="projects">view projects</button>
        <button type="button" class="btn" data-app="contact">contact</button>
        <button type="button" class="btn btn-ghost" data-app="ai">ask my AI</button>
      </div>
      <ul class="stats">${stats}</ul>
      <div class="about-text">${about.map((line) => `<p>${esc(line)}</p>`).join('')}</div>
      <dl class="facts">${facts}</dl>
    </div>`;
}

function mountAbout() { return null; }

/* ---------- projects ---------- */

function badge(status) {
  return status ? `<span class="badge">${esc(status)}</span>` : '';
}

function thumb(p) {
  if (screenshots.includes(p.id)) {
    return `<span class="thumb"><img src="assets/${p.id}.webp" alt="" loading="lazy" width="640" height="360"></span>`;
  }
  return `<span class="thumb thumb-empty" style="--strip:${p.color}"><b>${p.id.toUpperCase()}</b><small>image coming soon</small></span>`;
}

function projectsHtml() {
  const chips = filters.map((f) => `<button type="button" class="chip" data-filter="${f}" aria-pressed="${f === 'all'}">${f}</button>`).join('');
  const cards = projects.map((p) => `
    <li data-categories="${p.categories.join(' ')}">
      <button type="button" class="card" data-project="${p.id}" style="--strip:${p.color}">
        ${thumb(p)}
        <span class="card-body">
          <span class="card-head"><span>${p.id.toUpperCase()}</span>${badge(p.status)}</span>
          <span class="card-name">${esc(p.name)}</span>
          <span class="card-desc">${esc(p.summary)}</span>
        </span>
      </button>
    </li>`).join('');
  return `
    <div class="finder">
      <div class="finder-bar" role="group" aria-label="Filter projects">${chips}</div>
      <ul class="project-grid">${cards}</ul>
    </div>`;
}

function mountProjects(el) {
  $('.finder-bar', el).addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const filter = chip.dataset.filter;
    el.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    el.querySelectorAll('.project-grid li').forEach((li) => {
      li.hidden = filter !== 'all' && !li.dataset.categories.split(' ').includes(filter);
    });
  });
  $('.project-grid', el).addEventListener('click', (e) => {
    const card = e.target.closest('[data-project]');
    if (card) openProject(card.dataset.project);
  });
  if (finePointer && !reduceMotion) initTilt($('.project-grid', el));
  return null;
}

function findProject(query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return projects.find((p) => p.id === q || p.id === `kfz-${q}` || p.name.toLowerCase() === q)
    || projects.find((p) => p.name.toLowerCase().includes(q));
}

function projectHtml(p) {
  const shot = screenshots.includes(p.id)
    ? `<img class="shot" src="assets/${p.id}.webp" alt="Screenshot of ${esc(p.name)}" width="1280" height="720">`
    : '<div class="shot shot-missing">image coming soon</div>';
  const links = p.links.map((l) => `<a class="btn btn-solid" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('');
  return `
    <article class="project">
      ${shot}
      <div class="project-meta"><span>${p.id.toUpperCase()}</span>${badge(p.status)}</div>
      <p class="project-name">${esc(p.name)}</p>
      <p>${esc(p.description)}</p>
      <h3>Key features</h3>
      <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <h3>Stack</h3>
      <p class="tags">${p.stack.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</p>
      ${links ? `<div class="cta">${links}</div>` : ''}
    </article>`;
}

// Projects open in an off-canvas panel that slides in from the right.
// <dialog> + showModal gives us the focus trap, Esc to close and focus return for free.
function openProject(query) {
  const p = findProject(query);
  if (!p) return null;
  const drawer = $('#drawer');
  $('#drawer-title').textContent = `${p.id.toUpperCase()} — ${p.name}`;
  $('.drawer-body', drawer).innerHTML = projectHtml(p);
  $('.drawer-body', drawer).scrollTop = 0;
  if (!drawer.open) drawer.showModal();
  $('.drawer-close', drawer).focus();
  return p;
}

function closeDrawer() {
  const drawer = $('#drawer');
  if (!drawer.open) return;
  if (reduceMotion) return drawer.close();
  drawer.classList.add('closing');
  setTimeout(() => { drawer.classList.remove('closing'); drawer.close(); }, 220);
}

function initDrawer() {
  const drawer = $('#drawer');
  $('.drawer-close', drawer).addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); }); // backdrop
  drawer.addEventListener('cancel', (e) => { e.preventDefault(); closeDrawer(); }); // Esc, animated
}

/* ---------- experience & skills ---------- */

function commitItem(job, isHead) {
  const ref = isHead ? ' <span class="commit-ref">(HEAD -&gt; main)</span>' : '';
  return `
    <li class="commit">
      <p class="commit-hash">commit ${job.hash}${ref}</p>
      <p class="commit-date">${esc(job.date)}</p>
      <h3>${esc(job.title)} <span class="commit-co">@ ${esc(job.company)}</span></h3>
      <ul>${job.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
    </li>`;
}

function experienceHtml() {
  const items = experience.map((job) => commitItem(job, job.head)).concat(commitItem(education, false));
  return `<ol class="gitlog">${items.join('')}</ol>`;
}

function skillsHtml() {
  const groups = skills.map((g) => `
    <div class="skill-group">
      <p class="skill-name">${esc(g.group)}</p>
      <ul class="skill-list">${g.items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    </div>`).join('');
  const log = awards.map((a) => `<li><span class="log-date">[${a.date}]</span> <span class="log-level">${a.level}</span> ${esc(a.text)}</li>`).join('');
  return `
    <p class="cmd"><span class="ps1">$</span> npm ls --depth=0</p>
    <div class="skills">${groups}</div>
    <p class="cmd"><span class="ps1">$</span> cat achievements.log</p>
    <ul class="log">${log}</ul>`;
}

/* ---------- terminal ---------- */

function terminalHtml() {
  return `
    <div class="term">
      <div class="term-log" role="log" aria-live="polite"></div>
      <form class="term-form" autocomplete="off">
        <label for="term-input" class="ps1">visitor@kufiz:~$</label>
        <input id="term-input" type="text" spellcheck="false" autocapitalize="off" placeholder="type help">
      </form>
    </div>`;
}

let termPrint = () => {};
const history = [];
let historyPos = 0;

const commands = {
  help: () => termPrint([
    'commands:',
    '  about | projects | experience | skills | contact | ai   open an app',
    '  open <id|name>   open a project, e.g. open kfz-002',
    '  ask <question>   ask KUFIZ AI about me',
    '  ls               list projects',
    '  whoami           who is this',
    '  theme amber      switch accent to amber',
    '  matrix           you know what this does',
    '  sudo hire kufiz  ...',
    '  clear            clear the screen',
  ].join('\n')),
  about: () => openApp('about'),
  projects: () => openApp('projects'),
  experience: () => openApp('experience'),
  skills: () => openApp('skills'),
  contact: () => openApp('contact'),
  ai: () => openApp('ai'),
  ls: () => termPrint(projects.map((p) => `${p.id}  ${p.name}`).join('\n')),
  whoami: () => termPrint(profile.whoami),
  clear: () => { $('#win-terminal .term-log').textContent = ''; },
  open: (arg) => {
    const p = openProject(arg);
    if (p) termPrint(`opening ${p.id} ...`, 'ok');
    else termPrint(`open: no such project: ${arg || '(empty)'} — try ls`, 'err');
  },
  ask: (arg) => {
    if (!arg) return termPrint('usage: ask <question>, e.g. ask what is ambush?', 'err');
    termPrint('thinking...');
    askAi(arg).then((answer) => termPrint(answer, 'ok'));
  },
  theme: (arg) => {
    if (arg !== 'amber') return termPrint(`theme: unknown theme: ${arg || '(empty)'} — try theme amber`, 'err');
    document.documentElement.dataset.theme = 'amber';
    termPrint('accent switched to amber', 'ok');
  },
  matrix: () => {
    if (reduceMotion) return termPrint('matrix skipped: reduced motion is on');
    runMatrix();
  },
  sudo: (arg) => {
    if (arg !== 'hire kufiz') return false;
    termPrint('[sudo] password for visitor: ********');
    termPrint('access granted. welcome aboard.', 'ok');
    setTimeout(() => openApp('contact'), 900);
  },
};

function runCommand(raw) {
  const input = raw.trim();
  if (!input) return;
  termPrint(`$ ${input}`, 'echo');
  history.push(input);
  historyPos = history.length;
  const [name, ...rest] = input.split(/\s+/);
  const key = name.toLowerCase();
  const arg = key === 'ask' ? rest.join(' ') : rest.join(' ').toLowerCase();
  const result = commands[key] ? commands[key](arg) : false;
  if (result === false) termPrint(`command not found: ${input} — try help`, 'err');
}

function completions(value) {
  if (value.startsWith('open ')) {
    const q = value.slice(5).toLowerCase();
    return projects.map((p) => `open ${p.id}`).filter((c) => c.startsWith(`open ${q}`));
  }
  return [...Object.keys(commands), 'theme amber', 'sudo hire kufiz'].filter((c) => c.startsWith(value.toLowerCase()));
}

function mountTerminal(el) {
  const log = $('.term-log', el);
  const input = $('#term-input', el);
  termPrint = (text, cls = '') => {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    log.append(line);
    log.scrollTop = log.scrollHeight;
  };

  $('.term-form', el).addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(input.value);
    input.value = '';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      historyPos = Math.max(0, historyPos - 1);
      input.value = history[historyPos];
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      historyPos = Math.min(history.length, historyPos + 1);
      input.value = history[historyPos] ?? '';
    } else if (e.key === 'Tab' && input.value) {
      const matches = completions(input.value);
      if (!matches.length) return;
      e.preventDefault();
      if (matches.length === 1) input.value = matches[0];
      else termPrint(matches.join('  '));
    }
  });
  el.addEventListener('click', (e) => { if (!e.target.closest('button')) input.focus({ preventScroll: true }); });

  termPrint('kufiz OS 1.0 — type help, or just click around.');
  return () => { termPrint = () => {}; };
}

// The opening "whoami" scene in the terminal.
async function terminalIntro() {
  const el = openApp('terminal', { left: 32, top: 24 });
  if (!el || isMobile()) return;
  const input = $('#term-input', el);
  if (!reduceMotion) {
    await sleep(500);
    await typeText(input, 'whoami', 90);
    await sleep(300);
  }
  input.value = '';
  termPrint('$ whoami', 'echo');
  termPrint(profile.whoami);
}

/* ---------- KUFIZ AI ---------- */

const ASK_SUGGESTIONS = [
  'What does he build at Westports?',
  'Tell me about Ambush',
  'Which tech does he use most?',
  'How can I contact him?',
];

async function askAi(question) {
  try {
    const res = await fetch('api/ask.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    return data.answer || data.error || 'No answer.';
  } catch {
    return 'The AI is unavailable right now. Please try again.';
  }
}

function aiHtml() {
  const suggestions = ASK_SUGGESTIONS.map((q) => `<button type="button" class="suggest">${esc(q)}<span aria-hidden="true">→</span></button>`).join('');
  return `
    <div class="ai">
      <div class="ai-side">
        <div class="scene-box orb-box" aria-hidden="true"></div>
        <p class="ai-title">Ask my AI assistant</p>
        <p class="muted">It knows my projects, experience and skills, and answers only from this site.</p>
        <div class="suggest-list">${suggestions}</div>
      </div>
      <div class="chat">
        <div class="chat-log" role="log" aria-live="polite">
          <p class="msg msg-bot">Hi! I'm KUFIZ AI. Ask me anything about Syafiz's work, projects or skills.</p>
        </div>
        <form class="chat-form" autocomplete="off">
          <label for="ai-input" class="visually-hidden">Ask KUFIZ AI a question</label>
          <input id="ai-input" type="text" maxlength="500" placeholder="Ask about projects, skills, experience...">
          <button type="submit" class="send-btn" aria-label="Send question">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </form>
      </div>
    </div>`;
}

function mountAi(el) {
  const log = $('.chat-log', el);
  const form = $('.chat-form', el);
  const input = $('#ai-input', el);
  const orb = scenes && !isMobile() ? scenes.startOrb($('.orb-box', el), { animate: !reduceMotion }) : null;

  const add = (text, who) => {
    const msg = document.createElement('p');
    msg.className = `msg msg-${who}`;
    msg.textContent = text;
    log.append(msg);
    log.scrollTop = log.scrollHeight;
    return msg;
  };

  async function ask(question) {
    const q = question.trim();
    if (!q) return;
    form.querySelector('button').disabled = true;
    document.querySelector('.menu-ai')?.classList.add('busy');
    orb?.setThinking(true);
    add(q, 'user');
    const pending = add('thinking...', 'bot');
    pending.classList.add('pending');
    pending.textContent = await askAi(q);
    pending.classList.remove('pending');
    orb?.setThinking(false);
    document.querySelector('.menu-ai')?.classList.remove('busy');
    form.querySelector('button').disabled = false;
  }

  $('.suggest-list', el).addEventListener('click', (e) => {
    const btn = e.target.closest('.suggest');
    if (btn) ask(btn.firstChild.textContent);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });
  return () => orb?.stop();
}

/* ---------- contact ---------- */

function contactHtml() {
  const method = (iconHtml, label, value, href) => {
    const external = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<li><a class="method" href="${href}"${external}>
      <span class="method-icon" aria-hidden="true">${iconHtml}</span>
      <span class="method-text"><small>${label}</small>${esc(value)}</span>
      <span class="method-arrow" aria-hidden="true">→</span></a></li>`;
  };
  return `
    <div class="contact">
      <div class="contact-visual">
        <div class="scene-box globe-box" aria-hidden="true"></div>
        <div class="ping-panel">
          <p class="cmd"><span class="ps1">$</span> ping kufiz</p>
          <pre class="ping-out" aria-hidden="true"></pre>
        </div>
      </div>
      <div class="contact-info">
        <p class="contact-title">Let's build something together.</p>
        <p class="muted">Have a role, a project or an idea? I usually reply within a day. Based in Selangor, Malaysia (GMT+8).</p>
        <div class="contact-links">
          <div class="cta">
            <a class="btn btn-solid" href="mailto:${contact.email}">email me</a>
            <button type="button" class="btn copy-email">copy email</button>
          </div>
          <ul class="methods">
            ${method(icon('mail'), 'Email', contact.email, `mailto:${contact.email}`)}
            ${method(BRAND_ICONS.github, 'GitHub', contact.github.replace('https://', ''), contact.github)}
            ${method(BRAND_ICONS.linkedin, 'LinkedIn', 'in/tengku-syafiz', contact.linkedin)}
          </ul>
        </div>
      </div>
    </div>`;
}

function mountContact(el) {
  const globe = scenes && !isMobile() ? scenes.startGlobe($('.globe-box', el), { animate: !reduceMotion }) : null;

  const copy = $('.copy-email', el);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      copy.textContent = 'copied';
    } catch {
      copy.textContent = 'copy failed';
    }
    setTimeout(() => { copy.textContent = 'copy email'; }, 2000);
  });

  // Ping lines, then the contact links appear.
  const out = $('.ping-out', el);
  const links = $('.contact-links', el);
  const lines = [
    'PING kufiz (inbox): 56 data bytes',
    '64 bytes from inbox: icmp_seq=0 ttl=64 time=0.42 ms',
    '64 bytes from inbox: icmp_seq=1 ttl=64 time=0.39 ms',
    '--- 2 packets transmitted, 2 received, 0% packet loss ---',
  ];
  let alive = true;
  (async () => {
    if (reduceMotion) {
      out.textContent = lines.join('\n');
    } else {
      links.classList.add('waiting');
      for (const line of lines) {
        if (!alive) return;
        out.textContent += `${line}\n`;
        await sleep(280);
      }
    }
    links.classList.remove('waiting');
  })();

  return () => { alive = false; globe?.stop(); };
}

/* ---------- effects ---------- */

function decrypt(node) {
  const text = node.textContent;
  const glyphs = '!<>-_/[]{}=+*^?#01';
  const total = 14;
  let frame = 0;
  node.setAttribute('aria-label', text);
  const timer = setInterval(() => {
    frame++;
    const settled = Math.floor((text.length * frame) / total);
    node.textContent = [...text]
      .map((ch, i) => (i < settled || ch === ' ' ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]))
      .join('');
    if (frame >= total) {
      clearInterval(timer);
      node.textContent = text;
      node.removeAttribute('aria-label');
    }
  }, 35);
}

function initTilt(grid) {
  grid.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-3px)`;
  });
  grid.addEventListener('pointerout', (e) => {
    const card = e.target.closest('.card');
    if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
  });
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  setTimeout(() => node.classList.remove('show'), 3000);
}

function runMatrix() {
  const canvas = document.createElement('canvas');
  canvas.className = 'matrix';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.append(canvas);

  const ctx = canvas.getContext('2d');
  const size = 16;
  const chars = 'アカサタナハマヤラワ0123456789KUFIZ';
  const drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -40);
  const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const started = Date.now();

  const timer = setInterval(() => {
    ctx.fillStyle = 'rgba(11, 15, 12, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `${size}px JetBrains Mono, monospace`;
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
      drops[i] = y * size > canvas.height && Math.random() > 0.95 ? 0 : y + 1;
    });
    if (Date.now() - started > 4000) {
      clearInterval(timer);
      canvas.remove();
    }
  }, 50);
}

function initKonami() {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === code[pos]) pos++;
    else pos = key === code[0] ? 1 : 0;
    if (pos === code.length) {
      pos = 0;
      document.documentElement.dataset.theme = 'red';
      toast('// konami: red alert mode unlocked until reload');
    }
  });
}

/* ---------- boot & scenes ---------- */

function runBoot() {
  return new Promise((resolve) => {
    if (reduceMotion || storageGet('kufiz-booted')) return resolve();
    storageSet('kufiz-booted', '1');

    const boot = $('#boot');
    const log = $('#boot-log');
    let done = false;
    boot.hidden = false;

    const finish = () => {
      if (done) return;
      done = true;
      removeEventListener('keydown', finish);
      removeEventListener('pointerdown', finish);
      boot.classList.add('fade');
      setTimeout(() => { boot.hidden = true; resolve(); }, 400);
    };
    addEventListener('keydown', finish);
    addEventListener('pointerdown', finish);

    (async () => {
      for (const line of profile.boot) {
        if (done) return;
        await typeText(log, line, 22);
        log.textContent += '\n';
        await sleep(160);
      }
      await sleep(350);
      finish();
    })();
  });
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

async function loadScenes() {
  if (isMobile() || !canUseWebGL()) return;
  try {
    scenes = await import('./yard.js');
    scenes.startYard($('#wallpaper'), { animate: !reduceMotion });
  } catch (err) {
    console.warn('3D scenes unavailable, using static fallback.', err);
  }
}

/* ---------- start ---------- */

async function init() {
  renderChrome();
  initDrawer();
  startClock();
  initKonami();
  await loadScenes();
  await runBoot();

  if (isMobile()) return; // phones start on the home screen
  // About on the right, terminal top-left, name visible bottom-left.
  openApp('about', { left: Math.max(24, innerWidth - Math.min(600, innerWidth - 32) - 32), top: 16 });
  terminalIntro();
}

init();
