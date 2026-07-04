import {
  BRAND,
  MANIFESTO,
  PACKAGES,
  CAPABILITIES,
  PROCESS,
  CTA,
  CONTACT_EMAIL,
} from '../content.js';

const mailto = `mailto:${CONTACT_EMAIL}?subject=Conquest%20project%20enquiry`;

const check = /* html */ `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
const arrow = /* html */ `<svg class="btn__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

function nav() {
  return /* html */ `
    <header class="nav">
      <a class="brand" href="#top" aria-label="Conquest home">
        <span class="brand__mark" aria-hidden="true"></span>
        <span>${BRAND.name}</span>
      </a>
      <a class="btn" href="${mailto}">Start a project ${arrow}</a>
    </header>`;
}

function hero() {
  return /* html */ `
    <section class="hero" id="top">
      <p class="hero__eyebrow">Creative &amp; web studio</p>
      <h1 class="hero__title">${BRAND.name}</h1>
      <p class="hero__tagline reveal" data-delay="0.9">${BRAND.tagline}</p>
      <p class="hero__lead reveal" data-delay="1.05">${BRAND.heroLead}</p>
      <div class="hero__scroll" aria-hidden="true">
        <span>${BRAND.scrollCue}</span>
        <span class="line"></span>
      </div>
    </section>`;
}

function manifesto() {
  return /* html */ `
    <section class="section" id="manifesto">
      <div class="container">
        <p class="eyebrow reveal">${MANIFESTO.eyebrow}</p>
        <div class="manifesto__lines reveal" data-delay="0.05">
          <div class="l1">${MANIFESTO.lines[0]}</div>
          <div class="l2">${MANIFESTO.lines[1]}</div>
        </div>
        <p class="manifesto__body reveal" data-delay="0.1">${MANIFESTO.body}</p>
      </div>
    </section>`;
}

function pkgCard(p) {
  const features = p.features
    .map(
      (f) => /* html */ `<li class="pkg__feature">${check}<span>${f}</span></li>`
    )
    .join('');
  const flag = p.highlight
    ? `<span class="pkg__flag">Flagship</span>`
    : `<span class="pkg__index">${p.index}</span>`;
  const priceTitle = p.isPlaceholderPrice ? ' title="Placeholder price — edit in src/content.js"' : '';
  return /* html */ `
    <article class="pkg ${p.highlight ? 'pkg--highlight' : ''}" data-stagger-item>
      <div class="pkg__top">
        ${p.highlight ? `<span class="pkg__index">${p.index}</span>` : ''}
        ${flag}
      </div>
      <h3 class="pkg__name">${p.name}</h3>
      <p class="pkg__system">${p.system}</p>
      <p class="pkg__summary">${p.summary}</p>
      <div class="pkg__price"${priceTitle}>
        <span class="pkg__price-value">${p.price}</span>
        <span class="pkg__price-note">${p.priceNote}</span>
      </div>
      <ul class="pkg__features">${features}</ul>
      <p class="pkg__badge">${p.badge}</p>
      <a class="btn ${p.highlight ? 'btn--primary' : ''} pkg__cta" href="${mailto}">${p.cta} ${arrow}</a>
    </article>`;
}

function packages() {
  return /* html */ `
    <section class="section" id="packages">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow reveal">Choose your orbit</p>
          <h2 class="section__title reveal" data-delay="0.05">Three packages.\nOne trajectory: up.</h2>
          <p class="section__body reveal" data-delay="0.1">From a single luminous landing page to a full design-system universe with its own AI lead agent — pick the altitude that fits your brand.</p>
        </div>
        <div class="packages__grid" data-stagger>
          ${PACKAGES.map(pkgCard).join('')}
        </div>
      </div>
    </section>`;
}

function node(n, i, total) {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  const rx = 50 + Math.cos(angle) * 40;
  const ry = 50 + Math.sin(angle) * 40;
  const blue = i % 2 === 1 ? 'node--blue' : '';
  return /* html */ `
    <div class="node ${blue}" data-stagger-item style="left:${rx}%; top:${ry}%;">
      <span class="node__dot" aria-hidden="true"></span>
      <span class="node__label">${n.label}</span>
      <span class="node__hint">${n.hint}</span>
    </div>`;
}

function capabilities() {
  const nodes = CAPABILITIES.nodes
    .map((n, i) => node(n, i, CAPABILITIES.nodes.length))
    .join('');
  return /* html */ `
    <section class="section capabilities" id="capabilities">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow reveal">${CAPABILITIES.eyebrow}</p>
          <h2 class="section__title reveal" data-delay="0.05">${CAPABILITIES.title}</h2>
          <p class="section__body reveal" data-delay="0.1" style="margin-inline:auto;">${CAPABILITIES.body}</p>
        </div>
        <div class="constellation" data-stagger role="img" aria-label="Singularity capabilities: ${CAPABILITIES.nodes.map((n) => n.label).join(', ')}">
          <div class="constellation__ring" aria-hidden="true"></div>
          <div class="constellation__ring constellation__ring--2" aria-hidden="true"></div>
          <div class="constellation__core" aria-hidden="true">Design<br>System</div>
          ${nodes}
        </div>
      </div>
    </section>`;
}

function process() {
  const steps = PROCESS.steps
    .map(
      (s) => /* html */ `
      <div class="step" data-stagger-item>
        <div class="step__n">${s.n}</div>
        <h3 class="step__title">${s.title}</h3>
        <p class="step__body">${s.body}</p>
      </div>`
    )
    .join('');
  return /* html */ `
    <section class="section" id="process">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow reveal">${PROCESS.eyebrow}</p>
          <h2 class="section__title reveal" data-delay="0.05">How a conquest unfolds.</h2>
        </div>
        <div class="process__grid" data-stagger>${steps}</div>
      </div>
    </section>`;
}

function cta() {
  return /* html */ `
    <section class="section cta" id="contact">
      <div class="container">
        <div class="cta__inner reveal">
          <p class="eyebrow" style="margin-inline:auto;">${CTA.eyebrow}</p>
          <h2 class="cta__title">${CTA.title}</h2>
          <p class="cta__body">${CTA.body}</p>
          <a class="btn btn--primary cta__button" href="${mailto}">${CTA.button} ${arrow}</a>
        </div>
      </div>
    </section>`;
}

function footer() {
  const year = new Date().getFullYear();
  return /* html */ `
    <footer class="footer">
      <div class="container">
        <div class="footer__row">
          <a class="brand" href="#top">
            <span class="brand__mark" aria-hidden="true"></span>
            <span>${BRAND.name}</span>
          </a>
          <a class="footer__mail" href="${mailto}">${CONTACT_EMAIL}</a>
        </div>
        <p class="footer__legal">© ${year} Conquest. We engineer brands worthy of orbit.</p>
      </div>
    </footer>`;
}

export function renderApp(root) {
  root.innerHTML = [
    nav(),
    hero(),
    manifesto(),
    packages(),
    capabilities(),
    process(),
    cta(),
    footer(),
  ].join('');

  // Prime staggered items for animation.
  root.querySelectorAll('[data-stagger-item]').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
  });
}
