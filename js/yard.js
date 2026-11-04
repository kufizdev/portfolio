import * as THREE from 'three';

// The kufiz "K" logo as flat faces (traced on a 1250 x 1250 canvas, y down).
// Each face is extruded to its own depth so the mark reads as a 3D object.
const FACES = [
  { tone: 'mid', depth: 70, pts: [[278, 390], [583, 187], [583, 385], [405, 495]] },
  { tone: 'ink', depth: 120, pts: [[278, 393], [463, 545], [463, 1022], [278, 862]] },
  { tone: 'hi', depth: 50, pts: [[405, 495], [583, 385], [583, 905], [463, 808], [463, 545]] },
  { tone: 'mid', depth: 70, pts: [[463, 808], [583, 905], [463, 1022]] },
  { tone: 'ink', depth: 120, pts: [[583, 383], [806, 235], [973, 337], [583, 592]] },
  { tone: 'dark', depth: 90, pts: [[588, 668], [853, 445], [1020, 443], [773, 713], [725, 666]] },
  { tone: 'hi', depth: 50, pts: [[588, 670], [725, 666], [947, 890], [815, 890]] },
  { tone: 'ink', depth: 120, pts: [[583, 672], [947, 1025], [756, 1065], [583, 905]] },
];

const SCALE = 0.01;

function accentColor() {
  const css = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return new THREE.Color(css || '#39ff88');
}

function makeMaterials() {
  // Transparent so the logo can fade back once it breaks apart on scroll.
  const base = { transparent: true };
  return {
    ink: new THREE.MeshStandardMaterial({ ...base, color: 0xe6ede8, roughness: 0.45, metalness: 0.1 }),
    mid: new THREE.MeshStandardMaterial({ ...base, color: 0x8a9a8f, roughness: 0.5, metalness: 0.1 }),
    dark: new THREE.MeshStandardMaterial({ ...base, color: 0x3f4d45, roughness: 0.5, metalness: 0.2 }),
    hi: new THREE.MeshStandardMaterial({ ...base, color: accentColor(), emissive: accentColor(), emissiveIntensity: 0.35, roughness: 0.35 }),
  };
}

// Each face is its own mesh centred on its centroid, so it can fly out and spin on its own.
function buildLogo(materials) {
  const logo = new THREE.Group();
  FACES.forEach((face, i) => {
    const pts = face.pts.map(([x, y]) => new THREE.Vector2((x - 625) * SCALE, (625 - y) * SCALE));
    const centroid = pts.reduce((sum, p) => sum.add(p), new THREE.Vector2()).divideScalar(pts.length);
    const shape = new THREE.Shape(pts.map((p) => p.clone().sub(centroid)));
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: face.depth * SCALE,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    geometry.translate(0, 0, -face.depth * SCALE / 2);

    const mesh = new THREE.Mesh(geometry, materials[face.tone]);
    const home = new THREE.Vector3(centroid.x, centroid.y, 0);
    mesh.position.copy(home);
    // Fly-out direction: away from the logo's centre, alternating toward and away from the camera.
    const dir = home.clone().normalize().setZ(i % 2 ? 0.2 : -0.9).normalize();
    mesh.userData = { home, dir, spin: new THREE.Vector3(1 + (i % 3), 2 - (i % 2), 1 + (i % 4) * 0.5) };
    logo.add(mesh);
  });
  return logo;
}

// A slow drifting field of points behind the logo. One draw call.
function buildDust(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 2] = -4 - Math.random() * 12;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: accentColor(), size: 0.05, transparent: true, opacity: 0.55 });
  return new THREE.Points(geometry, material);
}

// Shared render loop: sizes the canvas to its host, pauses when the tab is
// hidden or the host is off-screen, and renders one still frame when not animating.
function runScene(host, { animate: animateOption, camera, scene, update, onResize }) {
  let animate = animateOption;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.prepend(renderer.domElement);
  host.classList.add('live');

  const clock = new THREE.Clock();
  let time = 1.2;
  let running = false;
  let onScreen = false;

  function render() {
    renderer.render(scene, camera);
  }

  function frame() {
    if (!running) return;
    time += Math.min(clock.getDelta(), 0.1);
    update(time);
    render();
    requestAnimationFrame(frame);
  }

  function sync() {
    const should = animate && onScreen && !document.hidden && innerWidth >= 768;
    if (should && !running) {
      running = true;
      clock.getDelta();
      requestAnimationFrame(frame);
    } else if (!should) {
      running = false;
    }
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    onResize?.(w / h);
    camera.updateProjectionMatrix();
    if (!running) { update(time); render(); }
  }

  update(time);
  resize();
  const resizer = new ResizeObserver(resize);
  resizer.observe(host);
  const watcher = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); });
  watcher.observe(host);
  document.addEventListener('visibilitychange', sync);
  addEventListener('resize', sync);

  return {
    render: () => { if (!running) render(); },
    // Called when a window closes: stop the loop and free the GPU context.
    stop() {
      animate = false;
      running = false;
      resizer.disconnect();
      watcher.disconnect();
      document.removeEventListener('visibilitychange', sync);
      removeEventListener('resize', sync);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

// Re-tint accent-coloured parts when the theme changes (theme amber, konami red).
function onAccentChange(apply) {
  new MutationObserver(() => apply(accentColor()))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/* ---------- desktop wallpaper: the 3D logo ---------- */

export function startYard(host, { animate }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 17);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-6, 8, 10);
  scene.add(key);
  const rim = new THREE.PointLight(accentColor(), 60, 30);
  rim.position.set(6, -3, -4);
  scene.add(rim);

  const materials = makeMaterials();
  const logo = buildLogo(materials);
  const dust = buildDust(700);
  logo.scale.setScalar(0.75);
  scene.add(logo, dust);

  // Mouse parallax: the logo leans toward the pointer.
  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  });

  let homeX = 0;
  const view = runScene(host, {
    animate,
    camera,
    scene,
    update(time) {
      logo.position.set(homeX, Math.sin(time * 0.8) * 0.2, 0);
      logo.rotation.y = Math.sin(time * 0.3) * 0.5 + pointer.x * 0.7;
      logo.rotation.x = -0.1 + Math.sin(time * 0.45) * 0.06 + pointer.y * 0.4;
      dust.rotation.y = time * 0.012;
      dust.position.y = Math.sin(time * 0.2) * 0.3;
    },
    onResize(aspect) {
      // Wide screens: logo sits right of centre, clear of the first window.
      homeX = aspect > 1.3 ? 0.6 : 0;
    },
  });

  onAccentChange((color) => {
    materials.hi.color.copy(color);
    materials.hi.emissive.copy(color);
    dust.material.color.copy(color);
    rim.color.copy(color);
    view.render();
  });
}

/* ---------- ask: the AI orb ---------- */

export function startOrb(host, { animate }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const light = new THREE.PointLight(accentColor(), 40, 20);
  light.position.set(3, 3, 5);
  scene.add(light);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.25, 2),
    new THREE.MeshStandardMaterial({ color: 0x0f1a14, emissive: accentColor(), emissiveIntensity: 0.06, flatShading: true, roughness: 0.35, metalness: 0.6 }),
  );
  const cage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.9, 1)),
    new THREE.LineBasicMaterial({ color: accentColor(), transparent: true, opacity: 0.7 }),
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.015, 8, 120),
    new THREE.MeshBasicMaterial({ color: accentColor(), transparent: true, opacity: 0.5 }),
  );
  ring.rotation.x = Math.PI / 2.4;
  scene.add(core, cage, ring);

  let thinking = 0; // eases between 0 (idle) and 1 (thinking)
  let target = 0;

  const view = runScene(host, {
    animate,
    camera,
    scene,
    update(time) {
      thinking += (target - thinking) * 0.08;
      const speed = 0.3 + thinking * 2.2;
      core.rotation.y = time * speed;
      core.rotation.x = time * speed * 0.4;
      cage.rotation.y = -time * speed * 0.6;
      cage.rotation.z = time * 0.1;
      ring.rotation.z = time * (0.2 + thinking);
      const pulse = 1 + Math.sin(time * (2 + thinking * 6)) * (0.03 + thinking * 0.05);
      core.scale.setScalar(pulse);
      core.material.emissiveIntensity = 0.06 + thinking * 0.5;
    },
  });

  onAccentChange((color) => {
    core.material.emissive.copy(color);
    cage.material.color.copy(color);
    ring.material.color.copy(color);
    light.color.copy(color);
    view.render();
  });

  return { setThinking(on) { target = on ? 1 : 0; }, stop: view.stop };
}

/* ---------- contact: a dotted globe pinging from Malaysia ---------- */

function latLonToVector(lat, lon, radius) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function buildDottedSphere(radius, count, color) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    positions[i * 3] = Math.cos(golden * i) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(golden * i) * r * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color, size: 0.035, transparent: true, opacity: 0.55 }));
}

function buildArc(from, to, radius) {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.45);
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
    new THREE.LineBasicMaterial({ color: accentColor(), transparent: true, opacity: 0.45 }),
  );
  return { curve, line };
}

export function startGlobe(host, { animate }) {
  const radius = 2;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8.6);
  camera.lookAt(0, 0, 0);

  const globe = new THREE.Group();
  scene.add(globe);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.985, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x0b120e }),
  );
  const dots = buildDottedSphere(radius, 2400, 0x8a9a8f);
  globe.add(shell, dots);

  // Home marker (Selangor) plus arcs to a few world cities.
  const home = latLonToVector(3.07, 101.52, radius);
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: accentColor() }));
  marker.position.copy(home);
  globe.add(marker);

  const pingRings = [0, 1, 2].map(() => {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.09, 0.1, 48),
      new THREE.MeshBasicMaterial({ color: accentColor(), transparent: true, side: THREE.DoubleSide }),
    );
    mesh.position.copy(home);
    mesh.lookAt(home.clone().multiplyScalar(2));
    globe.add(mesh);
    return mesh;
  });

  const cities = [[1.35, 103.82], [35.68, 139.69], [51.51, -0.13], [37.77, -122.42], [-33.87, 151.21]];
  const arcs = cities.map(([lat, lon]) => buildArc(home, latLonToVector(lat, lon, radius), radius));
  const travellers = arcs.map(() => new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 8, 8),
    new THREE.MeshBasicMaterial({ color: accentColor() }),
  ));
  arcs.forEach((arc, i) => globe.add(arc.line, travellers[i]));

  // Face Malaysia toward the camera.
  const facing = Math.atan2(home.x, home.z);
  globe.position.y = 0.45;

  const view = runScene(host, {
    animate,
    camera,
    scene,
    update(time) {
      globe.rotation.y = -facing + Math.sin(time * 0.15) * 0.35;
      pingRings.forEach((ring, i) => {
        const t = (time * 0.6 + i / 3) % 1;
        ring.scale.setScalar(1 + t * 4);
        ring.material.opacity = (1 - t) * 0.8;
      });
      arcs.forEach((arc, i) => {
        const t = (time * 0.25 + i * 0.2) % 1;
        travellers[i].position.copy(arc.curve.getPoint(t));
      });
    },
  });

  onAccentChange((color) => {
    marker.material.color.copy(color);
    pingRings.forEach((ring) => ring.material.color.copy(color));
    arcs.forEach((arc) => arc.line.material.color.copy(color));
    travellers.forEach((t) => t.material.color.copy(color));
    view.render();
  });
  return { stop: view.stop };
}
