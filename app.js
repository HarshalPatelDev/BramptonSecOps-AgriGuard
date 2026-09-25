const STORAGE_KEY = 'agriguard-risk-planner-assets-v1';
const DISPATCH_STORAGE_KEY = 'agriguard-dispatch-v1';
const INCIDENT_STORAGE_KEY = 'agriguard-incidents-v1';
const NODE_STORAGE_KEY = 'agriguard-network-nodes-v1';
const VENDOR_STORAGE_KEY = 'agriguard-vendors-v1';
const NETWORK_ZONES = ['Cloud / SaaS', 'Perimeter / DMZ', 'Internal network', 'Restricted data zone', 'Remote / user devices', 'Not sure'];

const nowRounded = new Date();
nowRounded.setMinutes(0, 0, 0);
const demoTime = offsetHours => {
  const date = new Date(nowRounded.getTime() + offsetHours * 60 * 60 * 1000);
  return toLocalDateTime(date);
};

const demoDispatches = [
  {
    id: 'load-delivered', name: 'Produce delivery 1042', customer: 'North depot replenishment',
    cargo: '18 pallets of refrigerated produce', origin: 'Brampton, ON',
    destination: 'Toronto, ON', plannedEta: demoTime(-2), actualEta: demoTime(-1.5),
    vehicle: 'Truck 12 / Fleet A', status: 'delivered', delayMinutes: '',
    reason: '', redundancy: 'Backup refrigerated truck available from partner carrier.',
    remediation: 'No follow-up required; confirm delivery receipt with depot.'
  },
  {
    id: 'load-transit', name: 'Feed shipment 208', customer: 'West warehouse transfer',
    cargo: '24 tonnes of bagged livestock feed', origin: 'Brampton, ON',
    destination: 'Guelph, ON', plannedEta: demoTime(2), actualEta: '',
    vehicle: 'Truck 08 / Fleet A', status: 'in_transit', delayMinutes: '',
    reason: '', redundancy: 'Carrier B can dispatch a replacement truck within 90 minutes.',
    remediation: 'Dispatcher to confirm arrival window with receiving site.'
  },
  {
    id: 'load-canceled', name: 'Cold-chain delivery 317', customer: 'Regional grocery customer',
    cargo: '12 pallets of chilled dairy', origin: 'Brampton, ON',
    destination: 'Hamilton, ON', plannedEta: demoTime(-1), actualEta: '',
    vehicle: 'Truck 03 / Fleet A', status: 'canceled', delayMinutes: '120',
    reason: 'Refrigeration unit fault discovered before departure.',
    redundancy: 'No backup refrigerated truck confirmed at dispatch time.',
    remediation: 'Transfer load to rental reefer unit; inspect and repair Truck 03.'
  }
];

const demoIncidents = [
  {
    id: 'incident-reefer', type: 'Vehicle breakdown', severity: 'medium',
    description: 'Refrigeration unit fault delayed the chilled dairy dispatch; cargo temperature check required before release.',
    dispatchId: 'load-canceled', status: 'in_progress', delayMinutes: '120',
    estimatedCost: '450', remediation: 'Inspect refrigeration unit, document cargo temperature, and confirm replacement reefer availability.',
    createdAt: new Date().toISOString()
  }
];

const operationalSources = [
  { label: 'Google Maps URLs: open directions without an API key', url: 'https://developers.google.com/maps/documentation/urls/get-started' },
  { label: 'Transport Canada: Road safety in Canada', url: 'https://tc.canada.ca/en/road-transportation/road-safety-canada' },
  { label: 'NIST SP 800-161 Rev. 1 Update 1: Cybersecurity Supply Chain Risk Management', url: 'https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final' },
  { label: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework' }
];

const demoAssets = [
  {
    id: 'm365', name: 'Microsoft 365', type: 'Identity & access', criticality: 'high',
    purpose: 'Business email, shared files, and staff identity.', owner: 'Operations',
    exposure: 'yes', admin: 'unknown', mfa: 'partial', access: 'unknown',
    backups: 'unknown', logging: 'partial', zone: 'Cloud / SaaS', dependencies: []
  },
  {
    id: 'farm-erp', name: 'Farm operations platform', type: 'Business application', criticality: 'high',
    purpose: 'Coordinates inventory, purchasing, and daily operations.', owner: 'Farm manager',
    exposure: 'yes', admin: 'changed', mfa: 'unknown', access: 'no',
    backups: 'partial', logging: 'unknown', zone: 'Cloud / SaaS', dependencies: ['m365']
  },
  {
    id: 'nas', name: 'Office file server', type: 'Data storage', criticality: 'high',
    purpose: 'Stores finance records and internal business documents.', owner: 'Office team',
    exposure: 'no', admin: 'shared', mfa: 'no', access: 'no',
    backups: 'no', logging: 'no', zone: 'Restricted data zone', dependencies: []
  },
  {
    id: 'router', name: 'Office router & Wi-Fi', type: 'Network / infrastructure', criticality: 'medium',
    purpose: 'Connects office devices and staff to the internet.', owner: 'IT support',
    exposure: 'unknown', admin: 'unknown', mfa: 'unknown', access: 'unknown',
    backups: 'unknown', logging: 'unknown', zone: 'Perimeter / DMZ', dependencies: []
  }
];

const demoNodes = [
  { id: 'node-fw', name: 'Edge firewall', zone: 'Perimeter / DMZ', purpose: 'Filters inbound/outbound office network traffic.', dependencies: ['router'] },
  { id: 'node-dispatch', name: 'Dispatch workstation', zone: 'Internal network', purpose: 'Dispatcher assigns trucks and confirms load status.', dependencies: ['farm-erp', 'm365'] },
  { id: 'node-telematics', name: 'Fleet telematics gateway', zone: 'Perimeter / DMZ', purpose: 'Receives vehicle location and diagnostic updates.', dependencies: ['router'] },
  { id: 'node-backup', name: 'Recovery admin console', zone: 'Restricted data zone', purpose: 'Restricted access point for restoration and recovery tasks.', dependencies: ['nas'] },
  { id: 'node-yard-tablet', name: 'Yard check-in tablet', zone: 'Remote / user devices', purpose: 'Records trailer, driver, and arrival checks at the yard.', dependencies: ['node-dispatch', 'm365'] },
  { id: 'node-warehouse-terminal', name: 'Warehouse receiving terminal', zone: 'Internal network', purpose: 'Confirms received quantities and flags damaged cargo.', dependencies: ['farm-erp', 'vendor-carrier'] },
  { id: 'node-wifi-ap', name: 'Operations Wi-Fi access point', zone: 'Internal network', purpose: 'Provides staff connectivity for dispatch and receiving workflows.', dependencies: ['router', 'node-fw'] }
];

const demoVendors = [
  { id: 'vendor-carrier', name: 'Regional Freight Partner', service: 'Overflow freight and refrigerated truck capacity', zone: 'Cloud / SaaS', access: 'Receives load details and delivery windows; no internal network access.', data: 'Shipment reference, cargo class, pickup/delivery addresses, ETA', dependencies: ['node-dispatch'], criticality: 'high', contact: 'Dispatch coordinator' },
  { id: 'vendor-telematics', name: 'Fleet Telematics Provider', service: 'Vehicle location and diagnostic portal', zone: 'Perimeter / DMZ', access: 'Provider portal uses named fleet-manager accounts; integration method needs verification.', data: 'Vehicle identifiers, location, diagnostics', dependencies: ['node-telematics'], criticality: 'high', contact: 'Fleet manager' },
  { id: 'vendor-it', name: 'Managed IT Support', service: 'Endpoint and network administration', zone: 'Remote / user devices', access: 'Remote support access; review named accounts, MFA, and approval process.', data: 'Device/network configuration and support logs', dependencies: ['node-backup', 'router'], criticality: 'medium', contact: 'Operations lead' }
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
let activeMap = 'assets';
let toastTimer;

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

function assess() {
  return assets.flatMap(asset => ruleDefinitions
    .filter(rule => rule.applies(asset))
    .map(rule => {
      const criticality = asset.criticality === 'high' ? 16 : asset.criticality === 'medium' ? 8 : 0;
      const exposure = asset.exposure === 'yes' ? 9 : asset.exposure === 'unknown' ? 4 : 0;
      const score = Math.min(100, rule.base + rule.gap(asset) + criticality + exposure);
      const priority = score >= 75 ? 'high' : score >= 52 ? 'medium' : 'low';
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
  const medium = findings.filter(item => item.priority === 'medium').length;
  const topScore = findings.length ? findings[0].score : 0;
  const average = findings.length ? Math.round(findings.reduce((sum, item) => sum + item.score, 0) / findings.length) : 0;
  document.querySelector('#summary').innerHTML = `
    <article class="summary-card"><div class="summary-label">Systems inventoried</div><div class="summary-value">${assets.length}</div><div class="summary-hint">Across your business</div></article>
    <article class="summary-card"><div class="summary-label">High priority gaps</div><div class="summary-value ${high ? 'priority-high' : ''}">${high}</div><div class="summary-hint">Address these first</div></article>
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
        <div class="asset-icon" aria-hidden="true">${escapeHtml(typeIcons[asset.type] || '◇')}</div>
        <div class="asset-heading"><h3 class="asset-name">${escapeHtml(asset.name)}</h3><span class="asset-type">${escapeHtml(asset.type)}</span></div>
        <button class="asset-menu" type="button" data-action="edit" data-id="${escapeHtml(asset.id)}" aria-label="Edit ${escapeHtml(asset.name)}">✎</button>
      </div>
      <p class="asset-purpose">${escapeHtml(asset.purpose || 'Purpose not provided.')}</p>
      <div class="asset-footer">
        <span class="tag ${asset.criticality === 'high' ? 'critical' : ''}">${escapeHtml(capitalize(asset.criticality))} impact</span>
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

function renderVendors() {
  const list = document.querySelector('#vendor-list');
  if (!vendors.length) {
    list.innerHTML = '<div class="empty-state"><h3>No third parties recorded</h3><p>Add service providers, carriers, technology partners, or other suppliers to connect them to your systems and network zones.</p></div>';
    return;
  }
  list.innerHTML = vendors.map(vendor => {
    const links = vendor.dependencies.map(id => topologyItems().find(item => item.id === id)).filter(Boolean);
    return `<article class="vendor-card">
      <div class="vendor-card-heading"><div><span class="vendor-type-label">THIRD-PARTY PROVIDER</span><h3>${escapeHtml(vendor.name)}</h3></div><div class="vendor-actions"><button class="asset-menu" type="button" data-edit-vendor="${escapeHtml(vendor.id)}" aria-label="Edit ${escapeHtml(vendor.name)}">✎</button><button class="vendor-delete" type="button" data-remove-vendor="${escapeHtml(vendor.id)}">Remove</button></div></div>
      <p class="vendor-service">${escapeHtml(vendor.service)}</p>
      <div class="vendor-details"><span><b>Connection zone</b>${escapeHtml(vendor.zone)}</span><span><b>Business criticality</b>${escapeHtml(capitalize(vendor.criticality || 'medium'))}</span><span><b>Internal contact</b>${escapeHtml(vendor.contact || 'Not assigned')}</span></div>
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
    return `<article class="node-card"><div class="node-card-icon" aria-hidden="true">◈</div><div class="node-card-body"><h4>${escapeHtml(node.name)}</h4><span>${escapeHtml(node.zone)}</span><p>${escapeHtml(node.purpose)}</p><small>Connected to: ${links.length ? links.map(item => escapeHtml(item.name)).join(', ') : 'None recorded'}</small></div><button class="asset-menu" type="button" data-edit-node="${escapeHtml(node.id)}" aria-label="Edit ${escapeHtml(node.name)}">✎</button><button class="vendor-delete" type="button" data-remove-node="${escapeHtml(node.id)}">Remove</button></article>`;
  }).join('');
}

function renderFindings(findings) {
  const counts = {
    all: findings.length,
    high: findings.filter(item => item.priority === 'high').length,
    medium: findings.filter(item => item.priority === 'medium').length
  };
  document.querySelector('#count-all').textContent = counts.all;
  document.querySelector('#count-high').textContent = counts.high;
  document.querySelector('#count-medium').textContent = counts.medium;
  const visible = findings.filter(item => activeFilter === 'all' || item.priority === activeFilter);
  const container = document.querySelector('#finding-list');
  if (!visible.length) {
    container.innerHTML = `<div class="no-findings">${findings.length ? 'No findings in this priority group.' : 'No gaps identified from the answers provided. Confirm settings in each product before treating a control as verified.'}</div>`;
    return;
  }
  container.innerHTML = visible.map(({ asset, rule, score, priority }) => `
    <article class="finding-card severity-${priority}">
      <div class="finding-rail"></div>
      <div class="finding-content">
        <div class="finding-top">
          <span class="severity-pill">${priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Review'}</span>
          <div class="finding-title-wrap"><h3 class="finding-title">${escapeHtml(rule.title)}</h3><div class="finding-asset">${escapeHtml(asset.name)} · ${escapeHtml(asset.owner || 'Owner not assigned')}</div></div>
          <div class="score-block"><span class="score-value">${score}</span><span class="score-caption">Risk score</span></div>
        </div>
        <div class="finding-details">
          <div><span class="detail-label">Why it matters</span><p class="detail-copy">${escapeHtml(rule.why(asset))}</p></div>
          <div><span class="detail-label">Recommended next steps</span><p class="detail-copy recommendation">${escapeHtml(rule.action)}</p></div>
        </div>
        <div class="finding-meta"><span>NIST CSF 2.0 outcomes</span>${rule.controls.map(control => `<span class="csf-label" title="${escapeHtml(csfDescriptions[control])}">${control}</span>`).join('')}<span>${rule.controls.map(control => escapeHtml(csfDescriptions[control])).join(' · ')}</span><button class="learn-link" type="button" data-info="finding" data-rule="${escapeHtml(rule.key)}">Why this action? Sources ↗</button></div>
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
    scheduled: 'Scheduled', in_transit: 'In transit', delayed: 'Delayed',
    delivered: 'Delivered', canceled: 'Canceled',
    open: 'Open', in_progress: 'In progress', resolved: 'Resolved'
  })[status] || 'Unknown';
}

function renderOperations() {
  const active = dispatches.filter(task => !['delivered', 'canceled'].includes(task.status));
  const disruptions = dispatches.filter(task => ['delayed', 'canceled'].includes(task.status));
  const totalDelay = dispatches.reduce((sum, task) => sum + taskDelayMinutes(task), 0);
  const openIssues = incidents.filter(issue => issue.status !== 'resolved').length;
  const estimatedCost = incidents.reduce((sum, issue) => sum + (Number(issue.estimatedCost) || 0), 0);
  document.querySelector('#operations-metrics').innerHTML = `
    <article class="summary-card"><div class="summary-label">Active dispatches</div><div class="summary-value">${active.length}</div><div class="summary-hint">Scheduled, in transit, or awaiting update</div></article>
    <article class="summary-card"><div class="summary-label">Delayed / canceled</div><div class="summary-value ${disruptions.length ? 'priority-med' : ''}">${disruptions.length}</div><div class="summary-hint">Reported dispatch tasks</div></article>
    <article class="summary-card"><div class="summary-label">Recorded delay</div><div class="summary-value">${(totalDelay / 60).toFixed(1)}<span style="font-size:12px;color:#98a49d;font-weight:600"> hrs</span></div><div class="summary-hint">Sum of known task delays; user-entered</div></article>
    <article class="summary-card"><div class="summary-label">Physical issues open</div><div class="summary-value ${openIssues ? 'priority-high' : ''}">${openIssues}</div><div class="summary-hint">Issues still being addressed</div></article>
    <article class="summary-card"><div class="summary-label">Estimated direct impact</div><div class="summary-value">$${Math.round(estimatedCost).toLocaleString()}<span style="font-size:12px;color:#98a49d;font-weight:600"> CAD</span></div><div class="summary-hint">Optional user-entered estimates</div></article>`;

  renderDispatches();
  renderIncidents();
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
      <div class="dispatch-top"><div><span class="status-pill ${statusClass}">${escapeHtml(humanStatus(task.status))}</span><h4>${escapeHtml(task.name)}</h4><span class="task-customer">${escapeHtml(task.customer || 'Customer/process not specified')}</span></div><button class="asset-menu" type="button" data-edit-dispatch="${escapeHtml(task.id)}" aria-label="Edit ${escapeHtml(task.name)}">✎</button></div>
      <p class="cargo-line"><strong>Cargo:</strong> ${escapeHtml(task.cargo)}</p>
      <div class="route-line"><span>${escapeHtml(task.origin)}</span><span class="route-arrow" aria-hidden="true">→</span><span>${escapeHtml(task.destination)}</span></div>
      <div class="task-facts"><span><b>Planned ETA</b>${escapeHtml(formatDate(task.plannedEta))}</span><span><b>Actual arrival</b>${escapeHtml(task.actualEta ? formatDate(task.actualEta) : 'Not yet recorded')}</span><span><b>Truck / carrier</b>${escapeHtml(task.vehicle || 'Not assigned')}</span>${delay ? `<span><b>Recorded delay</b>${delay} minutes</span>` : ''}</div>
      ${task.reason ? `<p class="task-note"><strong>Disruption reason:</strong> ${escapeHtml(task.reason)}</p>` : ''}
      <p class="task-note"><strong>Redundancy:</strong> ${escapeHtml(task.redundancy || 'No fallback recorded')}</p>
      ${task.remediation ? `<p class="task-note"><strong>Next step:</strong> ${escapeHtml(task.remediation)}</p>` : ''}
      <div class="dispatch-actions"><a class="learn-link map-link" href="${escapeHtml(mapsDirectionsUrl(task))}" target="_blank" rel="noopener noreferrer">Open route in Google Maps ↗</a><button class="learn-link" type="button" data-info="dispatch">How to use this record? Sources ↗</button></div>
    </article>`;
  }).join('');
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
      <div class="incident-metrics">${issue.delayMinutes ? `<span>${escapeHtml(issue.delayMinutes)} min reported delay</span>` : ''}${issue.estimatedCost ? `<span>$${Number(issue.estimatedCost).toLocaleString()} CAD estimated</span>` : ''}</div>
      <p class="task-note"><strong>Remediation:</strong> ${escapeHtml(issue.remediation || 'No remediation step recorded')}</p>
      <span class="incident-date">Reported ${escapeHtml(formatDate(issue.createdAt))}</span>
    </article>`;
  }).join('');
}

function renderDiagram() {
  const host = document.querySelector('#diagram');
  const footnote = document.querySelector('#map-footnote');
  const items = activeMap === 'assets' ? topologyItems().filter(item => item.kind === 'asset') : topologyItems();
  if (!items.length) {
    host.innerHTML = '<div class="diagram-empty">Add technologies to see your business map.</div>';
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
    const detail = detailText.length > 31 ? `${detailText.slice(0, 30)}…` : detailText;
    const kindLabel = item.kind === 'vendor' ? 'VENDOR' : item.kind === 'node' ? 'NODE' : 'ASSET';
    markup += `<g class="topology-item" data-map-kind="${item.kind}" data-map-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(item.name)} in ${escapeHtml(item.zone)}"><title>${escapeHtml(item.name)} — ${escapeHtml(detailText)} (${escapeHtml(item.zone)})</title><rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" fill="${fill}" stroke="${stroke}"/><circle cx="${x + 14}" cy="${y + 16}" r="4" fill="${dot}"/><text x="${x + 25}" y="${y + 19}" fill="#315144" font-size="10" font-family="Segoe UI, sans-serif" font-weight="700">${escapeHtml(title)}</text><text x="${x + 13}" y="${y + 37}" fill="#829087" font-size="8" font-family="Segoe UI, sans-serif">${kindLabel} · ${escapeHtml(detail)}</text></g>`;
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
    for (const key of ['name', 'type', 'criticality', 'purpose', 'owner', 'exposure', 'admin', 'mfa', 'access', 'backups', 'logging', 'zone']) {
      form.elements[key].value = asset[key] || '';
    }
    [...dependencies.options].forEach(option => {
      option.selected = asset.dependencies.includes(option.value);
    });
  }
  document.querySelector('#asset-dialog').showModal();
  form.elements.name.focus();
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
    form.elements.purpose.value = node.purpose;
    [...form.elements.dependencies.options].forEach(option => { option.selected = node.dependencies.includes(option.value); });
  }
  document.querySelector('#node-dialog').showModal();
  form.elements.name.focus();
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
    for (const key of ['name', 'zone', 'service', 'access', 'data', 'criticality', 'contact']) form.elements[key].value = vendor[key] || '';
    [...form.elements.dependencies.options].forEach(option => { option.selected = vendor.dependencies.includes(option.value); });
  }
  document.querySelector('#vendor-dialog').showModal();
  form.elements.name.focus();
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
    for (const field of ['name', 'customer', 'cargo', 'origin', 'destination', 'plannedEta', 'vehicle', 'status', 'actualEta', 'delayMinutes', 'reason', 'redundancy', 'remediation']) {
      form.elements[field].value = task[field] || '';
    }
  } else {
    form.elements.plannedEta.value = demoTime(2);
  }
  document.querySelector('#dispatch-dialog').showModal();
  form.elements.name.focus();
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
    for (const field of ['type', 'severity', 'description', 'dispatchId', 'status', 'delayMinutes', 'estimatedCost', 'remediation']) {
      form.elements[field].value = issue[field] || '';
    }
  }
  document.querySelector('#incident-dialog').showModal();
  form.elements.description.focus();
}

function openInfoDialog(kind, ruleKey) {
  const title = document.querySelector('#info-title');
  const eyebrow = document.querySelector('#info-eyebrow');
  const content = document.querySelector('#info-content');
  const sources = document.querySelector('#info-sources');
  let body;
  let references = operationalSources;
  if (kind === 'finding') {
    const rule = ruleDefinitions.find(item => item.key === ruleKey);
    if (!rule) return;
    const codes = rule.controls.map(code => `${code}: ${csfDescriptions[code] || 'Related cybersecurity outcome'}`);
    eyebrow.textContent = 'UNDERSTAND THE CONTROL';
    title.textContent = rule.title;
    body = `<p><strong>Why it matters:</strong> ${escapeHtml(rule.why({ admin: 'unknown', mfa: 'unknown', access: 'unknown', backups: 'unknown', logging: 'unknown', exposure: 'unknown' }))}</p>
      <p><strong>What to do:</strong> ${escapeHtml(rule.action)}</p>
      <p><strong>Framework reference:</strong> ${codes.map(escapeHtml).join('; ')}. These are outcome references, not a claim that following one step makes the business compliant.</p>
      <p class="educational-callout">A control reduces a risk pathway; it cannot guarantee that an incident will not happen. Confirm product-specific settings and assign an owner to verify the change.</p>`;
    references = [{ label: 'NIST Cybersecurity Framework 2.0 (official)', url: 'https://www.nist.gov/cyberframework' }];
  } else {
    eyebrow.textContent = kind === 'centralized' ? 'FUTURE CENTRAL OPERATIONS' : 'TRANSPORT OPERATIONS';
    title.textContent = kind === 'centralized' ? 'What a centralized system needs' : 'How to use dispatch and disruption records';
    body = kind === 'centralized'
      ? `<p><strong>Connect the sources:</strong> a production system would authenticate company users and receive approved events from dispatch/TMS, fleet/telematics, warehouse, maintenance, and incident-reporting systems. Each update should retain its source, timestamp, affected load/asset, and whether it is automated or user reported.</p>
        <p><strong>Centralize carefully:</strong> store normalized operational records and append-only status history in a company-scoped service. Give each tenant isolated access; map a vendor/system to the process, data, vehicle, and loads it supports. Keep raw telemetry and sensitive information only when there is a defined purpose and retention period.</p>
        <p><strong>Turn updates into work:</strong> recompute deterministic risk rules when verified facts change. If a gap disappears, propose completion for an owner to confirm rather than deleting the remediation record; keep the audit trail and reopen/link a recurrence if the control later fails.</p>
        <p><strong>Make statistics explainable:</strong> label values as measured, source-system reported, dispatcher-entered, or estimated. Preserve units/time windows and avoid double-counting a dispatch delay and its linked incident. Attribute a disruption to cyber activity only when an investigation supports that conclusion.</p>
        <p class="educational-callout">This prototype is not centralized and has no connectors. A production rollout needs a secured backend, identity and authorization, integration agreements, data quality monitoring, audit/retention controls, and tested recovery.</p>`
      : `<p><strong>Resource flow:</strong> dispatch software coordinates jobs, cargo, assignments, and status. Route-planning tools help a dispatcher compare origin and destination. Telematics can provide vehicle/location signals when an actual integration exists. A backup truck or carrier is operational redundancy, not a software setting.</p>
        <p><strong>Risk pathway:</strong> an unavailable dispatch system can delay assignments; incorrect route or cargo data can send the wrong load or route; a vehicle or facility fault can affect delivery, product condition, and safety. Record the affected process, reported facts, fallback, and owner of the next action.</p>
        <p><strong>How statistics work:</strong> dispatch delay is calculated from the entered ETA/actual arrival or delay estimate. Direct-impact totals add optional user-entered incident estimates. These are descriptive records, not verified accounting or proof that cyber activity caused a physical event. A linked incident may describe the same disruption, so do not add its delay again.</p>
        <p class="educational-callout">Google Maps opens a route-planning page from the entered endpoints. This demo does not embed a live map, read GPS, calculate a reliable operational ETA, notify drivers, or ingest traffic. Dispatchers must verify routes, road conditions, vehicle restrictions, cargo handling, and applicable safety procedures.</p>`;
  }
  content.innerHTML = body;
  sources.innerHTML = references.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a>`).join('');
  document.querySelector('#info-dialog').showModal();
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
  const selectedDependencies = [...document.querySelector('#dependencies').selectedOptions].map(option => option.value);
  const editingId = form.dataset.editingId;
  const asset = {
    id: editingId || (crypto.randomUUID ? crypto.randomUUID() : `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: data.get('name').trim(),
    type: data.get('type'),
    criticality: data.get('criticality'),
    purpose: data.get('purpose').trim(),
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
    purpose: String(data.get('purpose')).trim(),
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
  const editingId = form.dataset.editingId;
  const vendor = {
    id: editingId || createId('vendor'),
    name: String(data.get('name')).trim(),
    service: String(data.get('service')).trim(),
    zone: data.get('zone'),
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
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
  openInfoDialog(button.dataset.info, button.dataset.rule);
}));
document.querySelector('#finding-list').addEventListener('click', event => {
  const button = event.target.closest('[data-info="finding"]');
  if (button) openInfoDialog('finding', button.dataset.rule);
});
document.querySelector('#dispatch-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const status = data.get('status');
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
    cargo: String(data.get('cargo')).trim(),
    origin: String(data.get('origin')).trim(),
    destination: String(data.get('destination')).trim(),
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
    estimatedCost: data.get('estimatedCost'),
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
  renderFindings(assess());
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
  document.querySelector('#diagram').setAttribute('aria-label', activeMap === 'assets' ? 'Asset relationship diagram' : activeMap === 'network' ? 'Network zone diagram' : 'Full network topology diagram');
  renderDiagram();
}

render();
