/**
 * EcoTrack Education + Fun Facts Page v2
 * Adds: Three.js 3D Globe with CO₂ hotspot markers.
 */
import { getAllFacts, getFactsByCategory, getAllCategories, getDailyFact } from '../core/fun-facts.js';

let globeRenderer = null;

// CO₂ hotspot data [lat, lon, intensity, label]
const CO2_HOTSPOTS = [
  [39.9, 116.4, 1.0, 'China'],
  [38.9, -77.0, 0.85, 'USA'],
  [55.7, 37.6, 0.7, 'Russia'],
  [28.6, 77.2, 0.65, 'India'],
  [35.7, 139.7, 0.55, 'Japan'],
  [51.5, -0.1, 0.5, 'UK'],
  [52.5, 13.4, 0.5, 'Germany'],
  [-23.5, -46.6, 0.45, 'Brazil'],
  [25.2, 55.3, 0.4, 'UAE'],
  [-33.9, 151.2, 0.35, 'Australia'],
];

function latLonToXYZ(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

async function initGlobe(containerId) {
  const container = document.getElementById(containerId);
  if (!container || globeRenderer) return;

  try {
    const THREE = await import('three');

    const width = container.offsetWidth;
    const height = 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    globeRenderer = renderer;

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const atmMat = new THREE.MeshPhongMaterial({
      color: 0x00b4d8, transparent: true, opacity: 0.08, side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Earth sphere (wireframe style)
    const earthGeo = new THREE.SphereGeometry(1, 48, 48);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x0a0f1a,
      wireframe: false,
      emissive: 0x001122,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x1a2a4a, wireframe: true, opacity: 0.3, transparent: true });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.001, 24, 24), wireMat));

    // Lighting
    scene.add(new THREE.AmbientLight(0x223344, 2));
    const sun = new THREE.DirectionalLight(0x4488ff, 3);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // CO₂ hotspot markers
    CO2_HOTSPOTS.forEach(([lat, lon, intensity]) => {
      const pos = latLonToXYZ(lat, lon, 1.01);
      const markerGeo = new THREE.SphereGeometry(0.02 + intensity * 0.025, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.3 - intensity * 0.3, 1, 0.6),
        transparent: true, opacity: 0.85,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(pos.x, pos.y, pos.z);
      scene.add(marker);

      // Pulse ring
      const ringGeo = new THREE.RingGeometry(0.035, 0.05, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.3 - intensity * 0.3, 1, 0.7),
        side: THREE.DoubleSide, transparent: true, opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(pos.x, pos.y, pos.z);
      ring.lookAt(0, 0, 0);
      scene.add(ring);
    });

    // Mouse drag rotation
    let isDragging = false, prevX = 0, prevY = 0;
    let rotX = 0, rotY = 0;
    renderer.domElement.addEventListener('mousedown', (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.005;
      rotX += (e.clientY - prevY) * 0.005;
      prevX = e.clientX; prevY = e.clientY;
    });

    let frame;
    function animate() {
      frame = requestAnimationFrame(animate);
      earth.rotation.y += 0.003;
      if (isDragging) { earth.rotation.y = rotY; earth.rotation.x = Math.max(-0.5, Math.min(0.5, rotX)); }
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup on navigation
    window.addEventListener('hashchange', () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      globeRenderer = null;
    }, { once: true });

  } catch (e) {
    console.warn('Three.js globe init failed:', e);
    if (container) container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:var(--space-8)">🌍 Globe unavailable in this environment.</p>';
  }
}


let currentCategory = 'All';

function renderFactCards(facts) {
  return facts.map(f => {
    const impactBadge = f.impact === 'mind-blowing' ? '🤯 Mind-blowing' : f.impact === 'surprising' ? '😮 Surprising' : '💡 Good to know';
    const impactClass = f.impact === 'mind-blowing' ? 'coral' : f.impact === 'surprising' ? 'amber' : 'teal';
    return `
      <div class="fun-fact-card">
        <div class="fun-fact-card__icon">${f.icon}</div>
        <div class="fun-fact-card__text">${f.text}</div>
        <div class="fun-fact-card__footer">
          <span class="badge badge--${impactClass}">${impactBadge}</span>
          <button class="btn btn--ghost btn--sm share-fact" data-text="${f.icon} ${f.text.replace(/"/g, '&quot;')}" title="Copy to clipboard">📋</button>
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-1)">Source: ${f.source}</div>
      </div>
    `;
  }).join('');
}

const MYTHS = [
  { myth: 'Individual actions don\'t matter — corporations are the problem.', fact: 'Both matter! Consumer demand drives corporate production. Individual choices influence markets, policy, and culture. 71% of industrial emissions come from just 100 companies, but our buying decisions fuel those companies.', icon: '🏭' },
  { myth: 'Paper bags are always better than plastic.', fact: 'Paper bags need 4x more energy to produce and create more CO₂. The best choice is reusable bags used hundreds of times. A cotton tote needs 131 uses to break even with plastic.', icon: '🛍️' },
  { myth: 'Electric cars produce zero emissions.', fact: 'EVs have zero tailpipe emissions but battery manufacturing and electricity generation do produce CO₂. However, lifecycle emissions are still 50-70% lower than petrol cars.', icon: '⚡' },
  { myth: 'Recycling solves the waste problem.', fact: 'Only 9% of plastic ever made has been recycled. While recycling helps, reducing consumption and reusing items is far more impactful. Follow the hierarchy: Reduce → Reuse → Recycle.', icon: '♻️' },
  { myth: 'Planting trees is enough to solve climate change.', fact: 'Trees absorb just 22 kg CO₂/year each. We\'d need 1.6 trillion new trees to offset current annual emissions, and they take decades to mature. Emission reduction must come first.', icon: '🌳' },
  { myth: 'Local food always has lower emissions than imported food.', fact: 'Transport is often <10% of food emissions. A tomato in a heated greenhouse locally can emit more than one shipped from a sunny climate. What you eat matters more than where it\'s from.', icon: '🌍' },
];

export function renderEducation() {
  const dailyFact = getDailyFact();
  const categories = ['All', ...getAllCategories()];
  const facts = currentCategory === 'All' ? getAllFacts() : getFactsByCategory(currentCategory);

  const html = `
    <div class="page-header">
      <h1 class="page-header__title">📚 Learn & Discover</h1>
      <p class="page-header__subtitle">Fun facts, myth-busting, and carbon literacy</p>
    </div>

    <!-- 3D Globe -->
    <div class="card" style="margin-bottom:var(--space-6);overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3)">
        <div>
          <h3>🌍 Global CO₂ Emissions Map</h3>
          <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin:var(--space-1) 0 0">Drag to rotate &bull; Coloured dots = top emitting countries</p>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;font-size:var(--text-xs)">
          <span style="color:#00d68f">🟢 Lower</span>
          <span style="color:#f5a623">🟡 Medium</span>
          <span style="color:#ff5f57">🔴 Higher</span>
        </div>
      </div>
      <div id="globe-container" style="width:100%;height:320px;border-radius:var(--radius-sm);background:radial-gradient(circle at 30% 30%,#0d1b2a,#050a12);cursor:grab"></div>
    </div>

    <!-- Daily Fact -->
    <div class="card card--accent" style="margin-bottom:var(--space-6);background:linear-gradient(135deg,rgba(0,214,143,0.1),rgba(0,180,216,0.1))">
      <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2)">
        <span style="font-size:1.5rem">📅</span>
        <h3>Fact of the Day</h3>
      </div>
      <p style="font-size:var(--text-lg);margin:0">${dailyFact.icon} ${dailyFact.text}</p>
      <small style="color:var(--text-tertiary);display:block;margin-top:var(--space-2)">Source: ${dailyFact.source}</small>
    </div>

    <!-- Fun Facts Carousel -->
    <div style="margin-bottom:var(--space-6)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
        <h3>🎉 Fun Facts</h3>
        <span style="font-size:var(--text-sm);color:var(--text-secondary)">${facts.length} facts</span>
      </div>
      <div class="tabs" style="margin-bottom:var(--space-4);flex-wrap:wrap" id="fact-tabs">
        ${categories.map(c => `<button class="tab ${c === currentCategory ? 'tab--active' : ''}" data-category="${c}">${c}</button>`).join('')}
      </div>
      <div class="fun-fact-carousel" id="fact-carousel">${renderFactCards(facts)}</div>
    </div>

    <!-- Myth vs Fact -->
    <div style="margin-bottom:var(--space-6)">
      <h3 style="margin-bottom:var(--space-4)">🔍 Myth vs. Fact</h3>
      <div class="dashboard-grid">
        ${MYTHS.map((m, i) => `
          <div class="card card--interactive myth-card" data-index="${i}" style="cursor:pointer">
            <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
              <span style="font-size:2rem">${m.icon}</span>
              <span class="badge badge--coral">MYTH</span>
            </div>
            <p style="font-style:italic;margin-bottom:var(--space-3)">"${m.myth}"</p>
            <div class="myth-reveal" style="display:none">
              <div class="divider"></div>
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2)">
                <span class="badge badge--green">FACT</span>
              </div>
              <p style="font-size:var(--text-sm);color:var(--text-secondary);margin:0">${m.fact}</p>
            </div>
            <small style="color:var(--text-tertiary)">Click to reveal the truth →</small>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Carbon Cost Comparison -->
    <div class="card">
      <h3 style="margin-bottom:var(--space-4)">📊 CO₂ Cost of Common Activities</h3>
      <div style="display:flex;flex-direction:column;gap:var(--space-3)">
        ${[
          { label: '🥩 1 kg Beef', value: 27, max: 40 },
          { label: '☕ 1 kg Coffee', value: 16.5, max: 40 },
          { label: '🍫 1 kg Chocolate', value: 19, max: 40 },
          { label: '🧀 1 kg Cheese', value: 13.5, max: 40 },
          { label: '🍚 1 kg Rice', value: 4, max: 40 },
          { label: '🥦 1 kg Vegetables', value: 2, max: 40 },
          { label: '🥜 1 kg Legumes', value: 0.9, max: 40 },
          { label: '✈️ 1 hr Flying', value: 250, max: 300 },
          { label: '🚗 1 hr Driving', value: 12.6, max: 40 },
          { label: '📺 1 hr Streaming', value: 0.036, max: 1 },
        ].map(item => `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:var(--text-sm)">
              <span>${item.label}</span>
              <span style="font-weight:600;color:var(--accent-amber)">${item.value} kg CO₂e</span>
            </div>
            <div class="progress-bar"><div class="progress-bar__fill" style="width:${Math.min((item.value / item.max) * 100, 100)}%;background:var(--gradient-warm)"></div></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return html;
}

export function bindEducationEvents() {
  // Init 3D Globe
  initGlobe('globe-container');

  // Category tabs
  document.querySelectorAll('#fact-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentCategory = tab.dataset.category;
      const newFacts = currentCategory === 'All' ? getAllFacts() : getFactsByCategory(currentCategory);
      const carousel = document.getElementById('fact-carousel');
      if (carousel) carousel.innerHTML = renderFactCards(newFacts);
      document.querySelectorAll('#fact-tabs .tab').forEach(t => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');
      bindShareButtons();
    });
  });

  // Myth flip cards
  document.querySelectorAll('.myth-card').forEach(card => {
    card.addEventListener('click', () => {
      const reveal = card.querySelector('.myth-reveal');
      if (reveal) reveal.style.display = reveal.style.display === 'none' ? 'block' : 'none';
    });
  });

  bindShareButtons();
}

function bindShareButtons() {
  document.querySelectorAll('.share-fact').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.dataset.text;
      navigator.clipboard.writeText(text + ' #EcoTrack').then(() => {
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = '📋'; }, 1500);
      });
    });
  });
}
