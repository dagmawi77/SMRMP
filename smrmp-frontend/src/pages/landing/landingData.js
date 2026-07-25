export const paperPoints = [
  'Manual paper ledgers susceptible to degradation and loss.',
  'Disconnected spreadsheets creating fragmented artifact history.',
  'Opaque conservation schedules leading to missed interventions.',
  'Cash-heavy ticketing with limited visitor data visibility.',
];

export const digitalPoints = [
  'Structured artifact intelligence with unique QR identity.',
  'Integrated conservation workflows with live condition alerts.',
  'Digital ticketing with real-time visitor exploration metrics.',
  'AI-assisted drafting with full curator review cycles.',
];

export const capabilityModules = [
  {
    module: 'Module 01',
    title: 'Artifact Intelligence',
    description:
      'Every object tells a story. We anchor that story in structured metadata. Unique QR identifiers link physical assets to deep digital provenance, tracking every movement from archive to exhibition.',
    image:
      'https://images.unsplash.com/photo-1707978932202-751b08324daf?auto=format&w=1600&q=80&fit=crop',
    imageAlt: 'Close up of traditional Ethiopian weaving. Photo by mohammad hassan taheri.',
    side: 'left',
    features: ['Provenance Tracking', 'Digital Identity'],
  },
  {
    module: 'Module 02',
    title: 'Precision Conservation',
    description:
      'Proactive preservation through data. Log condition history, schedule recurring inspections, and document restoration efforts in a chronological log that ensures no artifact is left to fade.',
    image:
      'https://images.pexels.com/photos/6661031/pexels-photo-6661031.jpeg?auto=compress&cs=tinysrgb&w=1600&q=80',
    imageAlt: 'Curator examining an artifact closely. Photo by kaboompics.',
    side: 'right',
    stats: [
      { value: '0%', label: 'Data Loss' },
      { value: '100%', label: 'Traceability' },
    ],
  },
  {
    module: 'Module 03',
    title: 'The Living Story',
    description:
      'From scan to story. Visitors explore exhibitions through a rich digital layer—audio narration, high-resolution imagery, and historical context—while ticketing becomes a seamless digital experience.',
    image:
      'https://images.unsplash.com/photo-1691956022908-02db329671cc?auto=format&w=1600&q=80&fit=crop',
    imageAlt: 'Silhouette of a visitor looking at a display. Photo by Remy Gieling.',
    side: 'left',
    features: [
      { icon: 'qr', label: ['Instant', 'Exploration'] },
      { icon: 'audio', label: ['Audio', 'Narration'] },
    ],
  },
];

export const roadmapSteps = [
  {
    step: '03',
    title: 'National Platform',
    description:
      'A multi-institution heritage network. Cross-museum archive sharing, national preservation analytics, and unified cultural reporting.',
    footer: '2027 Strategic Goal',
    variant: 'standard',
  },
  {
    step: '02',
    title: 'Single-Museum Pilot',
    description:
      'Full operational deployment at Adwa Victory Memorial Museum. Hardening every workflow with 10,000+ artifacts and daily visitor traffic.',
    footer: ['Modules 1-4 Production', 'Real-world Validation', 'Live Ticketing Integration'],
    variant: 'active',
  },
  {
    step: '01',
    title: '24-hour MVP',
    description:
      'Proving the core loop: registration, QR generation, AI description, and visitor scan experience in record time.',
    footer: 'Proven Hackathon Concept',
    variant: 'standard',
  },
];

export const audienceCards = [
  {
    eyebrow: 'For Leadership',
    title: 'Accountability & Insight',
    description:
      "Secure your institution's legacy with live operational dashboards, automated reporting, and transparent artifact custody.",
    action: 'View Executive Suite',
    image: 'https://images.pexels.com/photos/9721880/pexels-photo-9721880.jpeg?auto=compress&cs=tinysrgb&w=800',
    imageAlt: 'Museum director. Photo by Евгений Шухман.',
    overlay: 'group-hover:bg-smrmp-deep-green/60',
  },
  {
    eyebrow: 'For Curators',
    title: 'Stewardship & Care',
    description:
      'Focus on the art of preservation. Let AI handle the first draft while you manage structured records and conservation history.',
    action: 'Explore Curator Tools',
    image: 'https://images.pexels.com/photos/6661040/pexels-photo-6661040.jpeg?auto=compress&cs=tinysrgb&w=800',
    imageAlt: 'Curator at work. Photo by kaboompics.',
    overlay: 'group-hover:bg-smrmp-earth/60',
  },
  {
    eyebrow: 'For Visitors',
    title: 'Discovery & Access',
    description:
      'Uncover the hidden layers of history. Scan artifact QRs for immersive audio, rich imagery, and the stories that shaped a nation.',
    action: 'Explore Visitor Portal',
    image: 'https://images.pexels.com/photos/13432768/pexels-photo-13432768.jpeg?auto=compress&cs=tinysrgb&w=800',
    imageAlt: 'Family at museum. Photo by Minh Ngọc.',
    overlay: 'group-hover:bg-smrmp-brown/60',
  },
];

export const platformLinks = ['Artifact Intel', 'Conservation', 'Visitor Journey', 'Analytics'];
export const contactLinks = ['Inquire Pilot', 'Press & Media', 'Adwa Museum'];
