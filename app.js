const STORAGE_KEY = 'agriguard-risk-planner-assets-v1';
const DISPATCH_STORAGE_KEY = 'agriguard-dispatch-v1';
const INCIDENT_STORAGE_KEY = 'agriguard-incidents-v1';
const NODE_STORAGE_KEY = 'agriguard-network-nodes-v1';
const VENDOR_STORAGE_KEY = 'agriguard-vendors-v1';
const NETWORK_ZONES = ['Cloud / SaaS', 'Perimeter / DMZ', 'Internal network', 'Restricted data zone', 'Remote / user devices', 'Not sure'];
const CIA_LEVELS = { none: 0, low: 1, medium: 2, high: 3 };
const PROCESS_STAGES = [
  ['supplier_pickup', 'Supplier pickup'], ['inbound', 'Inbound transport'],
  ['receiving', 'Receiving / quality check'], ['cold_storage', 'Cold storage'],
  ['processing', 'Processing / packaging'], ['outbound', 'Outbound transport'],
  ['grocery_delivery', 'Grocery delivery'], ['completed', 'Completed']
];

const nowRounded = new Date();
nowRounded.setMinutes(0, 0, 0);
const demoTime = offsetHours => {
  const date = new Date(nowRounded.getTime() + offsetHours * 60 * 60 * 1000);
  return toLocalDateTime(date);
};

const demoDispatches = [
  {
    id: 'load-delivered', name: 'Romaine lot RM-26091', customer: 'Green Acres Farm → FreshFields Foods',
    cargo: '240 crates of romaine lettuce', origin: 'Green Acres Farm, ON',
    destination: 'FreshFields receiving dock, Brampton, ON', plannedEta: demoTime(-5), actualEta: demoTime(-4),
    vehicle: 'Reefer truck 12 / Carrier A', status: 'delivered', stage: 'receiving', productValue: '6800', delayMinutes: '',
    reason: '', redundancy: 'Backup refrigerated carrier confirmed; receiving dock has one alternate unloading bay.',
    remediation: 'Receiving team completed lot and temperature checks; release accepted crates to cold storage.'
  },
  {
    id: 'load-transit', name: 'Salad batch SF-26092', customer: 'FreshFields Foods → North Grocery DC',
    cargo: '1,200 cases of washed and packaged salad greens', origin: 'FreshFields packaging line, Brampton, ON',
    destination: 'North Grocery distribution centre, Toronto, ON', plannedEta: demoTime(4), actualEta: '',
    vehicle: 'Reefer truck 08 / Carrier A', status: 'in_transit', stage: 'grocery_delivery', productValue: '12600', delayMinutes: '',
    reason: '', redundancy: 'Carrier B has a compatible reefer unit; grocery DC accepts a revised delivery slot.',
    remediation: 'Operations to confirm arrival window with receiving and preserve temperature log.'
  },
  {
    id: 'load-canceled', name: 'Strawberry lot ST-26090', customer: 'Berry Ridge Co-op → FreshFields Foods',
    cargo: '90 crates of fresh strawberries; 14 crates held for temperature review', origin: 'Berry Ridge Co-op, ON',
    destination: 'FreshFields cold room, Brampton, ON', plannedEta: demoTime(-8), actualEta: demoTime(-6.5),
    vehicle: 'Reefer truck 03 / Carrier A', status: 'delivered', stage: 'cold_storage', productValue: '4100', delayMinutes: '',
    reason: 'Temperature alarm delayed release; 14 crates isolated pending quality review.',
    redundancy: 'Alternate cold-room capacity available for unaffected product.',
    remediation: 'Quality lead to document disposition of isolated crates and verify alarm sensor.'
  },
  {
    id: 'load-processing', name: 'Processing batch PR-26093', customer: 'FreshFields Foods production',
    cargo: 'Romaine and spinach inputs for 800 ready-to-eat salad cases', origin: 'FreshFields cold room, Brampton, ON',
    destination: 'FreshFields wash and packaging line, Brampton, ON', plannedEta: demoTime(3), actualEta: '',
    vehicle: 'Wash / pack line 2', status: 'processing', stage: 'processing', productValue: '8500', delayMinutes: '',
    reason: '', redundancy: 'Line 1 can run a reduced-volume shift if line 2 is unavailable.',
    remediation: 'Production lead to confirm lot traceability and packaging line availability.'
  }
];

const demoIncidents = [
  {
    id: 'incident-reefer', type: 'Temperature excursion / spoilage', severity: 'medium',
    description: 'Temperature alarm on inbound berry lot; 14 of 90 crates isolated pending quality disposition. Remaining product moved to cold storage.',
    dispatchId: 'load-canceled', status: 'in_progress', delayMinutes: '90',
    productLoss: '640', salvageValue: '90', disposalCost: '75', delayCost: '260',
    estimatedCost: '0', remediation: 'Quality lead to inspect temperature history, document lot disposition, and service the reefer alarm sensor.',
    createdAt: new Date().toISOString()
  }
];

const operationalSources = [
  { label: 'Google Maps URLs: open directions without an API key', url: 'https://developers.google.com/maps/documentation/urls/get-started' },
  { label: 'Transport Canada: Road safety in Canada', url: 'https://tc.canada.ca/en/road-transportation/road-safety-canada' },
  { label: 'NIST SP 800-161 Rev. 1 Update 1: Cybersecurity Supply Chain Risk Management', url: 'https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final' },
  { label: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework' }
];

const implementationResources = {
  admin: [
    { label: 'Microsoft Learn: Active Directory security groups', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups', type: 'guide' },
    { label: 'Microsoft Learn: Assign Microsoft Entra roles', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/manage-roles-portal', type: 'guide' }
  ],
  mfa: [
    { label: 'Microsoft Learn: Deploy Microsoft Entra multifactor authentication', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-getstarted', type: 'guide' },
    { label: 'Microsoft Learn: Identity and access training', url: 'https://learn.microsoft.com/en-us/training/browse/?products=entra-id', type: 'training' }
  ],
  access: [
    { label: 'Microsoft Learn: Active Directory security groups', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups', type: 'guide' },
    { label: 'Microsoft Learn: Assign Microsoft Entra roles', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/manage-roles-portal', type: 'guide' },
    { label: 'Microsoft Learn: Identity and access training', url: 'https://learn.microsoft.com/en-us/training/browse/?products=entra-id', type: 'training' }
  ],
  backup: [
    { label: 'NIST SP 800-34: Contingency Planning Guide', url: 'https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final', type: 'guide' },
    { label: 'NIST CSF 2.0: Recovery and backup outcomes', url: 'https://www.nist.gov/cyberframework', type: 'framework' }
  ],
  logging: [
    { label: 'Microsoft Learn: Microsoft Entra audit logs', url: 'https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-audit-logs', type: 'guide' },
    { label: 'Microsoft Learn: Identity and access training', url: 'https://learn.microsoft.com/en-us/training/browse/?products=entra-id', type: 'training' }
  ],
  exposure: [
    { label: 'Microsoft Learn: Assign Microsoft Entra roles', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/manage-roles-portal', type: 'guide' },
    { label: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework', type: 'framework' }
  ],
  owner: [
    { label: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework', type: 'framework' }
  ]
};

const microsoftVideoResource = {
  label: 'Microsoft Learn Shows: product walkthrough videos',
  url: 'https://learn.microsoft.com/en-us/shows/',
  type: 'video'
};

const demoAssets = [
  {
    id: 'm365', name: 'Microsoft 365', type: 'Identity & access', criticality: 'high', domain: 'shared',
    confidentiality: 'high', integrity: 'high', availability: 'high',
    purpose: 'Business email, shared files, and staff identity.', businessImpact: 'Staff may lose access to purchase orders, supplier contacts, and delivery coordination.', owner: 'Operations',
    exposure: 'yes', admin: 'unknown', mfa: 'partial', access: 'unknown',
    backups: 'unknown', logging: 'partial', zone: 'Cloud / SaaS', dependencies: []
  },
  {
    id: 'farm-erp', name: 'Farm operations platform', type: 'Business application', criticality: 'high', domain: 'shared',
    confidentiality: 'medium', integrity: 'high', availability: 'high',
    purpose: 'Coordinates inventory, purchasing, and daily operations.', businessImpact: 'Incorrect or unavailable lot and inventory records can delay receiving, production scheduling, and customer orders.', owner: 'Farm manager',
    exposure: 'yes', admin: 'changed', mfa: 'unknown', access: 'no',
    backups: 'partial', logging: 'unknown', zone: 'Cloud / SaaS', dependencies: ['m365']
  },
  {
    id: 'nas', name: 'Office file server', type: 'Data storage', criticality: 'high', domain: 'it',
    confidentiality: 'high', integrity: 'high', availability: 'medium',
    purpose: 'Stores finance records and internal business documents.', businessImpact: 'Loss or alteration could prevent finance reconciliation and access to essential business records.', owner: 'Office team',
    exposure: 'no', admin: 'shared', mfa: 'no', access: 'no',
    backups: 'no', logging: 'no', zone: 'Restricted data zone', dependencies: []
  },
  {
    id: 'router', name: 'Office router & Wi-Fi', type: 'Network / infrastructure', criticality: 'medium', domain: 'shared',
    confidentiality: 'low', integrity: 'high', availability: 'high',
    purpose: 'Connects office devices and staff to the internet.', businessImpact: 'An outage can disconnect office staff from cloud ordering, dispatch, and communications tools.', owner: 'IT support',
    exposure: 'unknown', admin: 'unknown', mfa: 'unknown', access: 'unknown',
    backups: 'unknown', logging: 'unknown', zone: 'Perimeter / DMZ', dependencies: []
  }
];

const demoNodes = [
  { id: 'node-fw', name: 'Edge firewall', zone: 'Perimeter / DMZ', domain: 'it', purpose: 'Filters inbound/outbound office network traffic.', businessImpact: 'A misconfiguration or outage can expose services or disconnect staff from essential cloud tools.', dependencies: ['router'] },
  { id: 'node-dispatch', name: 'Dispatch workstation', zone: 'Internal network', domain: 'ot', purpose: 'Dispatcher assigns trucks and confirms load status.', businessImpact: 'Lost dispatch access can delay refrigerated pickups and grocery delivery windows.', dependencies: ['farm-erp', 'm365'] },
  { id: 'node-telematics', name: 'Fleet telematics gateway', zone: 'Perimeter / DMZ', domain: 'ot', purpose: 'Receives vehicle location and diagnostic updates.', businessImpact: 'Missing location or reefer status can delay response to a route or temperature incident.', dependencies: ['router'] },
  { id: 'node-backup', name: 'Recovery admin console', zone: 'Restricted data zone', domain: 'it', purpose: 'Restricted access point for restoration and recovery tasks.', businessImpact: 'If recovery access is unavailable, restore time for orders and operating records can increase.', dependencies: ['nas'] },
  { id: 'node-yard-tablet', name: 'Yard check-in tablet', zone: 'Remote / user devices', domain: 'ot', purpose: 'Records trailer, driver, and arrival checks at the yard.', businessImpact: 'Incorrect check-in details can misroute a truck or delay the receiving dock.', dependencies: ['node-dispatch', 'm365'] },
  { id: 'node-warehouse-terminal', name: 'Warehouse receiving terminal', zone: 'Internal network', domain: 'ot', purpose: 'Confirms received quantities and flags damaged cargo.', businessImpact: 'Wrong quantity or condition records can lead to incorrect lot release, spoilage, or production delays.', dependencies: ['farm-erp', 'vendor-carrier'] },
  { id: 'node-wifi-ap', name: 'Operations Wi-Fi access point', zone: 'Internal network', domain: 'shared', purpose: 'Provides staff connectivity for dispatch and receiving workflows.', businessImpact: 'Loss of connectivity can slow yard checks, inventory updates, and dispatch communications.', dependencies: ['router', 'node-fw'] }
];

const demoVendors = [
  { id: 'vendor-carrier', name: 'Regional Freight Partner', service: 'Overflow freight and refrigerated truck capacity', zone: 'Cloud / SaaS', domain: 'ot', logoUrl: '', businessImpact: 'If capacity is unavailable, perishable pickups may miss receiving slots and product may remain in transit longer.', access: 'Receives load details and delivery windows; no internal network access.', data: 'Shipment reference, cargo class, pickup/delivery addresses, ETA', dependencies: ['node-dispatch'], criticality: 'high', contact: 'Dispatch coordinator' },
  { id: 'vendor-telematics', name: 'Fleet Telematics Provider', service: 'Vehicle location and diagnostic portal', zone: 'Perimeter / DMZ', domain: 'shared', logoUrl: '', businessImpact: 'A provider outage can reduce visibility into vehicle location and temperature alerts during transit.', access: 'Provider portal uses named fleet-manager accounts; integration method needs verification.', data: 'Vehicle identifiers, location, diagnostics', dependencies: ['node-telematics'], criticality: 'high', contact: 'Fleet manager' },
  { id: 'vendor-it', name: 'Managed IT Support', service: 'Endpoint and network administration', zone: 'Remote / user devices', domain: 'it', logoUrl: '', businessImpact: 'Delayed support can extend an email, network, or recovery outage that interrupts purchasing and dispatch coordination.', access: 'Remote support access; review named accounts, MFA, and approval process.', data: 'Device/network configuration and support logs', dependencies: ['node-backup', 'router'], criticality: 'medium', contact: 'Operations lead' }
];

const typeIcons = {
  'Identity & access': 'ID',
  'Cloud platform': '☁',
  'Business application': '▧',
  'Device / endpoint': '⌘',
  'Network / infrastructure': '⌁',
  'Data storage': 'DB',
  'Backup & recovery': '↻',
  'Other': '◇'
};

const ruleDefinitions = [
  {
    key: 'admin', title: 'Default or shared administrator credentials',
    applies: asset => asset.admin === 'shared' || asset.admin === 'unknown',
    base: 57, gap: asset => asset.admin === 'shared' ? 12 : 4,
    why: asset => asset.admin === 'shared'
      ? 'Shared or unchanged default administrator credentials can let one exposed or reused secret affect the whole system.'
      : 'The administrator credential state is unknown, so a high-impact entry point may be using a shared or vendor-default secret.',
    action: 'Change every vendor-default password before use. Give each administrator a unique named account; store distinct strong credentials in an approved password manager, remove shared accounts where supported, and protect admin sign-in with MFA. Verify recovery access and record the review date.',
    controls: ['PR.AA-01', 'PR.AA-05']
  },
  {
    key: 'mfa', title: 'Multi-factor authentication coverage is incomplete',
    applies: asset => asset.mfa !== 'yes',
    base: 48, gap: asset => asset.mfa === 'no' ? 11 : asset.mfa === 'partial' ? 6 : 3,
    why: asset => asset.mfa === 'no'
      ? 'Without MFA, a stolen password may be enough to access this system.'
      : asset.mfa === 'partial'
        ? 'MFA is enabled for only some accounts; users or administrators may still sign in with a password alone.'
        : 'MFA coverage has not been confirmed, especially for privileged and remote access.',
    action: 'Enable MFA for all users, starting with administrators, remote access, and accounts that can access sensitive data. Prefer phishing-resistant methods where available; remove legacy sign-in paths that bypass MFA, and test a documented recovery method.',
    controls: ['PR.AA-03', 'PR.AA-05']
  },
  {
    key: 'access', title: 'Access roles or permission boundaries need review',
    applies: asset => asset.access !== 'yes',
    base: 46, gap: asset => asset.access === 'no' ? 10 : 3,
    why: asset => asset.access === 'no'
      ? 'Broad or ungrouped permissions make excessive access and accidental changes more likely.'
      : 'Defined access groups, named roles, and permission review have not been confirmed.',
    action: 'Define named roles or groups around job duties; grant the minimum permissions each role needs. Use separate administrator accounts, remove dormant access, review membership at least quarterly and when staff change roles, and document who approves access.',
    controls: ['PR.AA-01', 'PR.AA-05', 'GV.RR-02']
  },
  {
    key: 'owner', title: 'Business ownership is not recorded',
    applies: asset => !String(asset.owner || '').trim(),
    base: 34, gap: () => 5,
    why: () => 'Without a named business owner, security decisions, access reviews, and recovery tasks may not have a clear accountable person.',
    action: 'Assign a role or team responsible for the system. Record who approves access, who reviews important settings, and who coordinates recovery or vendor support when the system is unavailable.',
    controls: ['GV.RR-02']
  },
  {
    key: 'backup', title: 'Recovery readiness is unverified',
    applies: asset => asset.backups !== 'yes',
    base: 44, gap: asset => asset.backups === 'no' ? 12 : asset.backups === 'partial' ? 6 : 3,
    why: asset => asset.backups === 'no'
      ? 'There is no known recovery copy for this important system or its data.'
      : asset.backups === 'partial'
        ? 'Backups exist, but an untested restore may fail when the business needs it.'
        : 'Backup scope and restore readiness have not been confirmed.',
    action: 'Confirm what data and configurations must be recovered, set an appropriate backup schedule and retention, and keep a protected copy separate from normal admin access. Run and document a restore test; make sure recovery access is available if primary accounts are unavailable.',
    controls: ['PR.DS-11', 'RC.RP-03']
  },
  {
    key: 'logging', title: 'Security event visibility is limited',
    applies: asset => asset.logging !== 'yes',
    base: 39, gap: asset => asset.logging === 'no' ? 9 : asset.logging === 'partial' ? 5 : 3,
    why: asset => asset.logging === 'no'
      ? 'Without security logs, suspicious sign-ins or changes may go unnoticed.'
      : asset.logging === 'partial'
        ? 'Logs exist but irregular review can delay detection of account misuse or unexpected changes.'
        : 'Log availability and review have not been confirmed.',
    action: 'Enable available authentication, administrator, and configuration-change audit logs. Limit who can delete them, retain them for a defined period, and assign someone to review alerts and unusual activity on a regular schedule.',
    controls: ['PR.PS-04', 'DE.CM-03']
  },
  {
    key: 'exposure', title: 'Internet exposure needs a deliberate access boundary',
    applies: asset => asset.exposure === 'yes' || asset.exposure === 'unknown',
    base: 40, gap: asset => asset.exposure === 'yes' ? 8 : 3,
    why: asset => asset.exposure === 'yes'
      ? 'Internet-accessible systems receive direct attention from automated attacks and need a tightly managed entry path.'
      : 'The system’s internet exposure is unknown; an unintended public endpoint could widen the attack surface.',
    action: 'Confirm whether public access is required. Remove unused public endpoints; restrict required access to named users and approved paths, enforce MFA, keep supported software updated, and monitor sign-in and administrative activity. For network services, review firewall rules with the system owner.',
    controls: ['PR.IR-01', 'PR.AA-03', 'DE.CM-01']
  }
];

const csfDescriptions = {
  'PR.AA-01': 'Manage identities and credentials',
  'PR.AA-03': 'Authenticate users and services',
  'PR.AA-05': 'Manage and review access permissions',
  'GV.RR-02': 'Define cybersecurity roles and responsibilities',
  'PR.DS-11': 'Protect data backups',
  'RC.RP-03': 'Verify backup integrity before use',
  'PR.PS-04': 'Generate and make logs available',
  'DE.CM-03': 'Monitor personnel activity and technology usage',
  'PR.IR-01': 'Protect networks and environments',
  'DE.CM-01': 'Monitor networks and network services'
};

let assets = readAssets();
let dispatches = readCollection(DISPATCH_STORAGE_KEY, demoDispatches, item => typeof item.name === 'string' && typeof item.plannedEta === 'string');
let incidents = readCollection(INCIDENT_STORAGE_KEY, demoIncidents, item => typeof item.description === 'string' && typeof item.status === 'string');
let networkNodes = readCollection(NODE_STORAGE_KEY, demoNodes, item => typeof item.name === 'string' && typeof item.zone === 'string' && Array.isArray(item.dependencies));
let vendors = readCollection(VENDOR_STORAGE_KEY, demoVendors, item => typeof item.name === 'string' && typeof item.service === 'string' && Array.isArray(item.dependencies));
let activeFilter = 'all';
let activeMap = 'topology';
let activeDomain = 'all';
let activePage = 'home';
let toastTimer;
let activeDialogTrigger = null;

function showAccessibleDialog(dialog, initialFocus) {
  activeDialogTrigger = document.activeElement;
  dialog.showModal();
  if (initialFocus) initialFocus.focus();
}

function readAssets() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(demoAssets);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isValidAsset)) return structuredClone(demoAssets);
    return parsed;
  } catch (error) {
    console.warn('Could not load the saved inventory; using the demo inventory.', error);
    return structuredClone(demoAssets);
  }
}

function readCollection(key, sample, validator) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return structuredClone(sample);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(item => item && typeof item.id === 'string' && validator(item))) {
      throw new Error(`Saved data in ${key} has an unexpected structure.`);
    }
    return parsed;
  } catch (error) {
    console.warn(`Could not load ${key}; showing the sample records.`, error);
    return structuredClone(sample);
  }
}

function toLocalDateTime(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function persistCollection(key, collection) {
  try {
    localStorage.setItem(key, JSON.stringify(collection));
  } catch (error) {
    console.error(`Could not save ${key} in this browser.`, error);
    showToast('Could not save locally. Check browser storage settings.');
  }
}

function isValidAsset(asset) {
  return asset && typeof asset.id === 'string' && typeof asset.name === 'string' &&
    typeof asset.type === 'string' && typeof asset.purpose === 'string' &&
    Array.isArray(asset.dependencies);
}

function saveAssets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (error) {
    console.error('Could not save the inventory in this browser.', error);
    showToast('Could not save locally. Check browser storage settings.');
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function monogram(name) {
  const words = String(name || 'Business').trim().split(/\s+/).filter(Boolean);
  return escapeHtml((words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0].slice(0, 2)).toUpperCase());
}

function logoColour(name) {
  let hash = 0;
  for (const char of String(name || 'business')) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return `hsl(${hash} 24% 92%)`;
}

function logoMark(name, className = 'brand-mark-small', logoUrl = '') {
  const image = /^https:\/\/[^\s"'<>]+$/i.test(String(logoUrl || ''));
  return `<span class="entity-logo ${className}" style="--logo-background:${logoColour(name)}" aria-hidden="true">${image ? `<img src="${escapeHtml(logoUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}<span ${image ? 'hidden' : ''}>${monogram(name)}</span></span>`;
}

function businessDomain(item) {
  if (['it', 'ot', 'shared'].includes(item.domain)) return item.domain;
  if (item.kind === 'vendor') return 'shared';
  const category = `${item.type || ''} ${item.name || ''} ${item.purpose || ''}`.toLowerCase();
  return /fleet|telematic|warehouse|cold.room|refrigerat|production|processing|packaging|plc|scada|sensor|dispatch|vehicle|factory|manufactur/.test(category)
    ? 'ot'
    : /identity|email|network|router|firewall|cloud/.test(category) ? 'shared' : 'it';
}

function ciaRating(item, dimension) {
  if (['none', 'low', 'medium', 'high'].includes(item[dimension])) return item[dimension];
  const domain = businessDomain(item);
  if (dimension === 'confidentiality') return domain === 'ot' ? 'low' : item.criticality === 'high' ? 'medium' : 'low';
  if (dimension === 'integrity') return item.criticality === 'low' ? 'medium' : 'high';
  return item.criticality === 'low' ? 'low' : 'high';
}

function ciaScore(item) {
  const values = ['confidentiality', 'integrity', 'availability'].map(dimension => CIA_LEVELS[ciaRating(item, dimension)]);
  return Math.max(...values) * 2 + Math.round(values.reduce((sum, value) => sum + value, 0) / 3);
}

function riskPriority(score) {
  return score >= 90 ? 'critical'
    : score >= 75 ? 'high'
      : score >= 52 ? 'medium'
        : score >= 35 ? 'low' : 'informational';
}

function impactScenario(asset, rule) {
  const domain = businessDomain(asset);
  const c = ciaRating(asset, 'confidentiality');
  const i = ciaRating(asset, 'integrity');
  const a = ciaRating(asset, 'availability');
  const scenarios = [];
  if (a === 'high' || a === 'medium') {
    scenarios.push(domain === 'ot'
      ? `If ${asset.name} becomes unavailable, staff may lose visibility or control of receiving, cold storage, processing, or dispatch; product can be held, spoiled, or delayed.`
      : `If ${asset.name} becomes unavailable, staff may lose access to the records or services needed to coordinate operations and recover on time.`);
  }
  if (i === 'high' || i === 'medium') {
    scenarios.push(domain === 'ot'
      ? `If operating or lot data in ${asset.name} is changed, incorrect quantities, process settings, or release decisions could affect product quality and traceability.`
      : `If records in ${asset.name} are changed, orders, access decisions, or recovery information could be inaccurate and disrupt downstream work.`);
  }
  if (c === 'high' || c === 'medium') {
    scenarios.push(`If information in ${asset.name} is exposed, business, employee, customer, or supplier details could be misused.`);
  }
  if (String(asset.businessImpact || '').trim()) {
    scenarios.push(`For this operation, the recorded consequence is: ${asset.businessImpact}`);
  }
  return scenarios.length ? scenarios.join(' ') : `${rule.why(asset)} The current record indicates limited CIA impact; verify this with the process owner.`;
}

function assess() {
  return assets.flatMap(asset => ruleDefinitions
    .filter(rule => rule.applies(asset))
    .map(rule => {
      const criticality = asset.criticality === 'high' ? 16 : asset.criticality === 'medium' ? 8 : 0;
      const exposure = asset.exposure === 'yes' ? 9 : asset.exposure === 'unknown' ? 4 : 0;
      const score = Math.min(100, rule.base + rule.gap(asset) + criticality + exposure + ciaScore(asset));
      const priority = riskPriority(score);
      return { asset, rule, score, priority };
    }))
    .sort((a, b) => b.score - a.score || a.asset.name.localeCompare(b.asset.name));
}

function render() {
  const findings = assess();
  renderSummary(findings);
  renderAssets();
  renderVendors();
  renderNodes();
  renderOperations();
  renderFindings(findings);
  renderDiagram();
}

function renderSummary(findings) {
  const high = findings.filter(item => item.priority === 'high').length;
  const critical = findings.filter(item => item.priority === 'critical').length;
  const medium = findings.filter(item => item.priority === 'medium').length;
  const topScore = findings.length ? findings[0].score : 0;
  const average = findings.length ? Math.round(findings.reduce((sum, item) => sum + item.score, 0) / findings.length) : 0;
  document.querySelector('#summary').innerHTML = `
    <article class="summary-card"><div class="summary-label">Systems inventoried</div><div class="summary-value">${assets.length}</div><div class="summary-hint">Across your business</div></article>
    <article class="summary-card"><div class="summary-label">Critical / high risks</div><div class="summary-value ${critical || high ? 'priority-high' : ''}">${critical + high}</div><div class="summary-hint">${critical} critical · ${high} high</div></article>
    <article class="summary-card"><div class="summary-label">Other gaps to review</div><div class="summary-value ${medium ? 'priority-med' : ''}">${medium + findings.filter(item => item.priority === 'low').length}</div><div class="summary-hint">${medium} medium · ${findings.filter(item => item.priority === 'low').length} lower priority</div></article>
    <article class="summary-card"><div class="summary-label">Highest risk score</div><div class="summary-value">${topScore}<span style="font-size:12px;color:#98a49d;font-weight:600"> / 100</span></div><div class="summary-hint">Average finding score: ${average}</div></article>`;
}

function renderAssets() {
  const list = document.querySelector('#asset-list');
  if (!assets.length) {
    list.innerHTML = `<div class="empty-state"><h3>Your inventory is ready to grow</h3><p>Add the systems your business relies on to get a tailored set of risk priorities.</p><button class="button button-dark" type="button" data-action="add">Add your first technology</button></div>`;
    return;
  }
  list.innerHTML = assets.map(asset => {
    const deps = asset.dependencies.map(id => topologyItems().find(item => item.id === id)).filter(Boolean);
    return `<article class="asset-card">
      <div class="asset-card-top">
        ${logoMark(asset.name, 'asset-logo', asset.logoUrl)}
        <div class="asset-heading"><h3 class="asset-name">${escapeHtml(asset.name)}</h3><span class="asset-type">${escapeHtml(asset.type)}</span></div>
        <button class="asset-menu" type="button" data-action="edit" data-id="${escapeHtml(asset.id)}" aria-label="Edit ${escapeHtml(asset.name)}">✎</button>
      </div>
      <p class="asset-purpose">${escapeHtml(asset.purpose || 'Purpose not provided.')}</p>
      ${asset.businessImpact ? `<p class="asset-impact"><strong>Business impact:</strong> ${escapeHtml(asset.businessImpact)}</p>` : ''}
      <div class="asset-footer">
        <span class="tag ${asset.criticality === 'high' ? 'critical' : ''}">${escapeHtml(capitalize(asset.criticality))} impact</span>
        <span class="tag domain-tag">${escapeHtml(domainLabel(businessDomain(asset)))}</span>
        <span class="tag">${escapeHtml(asset.zone)}</span>
        ${asset.exposure === 'yes' ? '<span class="tag high-exposure">Internet-facing</span>' : ''}
        ${deps.length ? `<span class="dependency-note">Depends on ${deps.map(dep => escapeHtml(dep.name)).join(', ')}</span>` : ''}
        <button class="asset-remove" type="button" data-action="remove" data-id="${escapeHtml(asset.id)}" aria-label="Remove ${escapeHtml(asset.name)}">Remove</button>
      </div>
    </article>`;
  }).join('');
}

function topologyItems() {
  return [
    ...assets.map(item => ({ ...item, kind: 'asset', purpose: item.purpose || '', zone: item.zone || 'Not sure' })),
    ...networkNodes.map(item => ({ ...item, kind: 'node' })),
    ...vendors.map(item => ({ ...item, kind: 'vendor', purpose: item.service || '' }))
  ];
}

function domainLabel(domain) {
  return domain === 'ot' ? 'OT' : domain === 'shared' ? 'Shared IT/OT' : 'IT';
}

function attachLogoFallbacks(container) {
  container.querySelectorAll('.entity-logo img').forEach(image => image.addEventListener('error', () => {
    image.hidden = true;
    image.nextElementSibling.hidden = false;
  }, { once: true }));
}

function renderVendors() {
  const list = document.querySelector('#vendor-list');
  if (!vendors.length) {
    list.innerHTML = '<div class="empty-state"><h3>No third parties recorded</h3><p>Add service providers, carriers, technology partners, or other suppliers to connect them to your systems and network zones.</p></div>';
    return;
  }
  list.innerHTML = vendors.map(vendor => {
    const links = vendor.dependencies.map(id => topologyItems().find(item => item.id === id)).filter(Boolean);
    return `<article class="vendor-card">
      <div class="vendor-card-heading"><div class="vendor-identity">${logoMark(vendor.name, 'vendor-logo', vendor.logoUrl)}<div><span class="vendor-type-label">THIRD-PARTY PROVIDER</span><h3>${escapeHtml(vendor.name)}</h3></div></div><div class="vendor-actions"><button class="asset-menu" type="button" data-edit-vendor="${escapeHtml(vendor.id)}" aria-label="Edit ${escapeHtml(vendor.name)}">✎</button><button class="vendor-delete" type="button" data-remove-vendor="${escapeHtml(vendor.id)}">Remove</button></div></div>
      <p class="vendor-service">${escapeHtml(vendor.service)}</p>
      <span class="tag domain-tag">${escapeHtml(domainLabel(businessDomain(vendor)))}</span>
      <div class="vendor-details"><span><b>Connection zone</b>${escapeHtml(vendor.zone)}</span><span><b>Business criticality</b>${escapeHtml(capitalize(vendor.criticality || 'medium'))}</span><span><b>Internal contact</b>${escapeHtml(vendor.contact || 'Not assigned')}</span></div>
      ${vendor.businessImpact ? `<p class="vendor-fact"><strong>Business consequence:</strong> ${escapeHtml(vendor.businessImpact)}</p>` : ''}
      <p class="vendor-fact"><strong>Access:</strong> ${escapeHtml(vendor.access || 'Not recorded')}</p>
      <p class="vendor-fact"><strong>Data:</strong> ${escapeHtml(vendor.data || 'Not recorded')}</p>
      <p class="vendor-fact"><strong>Connected to:</strong> ${links.length ? links.map(item => escapeHtml(item.name)).join(', ') : 'No linked systems or nodes'}</p>
    </article>`;
  }).join('');
}

function renderNodes() {
  const list = document.querySelector('#node-list');
  if (!networkNodes.length) {
    list.innerHTML = '<p class="small-muted">No network nodes yet. Use Add node to describe an endpoint, server, gateway, or infrastructure component.</p>';
    return;
  }
  list.innerHTML = networkNodes.map(node => {
    const links = node.dependencies.map(id => topologyItems().find(item => item.id === id)).filter(Boolean);
    return `<article class="node-card">${logoMark(node.name, 'node-logo')}<div class="node-card-body"><h4>${escapeHtml(node.name)}</h4><span>${escapeHtml(node.zone)} · ${escapeHtml(domainLabel(businessDomain(node)))}</span><p>${escapeHtml(node.purpose)}</p>${node.businessImpact ? `<p class="entity-impact"><strong>Consequence:</strong> ${escapeHtml(node.businessImpact)}</p>` : ''}<small>Connected to: ${links.length ? links.map(item => escapeHtml(item.name)).join(', ') : 'None recorded'}</small></div><button class="asset-menu" type="button" data-edit-node="${escapeHtml(node.id)}" aria-label="Edit ${escapeHtml(node.name)}">✎</button><button class="vendor-delete" type="button" data-remove-node="${escapeHtml(node.id)}">Remove</button></article>`;
  }).join('');
}

function renderFindings(findings) {
  const counts = {
    all: findings.length,
    critical: findings.filter(item => item.priority === 'critical').length,
    high: findings.filter(item => item.priority === 'high').length,
    medium: findings.filter(item => item.priority === 'medium').length,
    low: findings.filter(item => item.priority === 'low').length,
    informational: findings.filter(item => item.priority === 'informational').length,
    na: 0
  };
  document.querySelector('#count-all').textContent = counts.all;
  document.querySelector('#count-critical').textContent = counts.critical;
  document.querySelector('#count-high').textContent = counts.high;
  document.querySelector('#count-medium').textContent = counts.medium;
  document.querySelector('#count-low').textContent = counts.low;
  document.querySelector('#count-informational').textContent = counts.informational;
  document.querySelector('#count-na').textContent = counts.na;
  const visible = findings.filter(item => activeFilter === 'all' || item.priority === activeFilter);
  const container = document.querySelector('#finding-list');
  if (!visible.length) {
    const emptyMessage = activeFilter === 'na'
      ? 'Not applicable findings are not scored by this prototype. Marking a control N/A requires an owner-reviewed applicability decision.'
      : findings.length ? 'No findings in this priority group.' : 'No gaps identified from the answers provided. Confirm settings in each product before treating a control as verified.';
    container.innerHTML = `<div class="no-findings">${emptyMessage}</div>`;
    return;
  }
  container.innerHTML = visible.map(({ asset, rule, score, priority }) => `
    <article class="finding-card severity-${priority}">
      <div class="finding-rail"></div>
      <div class="finding-content">
        <div class="finding-top">
          <span class="severity-pill">${priority === 'critical' ? 'Critical' : priority === 'high' ? 'High' : priority === 'medium' ? 'Moderate' : priority === 'low' ? 'Low' : 'Informational'}</span>
          <div class="finding-title-wrap"><h3 class="finding-title">${escapeHtml(rule.title)}</h3><div class="finding-asset">${escapeHtml(asset.name)} · ${escapeHtml(asset.owner || 'Owner not assigned')} · ${escapeHtml(domainLabel(businessDomain(asset)))}</div></div>
          <div class="score-block"><span class="score-value">${score}</span><span class="score-caption">Risk score</span></div>
        </div>
        <div class="finding-details">
          <div><span class="detail-label">Potential business impact scenario</span><p class="detail-copy">${escapeHtml(impactScenario(asset, rule))}</p></div>
          <div><span class="detail-label">Recommended next steps</span><p class="detail-copy recommendation">${escapeHtml(rule.action)}</p><button class="guide-button" type="button" data-info="finding" data-rule="${escapeHtml(rule.key)}" data-asset-id="${escapeHtml(asset.id)}">Open step-by-step guide, images &amp; sources ↗</button></div>
        </div>
        <div class="cia-impact" aria-label="Confidentiality, integrity, and availability impact">
          <span><abbr title="Confidentiality">C</abbr> ${escapeHtml(capitalize(ciaRating(asset, 'confidentiality')))}</span>
          <span><abbr title="Integrity">I</abbr> ${escapeHtml(capitalize(ciaRating(asset, 'integrity')))}</span>
          <span><abbr title="Availability">A</abbr> ${escapeHtml(capitalize(ciaRating(asset, 'availability')))}</span>
        </div>
        <div class="finding-meta"><span>NIST CSF 2.0 outcomes</span>${rule.controls.map(control => `<span class="csf-label" title="${escapeHtml(csfDescriptions[control])}">${control}</span>`).join('')}<span>${rule.controls.map(control => escapeHtml(csfDescriptions[control])).join(' · ')}</span></div>
      </div>
    </article>`).join('');
}

function formatDate(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function taskDelayMinutes(task) {
  if (task.actualEta && ['delivered', 'delayed'].includes(task.status)) {
    const diff = Math.round((new Date(task.actualEta) - new Date(task.plannedEta)) / 60000);
    return Math.max(0, diff);
  }
  return Math.max(0, Number(task.delayMinutes) || 0);
}

function humanStatus(status) {
  return ({
    scheduled: 'Scheduled', in_transit: 'In transit', processing: 'Processing', delayed: 'Delayed',
    delivered: 'Delivered', canceled: 'Canceled',
    open: 'Open', in_progress: 'In progress', resolved: 'Resolved'
  })[status] || 'Unknown';
}

function renderOperations() {
  const active = dispatches.filter(task => !['delivered', 'canceled'].includes(task.status));
  const disruptions = dispatches.filter(task => ['delayed', 'canceled'].includes(task.status));
  const totalDelay = dispatches.reduce((sum, task) => sum + taskDelayMinutes(task), 0);
  const openIssues = incidents.filter(issue => issue.status !== 'resolved').length;
  const estimatedCost = incidents.reduce((sum, issue) => sum + incidentOtherCosts(issue), 0);
  document.querySelector('#operations-metrics').innerHTML = `
    <article class="summary-card"><div class="summary-label">Active dispatches</div><div class="summary-value">${active.length}</div><div class="summary-hint">Scheduled, in transit, or awaiting update</div></article>
    <article class="summary-card"><div class="summary-label">Delayed / canceled</div><div class="summary-value ${disruptions.length ? 'priority-med' : ''}">${disruptions.length}</div><div class="summary-hint">Reported dispatch tasks</div></article>
    <article class="summary-card"><div class="summary-label">Recorded delay</div><div class="summary-value">${(totalDelay / 60).toFixed(1)}<span style="font-size:12px;color:#98a49d;font-weight:600"> hrs</span></div><div class="summary-hint">Sum of known task delays; user-entered</div></article>
    <article class="summary-card"><div class="summary-label">Physical issues open</div><div class="summary-value ${openIssues ? 'priority-high' : ''}">${openIssues}</div><div class="summary-hint">Issues still being addressed</div></article>
    <article class="summary-card"><div class="summary-label">Estimated added costs</div><div class="summary-value">$${Math.round(estimatedCost).toLocaleString()}<span style="font-size:12px;color:#98a49d;font-weight:600"> CAD</span></div><div class="summary-hint">Product loss is shown in the finance dashboard</div></article>`;

  renderDispatches();
  renderIncidents();
  renderFinance();
}

function money(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount);
}

function stageName(stage) {
  return (PROCESS_STAGES.find(([value]) => value === stage) || [null, stage || 'Stage not recorded'])[1];
}

function incidentProductLoss(issue) {
  return Math.max(0, Number(issue.productLoss) || 0);
}

function incidentSalvage(issue) {
  return Math.min(incidentProductLoss(issue), Math.max(0, Number(issue.salvageValue) || 0));
}

function incidentOtherCosts(issue) {
  const categorized = Math.max(0, Number(issue.disposalCost) || 0) +
    Math.max(0, Number(issue.delayCost) || 0) +
    Math.max(0, Number(issue.recoveryCost) || 0) +
    Math.max(0, Number(issue.otherCost) || 0);
  return categorized || Math.max(0, Number(issue.estimatedCost) || 0);
}

function incidentOtherDirectCost(issue) {
  const categorized = Math.max(0, Number(issue.disposalCost) || 0) +
    Math.max(0, Number(issue.delayCost) || 0) +
    Math.max(0, Number(issue.recoveryCost) || 0) +
    Math.max(0, Number(issue.otherCost) || 0);
  return categorized ? Math.max(0, Number(issue.otherCost) || 0) : Math.max(0, Number(issue.estimatedCost) || 0);
}

function renderFinance() {
  const trackedValue = dispatches.reduce((sum, task) => sum + Math.max(0, Number(task.productValue) || 0), 0);
  const openValue = dispatches
    .filter(task => !['delivered', 'canceled'].includes(task.status))
    .reduce((sum, task) => sum + Math.max(0, Number(task.productValue) || 0), 0);
  const grossLoss = incidents.reduce((sum, issue) => sum + incidentProductLoss(issue), 0);
  const salvage = incidents.reduce((sum, issue) => sum + incidentSalvage(issue), 0);
  const netLoss = Math.max(0, grossLoss - salvage);
  const otherCosts = incidents.reduce((sum, issue) => sum + incidentOtherCosts(issue), 0);
  const totalImpact = netLoss + otherCosts;
  const metrics = [
    ['Tracked product value', money(trackedValue), 'Sum of records; stage-to-stage values may overlap'],
    ['Value in open pipeline', money(openValue), 'Open records; may include linked stages of the same goods'],
    ['Gross reported product loss', money(grossLoss), 'User-entered spoilage / write-off value'],
    ['Salvage / recovered value', money(salvage), 'Recovered value deducted from net loss'],
    ['Net product loss', money(netLoss), 'Gross loss less salvage'],
    ['Total estimated disruption impact', money(totalImpact), 'Net product loss + additional direct costs']
  ];
  document.querySelector('#finance-metrics').innerHTML = metrics.map(([label, value, hint], index) =>
    `<article class="finance-metric ${index === 5 ? 'finance-total' : ''}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(hint)}</small></article>`
  ).join('');

  const stages = PROCESS_STAGES.filter(([stage]) => stage !== 'completed').map(([stage, label]) => {
    const amount = dispatches
      .filter(task => task.stage === stage && !['delivered', 'canceled'].includes(task.status))
      .reduce((sum, task) => sum + Math.max(0, Number(task.productValue) || 0), 0);
    return { label, amount };
  }).filter(stage => stage.amount > 0);
  const maxStageValue = Math.max(1, ...stages.map(stage => stage.amount));
  document.querySelector('#stage-chart').innerHTML = stages.length
    ? stages.map(stage => `<div class="stage-row"><span>${escapeHtml(stage.label)}</span><div class="stage-bar-track"><i style="width:${Math.max(4, stage.amount / maxStageValue * 100)}%"></i></div><strong>${escapeHtml(money(stage.amount))}</strong></div>`).join('')
    : '<p class="small-muted">No open product value by stage. Add or update a shipment/batch and enter its tracked value.</p>';

  const parts = [
    ['Gross product loss', grossLoss, 'loss'],
    ['Less salvage / recovered', -salvage, 'recovery'],
    ['Disposal / rework / recovery', incidents.reduce((sum, issue) => sum + (Number(issue.disposalCost) || 0) + (Number(issue.recoveryCost) || 0), 0), 'cost'],
    ['Delay / replacement', incidents.reduce((sum, issue) => sum + (Number(issue.delayCost) || 0), 0), 'cost'],
    ['Other direct costs', incidents.reduce((sum, issue) => sum + incidentOtherDirectCost(issue), 0), 'cost'],
    ['Estimated net impact', totalImpact, 'total']
  ];
  document.querySelector('#loss-breakdown').innerHTML = parts.map(([label, amount, type]) =>
    `<div class="loss-row ${type === 'recovery' ? 'loss-credit' : ''}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(money(amount))}</strong></div>`
  ).join('');
}

function mapsDirectionsUrl(task) {
  const params = new URLSearchParams({ api: '1', origin: task.origin, destination: task.destination });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function renderDispatches() {
  const list = document.querySelector('#dispatch-list');
  if (!dispatches.length) {
    list.innerHTML = '<div class="no-findings">No dispatch tasks recorded yet. Add a load to see its planned ETA, route link, and fallback plan.</div>';
    return;
  }
  list.innerHTML = [...dispatches].sort((a, b) => new Date(a.plannedEta) - new Date(b.plannedEta)).map(task => {
    const statusClass = ['delayed', 'canceled'].includes(task.status) ? 'issue' : task.status === 'delivered' ? 'resolved' : '';
    const delay = taskDelayMinutes(task);
    return `<article class="dispatch-card">
      <div class="dispatch-top"><div class="dispatch-identity">${logoMark(task.customer || task.name, 'dispatch-logo', task.logoUrl)}<div><span class="status-pill ${statusClass}">${escapeHtml(humanStatus(task.status))}</span><h4>${escapeHtml(task.name)}</h4><span class="task-customer">${escapeHtml(task.customer || 'Customer/process not specified')}</span></div></div><button class="asset-menu" type="button" data-edit-dispatch="${escapeHtml(task.id)}" aria-label="Edit ${escapeHtml(task.name)}">✎</button></div>
      <p class="cargo-line"><strong>Ingredient / product:</strong> ${escapeHtml(task.cargo)}</p>
      <div class="dispatch-stage-line"><span>${escapeHtml(stageName(task.stage))}</span>${task.productValue ? `<strong>${escapeHtml(money(task.productValue))} tracked value</strong>` : '<strong>Value not entered</strong>'}</div>
      <div class="route-line"><span>${escapeHtml(task.origin)}</span><span class="route-arrow" aria-hidden="true">→</span><span>${escapeHtml(task.destination)}</span></div>
      <div class="task-facts"><span><b>Planned stage ETA</b>${escapeHtml(formatDate(task.plannedEta))}</span><span><b>Actual arrival / complete</b>${escapeHtml(task.actualEta ? formatDate(task.actualEta) : 'Not yet recorded')}</span><span><b>Truck / line</b>${escapeHtml(task.vehicle || 'Not assigned')}</span>${delay ? `<span><b>Recorded delay</b>${delay} minutes</span>` : ''}</div>
      ${task.reason ? `<p class="task-note"><strong>Disruption reason:</strong> ${escapeHtml(task.reason)}</p>` : ''}
      <p class="task-note"><strong>Redundancy:</strong> ${escapeHtml(task.redundancy || 'No fallback recorded')}</p>
      ${task.remediation ? `<p class="task-note"><strong>Next step:</strong> ${escapeHtml(task.remediation)}</p>` : ''}
      <div class="dispatch-actions"><a class="learn-link map-link" href="${escapeHtml(mapsDirectionsUrl(task))}" target="_blank" rel="noopener noreferrer">Open route in Google Maps ↗</a><button class="learn-link" type="button" data-info="dispatch">How to use this record? Sources ↗</button></div>
    </article>`;
  }).join('');
  attachLogoFallbacks(list);
}

function renderIncidents() {
  const list = document.querySelector('#incident-list');
  if (!incidents.length) {
    list.innerHTML = '<div class="no-findings">No physical issues logged. Record equipment, road, cargo, facility, or safety disruptions and track their remediation.</div>';
    return;
  }
  list.innerHTML = [...incidents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(issue => {
    const relatedTask = dispatches.find(task => task.id === issue.dispatchId);
    return `<article class="incident-card">
      <div class="incident-top"><span class="status-pill ${issue.status === 'resolved' ? 'resolved' : issue.severity === 'high' ? 'issue' : ''}">${escapeHtml(humanStatus(issue.status))}</span><button class="asset-menu" type="button" data-edit-incident="${escapeHtml(issue.id)}" aria-label="Edit issue">✎</button></div>
      <h4>${escapeHtml(issue.type)} <span class="severity-inline">${escapeHtml(capitalize(issue.severity))} impact</span></h4>
      <p>${escapeHtml(issue.description)}</p>
      ${relatedTask ? `<p class="incident-related">Related load: ${escapeHtml(relatedTask.name)}</p>` : ''}
      <div class="incident-metrics">${issue.delayMinutes ? `<span>${escapeHtml(issue.delayMinutes)} min reported delay</span>` : ''}${issue.estimatedCost && !incidentOtherCosts(issue) ? `<span>${escapeHtml(money(issue.estimatedCost))} legacy estimate</span>` : ''}</div>
      ${(issue.productLoss || issue.salvageValue || issue.disposalCost || issue.delayCost || issue.otherCost || issue.estimatedCost) ? `<div class="incident-financial"><span>Gross product loss <b>${escapeHtml(money(issue.productLoss))}</b></span><span>Salvage <b>${escapeHtml(money(issue.salvageValue))}</b></span><span>Added costs <b>${escapeHtml(money(incidentOtherCosts(issue)))}</b></span></div>` : ''}
      <p class="task-note"><strong>Remediation:</strong> ${escapeHtml(issue.remediation || 'No remediation step recorded')}</p>
      <span class="incident-date">Reported ${escapeHtml(formatDate(issue.createdAt))}</span>
    </article>`;
  }).join('');
}

function renderDiagram() {
  const host = document.querySelector('#diagram');
  const footnote = document.querySelector('#map-footnote');
  const allItems = activeMap === 'assets' ? topologyItems().filter(item => item.kind === 'asset') : topologyItems();
  const items = allItems.filter(item => {
    const domain = businessDomain(item);
    if (activeDomain === 'it') return domain === 'it' || domain === 'shared';
    if (activeDomain === 'ot') return domain === 'ot' || domain === 'shared';
    if (activeDomain === 'shared') return domain === 'shared' || item.kind === 'vendor';
    return true;
  });
  if (!items.length) {
    host.innerHTML = `<div class="diagram-empty">No ${escapeHtml(activeDomain === 'it' ? 'IT' : activeDomain === 'ot' ? 'operational technology' : 'matching')} systems are recorded in this view. Add or classify assets in the inventory.</div>`;
    footnote.textContent = activeMap === 'assets'
      ? 'Technology assets only. Arrows show dependencies you entered, not observed network traffic.'
      : 'Select another business-domain view or classify more assets, nodes, and vendors.';
    return;
  }
  const zones = activeMap === 'assets' ? ['Inventory'] : NETWORK_ZONES;
  const width = activeMap === 'topology' ? zones.length * 245 + 24 : activeMap === 'network' ? zones.length * 205 + 24 : 920;
  const columnWidth = width / zones.length;
  const nodeWidth = activeMap === 'topology' ? 204 : Math.min(175, columnWidth - 24);
  const nodeHeight = activeMap === 'topology' ? 62 : 54;
  const positions = new Map();
  const tierNames = ['Third parties & services', 'Applications & business assets', 'Network nodes & infrastructure'];
  const tierKinds = [['vendor'], ['asset'], ['node']];
  let height;
  if (activeMap === 'topology') {
    const tierCounts = tierKinds.map(kinds => Math.max(1, ...zones.map(zone => items.filter(item => kinds.includes(item.kind) && item.zone === zone).length)));
    let y = 64;
    const tierOffsets = tierCounts.map((count, index) => {
      const top = y;
      y += count * 79 + 64;
      return top;
    });
    height = y + 12;
    items.forEach(item => {
      const tierIndex = tierKinds.findIndex(kinds => kinds.includes(item.kind));
      const zoneIndex = Math.max(0, zones.indexOf(item.zone));
      const sameGroup = items.filter(candidate => tierKinds[tierIndex].includes(candidate.kind) && candidate.zone === item.zone);
      const itemIndex = sameGroup.findIndex(candidate => candidate.id === item.id);
      positions.set(item.id, { x: zoneIndex * columnWidth + columnWidth / 2, y: tierOffsets[tierIndex] + itemIndex * 79 + nodeHeight / 2 });
    });
  } else {
    const grouped = zones.map(zone => items.filter(item => activeMap === 'assets' || item.zone === zone));
    const maxRows = Math.max(1, ...grouped.map(group => group.length));
    height = Math.max(400, 76 + maxRows * 84);
    grouped.forEach((group, zoneIndex) => {
      group.forEach((item, index) => {
        positions.set(item.id, { x: zoneIndex * columnWidth + columnWidth / 2, y: 82 + index * 84 + nodeHeight / 2 });
      });
    });
  }
  let markup = `<svg class="diagram-svg ${activeMap === 'topology' ? 'topology-svg' : ''}" style="width:${width}px;height:${height}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${activeMap === 'assets' ? 'Asset dependency graph' : activeMap === 'network' ? 'Network zones with connected nodes and third parties' : 'Full supply chain and network topology'}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="#8ba092" stroke-width="1.2"/></marker></defs>`;
  if (activeMap === 'topology') {
    tierKinds.forEach((kinds, tierIndex) => {
      const entities = items.filter(item => kinds.includes(item.kind));
      const tierY = Math.min(...entities.map(item => positions.get(item.id).y)) - nodeHeight / 2 - 25;
      const tierHeight = Math.max(96, Math.max(...zones.map(zone => entities.filter(item => item.zone === zone).length), 1) * 79 + 36);
      markup += `<rect x="5" y="${tierY}" width="${width - 10}" height="${tierHeight}" rx="8" fill="${tierIndex % 2 ? '#f5f8f5' : '#edf4ee'}" stroke="#e2ebe3"/>`;
      markup += `<text x="17" y="${tierY + 18}" fill="#60766a" font-size="10" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(tierNames[tierIndex])}</text>`;
    });
  }
  if (activeMap !== 'assets') {
    zones.forEach((zone, index) => {
      const x = index * columnWidth + 5;
      const y = activeMap === 'topology' ? 5 : 10;
      const boxHeight = activeMap === 'topology' ? height - 10 : height - 18;
      markup += `<rect x="${x}" y="${y}" width="${columnWidth - 10}" height="${boxHeight}" rx="8" fill="none" stroke="#dce6dd" stroke-dasharray="${activeMap === 'topology' ? '0' : '4 4'}"/>`;
      markup += `<text x="${x + 9}" y="${activeMap === 'topology' ? 43 : 31}" fill="#45634e" font-size="10" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(zone)}</text>`;
    });
  } else {
    markup += `<text x="14" y="26" fill="#63776a" font-size="10" font-family="Segoe UI, sans-serif" font-weight="700">Business technology assets</text>`;
  }
  if (activeMap !== 'network') {
    items.forEach(item => {
      const from = positions.get(item.id);
      if (!from) return;
      (item.dependencies || []).forEach(dependencyId => {
        const to = positions.get(dependencyId);
        if (!to) return;
        const direction = to.x >= from.x ? 1 : -1;
        const bend = Math.max(24, Math.abs(to.x - from.x) * .32);
        const cy = from.y + (to.y - from.y) * .5;
        markup += `<path d="M ${from.x} ${from.y} C ${from.x + bend * direction} ${cy}, ${to.x - bend * direction} ${cy}, ${to.x} ${to.y}" fill="none" stroke="#8da293" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arrow)"/>`;
      });
    });
  }
  items.forEach(item => {
    const point = positions.get(item.id);
    if (!point) return;
    const x = point.x - nodeWidth / 2;
    const y = point.y - nodeHeight / 2;
    const palettes = {
      asset: ['#eaf3eb', '#d6e6d8', '#78a982'],
      node: ['#edf3f5', '#d5e1e5', '#7599a8'],
      vendor: ['#f8f1e7', '#eadcc3', '#c18a3d']
    };
    const [fill, stroke, dot] = palettes[item.kind];
    const title = item.name.length > 27 ? `${item.name.slice(0, 26)}…` : item.name;
    const detailText = item.kind === 'vendor' ? item.service || item.access || 'Third-party provider'
      : item.kind === 'node' ? item.purpose : item.type || item.purpose;
    const impactText = item.businessImpact ? ` Business impact: ${item.businessImpact}` : '';
    const detail = detailText.length > 31 ? `${detailText.slice(0, 30)}…` : detailText;
    const kindLabel = item.kind === 'vendor' ? 'VENDOR' : item.kind === 'node' ? 'NODE' : 'ASSET';
    const domain = domainLabel(businessDomain(item));
    markup += `<g class="topology-item" data-map-kind="${item.kind}" data-map-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(item.name)}, ${domain}, in ${escapeHtml(item.zone)}"><title>${escapeHtml(item.name)} — ${escapeHtml(detailText)} (${domain}; ${escapeHtml(item.zone)}).${escapeHtml(impactText)}</title><rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" fill="${fill}" stroke="${stroke}"/><circle cx="${x + 14}" cy="${y + 16}" r="4" fill="${dot}"/><text x="${x + 25}" y="${y + 19}" fill="#315144" font-size="10" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(title)}</text><text x="${x + 13}" y="${y + 37}" fill="#829087" font-size="8" font-family="Segoe UI, sans-serif">${kindLabel} · ${domain} · ${escapeHtml(detail)}</text></g>`;
  });
  if (activeMap !== 'network' && items.every(item => !item.dependencies?.length)) {
    markup += `<text x="${width / 2}" y="${height - 12}" text-anchor="middle" fill="#94a098" font-size="9" font-family="Segoe UI, sans-serif">No dependencies recorded yet — add links when editing a node, technology, or vendor.</text>`;
  }
  markup += '</svg>';
  host.innerHTML = markup;
  footnote.textContent = activeMap === 'assets'
    ? 'Technology assets only. Arrows show dependencies you entered, not observed network traffic.'
    : activeMap === 'network'
      ? 'All recorded assets, nodes, and vendors are grouped into their declared zones; connections are omitted in this view.'
      : 'Combined view: vendors/services, business assets, and network nodes are arranged in tiers across zones. Arrows are declared dependencies, not live connections.';
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown';
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function openDialog(assetId) {
  const form = document.querySelector('#asset-form');
  form.reset();
  const asset = assets.find(item => item.id === assetId);
  const dependencies = document.querySelector('#dependencies');
  dependencies.innerHTML = topologyItems().filter(item => item.id !== assetId)
    .map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
  form.dataset.editingId = asset ? asset.id : '';
  document.querySelector('.dialog-heading h2').textContent = asset ? 'Edit technology' : 'Add a technology';
  form.querySelector('[type="submit"]').textContent = asset ? 'Save changes' : 'Add to inventory';
  if (asset) {
    for (const key of ['name', 'type', 'criticality', 'purpose', 'businessImpact', 'owner', 'exposure', 'admin', 'mfa', 'access', 'backups', 'logging', 'zone', 'domain', 'confidentiality', 'integrity', 'availability', 'logoUrl']) {
      form.elements[key].value = asset[key] || '';
    }
    form.elements.domain.value = businessDomain(asset);
    for (const dimension of ['confidentiality', 'integrity', 'availability']) form.elements[dimension].value = ciaRating(asset, dimension);
    [...dependencies.options].forEach(option => {
      option.selected = asset.dependencies.includes(option.value);
    });
  }
  showAccessibleDialog(document.querySelector('#asset-dialog'), form.elements.name);
}

function fillZoneSelect(select) {
  select.innerHTML = NETWORK_ZONES.map(zone => `<option value="${escapeHtml(zone)}">${escapeHtml(zone)}</option>`).join('');
}

function fillEntitySelect(select, excludedId) {
  select.innerHTML = topologyItems().filter(item => item.id !== excludedId)
    .map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} (${item.kind})</option>`).join('');
}

function openNodeDialog(nodeId) {
  const form = document.querySelector('#node-form');
  const node = networkNodes.find(item => item.id === nodeId);
  form.reset();
  form.dataset.editingId = node ? node.id : '';
  document.querySelector('#node-dialog h2').textContent = node ? 'Edit network node' : 'Add network node';
  form.querySelector('[type="submit"]').textContent = node ? 'Update node' : 'Save node';
  fillZoneSelect(form.elements.zone);
  fillEntitySelect(form.elements.dependencies, nodeId);
  if (node) {
    form.elements.name.value = node.name;
    form.elements.zone.value = node.zone;
    form.elements.domain.value = businessDomain(node);
    form.elements.purpose.value = node.purpose;
    form.elements.businessImpact.value = node.businessImpact || '';
    [...form.elements.dependencies.options].forEach(option => { option.selected = node.dependencies.includes(option.value); });
  }
  showAccessibleDialog(document.querySelector('#node-dialog'), form.elements.name);
}

function openVendorDialog(vendorId) {
  const form = document.querySelector('#vendor-form');
  const vendor = vendors.find(item => item.id === vendorId);
  form.reset();
  form.dataset.editingId = vendor ? vendor.id : '';
  document.querySelector('#vendor-dialog h2').textContent = vendor ? 'Edit third-party vendor' : 'Add third-party vendor';
  form.querySelector('[type="submit"]').textContent = vendor ? 'Update vendor' : 'Save vendor';
  fillZoneSelect(form.elements.zone);
  fillEntitySelect(form.elements.dependencies, vendorId);
  if (vendor) {
    for (const key of ['name', 'zone', 'service', 'businessImpact', 'access', 'data', 'criticality', 'contact', 'domain', 'logoUrl']) form.elements[key].value = vendor[key] || '';
    form.elements.domain.value = businessDomain(vendor);
    [...form.elements.dependencies.options].forEach(option => { option.selected = vendor.dependencies.includes(option.value); });
  }
  showAccessibleDialog(document.querySelector('#vendor-dialog'), form.elements.name);
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function openDispatchDialog(dispatchId) {
  const form = document.querySelector('#dispatch-form');
  const task = dispatches.find(item => item.id === dispatchId);
  form.reset();
  form.dataset.editingId = task ? task.id : '';
  document.querySelector('#dispatch-dialog h2').textContent = task ? 'Update dispatch task' : 'New dispatch task';
  form.querySelector('[type="submit"]').textContent = task ? 'Update dispatch' : 'Save dispatch';
  if (task) {
    for (const field of ['name', 'customer', 'logoUrl', 'cargo', 'origin', 'destination', 'stage', 'productValue', 'plannedEta', 'vehicle', 'status', 'actualEta', 'delayMinutes', 'reason', 'redundancy', 'remediation']) {
      form.elements[field].value = task[field] || '';
    }
    if (!task.stage) form.elements.stage.value = 'inbound';
  } else {
    form.elements.plannedEta.value = demoTime(2);
  }
  showAccessibleDialog(document.querySelector('#dispatch-dialog'), form.elements.name);
}

function openIncidentDialog(incidentId) {
  const form = document.querySelector('#incident-form');
  const issue = incidents.find(item => item.id === incidentId);
  form.reset();
  form.dataset.editingId = issue ? issue.id : '';
  document.querySelector('#incident-dialog h2').textContent = issue ? 'Update operational issue' : 'Log an operational issue';
  form.querySelector('[type="submit"]').textContent = issue ? 'Update issue' : 'Save issue';
  document.querySelector('#incident-dispatch').innerHTML = `<option value="">Not linked to a dispatch</option>${dispatches.map(task => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.name)}</option>`).join('')}`;
  if (issue) {
    for (const field of ['type', 'severity', 'description', 'dispatchId', 'status', 'delayMinutes', 'productLoss', 'salvageValue', 'disposalCost', 'delayCost', 'otherCost', 'remediation']) {
      form.elements[field].value = issue[field] || '';
    }
    if (!issue.otherCost && issue.estimatedCost) form.elements.otherCost.value = issue.estimatedCost;
  }
  showAccessibleDialog(document.querySelector('#incident-dialog'), form.elements.description);
}

function guideIllustration(ruleKey, assetName) {
  const steps = ({
    admin: ['Named accounts', 'Separate admin role', 'Unique credentials'],
    mfa: ['Select accounts', 'Require MFA', 'Test recovery'],
    access: ['Map job duties', 'Create role groups', 'Review membership'],
    backup: ['Choose critical data', 'Isolate backup', 'Test restore'],
    logging: ['Enable audit events', 'Protect retention', 'Review alerts'],
    exposure: ['List public access', 'Restrict entry', 'Monitor changes'],
    owner: ['Name an owner', 'Assign approvals', 'Review changes']
  })[ruleKey] || ['Confirm system', 'Apply safeguard', 'Verify result'];
  return `<figure class="guide-illustration" role="img" aria-label="Implementation flow for ${escapeHtml(assetName)}: ${steps.map(escapeHtml).join(', ')}">
    <svg viewBox="0 0 720 154" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M172 75H264M418 75H510" stroke="#9ab59d" stroke-width="3" stroke-dasharray="5 5"/>
      ${steps.map((step, index) => {
        const x = 18 + index * 246;
        const color = ['#e9f3ea', '#edf3f5', '#f8f1e7'][index];
        const label = `${String(index + 1).padStart(2, '0')}  ${step}`;
        return `<g><rect x="${x}" y="28" width="190" height="92" rx="12" fill="${color}" stroke="#dce7dd"/><circle cx="${x + 27}" cy="55" r="13" fill="#477b56"/><path d="M${x + 21} 55l4 4 8-9" fill="none" stroke="#fff" stroke-width="2"/><text x="${x + 17}" y="89" fill="#315144" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700">${escapeHtml(label)}</text><text x="${x + 17}" y="105" fill="#829087" font-family="Segoe UI, sans-serif" font-size="9">${index === 0 ? 'Plan with the system owner' : index === 1 ? 'Apply in the product console' : 'Record evidence and review'}</text></g>`;
      }).join('')}
    </svg>
    <figcaption>Illustrative sequence for ${escapeHtml(assetName)}. Exact menu names and capabilities vary by product, license, and deployment.</figcaption>
  </figure>`;
}

function implementationSteps(ruleKey, asset) {
  const microsoft = /microsoft|entra|active directory|\bad\b/i.test(`${asset.name} ${asset.type}`);
  const product = escapeHtml(asset.name || 'this system');
  const steps = ({
    admin: microsoft
      ? [`In Microsoft Entra admin center or Active Directory Users and Computers, identify the privileged accounts that can administer ${product}.`, 'Create named admin identities and role-appropriate security groups; do not use one shared daily-use administrator login.', 'Rotate vendor/default secrets, store unique credentials securely, protect admin sign-in with MFA, and test a separate recovery account.', 'Review privileged group membership with the system owner and record who approved the change.']
      : [`Open ${product}'s administration console and identify default, shared, and privileged accounts.`, 'Create individually assigned administrator accounts and role groups; remove default access only after confirming a named recovery path.', 'Set unique credentials, store them in an approved password manager, enable MFA where supported, then test a non-disruptive admin sign-in.', 'Document the account owner and review privileged access after staff or vendor changes.'],
    mfa: [`List users and privileged/vendor accounts with access to ${product}.`, 'Enable MFA policy in the identity provider or product console, starting with administrators and remote access.', 'Pilot with a small operations group; verify emergency/recovery access before broad rollout.', 'Check sign-in logs for coverage and bypass paths; record exceptions with an owner and expiry.'],
    access: microsoft
      ? ['Translate job duties into roles (e.g., dispatch, receiving, production, quality, finance, platform administrator).', 'Create Active Directory security groups or Entra groups for those roles; use clear names and a group owner.', 'Assign product permissions to groups, not broad shared accounts; separate daily users from privileged administrators.', 'Test one account per role, remove excess access, and schedule membership reviews.']
      : [`List the roles that use ${product} and the business actions each role needs.`, 'Create named groups/roles for dispatch, receiving, production, quality, finance, and administration as applicable.', 'Assign the minimum product permissions to each group and keep administrator access separate.', 'Test representative accounts, remove unneeded access, and schedule owner-approved membership reviews.'],
    backup: [`Identify product records and operational data required to recover ${product} (e.g., lot traceability, purchase orders, recipes, and delivery commitments).`, 'Confirm backup scope, retention, encryption, and an offline/isolated recovery copy with the provider or IT owner.', 'Run a restore test in a safe location and verify records can be read and reconciled.', 'Record recovery time, owner, and the fallback process for receiving/production while restoration is underway.'],
    logging: [`Enable sign-in, administrator, data-change, and configuration audit events for ${product}.`, 'Send available logs to a protected location and restrict who can modify or delete them.', 'Assign an owner and review schedule; define which alerts trigger an operations/security escalation.', 'Test that a sample event appears and can be investigated before relying on monitoring.'],
    exposure: [`Confirm whether ${product} must be reachable from outside the business network and list each public access path.`, 'Remove unused exposure; require named accounts and MFA for approved remote access.', 'Restrict admin access to approved paths, maintain supported versions, and review vendor/API connections.', 'Monitor sign-in and configuration changes; document a rollback and outage contact.'],
    owner: [`Name a business owner for ${product} and a technical support contact.`, 'Define who approves access, reviews vendor connections, and coordinates incident response.', 'Record an operational workaround if the system is unavailable during receiving, processing, or delivery.', 'Set a review date and update ownership when responsibilities change.']
  })[ruleKey] || [`Confirm which ${product} setting is missing with the system owner.`, 'Use the vendor documentation and current product interface to apply the change.', 'Test the change with a representative account or safe sample.', 'Record the result, evidence source, owner, and review date.'];
  return `<ol class="guide-steps">${steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
}

function openInfoDialog(kind, ruleKey, assetId) {
  const title = document.querySelector('#info-title');
  const eyebrow = document.querySelector('#info-eyebrow');
  const content = document.querySelector('#info-content');
  const sources = document.querySelector('#info-sources');
  let body;
  let references = operationalSources;
  if (kind === 'finding') {
    const rule = ruleDefinitions.find(item => item.key === ruleKey);
    if (!rule) return;
    const asset = assets.find(item => item.id === assetId) || assets[0] || { name: 'the system', type: '', purpose: '', criticality: 'medium', admin: 'unknown', mfa: 'unknown', access: 'unknown', backups: 'unknown', logging: 'unknown', exposure: 'unknown' };
    const codes = rule.controls.map(code => `${code}: ${csfDescriptions[code] || 'Related cybersecurity outcome'}`);
    eyebrow.textContent = 'UNDERSTAND THE CONTROL';
    title.textContent = `${rule.title} · ${asset.name}`;
    body = `<p><strong>Business context:</strong> ${escapeHtml(domainLabel(businessDomain(asset)))} · ${escapeHtml(asset.purpose || 'Purpose not recorded. Confirm the process and product owner before making configuration changes.')}.</p>
      <p><strong>Why this finding appears:</strong> ${escapeHtml(rule.why(asset))}</p>
      <p><strong>Confidentiality / integrity / availability:</strong> ${['confidentiality', 'integrity', 'availability'].map(dimension => `${dimension[0].toUpperCase()}: ${ciaRating(asset, dimension)}`).join(' · ')}.</p>
      <p><strong>Possible business scenario:</strong> ${escapeHtml(impactScenario(asset, rule))}</p>
      <p><strong>Recommended implementation sequence:</strong></p>
      ${implementationSteps(rule.key, asset)}
      ${guideIllustration(rule.key, asset.name)}
      <p><strong>Framework reference:</strong> ${codes.map(escapeHtml).join('; ')}. These are outcome references, not a claim that following one step makes the business compliant.</p>
      <p class="educational-callout">${businessDomain(asset) === 'ot' || businessDomain(asset) === 'shared'
        ? 'For operational technology or shared IT/OT, coordinate with the process owner and qualified OT staff. Test changes offline or in a safe maintenance window, preserve manual fallback and recovery, and never interrupt a live process without an approved change plan. '
        : 'Test changes safely, preserve a recovery route, and have the system owner verify effectiveness. '}
      Follow the vendor guide for your exact deployment and license. The diagram is illustrative, not a screenshot of your console.</p>`;
    references = [
      ...(implementationResources[rule.key] || []),
      ...( /microsoft|entra|active directory|\bad\b/i.test(`${asset.name} ${asset.type}`) ? [microsoftVideoResource] : []),
      { label: 'NIST Cybersecurity Framework 2.0 (official)', url: 'https://www.nist.gov/cyberframework', type: 'framework' }
    ];
    references = [...new Map(references.map(source => [source.url, source])).values()];
  } else if (kind === 'finance') {
    eyebrow.textContent = 'FINANCE DASHBOARD METHOD';
    title.textContent = 'How product-loss and disruption totals are calculated';
    body = `<p><strong>Tracked product value:</strong> adds the entered estimated value for each shipment or production batch. If the same goods appear in multiple linked stage records, their values can be counted more than once; open pipeline also sums open records rather than unique inventory. This is inventory/throughput context, not sales or revenue.</p>
      <p><strong>Net product loss:</strong> gross product loss reported in physical issues minus salvage/recovered value, with a floor of zero. Gross loss should represent the written-off quantity/value; salvage should only include value actually recovered or reworked.</p>
      <p><strong>Estimated disruption impact:</strong> net product loss plus entered disposal/rework, delay/replacement, recovery, and other direct costs. Enter a cost once and link the issue to its shipment/batch to avoid duplicate totals.</p>
      <p class="educational-callout">Values are user-entered estimates in CAD. They are not accounting entries, insurance valuations, regulatory loss determinations, or proof of cyber causation. Reconcile with finance/quality records before business decisions.</p>`;
    references = [
      { label: 'NIST SP 800-34: Contingency Planning Guide', url: 'https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final' },
      { label: 'NIST SP 800-161: Cybersecurity Supply Chain Risk Management', url: 'https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final' }
    ];
  } else {
    eyebrow.textContent = kind === 'centralized' ? 'FUTURE CENTRAL OPERATIONS' : 'TRANSPORT OPERATIONS';
    title.textContent = kind === 'centralized' ? 'What a centralized system needs' : 'How to use dispatch and disruption records';
    body = kind === 'centralized'
      ? `<p><strong>Connect the sources:</strong> a production system would authenticate company users and receive approved events from dispatch/TMS, fleet/telematics, warehouse, maintenance, and incident-reporting systems. Each update should retain its source, timestamp, affected load/asset, and whether it is automated or user reported.</p>
        <p><strong>Centralize carefully:</strong> store normalized operational records and append-only status history in a company-scoped service. Give each tenant isolated access; map a vendor/system to the process, data, vehicle, and loads it supports. Keep raw telemetry and sensitive information only when there is a defined purpose and retention period.</p>
        <p><strong>Turn updates into work:</strong> recompute deterministic risk rules when verified facts change. If a gap disappears, propose completion for an owner to confirm rather than deleting the remediation record; keep the audit trail and reopen/link a recurrence if the control later fails.</p>
        <p><strong>Make statistics explainable:</strong> label values as measured, source-system reported, dispatcher-entered, or estimated. Preserve units/time windows and avoid double-counting a dispatch delay and its linked incident. Attribute a disruption to cyber activity only when an investigation supports that conclusion.</p>
        <p class="educational-callout">This prototype is not centralized and has no connectors. A production rollout needs a secured backend, identity and authorization, integration agreements, data quality monitoring, audit/retention controls, and tested recovery.</p>`
      : `<p><strong>Resource flow:</strong> supplier systems record purchase orders and ingredient lots; receiving compares delivered quantity and quality; cold-storage controls temperature and access; processing systems schedule batches and trace inputs to packaged products; outbound systems coordinate grocery delivery.</p>
        <p><strong>Risk pathway:</strong> if lot, quantity, temperature, recipe, or dispatch records are unavailable or inaccurate, staff may hold safe product, release questionable product, lose traceability, spoil ingredients, or miss a retailer window. Record the source, affected lot/batch, verified impact, fallback, and accountable owner.</p>
        <p><strong>How statistics work:</strong> arrival delay uses entered planned/actual time or delay estimate. The finance dashboard aggregates user-entered product loss, salvage, and added costs by linked issue. Do not count an issue and a shipment cost twice.</p>
        <p class="educational-callout">The demo does not ingest ERP/TMS, cold-chain sensors, temperature loggers, GPS, or accounting data. Follow your approved food-safety, quality, recall, and emergency procedures; this tool is not a food-safety authority.</p>`;
  }
  content.innerHTML = body;
  sources.innerHTML = references.map(source => `<a class="source-resource source-${escapeHtml(source.type || 'guide')}" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">${source.type === 'video' ? '▶' : source.type === 'training' ? '▣' : '↗'}</span> ${escapeHtml(source.label)}${source.type === 'video' ? ' · videos' : source.type === 'training' ? ' · guided training' : ''}</a>`).join('');
  showAccessibleDialog(document.querySelector('#info-dialog'), document.querySelector('#info-dialog .icon-button'));
}

document.querySelector('#add-asset-top').addEventListener('click', openDialog);
document.querySelector('#asset-list').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  if (button.dataset.action === 'add') openDialog();
  if (button.dataset.action === 'edit') openDialog(button.dataset.id);
  if (button.dataset.action === 'remove') {
    const asset = assets.find(item => item.id === button.dataset.id);
    if (!asset) return;
    assets = assets.filter(item => item.id !== asset.id)
      .map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== asset.id) }));
    networkNodes = networkNodes.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== asset.id) }));
    vendors = vendors.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== asset.id) }));
    saveAssets();
    persistCollection(NODE_STORAGE_KEY, networkNodes);
    persistCollection(VENDOR_STORAGE_KEY, vendors);
    render();
    showToast(`${asset.name} removed from inventory.`);
  }
});
document.querySelector('#close-dialog').addEventListener('click', () => document.querySelector('#asset-dialog').close());
document.querySelector('#cancel-dialog').addEventListener('click', () => document.querySelector('#asset-dialog').close());
document.querySelector('#asset-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const logoUrl = String(data.get('logoUrl') || '').trim();
  if (logoUrl && !/^https:\/\/[^\s"'<>]+$/i.test(logoUrl)) {
    showToast('Technology logo links must use HTTPS. Clear the field to use initials instead.');
    form.elements.logoUrl.focus();
    return;
  }
  const selectedDependencies = [...document.querySelector('#dependencies').selectedOptions].map(option => option.value);
  const editingId = form.dataset.editingId;
  const asset = {
    id: editingId || (crypto.randomUUID ? crypto.randomUUID() : `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: data.get('name').trim(),
    type: data.get('type'),
    criticality: data.get('criticality'),
    domain: data.get('domain'),
    confidentiality: data.get('confidentiality'),
    integrity: data.get('integrity'),
    availability: data.get('availability'),
    logoUrl,
    purpose: data.get('purpose').trim(),
    businessImpact: data.get('businessImpact').trim(),
    owner: data.get('owner').trim(),
    exposure: data.get('exposure'),
    admin: data.get('admin'),
    mfa: data.get('mfa'),
    access: data.get('access'),
    backups: data.get('backups'),
    logging: data.get('logging'),
    zone: data.get('zone'),
    dependencies: selectedDependencies
  };
  if (!asset.name || !asset.purpose) return;
  if (editingId) assets = assets.map(item => item.id === editingId ? asset : item);
  else assets.push(asset);
  saveAssets();
  render();
  document.querySelector('#asset-dialog').close();
  showToast(`${asset.name} ${editingId ? 'updated' : 'added'}. Risk priorities updated.`);
  document.querySelector('#inventory').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.querySelector('#reset-demo').addEventListener('click', () => {
  assets = structuredClone(demoAssets);
  networkNodes = structuredClone(demoNodes);
  vendors = structuredClone(demoVendors);
  dispatches = structuredClone(demoDispatches);
  incidents = structuredClone(demoIncidents);
  saveAssets();
  persistCollection(NODE_STORAGE_KEY, networkNodes);
  persistCollection(VENDOR_STORAGE_KEY, vendors);
  persistCollection(DISPATCH_STORAGE_KEY, dispatches);
  persistCollection(INCIDENT_STORAGE_KEY, incidents);
  render();
  showToast('Demo inventory and transport records restored.');
});

document.querySelector('#add-node').addEventListener('click', () => openNodeDialog());
document.querySelector('#add-vendor').addEventListener('click', () => openVendorDialog());
document.querySelector('#node-list').addEventListener('click', event => {
  const editButton = event.target.closest('[data-edit-node]');
  if (editButton) openNodeDialog(editButton.dataset.editNode);
  const removeButton = event.target.closest('[data-remove-node]');
  if (removeButton) {
    const removedId = removeButton.dataset.removeNode;
    const removed = networkNodes.find(item => item.id === removedId);
    networkNodes = networkNodes.filter(item => item.id !== removedId);
    assets = assets.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== removedId) }));
    vendors = vendors.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== removedId) }));
    networkNodes = networkNodes.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== removedId) }));
    persistCollection(NODE_STORAGE_KEY, networkNodes);
    persistCollection(VENDOR_STORAGE_KEY, vendors);
    saveAssets();
    render();
    if (removed) showToast(`${removed.name} removed; its declared links were cleared.`);
  }
});
document.querySelector('#vendor-list').addEventListener('click', event => {
  const editButton = event.target.closest('[data-edit-vendor]');
  if (editButton) openVendorDialog(editButton.dataset.editVendor);
  const removeButton = event.target.closest('[data-remove-vendor]');
  if (removeButton) {
    const removedId = removeButton.dataset.removeVendor;
    const removed = vendors.find(item => item.id === removedId);
    vendors = vendors.filter(item => item.id !== removedId);
    assets = assets.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== removedId) }));
    networkNodes = networkNodes.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== removedId) }));
    vendors = vendors.map(item => ({ ...item, dependencies: item.dependencies.filter(id => id !== removedId) }));
    persistCollection(VENDOR_STORAGE_KEY, vendors);
    persistCollection(NODE_STORAGE_KEY, networkNodes);
    saveAssets();
    render();
    if (removed) showToast(`${removed.name} removed; its declared links were cleared.`);
  }
});
document.querySelector('#diagram').addEventListener('click', event => {
  const item = event.target.closest('[data-map-kind]');
  if (!item) return;
  if (item.dataset.mapKind === 'node') openNodeDialog(item.dataset.mapId);
  if (item.dataset.mapKind === 'vendor') openVendorDialog(item.dataset.mapId);
  if (item.dataset.mapKind === 'asset') openDialog(item.dataset.mapId);
});
document.querySelector('#diagram').addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const item = event.target.closest('[data-map-kind]');
  if (!item) return;
  event.preventDefault();
  item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});

document.querySelector('#node-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const editingId = form.dataset.editingId;
  const node = {
    id: editingId || createId('node'),
    name: String(data.get('name')).trim(),
    zone: data.get('zone'),
    domain: data.get('domain'),
    purpose: String(data.get('purpose')).trim(),
    businessImpact: String(data.get('businessImpact')).trim(),
    dependencies: data.getAll('dependencies')
  };
  if (editingId) networkNodes = networkNodes.map(item => item.id === editingId ? node : item);
  else networkNodes.push(node);
  persistCollection(NODE_STORAGE_KEY, networkNodes);
  render();
  form.closest('dialog').close();
  showToast(`Node "${node.name}" saved to ${node.zone}.`);
});

document.querySelector('#vendor-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const logoUrl = String(data.get('logoUrl') || '').trim();
  if (logoUrl && !/^https:\/\/[^\s"'<>]+$/i.test(logoUrl)) {
    showToast('Vendor logo links must use HTTPS. Clear the field to use initials instead.');
    form.elements.logoUrl.focus();
    return;
  }
  const editingId = form.dataset.editingId;
  const vendor = {
    id: editingId || createId('vendor'),
    name: String(data.get('name')).trim(),
    service: String(data.get('service')).trim(),
    zone: data.get('zone'),
    domain: data.get('domain'),
    logoUrl,
    businessImpact: String(data.get('businessImpact')).trim(),
    access: String(data.get('access')).trim(),
    data: String(data.get('data')).trim(),
    criticality: data.get('criticality'),
    contact: String(data.get('contact')).trim(),
    dependencies: data.getAll('dependencies')
  };
  if (editingId) vendors = vendors.map(item => item.id === editingId ? vendor : item);
  else vendors.push(vendor);
  persistCollection(VENDOR_STORAGE_KEY, vendors);
  render();
  form.closest('dialog').close();
  showToast(`Vendor "${vendor.name}" saved and linked to the topology.`);
});

document.querySelector('#add-dispatch').addEventListener('click', () => openDispatchDialog());
document.querySelector('#dispatch-list').addEventListener('click', event => {
  const button = event.target.closest('[data-edit-dispatch]');
  if (button) openDispatchDialog(button.dataset.editDispatch);
  const infoButton = event.target.closest('[data-info="dispatch"]');
  if (infoButton) openInfoDialog('dispatch');
});
document.querySelector('#add-incident').addEventListener('click', () => openIncidentDialog());
document.querySelector('#incident-list').addEventListener('click', event => {
  const button = event.target.closest('[data-edit-incident]');
  if (button) openIncidentDialog(button.dataset.editIncident);
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
  document.querySelector(`#${button.dataset.close}`).close();
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => {
    if (activeDialogTrigger && typeof activeDialogTrigger.focus === 'function') {
      activeDialogTrigger.focus();
    }
    activeDialogTrigger = null;
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.disabled && !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
});
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
  openInfoDialog(button.dataset.info, button.dataset.rule);
}));
document.querySelector('#finding-list').addEventListener('click', event => {
  const button = event.target.closest('[data-info="finding"]');
  if (button) openInfoDialog('finding', button.dataset.rule, button.dataset.assetId);
});
document.querySelector('#dispatch-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const status = data.get('status');
  const logoUrl = String(data.get('logoUrl') || '').trim();
  if (logoUrl && !/^https:\/\/[^\s"'<>]+$/i.test(logoUrl)) {
    showToast('Partner logo links must use HTTPS. Clear the field to use initials instead.');
    form.elements.logoUrl.focus();
    return;
  }
  if (status === 'canceled' && !String(data.get('reason')).trim()) {
    showToast('Record the reason for cancellation before saving.');
    form.elements.reason.focus();
    return;
  }
  if (status === 'delivered' && !data.get('actualEta')) {
    showToast('Enter the actual arrival time to record a delivery.');
    form.elements.actualEta.focus();
    return;
  }
  const editingId = form.dataset.editingId;
  const task = {
    id: editingId || createId('dispatch'),
    name: String(data.get('name')).trim(),
    customer: String(data.get('customer')).trim(),
    logoUrl,
    cargo: String(data.get('cargo')).trim(),
    origin: String(data.get('origin')).trim(),
    destination: String(data.get('destination')).trim(),
    stage: data.get('stage'),
    productValue: data.get('productValue'),
    plannedEta: data.get('plannedEta'),
    vehicle: String(data.get('vehicle')).trim(),
    status,
    actualEta: data.get('actualEta'),
    delayMinutes: data.get('delayMinutes'),
    reason: String(data.get('reason')).trim(),
    redundancy: String(data.get('redundancy')).trim(),
    remediation: String(data.get('remediation')).trim()
  };
  if (editingId) dispatches = dispatches.map(item => item.id === editingId ? task : item);
  else dispatches.push(task);
  persistCollection(DISPATCH_STORAGE_KEY, dispatches);
  renderOperations();
  form.closest('dialog').close();
  showToast(`Dispatch ${task.status === 'canceled' ? 'cancellation' : 'task'} saved.`);
});
document.querySelector('#incident-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const editingId = form.dataset.editingId;
  const issue = {
    id: editingId || createId('incident'),
    type: data.get('type'),
    severity: data.get('severity'),
    description: String(data.get('description')).trim(),
    dispatchId: data.get('dispatchId'),
    status: data.get('status'),
    delayMinutes: data.get('delayMinutes'),
    productLoss: data.get('productLoss'),
    salvageValue: data.get('salvageValue'),
    disposalCost: data.get('disposalCost'),
    delayCost: data.get('delayCost'),
    otherCost: data.get('otherCost'),
    remediation: String(data.get('remediation')).trim(),
    createdAt: editingId ? incidents.find(item => item.id === editingId).createdAt : new Date().toISOString()
  };
  if (editingId) incidents = incidents.map(item => item.id === editingId ? issue : item);
  else incidents.push(issue);
  persistCollection(INCIDENT_STORAGE_KEY, incidents);
  renderOperations();
  form.closest('dialog').close();
  showToast(`Operational issue ${issue.status === 'resolved' ? 'marked resolved' : 'saved'}.`);
});
document.querySelectorAll('.filter-tab').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.toggle('active', tab === button));
  document.querySelectorAll('.filter-tab').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
  renderFindings(assess());
  showToast(`${button.textContent.trim()} findings selected.`);
}));
document.querySelector('#asset-map-tab').addEventListener('click', () => {
  activeMap = 'assets';
  updateMapTabs();
});
document.querySelector('#network-map-tab').addEventListener('click', () => {
  activeMap = 'network';
  updateMapTabs();
});
document.querySelector('#topology-map-tab').addEventListener('click', () => {
  activeMap = 'topology';
  updateMapTabs();
});

function updateMapTabs() {
  const assetTab = document.querySelector('#asset-map-tab');
  const networkTab = document.querySelector('#network-map-tab');
  const topologyTab = document.querySelector('#topology-map-tab');
  assetTab.classList.toggle('active', activeMap === 'assets');
  networkTab.classList.toggle('active', activeMap === 'network');
  topologyTab.classList.toggle('active', activeMap === 'topology');
  assetTab.setAttribute('aria-selected', String(activeMap === 'assets'));
  networkTab.setAttribute('aria-selected', String(activeMap === 'network'));
  topologyTab.setAttribute('aria-selected', String(activeMap === 'topology'));
  assetTab.tabIndex = activeMap === 'assets' ? 0 : -1;
  networkTab.tabIndex = activeMap === 'network' ? 0 : -1;
  topologyTab.tabIndex = activeMap === 'topology' ? 0 : -1;
  document.querySelector('#diagram').setAttribute('aria-label', activeMap === 'assets' ? 'Asset relationship diagram' : activeMap === 'network' ? 'Network zone diagram' : 'Full network topology diagram');
  renderDiagram();
}

function navigateToPage(page, updateHistory = true) {
  const pageNames = ['home', 'inventory', 'risks', 'connections', 'operations'];
  if (!pageNames.includes(page)) return;
  const pageChanged = page !== activePage;
  activePage = page;
  document.querySelectorAll('[data-page-view]').forEach(view => {
    view.hidden = view.dataset.pageView !== page;
  });
  document.querySelectorAll('.nav-link').forEach(button => {
    const selected = button.dataset.page === page;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.title = `${page === 'home' ? 'Overview' : capitalize(page)} | AgriGuard Risk Planner`;
  if (updateHistory && pageChanged) history.pushState(null, '', `#${page}`);
  document.querySelector('#main-content').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => navigateToPage(button.dataset.page));
});
window.addEventListener('hashchange', () => navigateToPage(location.hash.slice(1), false));
window.addEventListener('popstate', () => navigateToPage(location.hash.slice(1) || 'home', false));
const initialPage = location.hash.slice(1);
if (initialPage && document.querySelector(`[data-page-view="${initialPage}"]`)) {
  navigateToPage(initialPage, false);
} else {
  navigateToPage('home', false);
}

document.querySelectorAll('.domain-tab').forEach(button => {
  button.addEventListener('click', () => {
    activeDomain = button.dataset.domain;
    document.querySelectorAll('.domain-tab').forEach(tab => {
      const selected = tab === button;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-pressed', String(selected));
    });
    renderDiagram();
    showToast(`${button.textContent.trim()} connection view selected.`);
  });
});

document.querySelectorAll('.map-tab').forEach((tab, index, tabs) => {
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  });
});

render();
