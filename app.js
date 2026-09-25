const STORAGE_KEY = 'agriguard-risk-planner-assets-v1';

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
    const deps = asset.dependencies.map(id => assets.find(item => item.id === id)).filter(Boolean);
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
        <div class="finding-meta"><span>NIST CSF 2.0 outcomes</span>${rule.controls.map(control => `<span class="csf-label" title="${escapeHtml(csfDescriptions[control])}">${control}</span>`).join('')}<span>${rule.controls.map(control => escapeHtml(csfDescriptions[control])).join(' · ')}</span></div>
      </div>
    </article>`).join('');
}

function renderDiagram() {
  const host = document.querySelector('#diagram');
  const footnote = document.querySelector('#map-footnote');
  if (!assets.length) {
    host.innerHTML = '<div class="diagram-empty">Add technologies to see your business map.</div>';
    return;
  }
  const zones = activeMap === 'assets'
    ? ['Inventory']
    : ['Cloud / SaaS', 'Perimeter / DMZ', 'Internal network', 'Restricted data zone', 'Remote / user devices', 'Not sure'];
  const width = Math.max(650, zones.length * 185 + 20);
  const columnWidth = width / zones.length;
  const nodeWidth = Math.min(145, columnWidth - 30);
  const positions = new Map();
  const grouped = zones.map(zone => assets.filter(asset => activeMap === 'assets' || asset.zone === zone));
  grouped.forEach((group, zoneIndex) => {
    group.forEach((asset, index) => {
      positions.set(asset.id, { x: zoneIndex * columnWidth + columnWidth / 2, y: 66 + index * 78 });
    });
  });
  const maxRows = Math.max(1, ...grouped.map(group => group.length));
  const height = Math.max(245, 90 + maxRows * 78);
  let markup = `<svg class="diagram-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${activeMap === 'assets' ? 'Asset dependency graph' : 'Systems grouped by network zone'}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="#8ba092" stroke-width="1.2"/></marker></defs>`;
  if (activeMap === 'network') {
    zones.forEach((zone, index) => {
      const x = index * columnWidth + 8;
      markup += `<rect x="${x}" y="12" width="${columnWidth - 16}" height="${height - 22}" rx="7" fill="${index % 2 ? '#f5f8f5' : '#f0f5f0'}" stroke="#e4ebe4"/>`;
      markup += `<text x="${x + 10}" y="32" fill="#63776a" font-size="10" font-family="DM Sans, sans-serif" font-weight="700">${escapeHtml(zone)}</text>`;
    });
  }
  assets.forEach(asset => {
    const from = positions.get(asset.id);
    if (!from) return;
    asset.dependencies.forEach(dependencyId => {
      const to = positions.get(dependencyId);
      if (!to) return;
      const startX = from.x;
      const startY = from.y;
      const endX = to.x;
      const endY = to.y;
      const bend = Math.max(24, Math.abs(endX - startX) * .35);
      const direction = endX >= startX ? 1 : -1;
      markup += `<path d="M ${startX} ${startY} C ${startX - bend * direction} ${startY - 20}, ${endX + bend * direction} ${endY - 20}, ${endX} ${endY}" fill="none" stroke="#94a699" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#arrow)"/>`;
    });
  });
  assets.forEach(asset => {
    const point = positions.get(asset.id);
    if (!point) return;
    const x = point.x - nodeWidth / 2;
    const y = point.y - 20;
    const fill = asset.type.includes('Network') || asset.type.includes('Cloud') ? '#edf3f5' : '#eaf3eb';
    const stroke = asset.type.includes('Network') || asset.type.includes('Cloud') ? '#d5e1e5' : '#d7e7d9';
    const name = asset.name.length > 19 ? `${asset.name.slice(0, 18)}…` : asset.name;
    markup += `<g><rect x="${x}" y="${y}" width="${nodeWidth}" height="42" rx="7" fill="${fill}" stroke="${stroke}"/><circle cx="${x + 14}" cy="${point.y + 1}" r="4" fill="${asset.type.includes('Network') || asset.type.includes('Cloud') ? '#7599a8' : '#78a982'}"/><text x="${x + 25}" y="${point.y - 1}" fill="#315144" font-size="10" font-family="DM Sans, sans-serif" font-weight="700">${escapeHtml(name)}</text><text x="${x + 25}" y="${point.y + 12}" fill="#839087" font-size="8" font-family="DM Sans, sans-serif">${escapeHtml(asset.type.length > 19 ? `${asset.type.slice(0, 18)}…` : asset.type)}</text></g>`;
  });
  if (activeMap === 'assets' && assets.every(asset => !asset.dependencies.length)) {
    markup += `<text x="${width / 2}" y="${height - 12}" text-anchor="middle" fill="#94a098" font-size="9" font-family="DM Sans, sans-serif">No dependencies recorded yet — add them in a technology’s inventory form.</text>`;
  }
  markup += '</svg>';
  host.innerHTML = markup;
  footnote.textContent = activeMap === 'assets'
    ? 'Arrows indicate declared dependencies, not verified network traffic.'
    : 'Systems are grouped by the hosting zone selected in the inventory; this is not a discovered topology.';
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
  dependencies.innerHTML = assets.filter(item => item.id !== assetId)
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
    saveAssets();
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
  saveAssets();
  render();
  showToast('Demo inventory restored.');
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

function updateMapTabs() {
  const assetTab = document.querySelector('#asset-map-tab');
  const networkTab = document.querySelector('#network-map-tab');
  assetTab.classList.toggle('active', activeMap === 'assets');
  networkTab.classList.toggle('active', activeMap === 'network');
  assetTab.setAttribute('aria-selected', String(activeMap === 'assets'));
  networkTab.setAttribute('aria-selected', String(activeMap === 'network'));
  document.querySelector('#diagram').setAttribute('aria-label', activeMap === 'assets' ? 'Asset relationship diagram' : 'Network zone diagram');
  renderDiagram();
}

render();
