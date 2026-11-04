// All site content lives here. Edit freely; layout code reads from these exports.

export const profile = {
  name: 'Tengku Mohd Syafiz',
  handle: 'kufiz',
  role: 'Full-Stack Developer',
  founder: 'kufiz.dev',
  pitch: 'I build systems for a container port by day, and 3D games, ML tools and browser extensions by night.',
  whoami: 'kufiz: full-stack developer at Westports and founder of kufiz.dev. Builds port systems by day, games and tools by night.',
  stats: [
    { value: '5+', label: 'years in production' },
    { value: '10', label: 'projects shipped or in progress' },
    { value: '2', label: 'national innovation medals' },
  ],
  facts: [
    ['based in', 'Selangor, Malaysia'],
    ['founder', 'kufiz.dev'],
    ['role', 'IT Developer @ Westports'],
    ['since', '2021'],
    ['focus', 'PHP 8 · TypeScript · Three.js'],
    ['speaks', 'English · Bahasa Malaysia'],
  ],
  boot: [
    '> booting kufiz.os ...',
    '> mounting /projects ... ok',
    '> mounting /experience ... ok',
    '> whoami',
  ],
};

export const nav = [
  { id: 'about', label: '~/about' },
  { id: 'projects', label: '~/projects' },
  { id: 'experience', label: '~/experience' },
  { id: 'skills', label: '~/skills' },
  { id: 'ask', label: '~/ask' },
  { id: 'contact', label: '~/contact' },
];

export const about = [
  'I am a full-stack developer with 5+ years of building production systems.',
  'Since 2021 I have worked at Westports, building the departmental systems a container terminal runs on.',
  'I like turning slow legacy systems into fast, modern ones: PHP 8, Bootstrap 5 and SQL that has been tuned properly.',
  'After hours I run kufiz.dev, the studio I founded to ship my own products: Chrome extensions, 3D games and AI tools.',
];

export const filters = ['all', 'web', '3d', 'ml', 'mobile', 'extension', 'work'];

// status: short badge text, or null when there is none.
// links: [{ label, href }]; leave empty when nothing is public.
export const projects = [
  {
    id: 'kfz-001',
    name: 'Password Vault',
    status: 'v3.23.2',
    color: '#2f6f9f',
    categories: ['extension'],
    summary: 'Keyboard-driven password manager for developers.',
    description: 'A password manager built for developers who live on the keyboard. It fills and captures logins, generates TOTP codes and syncs your vault end to end encrypted, with no server in the middle.',
    features: [
      'Auto-fill and auto-capture of logins',
      'TOTP 2FA codes',
      'Master PIN lock',
      'End-to-end encrypted sync with no server',
    ],
    stack: ['JavaScript', 'Chrome MV3', 'Web Crypto'],
    links: [{ label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/password-vault/jbpdjacnlniokgklokljimkcjkoohjnc' }],
  },
  {
    id: 'kfz-002',
    name: 'Ambush',
    status: 'v1.5',
    color: '#a33a2c',
    categories: ['web', '3d'],
    summary: 'Multiplayer arena shooter that runs in the browser.',
    description: 'A browser arena shooter for up to 20 players. Host a lobby on your LAN or online and play across five maps and seven modes, or practise against bots.',
    features: [
      'Up to 20 players per match',
      '5 maps: Port, Factory, Rail Yard, Solar Farm, Shopping Mall',
      '7 modes: free for all, teams, domination, gun game, kill confirmed, capture the flag, bomb',
      'LAN and online lobbies',
    ],
    stack: ['TypeScript', 'Three.js', 'Vite', 'WebSocket', 'PeerJS', 'Node.js'],
    links: [{ label: 'Play now', href: 'https://play-ambush.pages.dev' }],
  },
  {
    id: 'kfz-003',
    name: 'Port Digital Twin',
    status: 'WORK',
    color: '#2f7a6b',
    categories: ['web', '3d', 'work'],
    summary: '3D digital twin of a container terminal.',
    description: 'A 3D digital twin of a container terminal running a simulated operation, with vehicles routed over a road network. Everything shown uses simulated data: no real operations or company infrastructure.',
    features: [
      'Simulated terminal operation in 3D',
      'Road-network routing for yard vehicles',
      'Map-based terminal layout',
      'Unit-tested simulation logic',
    ],
    stack: ['TypeScript', 'Three.js', 'Mapbox', 'Vitest'],
    links: [],
  },
  {
    id: 'kfz-004',
    name: 'Kinetra',
    status: 'PLANNING',
    color: '#b07a2a',
    categories: ['web', 'ml'],
    summary: 'Sports video analysis: upload a match, get the numbers.',
    description: 'Upload a match video and get player tracking, heatmaps, distance covered, shots and rallies.',
    features: [
      'Player tracking from video',
      'Heatmaps and distance covered',
      'Shot and rally detection',
    ],
    stack: ['PHP 8', 'MySQL', 'Python'],
    links: [],
  },
  {
    id: 'kfz-005',
    name: 'MyDiet',
    status: 'WIP',
    color: '#3d6b35',
    categories: ['mobile', 'ml'],
    summary: 'Mobile app that plans meals and stepper workouts.',
    description: 'A mobile app that plans meals and stepper workouts around your goals, with barcode scanning and an AI weekly review.',
    features: [
      'Meal and stepper workout plans',
      'Barcode scanning',
      'AI weekly review',
      'English and Bahasa Melayu',
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'Firebase'],
    links: [],
  },
  {
    id: 'kfz-006',
    name: 'API Lab',
    status: 'v2.6',
    color: '#5b4a8a',
    categories: ['extension'],
    summary: 'REST API client inside Chrome.',
    description: 'A REST API client that lives in a Chrome tab. Send requests, keep them organised and find old ones by date.',
    features: [
      'Request history grouped by date',
      'Folders with drag-and-drop',
      'Collections',
    ],
    stack: ['JavaScript', 'Chrome MV3'],
    links: [],
  },
  {
    id: 'kfz-007',
    name: 'MyCalendar',
    status: 'v1.0',
    color: '#8a2f4a',
    categories: ['extension'],
    summary: 'Malaysian public holidays for all 16 states.',
    description: 'A Chrome extension calendar with public holidays for all 16 Malaysian states and federal territories, plus your own events and reminders.',
    features: [
      'Holidays for all 16 states and territories',
      'Personal events',
      'Reminders with snooze',
      'Themes',
    ],
    stack: ['JavaScript', 'Chrome MV3'],
    links: [],
  },
  {
    id: 'kfz-008',
    name: 'ProxyShift',
    status: 'v1.0',
    color: '#5b6470',
    categories: ['extension'],
    summary: 'Proxy switcher with profiles.',
    description: 'Switch between proxy profiles in one click, including proxies that need authentication.',
    features: [
      'Proxy profiles',
      'Authenticated proxies',
    ],
    stack: ['JavaScript', 'Chrome MV3'],
    links: [],
  },
  {
    id: 'kfz-009',
    name: 'Westports Careers',
    status: 'WORK',
    color: '#2f5d8a',
    categories: ['web', 'work'],
    summary: 'Rebuild of the corporate careers site.',
    description: 'A rebuild of the corporate careers site, with an admin studio for HR and a UAT to production release pipeline. No internal or deployment details are shown here.',
    features: [
      'Public careers site',
      'Admin studio for job posts',
      'UAT / PRD release pipeline',
    ],
    stack: ['PHP', 'MySQL'],
    links: [],
  },
  {
    id: 'kfz-010',
    name: 'KUFIZ AI',
    status: 'WIP',
    color: '#1f8fb3',
    categories: ['ml'],
    summary: 'Private AI assistant that runs my day-to-day ops.',
    description: 'A personal ops assistant built on Hermes Agent. A brain router sends each job to the right model, private notes stay on the laptop with a local Qwen model, and nothing leaves until I approve it. Shown with demo data.',
    features: [
      'Brain router across cloud models and a local Qwen',
      'Private memory only the local model can read',
      'Approval queue: nothing is sent without my OK',
      'Voice input and an append-only activity log',
    ],
    stack: ['Python', 'Hermes Agent', 'Ollama', 'Gemini', 'Groq'],
    links: [],
  },
];

// Project ids that have a screenshot at assets/<id>.webp, e.g. ['kfz-002'].
// Others show a placeholder (keeps 404s out of the console).
export const screenshots = ['kfz-001', 'kfz-002', 'kfz-003', 'kfz-005', 'kfz-006', 'kfz-007', 'kfz-008', 'kfz-009', 'kfz-010'];

export const experience = [
  {
    hash: 'a3f9c21',
    head: true,
    date: 'Apr 2021 – Present',
    title: 'IT Developer',
    company: 'Westports Holdings',
    points: [
      'Build new systems and reports for departments across the terminal.',
      'Migrated legacy systems to PHP 8 and Bootstrap 5.',
      'Found and optimised slow SQL queries.',
      'Set documentation standards, mentor junior developers and gather requirements with users.',
    ],
  },
  {
    hash: '7c1e0b4',
    date: 'Oct 2019 – May 2020',
    title: 'Junior Programmer',
    company: 'WizApp System',
    points: [
      'Enhanced the in-house logistics and shipping systems.',
      'Worked with outsourced development teams on in-house features.',
      'Picked up CodeIgniter on the job.',
    ],
  },
  {
    hash: '4d82af9',
    date: 'Dec 2018 – Apr 2019',
    title: 'Software Developer (Intern)',
    company: 'Dataone Services',
    points: [
      'Built an SLA monitoring dashboard.',
      'Built user forms for TNB.',
      'Ran data checks to find duplicates and anomalies.',
    ],
  },
];

export const education = {
  hash: '0e1a5d3',
  date: '2016 – 2018',
  title: 'Diploma in Information Technology (Digital Technology)',
  company: 'Politeknik Sultan Mizan Zainal Abidin',
  points: ['CGPA 3.40'],
};

export const skills = [
  { group: 'languages', items: ['PHP', 'JavaScript', 'TypeScript', 'SQL', 'Python', 'HTML/CSS'] },
  { group: 'frameworks', items: ['CodeIgniter', 'Bootstrap 5', 'Three.js', 'React Native', 'Expo', 'Vite'] },
  { group: 'tools', items: ['MySQL', 'Redis', 'Git', 'Linux', 'Chrome Extensions MV3', 'Mapbox', 'Firebase'] },
];

export const awards = [
  { date: '2018-05-02', level: 'SILVER', text: 'National e-Learning Conference (NELCON 2018), website category' },
  { date: '2018-10-11', level: 'BRONZE', text: 'National Education, Research, Innovation & Entrepreneurship Conference, for e-RedAudra' },
];

export const contact = {
  email: 'tengkusyafiz98@gmail.com',
  github: 'https://github.com/tengkusyafiz',
  linkedin: 'https://www.linkedin.com/in/tengku-syafiz-06bb2b12a/',
};
