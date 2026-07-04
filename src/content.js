// Single source of truth for all site copy and package data.
// Edit prices, features, and contact details here.

export const CONTACT_EMAIL = 'conquest.SU@gmail.com';

export const BRAND = {
  name: 'CONQUEST',
  tagline: 'We engineer brands worthy of orbit.',
  heroLead:
    'A web & creative studio building cinematic, high-fidelity worlds — from a single landing page to a full design-system universe.',
  scrollCue: 'Scroll to enter',
};

export const MANIFESTO = {
  eyebrow: 'The Conquest doctrine',
  lines: [
    'Most websites sit still.',
    'Ours pull light.',
  ],
  body:
    'We treat every brand like a celestial body — engineered to be seen from a distance, and impossible to look away from up close. Motion, depth, and craft, applied with intent.',
};

// data-placeholder marks figures the client should replace with real numbers.
export const PACKAGES = [
  {
    id: 'base',
    index: '01',
    name: 'Base',
    system: 'Single-star system',
    summary: 'A sharp, fast landing page that puts your brand in orbit.',
    price: '$900',
    priceNote: 'one-time · placeholder',
    isPlaceholderPrice: true,
    highlight: false,
    features: [
      'A designed, responsive landing page',
      'Built for speed and clarity on every device',
      'Refresh your page every 6 months at 50% off',
    ],
    badge: 'Updates 50% off · every 6 months',
    cta: 'Launch Base',
  },
  {
    id: 'premium',
    index: '02',
    name: 'Premium',
    system: 'Multi-planet system',
    summary:
      'A full-stack website for your brand that showcases your products and services.',
    price: '$3,200',
    priceNote: 'project · placeholder',
    isPlaceholderPrice: true,
    highlight: false,
    features: [
      'Full-stack, multi-page website',
      'Showcases your products or services',
      'Website updates every 3 months at 60% off',
    ],
    badge: 'Updates 60% off · every 3 months',
    cta: 'Go Premium',
  },
  {
    id: 'singularity',
    index: '03',
    name: 'Singularity',
    system: 'Full galaxy',
    summary:
      'The complete universe: a hi-fidelity, animated site plus an on-demand brand system and your own AI lead agent.',
    price: 'From $8,500',
    priceNote: 'project · placeholder',
    isPlaceholderPrice: true,
    highlight: true,
    features: [
      'Full-stack website with motion graphics, 3D animation & hi-fidelity design',
      'A design system you invoke 3× / month — ads, logo redesigns, posters, stickers, brochures',
      'Update your website anytime, up to 6× / year',
      'A tailored AI agent trained on your business',
      'Agent follows up leads over WhatsApp & schedules client meetings',
    ],
    badge: 'The flagship',
    cta: 'Enter the Singularity',
  },
];

// Package-3 capabilities rendered as a radial constellation of nodes.
export const CAPABILITIES = {
  eyebrow: 'Inside the Singularity',
  title: 'One design system.\nInvoked on demand.',
  body:
    'Three times a month, point the Conquest design system at whatever you need next. Plus a lead agent that never sleeps.',
  nodes: [
    { label: 'Ads', hint: 'Campaign-ready creative' },
    { label: 'Logos', hint: 'Redesigns & refinements' },
    { label: 'Posters', hint: 'Print & social' },
    { label: 'Stickers', hint: 'Merch & moments' },
    { label: 'Brochures', hint: 'Sales collateral' },
    { label: 'Lead Agent', hint: 'WhatsApp follow-ups' },
    { label: 'Scheduling', hint: 'Books client meetings' },
  ],
};

export const PROCESS = {
  eyebrow: 'The trajectory',
  steps: [
    {
      n: '01',
      title: 'Brief',
      body: 'We map your brand, audience, and the outcome you want in orbit.',
    },
    {
      n: '02',
      title: 'Design',
      body: 'Direction, motion language, and a system built to scale with you.',
    },
    {
      n: '03',
      title: 'Build',
      body: 'Hi-fidelity front-end, engineered for speed, depth, and craft.',
    },
    {
      n: '04',
      title: 'Orbit',
      body: 'Launch, iterate, and keep the system working — updates and agent included.',
    },
  ],
};

export const CTA = {
  eyebrow: 'Ready for launch',
  title: 'Begin your conquest.',
  body: 'Tell us where you want to go. We will chart the orbit.',
  button: 'Start a project',
};
