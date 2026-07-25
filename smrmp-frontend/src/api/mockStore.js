// Client-side local storage fallback for SMRMP when backend API is offline

const STORAGE_KEY_ARTIFACTS = 'smrmp_mock_artifacts';
const STORAGE_KEY_TICKETS = 'smrmp_mock_tickets';

// Initial realistic demo seed artifacts
export const INITIAL_DEMO_ARTIFACTS = [
  {
    id: 'art-001',
    name: "Ras Alula's Ceremonial Battle Shield",
    category: 'weapon',
    historical_period: '1896 Adwa Victory Era',
    origin: 'Tigray / Adwa Region, Ethiopia',
    materials: 'Rhino hide, embossed brass filigree, velvet lining',
    description: "Ornate ceremonial battle shield wielded by Ras Alula Engida during the Battle of Adwa in 1896. Featuring handcrafted brass sunburst motifs signifying Ethiopian sovereignty.",
    location: 'Adwa Victory Gallery A-3, Display Case 1',
    condition_status: 'excellent',
    is_on_loan: false,
    qr_code: 'ART-001',
    description_source: 'ai_approved',
    created_at: new Date('2026-01-15').toISOString(),
    images: [
      {
        id: 'img-1',
        file_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
      },
    ],
    keywords: ['battle', '1896', 'ras alula', 'shield', 'brass'],
  },
  {
    id: 'art-002',
    name: "Empress Taitu's Silk & Gold Royal Cloak",
    category: 'textile',
    historical_period: 'Late 19th Century (1895)',
    origin: 'Addis Ababa Imperial Court, Ethiopia',
    materials: 'Pure Ethiopian silk, gold thread bullion, lion mane trim',
    description: "Royal ceremonial mantle worn by Empress Taitu Betul. Woven with intricate cross motifs and gold thread detailing symbolizing royal dignity and strategic leadership at Adwa.",
    location: 'Empress Taitu Memorial Hall, Case 4',
    condition_status: 'good',
    is_on_loan: false,
    qr_code: 'ART-002',
    description_source: 'ai_approved',
    created_at: new Date('2026-02-01').toISOString(),
    images: [
      {
        id: 'img-2',
        file_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
      },
    ],
    keywords: ['empress taitu', 'silk', 'cloak', 'royal', 'gold'],
  },
  {
    id: 'art-003',
    name: 'Emperor Menelik II Adwa Mobilization Proclamation',
    category: 'document',
    historical_period: '1895 (1888 E.C.)',
    origin: 'Imperial Palace, Entoto, Ethiopia',
    materials: 'Handmade parchment paper, black & red gall ink, imperial seal',
    description: "Original parchment proclamation issued by Emperor Menelik II calling all Ethiopians to unite and defend the homeland prior to the Battle of Adwa. Stamped with the official Imperial Lion seal.",
    location: 'Imperial Document Archives Room 2',
    condition_status: 'fair',
    is_on_loan: false,
    qr_code: 'ART-ADWA-003',
    description_source: 'ai_approved',
    created_at: new Date('2026-02-10').toISOString(),
    images: [
      {
        id: 'img-3',
        file_url: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
      },
    ],
    keywords: ['proclamation', 'menelik ii', 'parchment', '1895', 'document'],
  },
  {
    id: 'art-004',
    name: 'Adwa Imperial Ceremonial Gold Crown',
    category: 'jewelry',
    historical_period: 'Late 19th Century',
    origin: 'Gondar Craftsmen Guild, Ethiopia',
    materials: 'High-purity gold, emeralds, rubies, filigree wire',
    description: "Royal ceremonial crown featuring repoussé metalwork and filigree bands. Represents the sacred unity of church and crown during the Adwa campaign.",
    location: 'Crown Jewels Vault, Case 1',
    condition_status: 'excellent',
    is_on_loan: false,
    qr_code: 'ART-004',
    description_source: 'ai_approved',
    created_at: new Date('2026-02-20').toISOString(),
    images: [
      {
        id: 'img-4',
        file_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
      },
    ],
    keywords: ['crown', 'gold', 'jewels', 'emperor', 'ceremonial'],
  },
  {
    id: 'art-005',
    name: 'Imperial Field Command Brass Telescope & Compass',
    category: 'other',
    historical_period: '1890s',
    origin: 'European Import / Imperial Command Use',
    materials: 'Lacquered brass, optical glass lens, mahogany casing',
    description: "Navigational and tactical telescope used by Ethiopian vanguard commanders at the heights of Soloda during the Battle of Adwa to observe enemy positions.",
    location: 'Tactical Command Gallery B-1',
    condition_status: 'good',
    is_on_loan: false,
    qr_code: 'ART-005',
    description_source: 'ai_draft',
    created_at: new Date('2026-03-01').toISOString(),
    images: [
      {
        id: 'img-5',
        file_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
      },
    ],
    keywords: ['telescope', 'brass', 'command', 'tactical', '1896'],
  },
  {
    id: 'art-006',
    name: 'Silver Processional Cross of St. George at Adwa',
    category: 'ceremonial',
    historical_period: '19th Century',
    origin: 'Axum, Ethiopia',
    materials: 'Cast silver, incised Ge\'ez inscriptions',
    description: "Historical processional cross carried by priests accompanying the Ethiopian army to Adwa under the patronage of St. George.",
    location: 'Spiritual Heritage Wing, Case 3',
    condition_status: 'good',
    is_on_loan: false,
    qr_code: 'ART-006',
    description_source: 'ai_approved',
    created_at: new Date('2026-03-10').toISOString(),
    images: [
      {
        id: 'img-6',
        file_url: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
      },
    ],
    keywords: ['cross', 'silver', 'axum', 'st george', 'church'],
  },
];

// Helper to get local stored artifacts
export function getLocalArtifacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTIFACTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ARTIFACTS, JSON.stringify(INITIAL_DEMO_ARTIFACTS));
      return INITIAL_DEMO_ARTIFACTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_ARTIFACTS, JSON.stringify(INITIAL_DEMO_ARTIFACTS));
      return INITIAL_DEMO_ARTIFACTS;
    }
    return parsed;
  } catch (err) {
    return INITIAL_DEMO_ARTIFACTS;
  }
}

// Helper to save local stored artifacts
export function saveLocalArtifacts(artifacts) {
  try {
    localStorage.setItem(STORAGE_KEY_ARTIFACTS, JSON.stringify(artifacts));
  } catch (err) {
    console.warn('Failed to save artifacts to localStorage:', err);
  }
}

// Check if error is due to missing backend server
export function isBackendError(error) {
  if (!error) return true;
  if (!error.response) return true;
  return (
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    error.response.status === 404 ||
    error.response.status >= 500
  );
}

// Generate simple scannable QR code image data URL fallback
export function generateQRDataUrl(code) {
  const publicUrl = `${window.location.origin}/artifact/${code}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}&color=2B1B12&bgcolor=FAF6F0`;
}
