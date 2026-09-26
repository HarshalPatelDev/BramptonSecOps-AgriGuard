const STORAGE_KEY = 'agriguard-risk-planner-assets-v1';
const DISPATCH_STORAGE_KEY = 'agriguard-dispatch-v1';
const INCIDENT_STORAGE_KEY = 'agriguard-incidents-v1';
const NODE_STORAGE_KEY = 'agriguard-network-nodes-v1';
const VENDOR_STORAGE_KEY = 'agriguard-vendors-v1';
const FINDING_STATUS_KEY = 'agriguard-finding-status-v1';
const HISTORY_STORAGE_KEY = 'agriguard-risk-history-v1';
const VIEW_MODE_KEY = 'agriguard-dashboard-view-v1';
const AUTHOR_KEY = 'agriguard-update-author-v1';
const RISK_VIEW_KEY = 'agriguard-risk-view-v1';
const REVIEW_CYCLE_MONTHS = 6;
const SEVERITY_LEVELS = [
  { key: 'critical', name: 'Critical', plain: 'Act now', range: 'Score 90–100' },
  { key: 'high', name: 'High', plain: 'Next up', range: 'Score 75–89' },
  { key: 'medium', name: 'Medium', plain: 'Plan a fix', range: 'Score 52–74' },
  { key: 'low', name: 'Low', plain: 'Keep an eye on it', range: 'Score below 52' }
];
const STATUS_LABELS = { open: 'Open', 'in-progress': 'In progress', closed: 'Closed' };
const NETWORK_ZONES = ['Cloud / SaaS', 'Perimeter / DMZ', 'Internal network', 'Restricted data zone', 'Remote / user devices', 'Not sure'];
// Stored values stay the same; people see plain words.
const ZONE_LABELS = {
  'Cloud / SaaS': 'Online service',
  'Perimeter / DMZ': 'Edge of your network',
  'Internal network': 'Inside your building',
  'Restricted data zone': 'Locked-down area',
  'Remote / user devices': 'Phones, laptops & tablets',
  'Not sure': 'Not sure'
};
const TYPE_LABELS = {
  'Identity & access': 'Sign-in & accounts',
  'Cloud platform': 'Online platform',
  'Business application': 'Business software',
  'Device / endpoint': 'Computer or device',
  'Network / infrastructure': 'Internet & network equipment',
  'Data storage': 'File storage',
  'Backup & recovery': 'Backups',
  'Production equipment': 'Production equipment',
  'Other': 'Other'
};
// Same-origin endpoint served by server/personalize.mjs. When it is not running,
// advice is personalized locally from the answers instead.
const PERSONALIZE_ENDPOINT = 'api/personalize';
const CIA_LEVELS = { none: 0, low: 1, medium: 2, high: 3 };
const BRAND_LOGOS = [
  { pattern: /\b(?:microsoft\s*365|office\s*365|m365)\b/i, slug: 'microsoft' },
  { pattern: /\b(?:microsoft|windows|azure|entra|sharepoint|onedrive|teams|intune)\b/i, slug: 'microsoft' },
  { pattern: /\b(?:amazon web services|aws)\b/i, slug: 'amazonaws' },
  { pattern: /\bgoogle workspace\b|\bg suite\b|\bgoogle\b/i, slug: 'google' },
  { pattern: /\bcisco\b|\bmeraki\b/i, slug: 'cisco' },
  { pattern: /\bfortinet\b/i, slug: 'fortinet' },
  { pattern: /\bpalo alto networks\b/i, slug: 'paloaltonetworks' },
  { pattern: /\bcrowdstrike\b/i, slug: 'crowdstrike' },
  { pattern: /\bsophos\b/i, slug: 'sophos' },
  { pattern: /\bvmware\b/i, slug: 'vmware' },
  { pattern: /\bsap\b/i, slug: 'sap' },
  { pattern: /\boracle\b/i, slug: 'oracle' },
  { pattern: /\bsalesforce\b/i, slug: 'salesforce' },
  { pattern: /\b(?:intuit|quickbooks)\b/i, slug: 'intuit' },
  { pattern: /\bslack\b/i, slug: 'slack' },
  { pattern: /\bzoom\b/i, slug: 'zoom' },
  { pattern: /\bdropbox\b/i, slug: 'dropbox' },
  { pattern: /\b(?:atlassian|jira|confluence)\b/i, slug: 'atlassian' },
  { pattern: /\bgithub\b/i, slug: 'github' },
  { pattern: /\badobe\b/i, slug: 'adobe' },
  { pattern: /\bibm\b/i, slug: 'ibm' },
  { pattern: /\bservicenow\b/i, slug: 'servicenow' },
  { pattern: /\bokta\b/i, slug: 'okta' },
  { pattern: /\bcloudflare\b/i, slug: 'cloudflare' },
  { pattern: /\bshopify\b/i, slug: 'shopify' },
  { pattern: /\bfedex\b/i, slug: 'fedex' },
  { pattern: /\bups\b/i, slug: 'ups' },
  { pattern: /\bdhl\b/i, slug: 'dhl' },
  { pattern: /\bwalmart\b/i, slug: 'walmart' },
  { pattern: /\bcostco\b/i, slug: 'costco' },
  { pattern: /\bhoneywell\b/i, slug: 'honeywell' },
  { pattern: /\bzebra technologies\b|\bzebra\b/i, slug: 'zebra' },
  { pattern: /\bdell\b/i, slug: 'dell' },
  { pattern: /\blenovo\b/i, slug: 'lenovo' },
  { pattern: /\bapple\b|\bmacos\b|\biphone\b|\bipad\b/i, slug: 'apple' },
  { pattern: /\bsamsung\b/i, slug: 'samsung' }
];
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
  { label: 'Transport Canada: Road safety in Canada', url: 'https://tc.canada.ca/en/road-transportation/road-safety-canada' }
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
  backup: [],
  logging: [
    { label: 'Microsoft Learn: Microsoft Entra audit logs', url: 'https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-audit-logs', type: 'guide' },
    { label: 'Microsoft Learn: Identity and access training', url: 'https://learn.microsoft.com/en-us/training/browse/?products=entra-id', type: 'training' }
  ],
  exposure: [
    { label: 'Microsoft Learn: Assign Microsoft Entra roles', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/manage-roles-portal', type: 'guide' }
  ],
  owner: []
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
    backups: 'unknown', logging: 'partial', zone: 'Cloud / SaaS', dependencies: [], lastReviewed: daysAgo(40)
  },
  {
    id: 'farm-erp', name: 'Farm operations platform', type: 'Business application', criticality: 'high', domain: 'shared',
    confidentiality: 'medium', integrity: 'high', availability: 'high',
    purpose: 'Coordinates inventory, purchasing, and daily operations.', businessImpact: 'Incorrect or unavailable lot and inventory records can delay receiving, production scheduling, and customer orders.', owner: 'Farm manager',
    exposure: 'yes', admin: 'changed', mfa: 'unknown', access: 'no',
    backups: 'partial', logging: 'unknown', zone: 'Cloud / SaaS', dependencies: ['m365'], lastReviewed: daysAgo(165)
  },
  {
    id: 'nas', name: 'Office file server', type: 'Data storage', criticality: 'high', domain: 'it',
    confidentiality: 'high', integrity: 'high', availability: 'medium',
    purpose: 'Stores finance records and internal business documents.', businessImpact: 'Loss or alteration could prevent finance reconciliation and access to essential business records.', owner: 'Office team',
    exposure: 'no', admin: 'shared', mfa: 'no', access: 'no',
    backups: 'no', logging: 'no', zone: 'Restricted data zone', dependencies: [], lastReviewed: daysAgo(205)
  },
  {
    id: 'router', name: 'Office router & Wi-Fi', type: 'Network / infrastructure', criticality: 'medium', domain: 'shared',
    confidentiality: 'low', integrity: 'high', availability: 'high',
    purpose: 'Connects office devices and staff to the internet.', businessImpact: 'An outage can disconnect office staff from cloud ordering, dispatch, and communications tools.', owner: 'IT support',
    exposure: 'unknown', admin: 'unknown', mfa: 'unknown', access: 'unknown',
    backups: 'unknown', logging: 'unknown', zone: 'Perimeter / DMZ', dependencies: []
  },
  {
    id: 'cold-room', name: 'Cold room temperature monitor', type: 'Production equipment', criticality: 'high', domain: 'ot',
    confidentiality: 'low', integrity: 'high', availability: 'high',
    purpose: 'Watches cold room temperatures overnight and texts the night supervisor if lettuce and berries get too warm.', businessImpact: 'If alerts stop or readings are wrong, a full cold room of greens can spoil overnight or be shipped unsafe.', owner: 'Quality lead',
    exposure: 'yes', admin: 'shared', mfa: 'no', access: 'unknown',
    backups: 'no', logging: 'no', zone: 'Internal network', dependencies: ['router']
  },
  {
    id: 'pack-line', name: 'Wash & pack line controller', type: 'Production equipment', criticality: 'high', domain: 'ot',
    confidentiality: 'low', integrity: 'high', availability: 'high',
    purpose: 'Controls wash water, drying, and bagging on packaging line 2. The equipment maker connects remotely for support.', businessImpact: 'A wrong setting can under-wash product or stop the line, delaying grocery orders.', owner: 'Production lead',
    exposure: 'unknown', admin: 'shared', mfa: 'unknown', access: 'no',
    backups: 'partial', logging: 'unknown', zone: 'Internal network', dependencies: ['farm-erp'], lastReviewed: daysAgo(120)
  }
];

const demoNodes = [
  { id: 'node-fw', name: 'Edge firewall', zone: 'Perimeter / DMZ', domain: 'it', purpose: 'Filters inbound/outbound office network traffic.', businessImpact: 'A misconfiguration or outage can expose services or disconnect staff from essential cloud tools.', dependencies: ['router'] },
  { id: 'node-dispatch', name: 'Dispatch workstation', zone: 'Internal network', domain: 'ot', purpose: 'Dispatcher assigns trucks and confirms load status.', businessImpact: 'Lost dispatch access can delay refrigerated pickups and grocery delivery windows.', dependencies: ['farm-erp', 'm365'] },
  { id: 'node-telematics', name: 'Fleet telematics gateway', zone: 'Perimeter / DMZ', domain: 'ot', purpose: 'Receives vehicle location and diagnostic updates.', businessImpact: 'Missing location or reefer status can delay response to a route or temperature incident.', dependencies: ['router'] },
  { id: 'node-backup', name: 'Recovery access system', zone: 'Restricted data zone', domain: 'it', purpose: 'Restricted access point for restoration and recovery tasks.', businessImpact: 'If recovery access is unavailable, restore time for orders and operating records can increase.', dependencies: ['nas'] },
  { id: 'node-yard-tablet', name: 'Yard check-in tablet', zone: 'Remote / user devices', domain: 'ot', purpose: 'Records trailer, driver, and arrival checks at the yard.', businessImpact: 'Incorrect check-in details can misroute a truck or delay the receiving dock.', dependencies: ['node-dispatch', 'm365'] },
  { id: 'node-warehouse-terminal', name: 'Warehouse receiving terminal', zone: 'Internal network', domain: 'ot', purpose: 'Confirms received quantities and flags damaged cargo.', businessImpact: 'Wrong quantity or condition records can lead to incorrect lot release, spoilage, or production delays.', dependencies: ['farm-erp', 'vendor-carrier'] },
  { id: 'node-wifi-ap', name: 'Operations Wi-Fi access point', zone: 'Internal network', domain: 'shared', purpose: 'Provides staff connectivity for dispatch and receiving workflows.', businessImpact: 'Loss of connectivity can slow yard checks, inventory updates, and dispatch communications.', dependencies: ['router', 'node-fw'] }
];

const demoVendors = [
  { id: 'vendor-carrier', name: 'Regional Freight Partner', service: 'Overflow freight and refrigerated truck capacity', zone: 'Cloud / SaaS', domain: 'ot', logoUrl: '', businessImpact: 'If capacity is unavailable, perishable pickups may miss receiving slots and product may remain in transit longer.', access: 'Receives load details and delivery windows; no internal network access.', data: 'Shipment reference, cargo class, pickup/delivery addresses, ETA', dependencies: ['node-dispatch'], criticality: 'high', contact: 'Dispatch coordinator' },
  { id: 'vendor-telematics', name: 'Fleet Telematics Provider', service: 'Vehicle location and diagnostic portal', zone: 'Perimeter / DMZ', domain: 'shared', logoUrl: '', businessImpact: 'A provider outage can reduce visibility into vehicle location and temperature alerts during transit.', access: 'Provider portal uses named fleet-manager accounts; integration method needs verification.', data: 'Vehicle identifiers, location, diagnostics', dependencies: ['node-telematics'], criticality: 'high', contact: 'Fleet manager' },
  { id: 'vendor-line-maker', name: 'Packaging line equipment maker', service: 'Remote support and software updates for wash & pack line 2', zone: 'Perimeter / DMZ', domain: 'ot', logoUrl: '', businessImpact: 'Without their support, a line fault can keep packaging stopped for a full shift or longer.', access: 'Always-on remote connection to the line controller; shared support login.', data: 'Line settings, recipes, fault logs', dependencies: ['pack-line'], criticality: 'high', contact: 'Production lead' },
  { id: 'vendor-it', name: 'Managed IT Support', service: 'Device and network support', zone: 'Remote / user devices', domain: 'it', logoUrl: '', businessImpact: 'Delayed support can extend an email, network, or recovery outage that interrupts purchasing and dispatch coordination.', access: 'Remote support access; review named accounts, extra sign-in checks, and approval process.', data: 'Device/network configuration and support logs', dependencies: ['node-backup', 'router'], criticality: 'medium', contact: 'Operations lead' }
];

const typeIcons = {
  'Identity & access': 'ID',
  'Cloud platform': '☁',
  'Business application': '▧',
  'Device / endpoint': '⌘',
  'Network / infrastructure': '⌁',
  'Data storage': 'DB',
  'Backup & recovery': '↻',
  'Production equipment': '⚙',
  'Other': '◇'
};

const ruleDefinitions = [
  {
    key: 'admin', title: 'Some sign-in details may be shared or unchanged',
    applies: asset => asset.admin === 'shared' || asset.admin === 'unknown',
    base: 57, gap: asset => asset.admin === 'shared' ? 12 : 4,
    why: asset => asset.admin === 'shared'
      ? 'When people share sign-in details, one leaked password could put the whole system at risk.'
      : 'It is not clear whether each person has a separate sign-in or whether the original setup password was changed.',
    action: 'Change any setup password before use. Give each person their own account, and give system managers a separate account for making changes. Save different strong passwords in an approved password manager, add a second sign-in check for managers, test account recovery, and note when this was reviewed.',
    controls: ['PR.AA-01', 'PR.AA-05']
  },
  {
    key: 'mfa', title: 'Some accounts need an extra sign-in check',
    applies: asset => asset.mfa !== 'yes',
    base: 48, gap: asset => asset.mfa === 'no' ? 11 : asset.mfa === 'partial' ? 6 : 3,
    why: asset => asset.mfa === 'no'
      ? 'A stolen password may be enough for someone else to sign in.'
      : asset.mfa === 'partial'
        ? 'Some people can still sign in with only a password.'
        : 'It is not clear whether an extra sign-in check protects every account, especially manager accounts and people working remotely.',
    action: 'Add a second sign-in check for everyone, starting with system managers and people who sign in remotely. Use the strongest available option, close older sign-in methods that skip the check, and test how staff can recover access.',
    controls: ['PR.AA-03', 'PR.AA-05']
  },
  {
    key: 'access', title: 'Review who can use or change this system',
    applies: asset => asset.access !== 'yes',
    base: 46, gap: asset => asset.access === 'no' ? 10 : 3,
    why: asset => asset.access === 'no'
      ? 'Too many people may be able to see or change more than their jobs require.'
      : 'It is not clear who can use this system or whether access is reviewed when people change jobs.',
    action: 'List the jobs that use this system and what each job needs to do. Give each job the access it needs, keep manager access separate, remove access that is no longer needed, and review the list when people change jobs and at least every three months.',
    controls: ['PR.AA-01', 'PR.AA-05', 'GV.RR-02']
  },
  {
    key: 'owner', title: 'Choose someone to look after this system',
    applies: asset => !String(asset.owner || '').trim(),
    base: 34, gap: () => 5,
    why: () => 'Without a named person or team, important reviews and recovery work may be missed.',
    action: 'Choose a person or team to look after this system. Note who approves new access, checks important settings, and contacts the supplier if the system stops working.',
    controls: ['GV.RR-02']
  },
  {
    key: 'backup', title: 'Check that important information can be restored',
    applies: asset => asset.backups !== 'yes',
    base: 44, gap: asset => asset.backups === 'no' ? 12 : asset.backups === 'partial' ? 6 : 3,
    why: asset => asset.backups === 'no'
      ? 'There may be no safe copy of the information to use if it is lost.'
      : asset.backups === 'partial'
        ? 'Copies may exist, but no one has confirmed they can be used to recover the business.'
        : 'It is not clear what is copied or when anyone last tested getting information back.',
    action: 'Decide which business information must be saved and how long to keep it. Keep a protected copy separate from everyday accounts. Practice restoring a small sample, write down the result, and make sure someone can reach the saved copy if regular accounts are unavailable.',
    controls: ['PR.DS-11', 'RC.RP-03']
  },
  {
    key: 'logging', title: 'Important activity may not be easy to review',
    applies: asset => asset.logging !== 'yes',
    base: 39, gap: asset => asset.logging === 'no' ? 9 : asset.logging === 'partial' ? 5 : 3,
    why: asset => asset.logging === 'no'
      ? 'Unexpected sign-ins or changes could happen without anyone noticing.'
      : asset.logging === 'partial'
        ? 'Some activity is recorded, but no one may be checking it often enough to spot a problem.'
        : 'It is not clear whether important sign-ins and changes are recorded or reviewed.',
    action: 'Turn on records of sign-ins, manager actions, and important changes. Limit who can erase them, keep them for an agreed period, and choose someone to check for unusual activity regularly.',
    controls: ['PR.PS-04', 'DE.CM-03']
  },
  {
    key: 'exposure', title: 'Review who can reach this system online',
    applies: asset => asset.exposure === 'yes' || asset.exposure === 'unknown',
    base: 40, gap: asset => asset.exposure === 'yes' ? 8 : 3,
    why: asset => asset.exposure === 'yes'
      ? 'Anyone online can try to reach this system, so check that only the right people can get in.'
      : 'It is not clear whether people outside your business can reach this system.',
    action: 'Check whether people need to reach this system from outside the business. Close access that is not needed, limit any remaining access to named people, add a second sign-in check, keep the system updated, and ask the system owner to review outside-access settings.',
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

function ruleTitle(ruleKey) {
  return ruleDefinitions.find(rule => rule.key === ruleKey)?.title || 'Security check';
}

// Sample assessment history: findings closed over the last six months and two fixes underway.
function demoFindingStatus() {
  const created = days => ({ id: `demo-${days}-created`, at: daysAgoAt(days), author: 'AgriGuard', type: 'system', text: 'Ticket created from the first assessment.' });
  const entry = (days, author, text, from, to) => ({ id: `demo-${days}-${author.length}-${text.length}`, at: daysAgoAt(days), author, type: from ? 'status' : 'note', from, to, text });
  const closed = (assetId, assetName, ruleKey, priority, openedDays, closedDays, resolution, owner) => ({
    status: 'closed', assetId, assetName, ruleKey, title: ruleTitle(ruleKey), priority,
    openedAt: daysAgo(openedDays), closedAt: daysAgo(closedDays), resolution, assignee: owner,
    updates: [created(openedDays), entry(closedDays + 12, owner, 'Started on this.', 'open', 'in-progress'), entry(closedDays, owner, resolution, 'in-progress', 'closed')]
  });
  const firstAssessment = {};
  for (const asset of demoAssets) {
    for (const rule of ruleDefinitions.filter(item => item.applies(asset))) {
      firstAssessment[findingKey(asset.id, rule.key)] = { status: 'open', openedAt: daysAgo(180), updates: [created(180)] };
    }
  }
  return {
    ...firstAssessment,
    'm365:owner': closed('m365', 'Microsoft 365', 'owner', 'medium', 175, 140, 'Operations team named as owner and approver for new accounts.', 'Operations'),
    'farm-erp:admin': closed('farm-erp', 'Farm operations platform', 'admin', 'high', 170, 120, 'Setup password changed; managers now use separate named accounts.', 'Farm manager'),
    'nas:exposure': closed('nas', 'Office file server', 'exposure', 'high', 160, 75, 'Remote file sharing turned off at the router; staff use the VPN instead.', 'IT support'),
    'router:owner': closed('router', 'Office router & Wi-Fi', 'owner', 'medium', 150, 60, 'IT support assigned; supplier contact added to the recovery sheet.', 'IT support'),
    'nas:backup': {
      status: 'in-progress', openedAt: daysAgo(170), assignee: 'Office team', due: daysAhead(14), checked: [0],
      note: 'Quote requested for an offsite backup service.',
      updates: [
        created(170),
        entry(32, 'Office team', 'Listed the finance and order folders that must be copied every night.', 'open', 'in-progress'),
        entry(6, 'Office team', 'Quote requested for an offsite backup service.')
      ]
    },
    'm365:mfa': {
      status: 'in-progress', openedAt: daysAgo(175), assignee: 'Operations', due: daysAhead(5), checked: [0, 1],
      note: 'Enforced for managers; staff rollout scheduled.',
      updates: [
        created(175),
        entry(45, 'Operations', 'Turned on the extra sign-in check for the three managers first.', 'open', 'in-progress'),
        entry(9, 'Operations', 'Enforced for managers; staff rollout scheduled.')
      ]
    }
  };
}

function demoHistory() {
  const now = new Date();
  const counts = [
    { critical: 9, high: 24, medium: 10, low: 2, closed: 0 },
    { critical: 9, high: 24, medium: 9, low: 1, closed: 1 },
    { critical: 8, high: 23, medium: 9, low: 1, closed: 2 },
    { critical: 7, high: 22, medium: 9, low: 0, closed: 2 },
    { critical: 7, high: 21, medium: 8, low: 0, closed: 4 }
  ];
  return counts.map((entry, index) => ({ month: monthKey(new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)), ...entry }));
}

let assets = readAssets();
let dispatches = readCollection(DISPATCH_STORAGE_KEY, demoDispatches, item => typeof item.name === 'string' && typeof item.plannedEta === 'string');
let incidents = readCollection(INCIDENT_STORAGE_KEY, demoIncidents, item => typeof item.description === 'string' && typeof item.status === 'string');
let networkNodes = readCollection(NODE_STORAGE_KEY, demoNodes, item => typeof item.name === 'string' && typeof item.zone === 'string' && Array.isArray(item.dependencies));
let vendors = readCollection(VENDOR_STORAGE_KEY, demoVendors, item => typeof item.name === 'string' && typeof item.service === 'string' && Array.isArray(item.dependencies));
let findingStatus = readJson(FINDING_STATUS_KEY, demoFindingStatus, value => value && typeof value === 'object' && !Array.isArray(value));
let riskHistory = readJson(HISTORY_STORAGE_KEY, demoHistory, value => Array.isArray(value) && value.every(item => item && /^\d{4}-\d{2}$/.test(item.month)));
let dashboardView = readPreference(VIEW_MODE_KEY, 'plain');
let latestItems = [];
let activeFilter = 'all';
const systemFilter = (new URLSearchParams(location.search).get('system') || '').split(',').filter(Boolean);
let activeStatusFilter = 'active';
let activeMap = 'topology';
let activeDomain = 'all';
let toastTimer;
// A stack, so closing a help pop-up opened from a ticket returns focus inside the ticket.
const dialogTriggers = [];
let activeRiskView = readPreference(RISK_VIEW_KEY, 'list') === 'board' ? 'board' : 'list';

function bind(selector, eventName, handler) {
  const element = document.querySelector(selector);
  if (element) element.addEventListener(eventName, handler);
}

function showAccessibleDialog(dialog, initialFocus) {
  dialogTriggers.push(document.activeElement);
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

function readJson(key, sampleFactory, validator) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return sampleFactory();
    const parsed = JSON.parse(saved);
    if (!validator(parsed)) throw new Error(`Saved data in ${key} has an unexpected structure.`);
    return parsed;
  } catch (error) {
    console.warn(`Could not load ${key}; showing the sample records.`, error);
    return sampleFactory();
  }
}

function readPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

function isoDate(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function daysAgo(days) {
  return isoDate(new Date(Date.now() - days * 86400000));
}

function daysAgoAt(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function daysAhead(days) {
  return isoDate(new Date(Date.now() + days * 86400000));
}

function monthKey(date = new Date()) {
  return isoDate(date).slice(0, 7);
}

function parseDay(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day || 1, 12);
}

function addMonths(value, months) {
  const date = parseDay(value);
  return isoDate(new Date(date.getFullYear(), date.getMonth() + months, date.getDate(), 12));
}

function daysUntil(value) {
  return Math.round((parseDay(value) - parseDay(isoDate())) / 86400000);
}

function formatDay(value) {
  if (!value) return 'Never';
  const date = parseDay(value);
  return Number.isNaN(date.getTime()) ? 'Invalid date' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function formatMonth(key, style = 'short') {
  return new Intl.DateTimeFormat(undefined, style === 'long' ? { month: 'long', year: 'numeric' } : { month: 'short' }).format(parseDay(`${key}-01`));
}

function reviewStatus(item) {
  if (!item.lastReviewed) return { key: 'never', icon: '?', label: 'Never checked', due: null };
  const due = addMonths(item.lastReviewed, REVIEW_CYCLE_MONTHS);
  const days = daysUntil(due);
  if (days < 0) return { key: 'overdue', icon: '!', label: `Overdue by ${-days} day${days === -1 ? '' : 's'}`, due, days };
  if (days <= 30) return { key: 'soon', icon: '◷', label: `Due in ${days} day${days === 1 ? '' : 's'}`, due, days };
  return { key: 'current', icon: '✓', label: 'Up to date', due, days };
}

function reviewChip(item) {
  const review = reviewStatus(item);
  return `<span class="review-chip review-${review.key}"><span aria-hidden="true">${review.icon}</span>${escapeHtml(review.label)}</span>`;
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
  return `hsl(${hash} 40% 95%)`;
}

function resolvedLogoUrl(name, customUrl = '') {
  if (/^https:\/\/[^\s"'<>]+$/i.test(String(customUrl || ''))) return customUrl;
  const brand = BRAND_LOGOS.find(candidate => candidate.pattern.test(String(name || '')));
  return brand ? `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${brand.slug}.svg` : '';
}

function logoMark(name, className = 'brand-mark-small', customUrl = '', searchableText = name) {
  const url = resolvedLogoUrl(searchableText, customUrl);
  return `<span class="entity-logo ${className}" style="--logo-background:${logoColour(name)}" aria-hidden="true">${url ? `<img src="${escapeHtml(url)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}<span ${url ? 'hidden' : ''}>${monogram(name)}</span></span>`;
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

// Short, plain bullet points: what could go wrong for this system.
function impactPoints(asset, rule) {
  const domain = businessDomain(asset);
  const c = ciaRating(asset, 'confidentiality');
  const i = ciaRating(asset, 'integrity');
  const a = ciaRating(asset, 'availability');
  const points = [];
  if (String(asset.businessImpact || '').trim()) points.push(asset.businessImpact);
  if (a === 'high' || a === 'medium') {
    points.push(domain === 'ot'
      ? 'If it stops, product can be held, spoiled, or delayed.'
      : 'If it stops, staff lose the records they need to keep work moving.');
  }
  if (i === 'high' || i === 'medium') {
    points.push(domain === 'ot'
      ? 'Wrong settings or lot records could affect product quality.'
      : 'Changed records could lead to wrong orders or decisions.');
  }
  if (c === 'high' || c === 'medium') points.push('Private business, staff, or customer details could leak.');
  return points.length ? points : [rule.why(asset)];
}

function impactScenario(asset, rule) {
  return impactPoints(asset, rule).join(' ');
}

function actionSteps(rule) {
  return String(rule.action || '').split(/(?<=\.)\s+/).filter(Boolean);
}

function bulletList(points, className = 'bullet-list') {
  return `<ul class="${className}">${points.map(point => `<li>${escapeHtml(point)}</li>`).join('')}</ul>`;
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
  syncFindingStatus(findings);
  const items = riskItems(findings);
  latestItems = items;
  recordHistory(items);
  renderDashboard(items);
  renderAssets();
  renderVendors();
  renderNodes();
  renderOperations();
  renderFindings(items);
  renderDiagram();
}

function findingKey(assetId, ruleKey) {
  return `${assetId}:${ruleKey}`;
}

function severityBucket(priority) {
  return ['informational', 'na'].includes(priority) ? 'low' : priority;
}

function severityLevel(priority) {
  return SEVERITY_LEVELS.find(level => level.key === severityBucket(priority)) || SEVERITY_LEVELS[3];
}

function severityPill(priority, withPlain = true) {
  const level = severityLevel(priority);
  return `<span class="severity-pill severity-${level.key}">${level.name}${withPlain ? ` · ${level.plain}` : ''}</span>`;
}

function statusChip(status) {
  const icon = status === 'closed' ? '✓' : status === 'in-progress' ? '◐' : '○';
  return `<span class="status-chip status-${status}"><span aria-hidden="true">${icon}</span>${escapeHtml(STATUS_LABELS[status] || 'Open')}</span>`;
}

// Keeps one status record per asset/rule pair. A fix recorded in the inventory closes the
// finding automatically; if the gap returns later, an automatically closed finding reopens.
function syncFindingStatus(findings) {
  const today = isoDate();
  const next = {};
  const activeKeys = new Set();
  for (const finding of findings) {
    const key = findingKey(finding.asset.id, finding.rule.key);
    activeKeys.add(key);
    let record = findingStatus[key]
      ? { ...findingStatus[key] }
      : { status: 'open', openedAt: today, updates: [systemUpdate('Ticket created: your inventory answers show this gap.')] };
    if (record.status === 'closed' && record.auto) {
      const text = `Reopened: this gap came back after being fixed on ${formatDay(record.closedAt)}.`;
      record = {
        status: 'open', openedAt: today, note: text, ticket: record.ticket, assignee: record.assignee, due: record.due,
        updates: [...(record.updates || []), systemUpdate(text, 'closed', 'open')]
      };
    }
    Object.assign(record, { assetId: finding.asset.id, assetName: finding.asset.name, ruleKey: finding.rule.key, title: finding.rule.title, priority: finding.priority, score: finding.score });
    next[key] = record;
    Object.assign(finding, { key, status: record.status, record });
  }
  for (const [key, record] of Object.entries(findingStatus)) {
    if (activeKeys.has(key) || !assets.some(asset => asset.id === record.assetId)) continue;
    const resolution = 'Resolved: the inventory answers now meet this check.';
    next[key] = record.status === 'closed'
      ? record
      : { ...record, status: 'closed', auto: true, closedAt: today, resolution, updates: [...(record.updates || []), systemUpdate(resolution, record.status, 'closed')] };
  }
  // Stable ticket numbers (AG-1, AG-2, ...) in the order tickets were first seen.
  let lastTicket = Math.max(0, ...Object.values(next).map(record => record.ticket || 0));
  for (const record of Object.values(next)) {
    if (!record.ticket) record.ticket = ++lastTicket;
  }
  const changed = JSON.stringify(next) !== JSON.stringify(findingStatus);
  findingStatus = next;
  if (changed) persistCollection(FINDING_STATUS_KEY, findingStatus);
}

function riskItems(findings) {
  const activeKeys = new Set(findings.map(finding => finding.key));
  const resolved = Object.entries(findingStatus)
    .filter(([key, record]) => !activeKeys.has(key) && record.status === 'closed')
    .map(([key, record]) => ({
      key, record, status: 'closed', resolved: true,
      priority: record.priority || 'low', score: record.score || 0,
      asset: assets.find(asset => asset.id === record.assetId) || { id: record.assetId, name: record.assetName || 'Removed system' },
      rule: ruleDefinitions.find(rule => rule.key === record.ruleKey) || { key: record.ruleKey, title: record.title || 'Security check', controls: [] }
    }));
  return [...findings, ...resolved];
}

// Every status change is logged on the ticket, with an optional note from the person.
function setFindingStatus(key, status, text = '') {
  const record = findingStatus[key];
  if (!record || !STATUS_LABELS[status] || record.status === status) return;
  const note = String(text).trim();
  const updated = { ...record, status, auto: false, updates: [...(record.updates || []), ticketUpdate({ type: 'status', from: record.status, to: status, text: note })] };
  if (note) updated.note = note;
  if (status === 'closed') {
    updated.closedAt = isoDate();
    updated.resolution = note || 'Closed by the team.';
  } else {
    delete updated.closedAt;
    delete updated.resolution;
  }
  saveTicket(key, updated);
}

function saveTicket(key, record) {
  findingStatus = { ...findingStatus, [key]: record };
  persistCollection(FINDING_STATUS_KEY, findingStatus);
}

function currentAuthor() {
  return readPreference(AUTHOR_KEY, '').trim() || 'You';
}

function ticketUpdate(fields) {
  return { id: createId('update'), at: new Date().toISOString(), author: currentAuthor(), ...fields };
}

function systemUpdate(text, from, to) {
  return { id: createId('update'), at: new Date().toISOString(), author: 'AgriGuard', type: from ? 'status' : 'system', from, to, text };
}

function ticketLabel(record) {
  return record?.ticket ? `AG-${record.ticket}` : 'AG-?';
}

// A note, optionally with a status change, posted from the ticket's "Add an update" box.
function addTicketNote(key, text, status) {
  const note = String(text).trim();
  const record = findingStatus[key];
  if (!record || !note) return;
  if (status && status !== record.status) {
    setFindingStatus(key, status, note);
    return;
  }
  const updated = { ...record, note, updates: [...(record.updates || []), ticketUpdate({ type: 'note', text: note })] };
  if (record.status === 'closed') updated.resolution = note;
  saveTicket(key, updated);
}

function setTicketField(key, field, value) {
  const record = findingStatus[key];
  const clean = String(value || '').trim();
  if (!record || (record[field] || '') === clean) return;
  const text = field === 'assignee'
    ? (clean ? `Assigned to ${clean}.` : 'Unassigned.')
    : (clean ? `Due date set to ${formatDay(clean)}.` : 'Due date removed.');
  saveTicket(key, { ...record, [field]: clean, updates: [...(record.updates || []), ticketUpdate({ type: 'system', text })] });
}

function toggleTicketStep(key, index, done, stepText) {
  const record = findingStatus[key];
  if (!record) return;
  const checked = new Set(record.checked || []);
  if (done) checked.add(index);
  else checked.delete(index);
  saveTicket(key, {
    ...record,
    checked: [...checked].sort((a, b) => a - b),
    updates: [...(record.updates || []), ticketUpdate({ type: 'step', done, text: stepText })]
  });
}

// One snapshot per calendar month; the current month is refreshed as answers change.
function recordHistory(items) {
  const open = items.filter(item => item.status !== 'closed');
  const entry = { month: monthKey(), closed: items.length - open.length };
  for (const level of SEVERITY_LEVELS) entry[level.key] = open.filter(item => severityBucket(item.priority) === level.key).length;
  const existing = riskHistory.find(item => item.month === entry.month);
  if (existing && JSON.stringify(existing) === JSON.stringify(entry)) return;
  riskHistory = [...riskHistory.filter(item => item.month !== entry.month), entry]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-24);
  persistCollection(HISTORY_STORAGE_KEY, riskHistory);
}

function markReviewed(assetId) {
  const asset = assets.find(item => item.id === assetId);
  if (!asset) return;
  assets = assets.map(item => item.id === assetId ? { ...item, lastReviewed: isoDate() } : item);
  saveAssets();
  render();
  showToast(`${asset.name} marked as reassessed. Next one due ${formatDay(addMonths(isoDate(), REVIEW_CYCLE_MONTHS))}.`);
}

const ANSWER_LABELS = {
  exposure: { label: 'Internet exposure', yes: 'Internet-facing', no: 'Not internet-facing', unknown: 'Not sure' },
  admin: { label: 'Default / shared credentials', changed: 'Individual named accounts', shared: 'Shared account in use', unknown: 'Not sure' },
  mfa: { label: 'Multi-factor authentication', yes: 'All users and admins', partial: 'Some accounts', no: 'Not enabled', unknown: 'Not sure' },
  access: { label: 'Least-privilege access', yes: 'Role-based', no: 'Broad / not grouped', unknown: 'Not sure' },
  backups: { label: 'Backups', yes: 'Configured and restore-tested', partial: 'Restore not tested', no: 'None known', unknown: 'Not sure' },
  logging: { label: 'Logging and monitoring', yes: 'Recorded and reviewed', partial: 'Irregular review', no: 'None known', unknown: 'Not sure' }
};

function renderDashboard(items) {
  const root = document.querySelector('#dashboard');
  if (!root) return;
  root.classList.toggle('is-technical', dashboardView === 'technical');
  root.querySelectorAll('[data-view]').forEach(button => {
    const selected = button.dataset.view === dashboardView;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const open = items.filter(item => item.status !== 'closed')
    .sort((a, b) => b.score - a.score || a.asset.name.localeCompare(b.asset.name));
  const closed = items.filter(item => item.status === 'closed');
  const bySeverity = key => open.filter(item => severityBucket(item.priority) === key).length;
  const urgent = bySeverity('critical') + bySeverity('high');
  const reviews = assets.map(asset => ({ asset, review: reviewStatus(asset) }));
  const reviewsDue = reviews.filter(item => item.review.key !== 'current');
  const overdue = reviews.filter(item => ['overdue', 'never'].includes(item.review.key)).length;
  const closedShare = items.length ? Math.round(closed.length / items.length * 100) : 0;

  document.querySelector('#dash-asof').textContent = `As of ${formatDay(isoDate())} · ${items.length} risks found across ${assets.length} systems`;

  const top = open[0];
  const critical = bySeverity('critical');
  const headline = document.querySelector('#dash-headline');
  headline.className = `dash-headline headline-${top ? (critical ? 'critical' : 'open') : 'clear'}`;
  headline.innerHTML = top
    ? `<span class="headline-icon" aria-hidden="true">!</span>
      <div class="headline-body">
        <p class="headline-count"><strong>${urgent}</strong> urgent risk${urgent === 1 ? '' : 's'} need${urgent === 1 ? 's' : ''} attention</p>
        <ul class="headline-points">
          <li><strong>${critical} critical</strong> (act now) · ${bySeverity('high')} high (next up)</li>
          <li>Most urgent: “${escapeHtml(top.rule.title)}” on <strong>${escapeHtml(top.asset.name)}</strong></li>
          ${reviewsDue.length ? `<li>${reviewsDue.length} system${reviewsDue.length === 1 ? '' : 's'} due for reassessment</li>` : ''}
        </ul>
      </div>
      <a class="button headline-action" href="risks.html">Fix these first <span aria-hidden="true">→</span></a>`
    : `<span class="headline-icon" aria-hidden="true">✓</span><div class="headline-body"><p class="headline-count"><strong>No open risks</strong></p><ul class="headline-points"><li>Everything found so far has been closed.</li><li>Reassess each system every ${REVIEW_CYCLE_MONTHS} months.</li></ul></div>`;

  const listNames = (names, empty) => names.length
    ? `<ul>${names.slice(0, 5).map(name => `<li>${escapeHtml(name)}</li>`).join('')}${names.length > 5 ? `<li class="kpi-more">+${names.length - 5} more</li>` : ''}</ul>`
    : `<p>${escapeHtml(empty)}</p>`;
  const openBySystem = assets.map(asset => ({ asset, count: open.filter(item => item.asset.id === asset.id).length }))
    .filter(entry => entry.count).sort((a, b) => b.count - a.count);
  const recentClosed = closed.filter(item => item.record?.closedAt).sort((a, b) => b.record.closedAt.localeCompare(a.record.closedAt));
  const kpis = [
    {
      id: 'systems', label: 'Systems and devices', value: assets.length + networkNodes.length + vendors.length,
      hint: `${assets.length} systems · ${networkNodes.length} devices · ${vendors.length} vendors`,
      details: `<p class="kpi-pop-lead">Everything your business runs on. The more you list, the more gaps we can spot.</p>
        <h4>${assets.length} systems <small>we run the security checks on these</small></h4>${listNames(assets.map(asset => asset.name), 'None yet — add one in the inventory.')}
        <h4>${networkNodes.length} devices <small>equipment on your connections map, like tablets and gateways</small></h4>${listNames(networkNodes.map(node => node.name), 'None yet.')}
        <h4>${vendors.length} vendors <small>outside companies you rely on</small></h4>${listNames(vendors.map(vendor => vendor.name), 'None yet.')}`
    },
    {
      id: 'open', label: 'Open risks', value: open.length,
      hint: `${open.filter(item => item.status === 'in-progress').length} being fixed now`,
      details: `<p class="kpi-pop-lead">Security gaps that are not fixed yet.</p>
        <ul class="kpi-levels">${SEVERITY_LEVELS.map(level => `<li><span class="severity-pill severity-${level.key}">${level.name}</span> ${bySeverity(level.key)} · ${escapeHtml(level.plain.toLowerCase())}</li>`).join('')}</ul>
        <h4>Where they are</h4>${listNames(openBySystem.map(entry => `${entry.asset.name} — ${entry.count}`), 'No open risks.')}`
    },
    {
      id: 'closed', label: 'Closed', value: closed.length, hint: `${closedShare}% of all risks found`,
      meter: closedShare,
      details: `<p class="kpi-pop-lead">Gaps that have been fixed. A risk closes when you mark it closed, or on its own when your updated answers show the fix.</p>
        <h4>Most recent</h4>${listNames(recentClosed.map(item => `${item.rule.title} — ${item.asset.name}`), 'Nothing closed yet.')}`
    },
    {
      id: 'reviews', label: 'Reassessments due', value: reviewsDue.length, hint: `${overdue} overdue or never checked`,
      details: `<p class="kpi-pop-lead">Answers go stale. Re-check each system every ${REVIEW_CYCLE_MONTHS} months so the advice stays right.</p>
        <h4>Due now or soon</h4>${listNames(reviewsDue.map(entry => `${entry.asset.name} — ${entry.review.label.toLowerCase()}`), 'Everything is up to date.')}`
    }
  ];
  document.querySelector('#dash-kpis').innerHTML = kpis.map((kpi, index) => `
    <article class="summary-card kpi-card${index === kpis.length - 1 ? ' kpi-card-end' : ''}" tabindex="0" aria-describedby="kpi-pop-${kpi.id}">
      <div class="summary-label">${escapeHtml(kpi.label)} <span class="kpi-info" aria-hidden="true">ⓘ</span></div>
      <div class="summary-value">${kpi.value}</div>
      <div class="summary-hint">${escapeHtml(kpi.hint)}</div>
      ${kpi.meter !== undefined ? `<div class="kpi-meter" aria-hidden="true"><span style="width:${kpi.meter}%"></span></div>` : ''}
      <div class="kpi-pop" id="kpi-pop-${kpi.id}" role="tooltip">${kpi.details}</div>
    </article>`).join('');

  renderSeverityBreakdown(items);
  renderTrend();
  renderSystemsAtGlance(items);
  renderTopRisks(open);
  renderReviews(reviews);
  renderDevices();
  renderActivity(items);
}

function renderSeverityBreakdown(items) {
  const rows = SEVERITY_LEVELS.map(level => {
    const levelItems = items.filter(item => severityBucket(item.priority) === level.key);
    const closed = levelItems.filter(item => item.status === 'closed').length;
    return { level, open: levelItems.length - closed, closed, total: levelItems.length };
  });
  const max = Math.max(1, ...rows.map(row => row.total));
  document.querySelector('#dash-severity').innerHTML = `
    <div class="chart-legend" aria-hidden="true"><span><i class="swatch swatch-open"></i>Open (colour shows severity)</span><span><i class="swatch swatch-closed"></i>Closed</span></div>
    <div class="severity-rows">${rows.map(({ level, open, closed, total }) => `
      <div class="severity-row severity-${level.key}" title="${level.name}: ${open} open, ${closed} closed">
        <div class="severity-row-label"><strong>${level.name}</strong><small class="plain-only">${level.plain}</small><small class="tech-only">${level.range}</small></div>
        <div class="severity-bar" role="img" aria-label="${level.name}: ${open} open, ${closed} closed">
          ${open ? `<span class="bar-open" style="width:${open / max * 100}%"></span>` : ''}${closed ? `<span class="bar-closed" style="width:${closed / max * 100}%"></span>` : ''}${total ? '' : '<span class="bar-empty">None</span>'}
        </div>
        <div class="severity-row-count"><strong>${open}</strong> open<span> · ${closed} closed</span></div>
      </div>`).join('')}
    </div>`;
}

function renderTrend() {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => monthKey(new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)));
  const rows = months.map(month => ({ month, entry: riskHistory.find(item => item.month === month) }));
  const totalOf = entry => SEVERITY_LEVELS.reduce((sum, level) => sum + (entry[level.key] || 0), 0);
  const max = Math.max(5, Math.ceil(Math.max(0, ...rows.filter(row => row.entry).map(row => totalOf(row.entry))) / 5) * 5);
  const plotHeight = 150;
  // Each colour segment explains only its own risk level.
  const describeSegment = (month, entry, level) => {
    const count = entry[level.key] || 0;
    const previous = riskHistory.find(item => item.month === monthKey(new Date(parseDay(`${month}-01`).getFullYear(), parseDay(`${month}-01`).getMonth() - 1, 1)));
    const change = previous ? count - (previous[level.key] || 0) : null;
    return {
      heading: `${level.name} · ${formatMonth(month, 'long')}`,
      lines: [
        `${count} open ${level.name.toLowerCase()} risk${count === 1 ? '' : 's'}`,
        `Means: ${level.plain.toLowerCase()}`,
        change === null ? 'No earlier month to compare' : change === 0 ? 'Same as the month before' : `${Math.abs(change)} ${change < 0 ? 'fewer' : 'more'} than the month before`
      ]
    };
  };
  document.querySelector('#dash-trend').innerHTML = `
    <div class="chart-legend" aria-hidden="true">${SEVERITY_LEVELS.map(level => `<span><i class="swatch swatch-${level.key}"></i>${level.name}</span>`).join('')}</div>
    <div class="trend-chart" role="list" aria-label="Open risks by month, oldest first. Focus a colour block for details.">
      <div class="trend-grid" aria-hidden="true">${[max, max / 2, 0].map(value => `<span style="bottom:${value / max * plotHeight}px"><b>${value}</b></span>`).join('')}</div>
      ${rows.map(({ month, entry }, index) => {
        const total = entry ? totalOf(entry) : 0;
        const segments = entry ? SEVERITY_LEVELS.filter(level => entry[level.key]).reverse()
          .map(level => {
            const tip = describeSegment(month, entry, level);
            return `<span class="trend-seg swatch-${level.key}" style="flex-grow:${entry[level.key]}" tabindex="0" role="img" aria-label="${escapeHtml(`${tip.heading}: ${tip.lines.join('. ')}`)}"><span class="trend-tip" aria-hidden="true"><strong>${escapeHtml(tip.heading)}</strong>${tip.lines.map(line => `<span>${escapeHtml(line)}</span>`).join('')}</span></span>`;
          }).join('') : '';
        return `<div class="trend-col${index === rows.length - 1 ? ' is-current' : ''}" role="listitem">
          <div class="trend-bar-area">${entry
            ? `<span class="trend-total" aria-hidden="true">${total}</span><div class="trend-stack" style="height:${Math.max(total ? 4 : 0, total / max * plotHeight)}px">${segments}</div>`
            : '<span class="trend-missing">No data</span>'}</div>
          <span class="trend-month">${escapeHtml(formatMonth(month))}${index === rows.length - 1 ? ' <small>Now</small>' : ''}</span>
          <span class="trend-closed">${entry ? `✓ ${entry.closed || 0} closed` : '—'}</span>
        </div>`;
      }).join('')}
    </div>
    <details class="table-view"><summary>View as a table</summary>
      <div class="table-scroll"><table><thead><tr><th scope="col">Month</th>${SEVERITY_LEVELS.map(level => `<th scope="col">${level.name}</th>`).join('')}<th scope="col">Total open</th><th scope="col">Closed to date</th></tr></thead>
      <tbody>${rows.map(({ month, entry }) => `<tr><th scope="row">${escapeHtml(formatMonth(month, 'long'))}</th>${entry
        ? `${SEVERITY_LEVELS.map(level => `<td>${entry[level.key] || 0}</td>`).join('')}<td>${totalOf(entry)}</td><td>${entry.closed || 0}</td>`
        : `<td colspan="${SEVERITY_LEVELS.length + 2}">No snapshot</td>`}</tr>`).join('')}</tbody></table></div>
    </details>`;
}

function renderSystemsAtGlance(items) {
  const container = document.querySelector('#dash-systems');
  const openIds = new Set([...container.querySelectorAll('details[open]')].map(element => element.dataset.id));
  if (!assets.length) {
    container.innerHTML = '<div class="no-findings">No systems yet. <a href="inventory.html">Add your first technology</a> to start the assessment.</div>';
    return;
  }
  const rank = priority => SEVERITY_LEVELS.findIndex(level => level.key === severityBucket(priority));
  const rows = assets.map(asset => {
    const assetItems = items.filter(item => item.asset.id === asset.id).sort((a, b) => b.score - a.score);
    const open = assetItems.filter(item => item.status !== 'closed');
    return { asset, assetItems, open, closed: assetItems.length - open.length, worst: open.length ? Math.min(...open.map(item => rank(item.priority))) : 9 };
  }).sort((a, b) => a.worst - b.worst || b.open.length - a.open.length || a.asset.name.localeCompare(b.asset.name));

  container.innerHTML = rows.map(({ asset, assetItems, open, closed, worst }) => {
    const review = reviewStatus(asset);
    const counts = SEVERITY_LEVELS.map(level => ({ level, count: open.filter(item => severityBucket(item.priority) === level.key).length })).filter(entry => entry.count);
    return `<details class="system-row${worst === 0 ? ' is-critical' : ''}" data-id="${escapeHtml(asset.id)}"${openIds.has(asset.id) ? ' open' : ''}>
      <summary>
        <span class="system-id">${logoMark(asset.name, 'system-logo', asset.logoUrl, `${asset.name} ${asset.type} ${asset.purpose}`)}<span><strong>${escapeHtml(asset.name)}</strong><small>${escapeHtml(typeLabel(asset.type))} · ${escapeHtml(domainLabel(businessDomain(asset)))} · ${escapeHtml(capitalize(asset.criticality || 'medium'))} importance</small></span></span>
        <span class="system-severity">${worst < 9 ? severityPill(SEVERITY_LEVELS[worst].key, false) : '<span class="severity-pill severity-clear">No open risks</span>'}</span>
        <span class="system-counts">${counts.map(({ level, count }) => `<span class="count-chip severity-${level.key}">${count} ${level.name.toLowerCase()}</span>`).join('')}<span class="count-closed">${closed} closed</span></span>
        <span class="system-review">${reviewChip(asset)}</span>
        <span class="system-chevron" aria-hidden="true">›</span>
      </summary>
      <div class="system-detail">
        <div class="system-context">
          <div><span class="detail-label">What it does</span><p>${escapeHtml(asset.purpose || 'Purpose not recorded.')}</p></div>
          <div><span class="detail-label">If something goes wrong</span><p>${escapeHtml(asset.businessImpact || 'Business impact not recorded yet. Ask the owner what would stop if this system failed.')}</p></div>
          <div><span class="detail-label">Looked after by</span><p>${escapeHtml(asset.owner || 'No owner assigned')}</p></div>
        </div>
        <div class="system-risks">
          <span class="detail-label">Risks found for this system</span>
          ${assetItems.length ? `<ul>${assetItems.map(item => `<li>
            <div class="system-risk-head">${severityPill(item.priority, false)}<span class="system-risk-title">${escapeHtml(item.rule.title)}</span>${statusChip(item.status)}</div>
            <p class="plain-only">${escapeHtml(item.resolved ? item.record.resolution || 'Closed.' : item.record?.note || item.rule.why(asset))}</p>
            <p class="tech-only mono">Score ${item.score}/100 · ${escapeHtml((item.rule.controls || []).map(control => `${control} ${csfDescriptions[control] || ''}`.trim()).join('; ') || 'No control mapping')}</p>
          </li>`).join('')}</ul>` : '<p>No risks found from the details provided.</p>'}
        </div>
        <dl class="system-tech tech-only">
          <div><dt>Confidentiality / Integrity / Availability</dt><dd>${['confidentiality', 'integrity', 'availability'].map(dimension => capitalize(ciaRating(asset, dimension))).join(' / ')}</dd></div>
          <div><dt>Network zone</dt><dd>${escapeHtml(asset.zone || 'Not sure')} (${escapeHtml(zoneLabel(asset.zone))})</dd></div>
          ${Object.entries(ANSWER_LABELS).map(([key, labels]) => `<div><dt>${labels.label}</dt><dd>${escapeHtml(labels[asset[key]] || 'Not sure')}</dd></div>`).join('')}
        </dl>
        <div class="system-actions">
          <span>Last reassessed <strong>${escapeHtml(formatDay(asset.lastReviewed))}</strong>${review.due ? ` · Next <strong>${escapeHtml(formatDay(review.due))}</strong>` : ''}</span>
          <button class="button button-quiet" type="button" data-mark-reviewed="${escapeHtml(asset.id)}">Mark reassessed today</button>
          <a class="button button-quiet" href="inventory.html">Update answers in inventory</a>
        </div>
      </div>
    </details>`;
  }).join('');
  attachLogoFallbacks(container);
}

function renderTopRisks(open) {
  const container = document.querySelector('#dash-top-risks');
  if (!open.length) {
    container.innerHTML = '<div class="no-findings">No open risks. Keep your inventory answers up to date.</div>';
    return;
  }
  container.innerHTML = `<ol class="top-risks">${open.slice(0, 5).map(item => `
    <li class="top-risk severity-${severityBucket(item.priority)}">
      <div class="top-risk-head">${severityPill(item.priority)}${statusChip(item.status)}</div>
      <h4><span class="ticket-key">${escapeHtml(ticketLabel(item.record))}</span> ${escapeHtml(item.rule.title)}</h4>
      <p class="top-risk-asset">${escapeHtml(item.asset.name)} · ${escapeHtml(item.asset.owner || 'No owner assigned')}</p>
      <ul class="bullet-list"><li>${escapeHtml(item.rule.why(item.asset))}</li></ul>
      ${item.record?.note ? `<p class="top-risk-note"><strong>Update:</strong> ${escapeHtml(item.record.note)}</p>` : ''}
      <p class="tech-only mono">Score ${item.score}/100 · ${escapeHtml(item.rule.controls.join(', '))}</p>
      <button class="guide-button" type="button" data-info="finding" data-rule="${escapeHtml(item.rule.key)}" data-asset-id="${escapeHtml(item.asset.id)}">How to fix it ↗</button> <a class="guide-button ticket-link" href="risks.html?ticket=${encodeURIComponent(item.key)}">Open ticket →</a>
    </li>`).join('')}</ol>`;
}

function renderReviews(reviews) {
  const order = { never: 0, overdue: 1, soon: 2, current: 3 };
  const counts = key => reviews.filter(item => item.review.key === key).length;
  const sorted = [...reviews].sort((a, b) => order[a.review.key] - order[b.review.key] || (a.review.days ?? 0) - (b.review.days ?? 0));
  document.querySelector('#dash-reviews').innerHTML = `
    <p class="review-summary">${counts('overdue') + counts('never')} overdue or never checked · ${counts('soon')} due within 30 days · ${counts('current')} up to date</p>
    <ul class="review-list">${sorted.map(({ asset, review }) => `<li>
      <div><strong>${escapeHtml(asset.name)}</strong><small>Last reassessed ${escapeHtml(formatDay(asset.lastReviewed))}${review.due ? ` · next due ${escapeHtml(formatDay(review.due))}` : ''}</small></div>
      ${reviewChip(asset)}
      <button class="text-button" type="button" data-mark-reviewed="${escapeHtml(asset.id)}" aria-label="Mark ${escapeHtml(asset.name)} reassessed today">Mark done</button>
    </li>`).join('') || '<li>No systems to review yet.</li>'}</ul>`;
}

function renderDevices() {
  const rows = [
    ...networkNodes.map(node => ({ item: node, kind: 'Device', detail: zoneLabel(node.zone), search: `${node.name} ${node.purpose}` })),
    ...vendors.map(vendor => ({ item: vendor, kind: 'Vendor', detail: vendor.service, search: `${vendor.name} ${vendor.service}`, criticality: vendor.criticality }))
  ];
  const container = document.querySelector('#dash-devices');
  container.innerHTML = rows.length ? `<ul class="device-list">${rows.map(({ item, kind, detail, search, criticality }) => `<li>
      ${logoMark(item.name, 'device-logo', item.logoUrl || '', search)}
      <div><strong>${escapeHtml(item.name)}</strong><small>${kind} · ${escapeHtml(detail)} · ${escapeHtml(domainLabel(businessDomain(item)))}</small></div>
      <span class="device-tags">${criticality === 'high' ? '<span class="tag critical">Key supplier</span>' : ''}<span class="tag">${item.dependencies.length} link${item.dependencies.length === 1 ? '' : 's'}</span></span>
    </li>`).join('')}</ul>` : '<p class="small-muted">No tools, technology or vendors recorded yet.</p>';
  attachLogoFallbacks(container);
}

function renderActivity(items) {
  const closed = items.filter(item => item.status === 'closed' && item.record?.closedAt)
    .sort((a, b) => b.record.closedAt.localeCompare(a.record.closedAt))
    .slice(0, 6);
  document.querySelector('#dash-activity').innerHTML = closed.length
    ? `<ul class="activity-list">${closed.map(item => `<li>
        <span class="activity-icon" aria-hidden="true">✓</span>
        <div><strong>${escapeHtml(item.rule.title)}</strong><small>${escapeHtml(item.asset.name)} · closed ${escapeHtml(formatDay(item.record.closedAt))} · ${severityLevel(item.priority).name}</small><p>${escapeHtml(item.record.resolution || 'Closed.')}</p></div>
      </li>`).join('')}</ul>`
    : '<p class="small-muted">Nothing closed yet. Update a system’s answers, or mark a risk closed in the risk plan once it is fixed.</p>';
}

function renderAssets() {
  const list = document.querySelector('#asset-list');
  if (!list) return;
  if (!assets.length) {
    list.innerHTML = `<div class="empty-state"><h3>Your inventory is ready to grow</h3><p>Add the systems your business relies on to get a tailored set of risk priorities.</p><button class="button button-dark" type="button" data-action="add">Add your first technology</button></div>`;
    return;
  }
  list.innerHTML = assets.map(asset => {
    const deps = asset.dependencies.map(id => topologyItems().find(item => item.id === id)).filter(Boolean);
    return `<article class="asset-card">
      <div class="asset-card-top">
        ${logoMark(asset.name, 'asset-logo', asset.logoUrl, `${asset.name} ${asset.type} ${asset.purpose}`)}
        <div class="asset-heading"><h3 class="asset-name">${escapeHtml(asset.name)}</h3><span class="asset-type">${escapeHtml(typeLabel(asset.type))}</span></div>
        <button class="asset-menu" type="button" data-action="edit" data-id="${escapeHtml(asset.id)}" aria-label="Edit ${escapeHtml(asset.name)}">✎</button>
      </div>
      <p class="asset-purpose">${escapeHtml(asset.purpose || 'Purpose not provided.')}</p>
      ${asset.businessImpact ? `<p class="asset-impact"><strong>If it fails:</strong> ${escapeHtml(asset.businessImpact)}</p>` : ''}
      <div class="asset-footer">
        <span class="tag ${asset.criticality === 'high' ? 'critical' : ''}">${escapeHtml(capitalize(asset.criticality))} impact</span>
        <span class="tag domain-tag domain-${businessDomain(asset)}">${escapeHtml(domainLabel(businessDomain(asset)))}</span>
        <span class="tag">${escapeHtml(zoneLabel(asset.zone))}</span>
        ${asset.exposure === 'yes' ? '<span class="tag high-exposure">Internet-facing</span>' : ''}
        ${reviewChip(asset)}
        ${dependencySummary(asset, deps)}
        <button class="asset-remove" type="button" data-action="remove" data-id="${escapeHtml(asset.id)}" aria-label="Remove ${escapeHtml(asset.name)}">Remove</button>
      </div>
    </article>`;
  }).join('');
  attachLogoFallbacks(list);
}

function dependencySummary(asset, deps) {
  if (asset.independent) return '<span class="dependency-note">Works on its own</span>';
  const names = [...deps.map(dep => dep.name), ...(asset.dependencyOther ? [asset.dependencyOther] : [])];
  return names.length ? `<span class="dependency-note">Depends on ${names.map(escapeHtml).join(', ')}</span>` : '';
}

function topologyItems() {
  return [
    ...assets.map(item => ({ ...item, kind: 'asset', purpose: item.purpose || '', zone: item.zone || 'Not sure' })),
    ...networkNodes.map(item => ({ ...item, kind: 'node' })),
    ...vendors.map(item => ({ ...item, kind: 'vendor', purpose: item.service || '' }))
  ];
}

function domainLabel(domain) {
  return domain === 'ot' ? 'Production & equipment' : domain === 'shared' ? 'Office & production' : 'Office';
}

function zoneLabel(zone) {
  return ZONE_LABELS[zone] || zone || 'Not sure';
}

function typeLabel(type) {
  return TYPE_LABELS[type] || type || 'Other';
}

function attachLogoFallbacks(container) {
  container.querySelectorAll('.entity-logo img').forEach(image => image.addEventListener('error', () => {
    image.hidden = true;
    image.nextElementSibling.hidden = false;
  }, { once: true }));
}

function renderVendors() {
  const list = document.querySelector('#vendor-list');
  if (!list) return;
  if (!vendors.length) {
    list.innerHTML = '<div class="empty-state"><h3>No third parties recorded</h3><p>Add service providers, carriers, technology partners, or other suppliers to connect them to your systems and network zones.</p></div>';
    return;
  }
  list.innerHTML = vendors.map(vendor => {
    const links = vendor.dependencies.map(id => topologyItems().find(item => item.id === id)).filter(Boolean);
    return `<article class="vendor-card">
      <div class="vendor-card-heading"><div class="vendor-identity">${logoMark(vendor.name, 'vendor-logo', vendor.logoUrl, `${vendor.name} ${vendor.service} ${vendor.access}`)}<div><span class="vendor-type-label">THIRD-PARTY PROVIDER</span><h3>${escapeHtml(vendor.name)}</h3></div></div><div class="vendor-actions"><button class="asset-menu" type="button" data-edit-vendor="${escapeHtml(vendor.id)}" aria-label="Edit ${escapeHtml(vendor.name)}">✎</button><button class="vendor-delete" type="button" data-remove-vendor="${escapeHtml(vendor.id)}">Remove</button></div></div>
      <p class="vendor-service">${escapeHtml(vendor.service)}</p>
      <span class="tag domain-tag domain-${businessDomain(vendor)}">${escapeHtml(domainLabel(businessDomain(vendor)))}</span>
      <div class="vendor-details"><span><b>Where it connects</b>${escapeHtml(zoneLabel(vendor.zone))}</span><span><b>Business criticality</b>${escapeHtml(capitalize(vendor.criticality || 'medium'))}</span><span><b>Internal contact</b>${escapeHtml(vendor.contact || 'Not assigned')}</span></div>
      ${vendor.businessImpact ? `<p class="vendor-fact"><strong>Business consequence:</strong> ${escapeHtml(vendor.businessImpact)}</p>` : ''}
      <p class="vendor-fact"><strong>Access:</strong> ${escapeHtml(vendor.access || 'Not recorded')}</p>
      <p class="vendor-fact"><strong>Data:</strong> ${escapeHtml(vendor.data || 'Not recorded')}</p>
      <p class="vendor-fact"><strong>Connected to:</strong> ${links.length ? links.map(item => escapeHtml(item.name)).join(', ') : 'No linked systems or nodes'}</p>
    </article>`;
  }).join('');
  attachLogoFallbacks(list);
}

function renderNodes() {
  const list = document.querySelector('#node-list');
  if (!list) return;
  if (!networkNodes.length) {
    list.innerHTML = '<p class="small-muted">No network nodes yet. Use Add node to describe an endpoint, server, gateway, or infrastructure component.</p>';
    return;
  }
  list.innerHTML = networkNodes.map(node => {
    const links = node.dependencies.map(id => topologyItems().find(item => item.id === id)).filter(Boolean);
    return `<article class="node-card">${logoMark(node.name, 'node-logo', '', `${node.name} ${node.purpose}`)}<div class="node-card-body"><h4>${escapeHtml(node.name)}</h4><span>${escapeHtml(zoneLabel(node.zone))} · ${escapeHtml(domainLabel(businessDomain(node)))}</span><p>${escapeHtml(node.purpose)}</p>${node.businessImpact ? `<p class="entity-impact"><strong>Consequence:</strong> ${escapeHtml(node.businessImpact)}</p>` : ''}<small>Connected to: ${links.length ? links.map(item => escapeHtml(item.name)).join(', ') : 'None recorded'}</small></div><button class="asset-menu" type="button" data-edit-node="${escapeHtml(node.id)}" aria-label="Edit ${escapeHtml(node.name)}">✎</button><button class="vendor-delete" type="button" data-remove-node="${escapeHtml(node.id)}">Remove</button></article>`;
  }).join('');
  attachLogoFallbacks(list);
}

function renderFindings(items) {
  const container = document.querySelector('#finding-list');
  if (!container) return;
  const statusMatches = (item, filter) => filter === 'all' || (filter === 'active' ? item.status !== 'closed' : item.status === filter);
  const filteredAssets = assets.filter(asset => systemFilter.includes(asset.id));
  const systemScoped = filteredAssets.length ? items.filter(item => systemFilter.includes(item.asset.id)) : items;
  for (const filter of ['active', 'open', 'in-progress', 'closed', 'all']) {
    const count = document.querySelector(`#status-count-${filter}`);
    if (count) count.textContent = systemScoped.filter(item => statusMatches(item, filter)).length;
  }
  // Severity is a sub-filter that only applies to work still to do.
  const severityRow = document.querySelector('#severity-filter');
  const severityApplies = ['active', 'open', 'in-progress'].includes(activeStatusFilter);
  if (severityRow) severityRow.hidden = !severityApplies;
  if (!severityApplies) activeFilter = 'all';
  document.querySelectorAll('.filter-tab[data-filter]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === activeFilter);
    tab.setAttribute('aria-pressed', String(tab.dataset.filter === activeFilter));
  });
  const systemNote = document.querySelector('#system-filter-note');
  if (systemNote) {
    systemNote.hidden = !filteredAssets.length;
    if (filteredAssets.length) systemNote.innerHTML = `Showing risks for <strong>${filteredAssets.map(asset => escapeHtml(asset.name)).join(', ')}</strong> only. <a href="risks.html">Show all systems</a>`;
  }
  // Board view shows every status as a column, so only the severity filter applies there.
  const board = activeRiskView === 'board';
  document.querySelectorAll('[data-risk-view]').forEach(button => {
    const selected = button.dataset.riskView === activeRiskView;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const statusTabs = document.querySelector('.status-tabs');
  if (statusTabs) statusTabs.hidden = board;
  if (board && severityRow) severityRow.hidden = false;
  const boardHost = document.querySelector('#finding-board');
  container.hidden = board;
  if (boardHost) boardHost.hidden = !board;
  const byStatus = board ? systemScoped : systemScoped.filter(item => statusMatches(item, activeStatusFilter));
  document.querySelector('#count-all').textContent = byStatus.length;
  for (const level of SEVERITY_LEVELS) {
    document.querySelector(`#count-${level.key}`).textContent = byStatus.filter(item => severityBucket(item.priority) === level.key).length;
  }
  const visible = byStatus.filter(item => activeFilter === 'all' || severityBucket(item.priority) === activeFilter);
  if (board && boardHost) {
    renderBoard(boardHost, visible);
    return;
  }
  if (!visible.length) {
    const emptyMessage = !items.length
      ? 'No issues were found in the details provided. Check the settings in each product to confirm they are correct.'
      : activeStatusFilter === 'closed' ? 'Nothing in this group has been closed yet.' : 'Nothing in this group needs attention right now.';
    container.innerHTML = `<div class="no-findings">${emptyMessage}</div>`;
    return;
  }
  container.innerHTML = visible.map(item => {
    const { asset, rule, priority, status, record } = item;
    const bucket = severityBucket(priority);
    const statusControl = item.resolved
      ? statusChip('closed')
      : `<label class="status-select">Status <select data-status-key="${escapeHtml(item.key)}">${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}"${value === status ? ' selected' : ''}>${label}</option>`).join('')}</select></label>`;
    const timeline = `Opened ${escapeHtml(formatDay(record?.openedAt))}${record?.closedAt ? ` · closed ${escapeHtml(formatDay(record.closedAt))}` : ''}`;
    return `
    <article class="finding-card severity-${bucket}${status === 'closed' ? ' is-closed' : ''}" id="ticket-${escapeHtml(item.key.replace(':', '-'))}">
      <div class="finding-rail"></div>
      <div class="finding-content">
        <div class="finding-top">
          ${severityPill(priority)}
          <div class="finding-title-wrap"><h3 class="finding-title"><span class="ticket-key">${escapeHtml(ticketLabel(record))}</span> ${escapeHtml(rule.title)}</h3><div class="finding-asset">${escapeHtml(asset.name)} · ${timeline}</div></div>
          ${statusControl}
        </div>
        ${ticketStrip(item)}
        ${item.resolved ? '' : `<div class="finding-details">
          <div><span class="detail-label">What could happen</span>${bulletList(impactPoints(asset, rule))}</div>
          <div><span class="detail-label">What to do next</span>${bulletList(actionSteps(rule).slice(0, 3))}<button class="guide-button" type="button" data-info="finding" data-rule="${escapeHtml(rule.key)}" data-asset-id="${escapeHtml(asset.id)}">See step-by-step help ↗</button></div>
        </div>`}
      </div>
    </article>`;
  }).join('');
}

function ticketSteps(item) {
  return item.resolved ? [] : actionSteps(item.rule);
}

function stepProgress(item) {
  const steps = ticketSteps(item);
  const done = (item.record?.checked || []).filter(index => index < steps.length).length;
  return { done, total: steps.length };
}

function latestPersonUpdate(record) {
  return [...(record?.updates || [])].reverse().find(update => update.author !== 'AgriGuard' && update.text && ['note', 'status'].includes(update.type));
}

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days < 1) return `today, ${new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date)}`;
  if (days < 2) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '?';
}

// The summary line on each list card: who, when, progress, and the latest update.
function ticketStrip(item) {
  const record = item.record || {};
  const progress = stepProgress(item);
  const latest = latestPersonUpdate(record);
  const count = (record.updates || []).filter(update => update.type !== 'system').length;
  const review = record.due && item.status !== 'closed' ? daysUntil(record.due) : null;
  return `<div class="ticket-strip">
      <span class="ticket-assignee"><span class="avatar" aria-hidden="true">${escapeHtml(initials(record.assignee || '?'))}</span>${escapeHtml(record.assignee || 'Unassigned')}</span>
      ${record.due ? `<span class="${review !== null && review < 0 ? 'ticket-overdue' : ''}">Due ${escapeHtml(formatDay(record.due))}${review !== null && review < 0 ? ' · overdue' : ''}</span>` : ''}
      ${progress.total ? `<span class="ticket-progress" title="${progress.done} of ${progress.total} steps done"><span class="progress-track" aria-hidden="true"><i style="width:${progress.done / progress.total * 100}%"></i></span>${progress.done}/${progress.total} steps</span>` : ''}
      <span>${count} update${count === 1 ? '' : 's'}</span>
      <button class="button button-quiet ticket-open" type="button" data-open-ticket="${escapeHtml(item.key)}">Open ticket · add update</button>
    </div>
    ${latest ? `<p class="finding-note"><strong>Latest update</strong> <span class="note-meta">${escapeHtml(latest.author)} · ${escapeHtml(formatWhen(latest.at))}</span><br>${escapeHtml(latest.text)}</p>`
      : record.resolution && item.status === 'closed' ? `<p class="finding-note"><strong>How it was closed:</strong> ${escapeHtml(record.resolution)}</p>` : ''}`;
}

function renderBoard(host, items) {
  host.innerHTML = Object.entries(STATUS_LABELS).map(([status, label]) => {
    const column = items.filter(item => item.status === status)
      .sort((a, b) => b.score - a.score);
    return `<section class="board-column board-${status}" data-drop-status="${status}" aria-label="${escapeHtml(label)}: ${column.length} tickets">
      <h3>${escapeHtml(label)} <span>${column.length}</span></h3>
      <div class="board-cards">${column.map(item => {
        const progress = stepProgress(item);
        const count = (item.record?.updates || []).filter(update => update.type !== 'system').length;
        return `<button class="board-card severity-${severityBucket(item.priority)}" type="button" data-open-ticket="${escapeHtml(item.key)}" ${item.resolved ? '' : `draggable="true" data-drag-key="${escapeHtml(item.key)}"`}>
          <span class="board-card-top"><span class="ticket-key">${escapeHtml(ticketLabel(item.record))}</span>${severityPill(item.priority, false)}</span>
          <span class="board-card-title">${escapeHtml(item.rule.title)}</span>
          <span class="board-card-system">${escapeHtml(item.asset.name)}</span>
          <span class="board-card-foot"><span class="avatar" title="${escapeHtml(item.record?.assignee || 'Unassigned')}" aria-hidden="true">${escapeHtml(initials(item.record?.assignee || '?'))}</span>${progress.total ? `<span>${progress.done}/${progress.total} steps</span>` : ''}<span>${count} update${count === 1 ? '' : 's'}</span></span>
        </button>`;
      }).join('') || '<p class="board-empty">Nothing here.</p>'}</div>
    </section>`;
  }).join('');
}

// Jira-style ticket view: checklist, activity timeline, and an "Add an update" box.
function openTicket(key) {
  const dialog = document.querySelector('#ticket-dialog');
  if (!dialog || !latestItems.some(item => item.key === key)) return;
  dialog.dataset.key = key;
  renderTicket();
  if (!dialog.open) showAccessibleDialog(dialog, dialog.querySelector('textarea[name="text"]'));
}

function renderTicket() {
  const dialog = document.querySelector('#ticket-dialog');
  const item = latestItems.find(entry => entry.key === dialog?.dataset.key);
  if (!item) return;
  const { asset, rule, record = {}, status } = item;
  const steps = ticketSteps(item);
  const checked = new Set(record.checked || []);
  const updates = [...(record.updates || [])].reverse();
  const statusOptions = Object.entries(STATUS_LABELS)
    .map(([value, label]) => `<option value="${value}"${value === status ? ' selected' : ''}>${label}</option>`).join('');
  dialog.querySelector('#ticket-key').textContent = `${ticketLabel(record)} · ${severityLevel(item.priority).name} risk`;
  dialog.querySelector('#ticket-title').textContent = rule.title;
  dialog.querySelector('#ticket-main').innerHTML = `
    <p class="ticket-system">${severityPill(item.priority)} ${statusChip(status)} <span>${escapeHtml(asset.name)}</span></p>
    ${steps.length ? `<section class="ticket-section">
      <h3>To do <span class="ticket-count">${checked.size} of ${steps.length} done</span></h3>
      <ul class="ticket-checklist">${steps.map((step, index) => `<li><label class="choice"><input type="checkbox" data-step="${index}"${checked.has(index) ? ' checked' : ''}> <span>${escapeHtml(step)}</span></label></li>`).join('')}</ul>
      <button class="guide-button" type="button" data-info="finding" data-rule="${escapeHtml(rule.key)}" data-asset-id="${escapeHtml(asset.id)}">Step-by-step help ↗</button>
    </section>` : ''}
    <section class="ticket-section">
      <h3>Add an update</h3>
      <form class="ticket-form" id="ticket-form">
        <label class="field field-full"><span class="field-label">What happened or what is next? <span class="required" aria-hidden="true">*</span></span>
          <textarea name="text" required maxlength="500" rows="3" placeholder="e.g. Called the equipment maker; they will change the shared login on Friday."></textarea>
        </label>
        <div class="ticket-form-row">
          <label class="field">Move to<select name="status"><option value="">Keep as ${escapeHtml(STATUS_LABELS[status])}</option>${Object.entries(STATUS_LABELS).filter(([value]) => value !== status && !(item.resolved && value !== 'closed')).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
          <label class="field">Your name<input name="author" maxlength="40" value="${escapeHtml(readPreference(AUTHOR_KEY, ''))}" placeholder="e.g. Quality lead"></label>
          <button class="button button-dark" type="submit">Post update</button>
        </div>
      </form>
    </section>
    <section class="ticket-section">
      <h3>Activity <span class="ticket-count">${updates.length}</span></h3>
      <ol class="activity-feed">${updates.map(update => `<li class="activity-${escapeHtml(update.type || 'note')}">
        <span class="avatar${update.author === 'AgriGuard' ? ' avatar-system' : ''}" aria-hidden="true">${update.author === 'AgriGuard' ? 'A' : escapeHtml(initials(update.author))}</span>
        <div>
          <p class="activity-meta"><strong>${escapeHtml(update.author)}</strong> <time datetime="${escapeHtml(update.at)}" title="${escapeHtml(formatDate(update.at))}">${escapeHtml(formatWhen(update.at))}</time></p>
          ${update.type === 'status' ? `<p class="activity-change">${statusChip(update.from || 'open')} <span aria-label="to">→</span> ${statusChip(update.to || 'open')}</p>` : ''}
          ${update.type === 'step' ? `<p class="activity-change">${update.done ? 'Finished a step' : 'Unticked a step'}: ${escapeHtml(update.text)}</p>` : update.text ? `<p class="activity-text">${escapeHtml(update.text)}</p>` : ''}
        </div>
      </li>`).join('') || '<li class="activity-empty">No updates yet.</li>'}</ol>
    </section>`;
  dialog.querySelector('#ticket-side').innerHTML = `
    <label class="field">Status<select data-ticket-field="status"${item.resolved ? ' disabled' : ''}>${statusOptions}</select></label>
    <label class="field">Assigned to<input data-ticket-field="assignee" maxlength="40" value="${escapeHtml(record.assignee || '')}" placeholder="${escapeHtml(asset.owner || 'Name or team')}"></label>
    <label class="field">Due date<input type="date" data-ticket-field="due" value="${escapeHtml(record.due || '')}"></label>
    <dl class="ticket-facts">
      <div><dt>System</dt><dd>${escapeHtml(asset.name)}</dd></div>
      <div><dt>Opened</dt><dd>${escapeHtml(formatDay(record.openedAt))}</dd></div>
      ${record.closedAt ? `<div><dt>Closed</dt><dd>${escapeHtml(formatDay(record.closedAt))}</dd></div>` : ''}
      <div><dt>Last update</dt><dd>${updates[0] ? escapeHtml(formatWhen(updates[0].at)) : '—'}</dd></div>
    </dl>
    ${item.resolved ? '<p class="field-hint">Closed automatically because your inventory answers now show the fix.</p>' : ''}`;
}

function afterTicketChange(message) {
  render();
  renderTicket();
  if (message) showToast(message);
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
  const metrics = document.querySelector('#operations-metrics');
  if (!metrics) return;
  const active = dispatches.filter(task => !['delivered', 'canceled'].includes(task.status));
  const disruptions = dispatches.filter(task => ['delayed', 'canceled'].includes(task.status));
  const totalDelay = dispatches.reduce((sum, task) => sum + taskDelayMinutes(task), 0);
  const openIssues = incidents.filter(issue => issue.status !== 'resolved').length;
  const estimatedCost = incidents.reduce((sum, issue) => sum + incidentOtherCosts(issue), 0);
  metrics.innerHTML = `
    <article class="summary-card"><div class="summary-label">Active dispatches</div><div class="summary-value">${active.length}</div><div class="summary-hint">Scheduled, in transit, or awaiting update</div></article>
    <article class="summary-card"><div class="summary-label">Delayed / canceled</div><div class="summary-value ${disruptions.length ? 'priority-med' : ''}">${disruptions.length}</div><div class="summary-hint">Reported dispatch tasks</div></article>
    <article class="summary-card"><div class="summary-label">Recorded delay</div><div class="summary-value">${(totalDelay / 60).toFixed(1)}<span> hrs</span></div><div class="summary-hint">Sum of known task delays; user-entered</div></article>
    <article class="summary-card"><div class="summary-label">Physical issues open</div><div class="summary-value ${openIssues ? 'priority-high' : ''}">${openIssues}</div><div class="summary-hint">Issues still being addressed</div></article>
    <article class="summary-card"><div class="summary-label">Estimated added costs</div><div class="summary-value">$${Math.round(estimatedCost).toLocaleString()}<span> CAD</span></div><div class="summary-hint">Product loss is in Financial impact above</div></article>`;

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
  const metricsElement = document.querySelector('#finance-metrics');
  if (!metricsElement) return;
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
    ['Product value tracked', money(trackedValue), 'All shipments and batches'],
    ['Product still moving', money(openValue), 'Not delivered yet'],
    ['Product thrown out', money(grossLoss), 'Spoiled or written off'],
    ['Saved or reworked', money(salvage), 'Taken off the loss'],
    ['Net product loss', money(netLoss), 'Thrown out, minus saved'],
    ['Total cost of disruptions', money(totalImpact), 'Net loss plus extra costs']
  ];
  metricsElement.innerHTML = metrics.map(([label, value, hint], index) =>
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
  if (!list) return;
  if (!dispatches.length) {
    list.innerHTML = '<div class="no-findings">No dispatch tasks recorded yet. Add a load to see its planned ETA, route link, and fallback plan.</div>';
    return;
  }
  list.innerHTML = [...dispatches].sort((a, b) => new Date(a.plannedEta) - new Date(b.plannedEta)).map(task => {
    const statusClass = ['delayed', 'canceled'].includes(task.status) ? 'issue' : task.status === 'delivered' ? 'resolved' : '';
    const delay = taskDelayMinutes(task);
    return `<article class="dispatch-card">
      <div class="dispatch-top"><div class="dispatch-identity">${logoMark(task.customer || task.name, 'dispatch-logo', task.logoUrl, `${task.customer || ''} ${task.name}`)}<div><span class="status-pill ${statusClass}">${escapeHtml(humanStatus(task.status))}</span><h4>${escapeHtml(task.name)}</h4><span class="task-customer">${escapeHtml(task.customer || 'Customer/process not specified')}</span></div></div><button class="asset-menu" type="button" data-edit-dispatch="${escapeHtml(task.id)}" aria-label="Edit ${escapeHtml(task.name)}">✎</button></div>
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
  if (!list) return;
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
  if (!host || !footnote) return;
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
  const tierNames = ['Outside companies', 'Your systems', 'Devices & equipment'];
  const tierKinds = [['vendor'], ['asset'], ['node']];
  let height;
  if (activeMap === 'topology') {
    const tierCounts = tierKinds.map(kinds => Math.max(1, ...zones.map(zone => items.filter(item => kinds.includes(item.kind) && item.zone === zone).length)));
    let y = 64;
    const tierOffsets = tierCounts.map((count, index) => {
      const top = y;
      y += count * 92 + 64;
      return top;
    });
    height = y + 12;
    items.forEach(item => {
      const tierIndex = tierKinds.findIndex(kinds => kinds.includes(item.kind));
      const zoneIndex = Math.max(0, zones.indexOf(item.zone));
      const sameGroup = items.filter(candidate => tierKinds[tierIndex].includes(candidate.kind) && candidate.zone === item.zone);
      const itemIndex = sameGroup.findIndex(candidate => candidate.id === item.id);
      positions.set(item.id, { x: zoneIndex * columnWidth + columnWidth / 2, y: tierOffsets[tierIndex] + itemIndex * 92 + nodeHeight / 2 });
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
  let markup = `<svg class="diagram-svg ${activeMap === 'topology' ? 'topology-svg' : ''}" style="width:${width}px;height:${height}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${activeMap === 'assets' ? 'Asset dependency graph' : activeMap === 'network' ? 'Network zones with connected nodes and third parties' : 'Full supply chain and network topology'}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="#98a2b3" stroke-width="1.2"/></marker><marker id="arrow-highlight" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="#d97706" stroke-width="1.6"/></marker></defs>`;
  if (activeMap === 'topology') {
    tierKinds.forEach((kinds, tierIndex) => {
      const entities = items.filter(item => kinds.includes(item.kind));
      const tierY = Math.min(...entities.map(item => positions.get(item.id).y)) - nodeHeight / 2 - 25;
      const tierHeight = Math.max(96, Math.max(...zones.map(zone => entities.filter(item => item.zone === zone).length), 1) * 92 + 36);
      markup += `<rect x="5" y="${tierY}" width="${width - 10}" height="${tierHeight}" rx="8" fill="${tierIndex % 2 ? '#ffffff' : '#f7f8fa'}" stroke="#e4e7ec"/>`;
      markup += `<text x="17" y="${tierY + 18}" fill="#5d6679" font-size="11" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(tierNames[tierIndex])}</text>`;
    });
  }
  if (activeMap !== 'assets') {
    zones.forEach((zone, index) => {
      const x = index * columnWidth + 5;
      const y = activeMap === 'topology' ? 5 : 10;
      const boxHeight = activeMap === 'topology' ? height - 10 : height - 18;
      markup += `<rect x="${x}" y="${y}" width="${columnWidth - 10}" height="${boxHeight}" rx="8" fill="none" stroke="#e4e7ec" stroke-dasharray="${activeMap === 'topology' ? '0' : '4 4'}"/>`;
      markup += `<text x="${x + 9}" y="${activeMap === 'topology' ? 43 : 31}" fill="#5d6679" font-size="11" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(zoneLabel(zone))}</text>`;
    });
  } else {
    markup += `<text x="14" y="26" fill="#5d6679" font-size="11" font-family="Segoe UI, sans-serif" font-weight="700">Your systems</text>`;
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
        markup += `<path class="dependency-link" data-source-id="${escapeHtml(item.id)}" data-target-id="${escapeHtml(dependencyId)}" d="M ${from.x} ${from.y} C ${from.x + bend * direction} ${cy}, ${to.x - bend * direction} ${cy}, ${to.x} ${to.y}" fill="none" stroke="#98a2b3" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arrow)"/>`;
      });
    });
  }
  items.forEach(item => {
    const point = positions.get(item.id);
    if (!point) return;
    const x = point.x - nodeWidth / 2;
    const y = point.y - nodeHeight / 2;
    const palettes = {
      asset: ['#ffffff', '#c7d4fb', '#2f5bea'],
      node: ['#ffffff', '#b2e3dc', '#0e9384'],
      vendor: ['#ffffff', '#d9d0fd', '#7a5af8']
    };
    const [fill, stroke, dot] = palettes[item.kind];
    const title = item.name.length > 27 ? `${item.name.slice(0, 26)}…` : item.name;
    const detailText = item.kind === 'vendor' ? item.service || item.access || 'Third-party provider'
      : item.kind === 'node' ? item.purpose : item.type || item.purpose;
    const impactText = item.businessImpact ? ` Business impact: ${item.businessImpact}` : '';
    const detail = detailText.length > 31 ? `${detailText.slice(0, 30)}…` : detailText;
    const kindLabel = item.kind === 'vendor' ? 'VENDOR' : item.kind === 'node' ? 'DEVICE' : 'SYSTEM';
    const domain = domainLabel(businessDomain(item));
    const logoUrl = resolvedLogoUrl(`${item.name} ${item.type || ''} ${item.service || ''} ${item.purpose || ''}`, item.logoUrl);
    markup += `<g class="topology-item" data-map-kind="${item.kind}" data-map-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(item.name)}, ${domain}, ${escapeHtml(zoneLabel(item.zone))}"><title>${escapeHtml(item.name)} — ${escapeHtml(detailText)} (${domain}; ${escapeHtml(zoneLabel(item.zone))}).${escapeHtml(impactText)}</title><rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" fill="${fill}" stroke="${stroke}"/><rect x="${x + 7}" y="${y + 8}" width="20" height="20" rx="4" fill="#f7f8fa" stroke="#e4e7ec"/><text x="${x + 17}" y="${y + 21}" text-anchor="middle" fill="#344054" font-size="8" font-family="Segoe UI, sans-serif" font-weight="700">${monogram(item.name)}</text>${logoUrl ? `<image class="topology-logo" href="${escapeHtml(logoUrl)}" x="${x + 8}" y="${y + 9}" width="18" height="18" preserveAspectRatio="xMidYMid meet"/>` : ''}<text x="${x + 34}" y="${y + 19}" fill="#101828" font-size="10" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(title)}</text><text x="${x + 34}" y="${y + 37}" fill="#5d6679" font-size="8" font-family="Segoe UI, sans-serif">${kindLabel} · ${domain} · ${escapeHtml(detail)}</text></g>`;
    const ticket = mapTicket(item);
    markup += ticket.href
      ? `<a class="map-ticket${ticket.critical ? ' is-critical' : ''}" href="${escapeHtml(ticket.href)}" aria-label="${escapeHtml(`${item.name}: ${ticket.label}`)}"><text x="${x + 4}" y="${y + nodeHeight + 12}" font-size="9" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(ticket.label)} →</text></a>`
      : `<text class="map-ticket-none" x="${x + 4}" y="${y + nodeHeight + 12}" font-size="9" font-family="Segoe UI, sans-serif">${escapeHtml(ticket.label)}</text>`;
  });
  if (activeMap !== 'network' && items.every(item => !item.dependencies?.length)) {
    markup += `<text x="${width / 2}" y="${height - 12}" text-anchor="middle" fill="#5d6679" font-size="10" font-family="Segoe UI, sans-serif">No dependencies recorded yet — add links when editing a node, technology, or vendor.</text>`;
  }
  markup += '</svg>';
  host.innerHTML = markup;
  footnote.textContent = activeMap === 'assets'
    ? 'Hover over or focus a system to highlight what it connects to. Lines show connections entered by you.'
    : activeMap === 'network'
      ? 'Systems, suppliers, and equipment are grouped by the area where they are used.'
      : 'Hover over or focus a system to highlight its direct connections. These links are entered by you, not detected automatically.';
}

// The risk tickets linked to one map item. Devices and vendors have no checks of their
// own, so they point to the tickets of the systems they connect to.
function mapTicket(item) {
  const linkedTo = id => topologyItems().filter(other => other.id !== id && ((other.dependencies || []).includes(id) || (topologyItems().find(entry => entry.id === id)?.dependencies || []).includes(other.id)));
  const direct = linkedTo(item.id);
  // Follow one hop through devices, so a vendor linked to a dispatch workstation reaches its systems.
  const reachable = item.kind === 'asset' ? [item] : [...direct, ...direct.filter(other => other.kind === 'node').flatMap(node => linkedTo(node.id))];
  const relatedIds = [...new Set(reachable.filter(other => other.kind === 'asset').map(other => other.id))];
  if (!relatedIds.length) return { label: 'No risk tickets linked', href: '' };
  const open = latestItems.filter(risk => relatedIds.includes(risk.asset.id) && risk.status !== 'closed');
  const critical = open.some(risk => severityBucket(risk.priority) === 'critical');
  const scope = item.kind === 'asset' ? '' : ' on linked systems';
  const label = open.length
    ? `${open.length} open risk${open.length === 1 ? '' : 's'}${scope}${critical ? ' · critical' : ''}`
    : `No open risks${scope}`;
  return { label, critical, href: `risks.html?system=${relatedIds.map(encodeURIComponent).join(',')}` };
}

function highlightMapConnections(itemId) {
  const host = document.querySelector('#diagram');
  if (!host) return;
  const entries = topologyItems();
  const selected = entries.find(item => item.id === itemId);
  if (!selected) return;
  const connectedIds = new Set([itemId, ...(selected.dependencies || [])]);
  entries.forEach(item => {
    if (item.dependencies?.includes(itemId)) connectedIds.add(item.id);
  });
  host.classList.add('has-active-connection');
  host.querySelectorAll('.topology-item').forEach(node => {
    const active = node.dataset.mapId === itemId;
    const connected = !active && connectedIds.has(node.dataset.mapId);
    node.classList.toggle('is-active', active);
    node.classList.toggle('is-connected', connected);
    node.classList.toggle('is-dimmed', !active && !connected);
  });
  host.querySelectorAll('.dependency-link').forEach(link => {
    const connected = link.dataset.sourceId === itemId || link.dataset.targetId === itemId;
    link.classList.toggle('is-connected', connected);
    link.classList.toggle('is-dimmed', !connected);
  });
  const footnote = document.querySelector('#map-footnote');
  if (footnote) footnote.textContent = `${selected.name} and its direct connections are highlighted.`;
}

function clearMapConnectionHighlight() {
  const host = document.querySelector('#diagram');
  if (!host) return;
  host.classList.remove('has-active-connection');
  host.querySelectorAll('.is-active, .is-connected, .is-dimmed').forEach(element => {
    element.classList.remove('is-active', 'is-connected', 'is-dimmed');
  });
  const footnote = document.querySelector('#map-footnote');
  if (footnote) {
    footnote.textContent = activeMap === 'assets'
      ? 'Hover over or focus a system to highlight what it connects to. Lines show connections entered by you.'
      : activeMap === 'network'
        ? 'Systems, suppliers, and equipment are grouped by the area where they are used.'
        : 'Hover over or focus a system to highlight its direct connections. These links are entered by you, not detected automatically.';
  }
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown';
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function openDialog(assetId) {
  const form = document.querySelector('#asset-form');
  form.reset();
  const asset = assets.find(item => item.id === assetId);
  fillEntitySelect(document.querySelector('#dependencies'), assetId, asset ? asset.dependencies : []);
  form.dataset.editingId = asset ? asset.id : '';
  document.querySelector('.dialog-heading h2').textContent = asset ? 'Edit technology' : 'Add a technology';
  form.querySelector('[type="submit"]').textContent = asset ? 'Save changes' : 'Add to inventory';
  form.elements.lastReviewed.max = isoDate();
  form.elements.lastReviewed.value = isoDate();
  if (asset) {
    for (const key of ['name', 'type', 'criticality', 'purpose', 'businessImpact', 'owner', 'exposure', 'admin', 'mfa', 'access', 'backups', 'logging', 'zone', 'domain', 'confidentiality', 'integrity', 'availability', 'logoUrl', 'lastReviewed']) {
      form.elements[key].value = asset[key] || '';
    }
    form.elements.domain.value = businessDomain(asset);
    for (const dimension of ['confidentiality', 'integrity', 'availability']) form.elements[dimension].value = ciaRating(asset, dimension);
    form.elements.independent.checked = Boolean(asset.independent);
    form.elements.hasOther.checked = Boolean(asset.dependencyOther);
    form.elements.dependencyOther.value = asset.dependencyOther || '';
  }
  syncDependencyChoices(form);
  showAccessibleDialog(document.querySelector('#asset-dialog'), form.elements.name);
}

function fillZoneSelect(select) {
  select.innerHTML = NETWORK_ZONES.map(zone => `<option value="${escapeHtml(zone)}">${escapeHtml(zoneLabel(zone))}</option>`).join('');
}

// Tick boxes instead of a Ctrl-click list, so anyone can pick several items.
function fillEntitySelect(container, excludedId, selected = []) {
  const kindNames = { asset: 'system', node: 'device', vendor: 'vendor' };
  const choices = topologyItems().filter(item => item.id !== excludedId);
  container.innerHTML = choices.length
    ? choices.map(item => `<label class="choice"><input type="checkbox" name="dependencies" value="${escapeHtml(item.id)}"${selected.includes(item.id) ? ' checked' : ''}> <span>${escapeHtml(item.name)} <small>${kindNames[item.kind]}</small></span></label>`).join('')
    : '<p class="field-hint">Nothing else has been added yet.</p>';
}

function syncDependencyChoices(form) {
  if (!form.elements.independent) return;
  const independent = form.elements.independent.checked;
  form.querySelectorAll('input[name="dependencies"], input[name="hasOther"]').forEach(input => {
    input.disabled = independent;
    if (independent) input.checked = false;
  });
  const other = form.elements.dependencyOther;
  other.hidden = independent || !form.elements.hasOther.checked;
  other.required = !other.hidden;
}

function openNodeDialog(nodeId) {
  const form = document.querySelector('#node-form');
  const node = networkNodes.find(item => item.id === nodeId);
  form.reset();
  form.dataset.editingId = node ? node.id : '';
  document.querySelector('#node-dialog h2').textContent = node ? 'Edit network node' : 'Add network node';
  form.querySelector('[type="submit"]').textContent = node ? 'Update node' : 'Save node';
  fillZoneSelect(form.elements.zone);
  fillEntitySelect(form.querySelector('.choice-list'), nodeId, node ? node.dependencies : []);
  if (node) {
    form.elements.name.value = node.name;
    form.elements.zone.value = node.zone;
    form.elements.domain.value = businessDomain(node);
    form.elements.purpose.value = node.purpose;
    form.elements.businessImpact.value = node.businessImpact || '';
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
  fillEntitySelect(form.querySelector('.choice-list'), vendorId, vendor ? vendor.dependencies : []);
  if (vendor) {
    for (const key of ['name', 'zone', 'service', 'businessImpact', 'access', 'data', 'criticality', 'contact', 'domain', 'logoUrl']) form.elements[key].value = vendor[key] || '';
    form.elements.domain.value = businessDomain(vendor);
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
    admin: ['One account per person', 'Separate manager access', 'Different sign-in details'],
    mfa: ['List people who sign in', 'Add a second sign-in check', 'Test account recovery'],
    access: ['Map job duties', 'Create role groups', 'Review membership'],
    backup: ['Choose critical data', 'Isolate backup', 'Test restore'],
    logging: ['Record important activity', 'Protect the records', 'Review unusual activity'],
    exposure: ['List public access', 'Restrict entry', 'Monitor changes'],
    owner: ['Name an owner', 'Assign approvals', 'Review changes']
  })[ruleKey] || ['Confirm system', 'Apply safeguard', 'Verify result'];
  return `<figure class="guide-illustration" role="img" aria-label="Implementation flow for ${escapeHtml(assetName)}: ${steps.map(escapeHtml).join(', ')}">
    <svg viewBox="0 0 720 154" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M172 75H264M418 75H510" stroke="#c7d4fb" stroke-width="3" stroke-dasharray="5 5"/>
      ${steps.map((step, index) => {
        const x = 18 + index * 246;
        const color = ['#ffffff', '#ffffff', '#ffffff'][index];
        const label = `${String(index + 1).padStart(2, '0')}  ${step}`;
        return `<g><rect x="${x}" y="28" width="190" height="92" rx="12" fill="${color}" stroke="#e4e7ec"/><circle cx="${x + 27}" cy="55" r="13" fill="#2f5bea"/><path d="M${x + 21} 55l4 4 8-9" fill="none" stroke="#fff" stroke-width="2"/><text x="${x + 17}" y="89" fill="#101828" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700">${escapeHtml(label)}</text><text x="${x + 17}" y="105" fill="#5d6679" font-family="Segoe UI, sans-serif" font-size="9">${index === 0 ? 'Plan with the system owner' : index === 1 ? 'Apply in system settings' : 'Record what changed'}</text></g>`;
      }).join('')}
    </svg>
    <figcaption>The three steps for ${escapeHtml(assetName)}. Your screens may look different.</figcaption>
  </figure>`;
}

function implementationSteps(ruleKey, asset) {
  const microsoft = /microsoft|entra|active directory|\bad\b/i.test(`${asset.name} ${asset.type}`);
  const product = escapeHtml(asset.name || 'this system');
  const steps = ({
    admin: microsoft
      ? [`In your Microsoft sign-in management page or Windows account tools, find the accounts that can change settings for ${product}.`, 'Give each person their own work account and create separate accounts for people who manage settings.', 'Change setup passwords, save different strong passwords safely, add a second sign-in check for managers, and test account recovery.', 'Review who can manage accounts with the system owner and note who approved the list.']
      : [`Open ${product}'s settings and find accounts that can make important changes.`, 'Give each person their own work account and separate accounts to manage settings.', 'Change setup passwords, save different strong passwords in an approved password manager, add a second sign-in check for managers, and test account recovery.', 'Choose who reviews manager access and check it when staff or suppliers change.'],
    mfa: [`List everyone who signs in to ${product}, including managers and suppliers.`, 'Turn on a second sign-in check for everyone, starting with managers and people working remotely.', 'Try it with a small group and confirm they can still get help if they lose access to a device.', 'Review sign-in history for accounts that do not have the extra check and record any approved exceptions.'],
    access: microsoft
      ? ['List the jobs that use this system, such as dispatch, receiving, production, quality, or finance.', 'In Microsoft account settings, group people by job and give each group a clear name and a person responsible for it.', 'Give each group only the access it needs; keep everyday work separate from account-management tasks.', 'Test access with a sample account, remove anything not needed, and review the list when jobs change.']
      : [`List the jobs that use ${product} and the actions each job needs to take.`, 'Group people by job and give each group a clear name and a person responsible for it.', 'Give each group only the access it needs and keep everyday work separate from account-management tasks.', 'Test access with sample accounts, remove anything not needed, and review the list when jobs change.'],
    backup: [`Identify product records and operational data required to recover ${product} (e.g., lot traceability, purchase orders, recipes, and delivery commitments).`, 'Confirm backup scope, retention, encryption, and an offline/isolated recovery copy with the provider or IT owner.', 'Run a restore test in a safe location and verify records can be read and reconciled.', 'Record recovery time, owner, and the fallback process for receiving/production while restoration is underway.'],
    logging: [`Turn on records of sign-ins, manager actions, and important changes in ${product}.`, 'Save these records somewhere protected and limit who can erase them.', 'Choose someone to check the records regularly and decide which unusual activity needs follow-up.', 'Make a test change and confirm it appears in the records before relying on them.'],
    exposure: [`Check whether anyone needs to use ${product} from outside the business and list the ways they can reach it.`, 'Close access that is not needed and add a second sign-in check for approved remote access.', 'Limit manager access, keep the system updated, and review connections to other companies or services.', 'Check sign-in and change history regularly and write down how to undo a change or get help.'],
    owner: [`Name a business owner for ${product} and a technical support contact.`, 'Define who approves access, reviews vendor connections, and coordinates incident response.', 'Record an operational workaround if the system is unavailable during receiving, processing, or delivery.', 'Set a review date and update ownership when responsibilities change.']
  })[ruleKey] || [`Confirm which ${product} setting is missing with the system owner.`, 'Use the vendor documentation and current product interface to apply the change.', 'Test the change with a representative account or safe sample.', 'Record the result, evidence source, owner, and review date.'];
  return `<ol class="guide-steps">${steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
}

// Advice tailored from "What do you use it for, and why?". The local version works
// offline; when the AI endpoint is running it replaces this with a written draft.
function localAdvice(asset, rule) {
  const text = `${asset.purpose || ''} ${asset.businessImpact || ''}`.toLowerCase();
  const tips = [];
  if (/temperature|cold|fridge|freez|alarm|alert/.test(text)) tips.push('Because it sends alerts, check that alerts still reach the right person after any change.');
  if (/remote|maker|vendor|support|supplier/.test(text)) tips.push('Ask the outside company to use their own named login, and only connect when you say yes.');
  if (/line|wash|pack|production|batch|recipe/.test(text)) tips.push('Make changes between shifts, not while product is on the line.');
  if (/order|grocery|deliver|dispatch|customer/.test(text)) tips.push('Avoid changes right before a delivery window.');
  if (/finance|payroll|invoice|record|document/.test(text)) tips.push('Save a copy of important records before changing anything.');
  if (/email|staff|sign.?in|identity|files/.test(text)) tips.push('Tell staff before the change so a new sign-in step does not surprise them.');
  if (!tips.length) tips.push(actionSteps(rule)[0] || 'Start with the first step below.');
  tips.push(asset.owner ? `Ask ${asset.owner} to own this fix and set a date.` : 'Pick one person to own this fix and set a date.');
  return tips.slice(0, 4);
}

function personalAdviceMarkup(points, source) {
  const label = source === 'ai'
    ? 'Written by AI from your answers. Check it with your team before acting.'
    : 'Based on what you told us this system is for.';
  return `<h3>Advice for your business <span class="advice-badge">${source === 'ai' ? 'AI draft' : 'Personalized'}</span></h3>${bulletList(points)}<p class="advice-source">${escapeHtml(label)}</p>`;
}

async function requestPersonalAdvice(asset, rule) {
  if (!/^https?:$/.test(location.protocol) || !String(asset.purpose || '').trim()) return;
  try {
    const response = await fetch(PERSONALIZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: { name: asset.name, type: typeLabel(asset.type), usedFor: asset.purpose, ifItFails: asset.businessImpact || '', owner: asset.owner || '', area: domainLabel(businessDomain(asset)) },
        risk: { title: rule.title, why: rule.why(asset), approvedSteps: actionSteps(rule) }
      })
    });
    if (!response.ok) return;
    const result = await response.json();
    const points = Array.isArray(result.points) ? result.points.filter(point => typeof point === 'string' && point.trim()).slice(0, 5) : [];
    const target = document.querySelector('#personal-advice');
    if (points.length && target?.dataset.adviceKey === `${asset.id}:${rule.key}`) target.innerHTML = personalAdviceMarkup(points, 'ai');
  } catch (error) {
    // No AI endpoint (for example, a plain static server): keep the local advice.
  }
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
    eyebrow.textContent = 'WHY THIS MATTERS';
    title.textContent = `${rule.title} · ${asset.name}`;
    const production = businessDomain(asset) === 'ot' || businessDomain(asset) === 'shared';
    body = `${guideIllustration(rule.key, asset.name)}
      <div class="info-section"><h3>Why you are seeing this</h3>${bulletList([rule.why(asset)])}</div>
      <div class="info-section"><h3>What could happen</h3>${bulletList(impactPoints(asset, rule))}</div>
      <div class="info-section personal-advice" id="personal-advice" data-advice-key="${escapeHtml(`${asset.id}:${rule.key}`)}" aria-live="polite">${personalAdviceMarkup(localAdvice(asset, rule), 'local')}</div>
      <div class="info-section"><h3>Step by step</h3>${implementationSteps(rule.key, asset)}</div>
      <ul class="educational-callout bullet-list">
        ${production ? '<li>Plan changes with the person who runs this equipment.</li><li>Make changes when the line or cold room is not busy, and keep a paper backup plan.</li>' : '<li>Test the change on one account first.</li>'}
        <li>Menus differ by product. The picture shows the idea, not your exact screen.</li>
      </ul>`;
    requestPersonalAdvice(asset, rule);
    references = [
      ...(implementationResources[rule.key] || []),
      ...( /microsoft|entra|active directory|\bad\b/i.test(`${asset.name} ${asset.type}`) ? [microsoftVideoResource] : [])
    ];
    references = [...new Map(references.map(source => [source.url, source])).values()];
  } else if (kind === 'finance') {
    eyebrow.textContent = 'HOW THE NUMBERS WORK';
    title.textContent = 'How financial impact is calculated';
    body = `<ul class="bullet-list">
        <li><strong>Product value:</strong> the value you entered for each shipment or batch. The same goods can appear at more than one stage.</li>
        <li><strong>Net product loss:</strong> product thrown out, minus anything you saved or reworked.</li>
        <li><strong>Total impact:</strong> net product loss plus extra costs (disposal, delays, replacement trucks, other).</li>
        <li>Enter each cost once, on the issue it belongs to, so nothing is counted twice.</li>
      </ul>
      <p class="educational-callout">These are your own estimates in CAD. They are not accounting or insurance figures, and they do not prove a problem was caused by a cyber attack.</p>`;
    references = [];
  } else {
    eyebrow.textContent = kind === 'centralized' ? 'FUTURE CENTRAL OPERATIONS' : 'HOW THIS PAGE WORKS';
    title.textContent = kind === 'centralized' ? 'What a connected, company-wide version needs' : 'How to use shipment and issue records';
    body = kind === 'centralized'
      ? `<ul class="bullet-list">
          <li><strong>Company sign-in:</strong> each person signs in with their own account; each company only sees its own data.</li>
          <li><strong>Connected sources:</strong> updates come in from dispatch, truck tracking, warehouse, maintenance, and issue reports, each marked with where and when it came from.</li>
          <li><strong>Risks update themselves:</strong> when a verified fact changes, the checks rerun. A person confirms before a fix is marked done.</li>
          <li><strong>Clear numbers:</strong> every figure says whether it was measured, reported, typed in, or estimated.</li>
        </ul>
        <p class="educational-callout">This demo is not connected to anything. A real rollout needs a secure server, sign-in, data agreements, audit history, and tested recovery.</p>`
      : `<ul class="bullet-list">
          <li><strong>The journey:</strong> farm pickup → receiving → cold storage → washing and packing → grocery delivery.</li>
          <li><strong>What can go wrong:</strong> if lot, temperature, or delivery records are missing or wrong, product can spoil, be held, or miss a grocery delivery slot.</li>
          <li><strong>What to record:</strong> the affected lot, what actually happened, the backup plan, and who is handling it.</li>
          <li><strong>Delays:</strong> worked out from planned vs. actual arrival, or the delay you typed in.</li>
        </ul>
        <p class="educational-callout">The demo has no live sensor, truck, or accounting data. Always follow your own food-safety and emergency procedures.</p>`;
  }
  content.innerHTML = body;
  sources.innerHTML = references.map(source => `<a class="source-resource source-${escapeHtml(source.type || 'guide')}" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">${source.type === 'video' ? '▶' : source.type === 'training' ? '▣' : '↗'}</span> ${escapeHtml(source.label)}${source.type === 'video' ? ' · videos' : source.type === 'training' ? ' · guided training' : ''}</a>`).join('');
  showAccessibleDialog(document.querySelector('#info-dialog'), document.querySelector('#info-dialog .icon-button'));
}

bind('#add-asset-top', 'click', openDialog);
bind('#asset-list', 'click', event => {
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
bind('#asset-form', 'change', event => {
  if (['independent', 'hasOther'].includes(event.target.name)) syncDependencyChoices(event.currentTarget);
});
bind('#close-dialog', 'click', () => document.querySelector('#asset-dialog').close());
bind('#cancel-dialog', 'click', () => document.querySelector('#asset-dialog').close());
bind('#asset-form', 'submit', event => {
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
  const independent = form.elements.independent.checked;
  const selectedDependencies = independent ? [] : data.getAll('dependencies');
  const dependencyOther = !independent && form.elements.hasOther.checked ? String(data.get('dependencyOther') || '').trim() : '';
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
    dependencies: selectedDependencies,
    independent,
    dependencyOther,
    lastReviewed: data.get('lastReviewed') || ''
  };
  if (!asset.name || !asset.purpose) return;
  if (editingId) assets = assets.map(item => item.id === editingId ? asset : item);
  else assets.push(asset);
  saveAssets();
  render();
  document.querySelector('#asset-dialog').close();
  showToast(`${asset.name} ${editingId ? 'updated' : 'added'}. Risk priorities updated.`);
  document.querySelector('#inventory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
bind('#reset-demo', 'click', () => {
  assets = structuredClone(demoAssets);
  networkNodes = structuredClone(demoNodes);
  vendors = structuredClone(demoVendors);
  dispatches = structuredClone(demoDispatches);
  incidents = structuredClone(demoIncidents);
  findingStatus = demoFindingStatus();
  riskHistory = demoHistory();
  persistCollection(FINDING_STATUS_KEY, findingStatus);
  persistCollection(HISTORY_STORAGE_KEY, riskHistory);
  saveAssets();
  persistCollection(NODE_STORAGE_KEY, networkNodes);
  persistCollection(VENDOR_STORAGE_KEY, vendors);
  persistCollection(DISPATCH_STORAGE_KEY, dispatches);
  persistCollection(INCIDENT_STORAGE_KEY, incidents);
  render();
  showToast('Demo inventory, risk history, and transport records restored.');
});

bind('#add-node', 'click', () => openNodeDialog());
bind('#add-vendor', 'click', () => openVendorDialog());
bind('#node-list', 'click', event => {
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
bind('#vendor-list', 'click', event => {
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
bind('#diagram', 'click', event => {
  const item = event.target.closest('[data-map-kind]');
  if (!item) return;
  if (item.dataset.mapKind === 'node') openNodeDialog(item.dataset.mapId);
  if (item.dataset.mapKind === 'vendor') openVendorDialog(item.dataset.mapId);
  if (item.dataset.mapKind === 'asset') openDialog(item.dataset.mapId);
});
bind('#diagram', 'pointerover', event => {
  const item = event.target.closest('[data-map-id]');
  if (item) highlightMapConnections(item.dataset.mapId);
});
bind('#diagram', 'pointerout', event => {
  if (event.relatedTarget instanceof Element && event.relatedTarget.closest('[data-map-id]')) return;
  clearMapConnectionHighlight();
});
bind('#diagram', 'focusin', event => {
  const item = event.target.closest('[data-map-id]');
  if (item) highlightMapConnections(item.dataset.mapId);
});
bind('#diagram', 'focusout', event => {
  if (event.relatedTarget instanceof Element && event.relatedTarget.closest('[data-map-id]')) return;
  clearMapConnectionHighlight();
});
bind('#diagram', 'keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const item = event.target.closest('[data-map-kind]');
  if (!item) return;
  event.preventDefault();
  item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});

bind('#node-form', 'submit', event => {
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

bind('#vendor-form', 'submit', event => {
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

bind('#add-dispatch', 'click', () => openDispatchDialog());
bind('#dispatch-list', 'click', event => {
  const button = event.target.closest('[data-edit-dispatch]');
  if (button) openDispatchDialog(button.dataset.editDispatch);
  const infoButton = event.target.closest('[data-info="dispatch"]');
  if (infoButton) openInfoDialog('dispatch');
});
bind('#add-incident', 'click', () => openIncidentDialog());
bind('#incident-list', 'click', event => {
  const button = event.target.closest('[data-edit-incident]');
  if (button) openIncidentDialog(button.dataset.editIncident);
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
  document.querySelector(`#${button.dataset.close}`).close();
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => {
    const trigger = dialogTriggers.pop();
    if (trigger && trigger.isConnected && typeof trigger.focus === 'function') trigger.focus();
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
bind('#finding-list', 'click', event => {
  const button = event.target.closest('[data-info="finding"]');
  if (button) openInfoDialog('finding', button.dataset.rule, button.dataset.assetId);
  const ticketButton = event.target.closest('[data-open-ticket]');
  if (ticketButton) openTicket(ticketButton.dataset.openTicket);
});
bind('#finding-board', 'click', event => {
  const card = event.target.closest('[data-open-ticket]');
  if (card) openTicket(card.dataset.openTicket);
});
bind('#finding-board', 'dragstart', event => {
  const card = event.target.closest('[data-drag-key]');
  if (!card) return;
  event.dataTransfer.setData('text/plain', card.dataset.dragKey);
  event.dataTransfer.effectAllowed = 'move';
  card.classList.add('is-dragging');
});
bind('#finding-board', 'dragend', event => event.target.closest?.('[data-drag-key]')?.classList.remove('is-dragging'));
bind('#finding-board', 'dragover', event => {
  const column = event.target.closest('[data-drop-status]');
  if (!column) return;
  event.preventDefault();
  document.querySelectorAll('.board-column.is-drop-target').forEach(element => element !== column && element.classList.remove('is-drop-target'));
  column.classList.add('is-drop-target');
});
bind('#finding-board', 'dragleave', event => {
  const column = event.target.closest('[data-drop-status]');
  if (column && !column.contains(event.relatedTarget)) column.classList.remove('is-drop-target');
});
bind('#finding-board', 'drop', event => {
  const column = event.target.closest('[data-drop-status]');
  if (!column) return;
  event.preventDefault();
  column.classList.remove('is-drop-target');
  const key = event.dataTransfer.getData('text/plain');
  const record = findingStatus[key];
  if (!record || record.status === column.dataset.dropStatus) return;
  setFindingStatus(key, column.dataset.dropStatus);
  render();
  showToast(`${ticketLabel(record)} moved to ${STATUS_LABELS[column.dataset.dropStatus].toLowerCase()}.`);
});
document.querySelectorAll('[data-risk-view]').forEach(button => button.addEventListener('click', () => {
  activeRiskView = button.dataset.riskView;
  try {
    localStorage.setItem(RISK_VIEW_KEY, activeRiskView);
  } catch (error) {
    console.warn('Could not remember the risk plan view.', error);
  }
  render();
  showToast(activeRiskView === 'board' ? 'Board view: drag a ticket to change its status.' : 'List view.');
}));
bind('#ticket-dialog', 'submit', event => {
  const form = event.target.closest('#ticket-form');
  if (!form) return;
  event.preventDefault();
  if (!form.reportValidity()) return;
  const key = document.querySelector('#ticket-dialog').dataset.key;
  const author = form.elements.author.value.trim();
  try {
    localStorage.setItem(AUTHOR_KEY, author);
  } catch (error) {
    console.warn('Could not remember your name.', error);
  }
  const status = form.elements.status.value;
  addTicketNote(key, form.elements.text.value, status);
  afterTicketChange(status ? `Update posted and moved to ${STATUS_LABELS[status].toLowerCase()}.` : 'Update posted.');
  document.querySelector('#ticket-dialog textarea[name="text"]')?.focus();
});
bind('#ticket-dialog', 'change', event => {
  const key = document.querySelector('#ticket-dialog').dataset.key;
  const field = event.target.closest('[data-ticket-field]');
  if (field) {
    const name = field.dataset.ticketField;
    if (name === 'status') setFindingStatus(key, field.value);
    else setTicketField(key, name, field.value);
    afterTicketChange(name === 'status' ? `Moved to ${STATUS_LABELS[field.value].toLowerCase()}.` : 'Ticket updated.');
    document.querySelector(`#ticket-dialog [data-ticket-field="${name}"]`)?.focus();
    return;
  }
  const step = event.target.closest('[data-step]');
  if (step) {
    const index = Number(step.dataset.step);
    toggleTicketStep(key, index, step.checked, step.closest('label').textContent.trim());
    afterTicketChange(step.checked ? 'Step marked done.' : 'Step unticked.');
    document.querySelector(`#ticket-dialog [data-step="${index}"]`)?.focus();
  }
});
bind('#ticket-dialog', 'click', event => {
  const button = event.target.closest('[data-info="finding"]');
  if (button) openInfoDialog('finding', button.dataset.rule, button.dataset.assetId);
});
bind('#dispatch-form', 'submit', event => {
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
bind('#incident-form', 'submit', event => {
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
document.querySelectorAll('.filter-tab[data-filter]').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter-tab[data-filter]').forEach(tab => {
    tab.classList.toggle('active', tab === button);
    tab.setAttribute('aria-pressed', String(tab === button));
  });
  render();
  showToast(`${button.textContent.trim().replace(/\s+\d+$/, '')} selected.`);
}));
document.querySelectorAll('.filter-tab[data-status-filter]').forEach(button => button.addEventListener('click', () => {
  activeStatusFilter = button.dataset.statusFilter;
  document.querySelectorAll('.filter-tab[data-status-filter]').forEach(tab => {
    tab.classList.toggle('active', tab === button);
    tab.setAttribute('aria-pressed', String(tab === button));
  });
  render();
  showToast(`${button.textContent.trim().replace(/\s+\d+$/, '')} selected.`);
}));
bind('#finding-list', 'change', event => {
  const select = event.target.closest('select[data-status-key]');
  if (!select) return;
  const key = select.dataset.statusKey;
  const title = findingStatus[key]?.title || 'Risk';
  setFindingStatus(key, select.value);
  render();
  const list = document.querySelector('#finding-list');
  const sameSelect = list.querySelector(`select[data-status-key="${CSS.escape(key)}"]`);
  if (sameSelect) sameSelect.focus();
  else {
    list.tabIndex = -1;
    list.focus();
  }
  showToast(`“${title}” marked ${STATUS_LABELS[select.value].toLowerCase()}. The dashboard has been updated.`);
});
bind('#dashboard', 'click', event => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    dashboardView = viewButton.dataset.view;
    try {
      localStorage.setItem(VIEW_MODE_KEY, dashboardView);
    } catch (error) {
      console.warn('Could not remember the dashboard view.', error);
    }
    render();
    showToast(dashboardView === 'technical' ? 'Showing technical detail: scores, control mappings, and settings.' : 'Showing plain-language summaries.');
    return;
  }
  const reviewButton = event.target.closest('[data-mark-reviewed]');
  if (reviewButton) {
    const container = reviewButton.closest('[id]')?.id;
    markReviewed(reviewButton.dataset.markReviewed);
    document.querySelector(`#${container} [data-mark-reviewed="${CSS.escape(reviewButton.dataset.markReviewed)}"]`)?.focus();
    return;
  }
  const infoButton = event.target.closest('[data-info="finding"]');
  if (infoButton) openInfoDialog('finding', infoButton.dataset.rule, infoButton.dataset.assetId);
});
bind('#asset-map-tab', 'click', () => {
  activeMap = 'assets';
  updateMapTabs();
});
bind('#network-map-tab', 'click', () => {
  activeMap = 'network';
  updateMapTabs();
});
bind('#topology-map-tab', 'click', () => {
  activeMap = 'topology';
  updateMapTabs();
});

function updateMapTabs() {
  const assetTab = document.querySelector('#asset-map-tab');
  const networkTab = document.querySelector('#network-map-tab');
  const topologyTab = document.querySelector('#topology-map-tab');
  if (!assetTab || !networkTab || !topologyTab) return;
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
const ticketParam = new URLSearchParams(location.search).get('ticket');
if (ticketParam) openTicket(ticketParam);
