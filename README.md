# AgriGuard Risk Planner

A security self risk assessment platform that helps small and mid-sized businesses take a proactive approach to reducing risk across information technology (IT) and operational technology (OT). The demo data models a food supply chain that follows perishable ingredients through supplier pickup, receiving, cold storage, processing/packaging, and delivery to grocery customers. It links technology risks to product, process, and estimated financial impact. It is a planning aid, not a live operations system, scanner, food-safety authority, accounting system, or certification.

## Example use case

The demo data models **FreshFields Foods**, a fresh-cut salad processor in Brampton, Ontario (about 60 staff). It buys lettuce and berries from Ontario farms, washes and packs them, and delivers to grocery distribution centres within hours. Its operational technology (OT) includes a cold room temperature monitor, a wash & pack line controller that the equipment maker supports remotely, refrigerated truck trackers, and receiving scanners. A missed cold-room alert, a changed line setting, or a locked dispatch system turns directly into spoiled product, under-washed product, or missed grocery deliveries.

## Run it

Run a local static web server from the repository directory (for example, `python -m http.server 8000`) and open `http://localhost:8000`. There is no build step or package dependency. The app is split across `index.html` (overview), `inventory.html`, `risks.html`, `connections.html`, and `operations.html`; `app.js` and `styles.css` provide the shared behavior and design. Serve all pages from the same origin so browser-local data is shared consistently between them. The **Sign in** link opens `login.html`, which contains sign-in and signup UI only; it does not authenticate users or save form data. Do not enter real passwords. Inventory, dispatches, and physical issues are stored in the browser's local storage and are not sent to a server. Use **Reset demo** to restore sample records.

### Optional: AI-personalized advice

The required **What do you use it for, and why?** answer drives an **Advice for your business** section in each finding's help pop-up. Without a server it is built locally from keywords in that answer (alerts, remote vendor access, production lines, deliveries, records, staff sign-in) and the named owner. To have Claude rewrite the approved fix steps for the specific business, run the included Node server instead of the static server:

```
npm install
ANTHROPIC_API_KEY=... npm start   # http://localhost:8000
```

`server/personalize.mjs` serves the site and adds `POST /api/personalize`. The API key stays on the server, the prompt is fixed server-side, and user answers are passed as data. Claude only rewords the approved steps into plain language; risk scoring and the steps themselves stay deterministic in `app.js`. The pop-up labels the result "AI draft" and asks the user to check it with their team. If the endpoint is unavailable or declines, the local advice stays in place.

## Accessibility

The prototype is designed toward Ontario AODA requirements by following WCAG 2.0 AA practices: semantic landmarks and headings, a skip link, visible keyboard focus, keyboard-operable diagrams and tabs, accessible modal names/descriptions, trapped and restored dialog focus, status announcements for changing metrics and filters, labelled form controls, and reduced-motion support. This is not a formal AODA compliance certification. Before production use, test the deployed build with NVDA or VoiceOver, keyboard-only navigation, browser zoom up to 200%, colour-contrast tooling, mobile screen readers, and representative users with disabilities.

## App workflow

The interface uses separate Overview, Inventory, Risk plan, Connections, and Operations HTML pages with standard links, rather than hiding all page content in one document.

## Security dashboard

The Overview page opens with a dashboard written for both business owners and technical staff. A **Plain language / Technical detail** switch keeps one set of data but changes the explanation: plain language shows what each risk means for the business, while technical detail adds risk scores, score bands, control mappings, CIA ratings, and the recorded security settings for each system.

- **Headline:** a large banner with the number of urgent (critical + high) risks and the most urgent one. It is solid red when any critical risk is open, black otherwise.
- **Key numbers:** systems and devices, open risks, closed risks, and reassessments due. Hover or keyboard-focus a number for what it means and what is behind it.
- **Colour rule:** red is used only for critical risks (solid pills, red-outlined cards and rows). High is black, medium and low are white with outlines, and "done" states use a small green tick. The two overview charts use a traffic-light scale: critical red, high black, medium yellow, low green, closed grey.
- **Risks by severity:** open and closed counts for Critical (Act now), High (Next up), Medium (Plan a fix), and Low (Keep an eye on it).
- **Open risks over 6 months:** one snapshot is saved per calendar month in this browser. Hover or keyboard-focus a colour segment to see that risk level alone for that month, including the change from the month before, or open the table view.
- **Systems at a glance:** each system's worst open risk, its risk count by severity, closed count, and review status. Expand a system to see what it does, what happens if it fails, who owns it, and each related risk with its status.
- **Reassessment schedule:** each system records a **Last checked** date (set in the inventory form or with **Mark done**). Reassessment is due 6 months later; systems that are overdue, due within 30 days, or never checked are flagged.
- **Most urgent open risks, recently closed, and tools, technology and vendors** add context from the risk plan and the connections map.

Each risk-plan item is a ticket (AG-1, AG-2, ...), similar to a Jira issue. Open a ticket to post an update (a note, optionally moving it to Open, In progress, or Closed), tick off its to-do steps, and set who it is assigned to and a due date. The activity timeline shows every note, status change, step, and assignment with who made it and when; automatic opens and closes from inventory answers are logged as AgriGuard. List cards show the assignee, due date, step progress, update count, and latest update. **Board** view shows Open, In progress, and Closed columns; drag a ticket between columns to change its status (the status menu inside the ticket does the same by keyboard). `risks.html?ticket=<key>` opens a ticket directly; the dashboard's urgent items link there. Updates and your name are stored in this browser only.

On the risk plan, choose a status first (for example **Open and in progress**); a severity sub-filter then narrows that list. It is hidden for closed items. Links such as `risks.html?system=cold-room` show one system's (or several comma-separated systems') tickets; each item on the connections map links to its tickets this way. Devices and vendors link to the tickets of the systems they connect to, directly or through one device.

When adding a technology, dependencies are chosen with tick boxes. **Independent** marks a system that works on its own; **Other** records a dependency that is not in the inventory yet.

Each finding has an **Open**, **In progress**, or **Closed** status that you can change on the risk plan. When updated inventory answers show that a gap is fixed, the finding closes automatically. If the gap later returns, an automatically closed finding reopens. Status, history, and review dates are browser-local like the rest of the demo; **Reset demo** restores the sample six-month history.

1. **Identify resources:** inventory business technologies, equipment, operational devices, suppliers, and vendors. Record purpose, owner, business consequence, connections, and importance to the business. Recognized brands (including Microsoft 365, Google Workspace, AWS, Cisco, SAP, Oracle, and common logistics providers) display logos automatically in inventory cards and the combined topology map using Simple Icons. A user-provided HTTPS logo URL overrides automatic recognition; unrecognized brands show generated initials. These images load from the Simple Icons CDN or the user-provided host, so the browser makes an external request.
2. **Prioritize risk:** deterministic rules assess known setup gaps, business importance, online access, and possible effects on sensitive information, accurate records, and service availability. Findings appear in plain-language groups: Act now, Next up, Plan a fix, Keep an eye on it, and Good to know. The underlying rules retain their framework mappings without showing framework identifiers in the user experience.
3. **Plan remediation:** review business-specific disruption scenarios and practical setup steps. Operational changes should be reviewed by qualified staff and tested safely before use; the prototype does not issue commands to business systems or equipment.
4. **Map connections:** view the combined topology or focus on IT, OT, or shared/vendor records. Include network zones, nodes, technologies, third parties, and declared dependencies. The map is user-entered, not network discovery.
5. **Follow operations:** the Operations page opens with **Financial impact** (product loss, salvage, and extra costs), then shipments and issues. Record shipments and batches through receiving, cold storage, processing/packaging, and grocery delivery. Log physical issues, loss, salvage, and additional estimated costs. Linked goods recorded at multiple stages may be counted more than once in throughput/pipeline totals; these are not unique inventory or revenue.
6. **Learn and improve:** finding popups include implementation guides, illustrative diagrams, official documentation, and framework references. Validate steps against the exact product, license, deployment, and business process.

## Prototype boundaries

The demo has no live ERP/TMS, accounting, GPS, traffic, cold-chain sensor, lot traceability, production, or warehouse integration. Operational, loss, and cost records are manually entered and browser-local. A single event may be represented by both a batch/shipment and a linked issue; avoid summing the same delay or cost twice. Product loss is gross written-off product value less salvage/recovered value; additional costs are separately summed. Values are optional, unverified CAD estimates.

Network nodes and vendor links are also entered manually and saved in browser-local storage. The network node inventory appears before diagram controls. **Combined**, **IT**, **OT**, and **Shared / vendors** views filter the business domains; **asset graph**, **network zones**, and **full topology** choose the map layout. Hover over or keyboard-focus a system in connection views to highlight its direct links. The map starts on combined full topology. Click a map item or use its inventory card to edit it. Removing a node/vendor clears its declared links from other records. The diagram is an explanatory supply-chain/network view, not a discovered network topology or proof of actual access.

For centralized production, add authenticated company accounts, a tenant-isolated backend/database, access controls, retention/audit policy, and approved ERP/TMS, finance, cold-chain, warehouse, and production integrations. Normalize updates into timestamped records retaining source and confidence. Recompute deterministic risk rules when verified facts change; task completion should be owner-confirmed and keep its audit history. Label metrics as measured, source-reported, user-entered, or estimated. Never treat a model-generated summary as verified telemetry, accounting, food-safety advice, or proof an incident was cyber-caused.

## Development path

1. **Validate the workflow with SMB users.** Test whether the inventory questions are understandable and whether owners can turn each finding into a practical task. Keep the first version read-only and avoid collecting secrets or configuration exports.
2. **Harden the rule-based MVP.** Version a reviewed control catalog; record evidence, confidence, assumptions, framework version, risk rationale, and recommendation provenance. Add user accounts, tenant isolation, encryption, backups, audit events, export, and a supported deployment model before storing business data centrally.
3. **Add workflow and evidence.** Let users assign owners and due dates, attest to controls, attach non-secret evidence, track remediation, and rerun assessments. Add business-context-specific threat scenarios and reviewable dependency records.
4. **Evaluate with practitioners.** Have security professionals validate every control mapping and instruction for common SMB stacks. Measure false positives, actionability, time to triage, and whether risk ranking matches expert judgment. Add regression tests for each rule and mapping.
5. **Consider a triage agent after the rules are reliable.** An agent can normalize free-text technology names, detect missing or contradictory answers, ask focused follow-up questions, and draft explanations from the approved catalog. Keep scoring and framework mapping deterministic; ground agent output in versioned sources, show citations and uncertainty, require human approval, and never let the agent change production systems. Compare agent-assisted results with the same fixed test set before enabling it.

## Triage-agent recommendation

Do **not** make an autonomous agent the first-line risk assessor. Start with deterministic, inspectable rules so users can see why a finding exists and reviewers can reproduce it. A constrained triage agent can be useful later for intake and clarification—especially when a user says “we use cloud email with a few admins” rather than selecting structured settings. Have it produce structured candidate answers and questions; require user confirmation before those answers enter the assessment. The rule engine should remain the source of risk prioritization, internal framework mappings, and approved remediation guidance.

## Scope and framework note

The built-in rules are illustrative and intentionally product-agnostic; a technology name alone does not imply a setting is wrong. The user-provided answers drive findings. Internal framework mappings support consistent recommendations but are not shown as compliance claims. Confirm product-specific setup steps in the vendor's current documentation and assess applicability with a qualified practitioner.
