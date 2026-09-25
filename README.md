# AgriGuard Risk Planner

A transportation-oriented small-business security and operational resilience MVP. It records technology, dispatch work, dependencies, and reported physical disruptions, then turns control gaps into an explainable action plan. It is a planning aid, not a live fleet system, scanner, certification, or substitute for a security professional.

## Run it

Open `index.html` in a modern browser. There is no build step, server, account, or external dependency. Inventory, dispatches, and physical issues are stored in that browser's local storage and are not sent to a server. Use **Reset demo** to restore sample records.

## MVP workflow

1. **Discover resources:** inventory dispatch, identity, fleet, telematics, routing, vendor and cargo systems. Record what each tool enables, what data/access it handles, the process that depends on it, and a fallback if it is unavailable.
2. **Follow operational work:** add dispatch tasks with cargo, origin/destination, planned and actual ETA, carrier, cancellation/delay reason, and redundancy/remediation. Route links open Google Maps directions using the entered endpoints.
3. **Record physical consequences:** track vehicle, road/weather, cargo, facility, or safety issues and the status of their remediation. Use the issue history to see what remains open and what response was taken.
4. **Learn why controls matter:** use the information popups for plain-language risk pathways, practical safeguards, and links to NIST, CISA, Transport Canada, and Google Maps documentation.
5. **Prioritize cyber gaps:** deterministic rules rank missing/unknown controls using control gap, business criticality, and internet exposure. Scores are planning signals, not quantified loss forecasts.
6. **Understand disruption statistics:** recorded delays are derived from entered arrival times or delay estimates; optional direct-impact figures are user-entered estimates. These are not audited financial values or proof of cyber causation.
7. **Visualize the supply chain:** choose the asset graph, zone view, or combined topology. Add internal nodes (zone, purpose, links) and third parties (service, access/data, connection zone, criticality, internal owner). The expanded combined map uses three readable tiers—vendors/services, business assets, and network nodes—inside the selected network zones.

## Transportation demo boundaries

The demo has no live GPS, traffic feed, dispatch integration, driver notifications, embedded Google map, automated ETA calculation, or sensor data. Google Maps directions are opened in another tab; route legality, truck restrictions, road conditions, cargo requirements, and safe operating decisions must be checked by qualified dispatchers. The operational records are manually entered and browser-local. A single event may be represented by both a dispatch and a linked physical issue; avoid summing the same delay twice. Physical-issue delay is displayed for context but not added to dispatch-delay totals. Estimated incident costs are optional, unverified CAD values.

Network nodes and vendor links are also entered manually and saved in browser-local storage. The **asset graph** shows technology assets; **network zones** groups assets, nodes, and vendors without drawing links; **full topology** places those records into vendor/service, business-asset, and network-node tiers and draws declared relationships. Click a map item or use its inventory card to edit it. Removing a node/vendor clears its declared links from other records. The diagram is an explanatory supply-chain/network view, not a discovered network topology or proof of actual access.

For a centralized production system, add authenticated company accounts, a tenant-isolated backend/database, access controls, retention/audit policy, and approved integrations. Normalize updates from a TMS/dispatch, fleet/telematics, warehouse, maintenance, and incident systems into timestamped records that retain their source and confidence. Recompute deterministic risk rules when verified facts change; task completion should be owner-confirmed and keep its audit history. Label metrics as measured, source-reported, dispatcher-entered, or estimated, and avoid double-counting linked incidents. Never treat a model-generated summary as verified telemetry, financial accounting, safety advice, or proof an incident was cyber-caused.

## Development path

1. **Validate the workflow with SMB users.** Test whether the inventory questions are understandable and whether owners can turn each finding into a practical task. Keep the first version read-only and avoid collecting secrets or configuration exports.
2. **Harden the rule-based MVP.** Version a reviewed control catalog; record evidence, confidence, assumptions, framework version, risk rationale, and recommendation provenance. Add user accounts, tenant isolation, encryption, backups, audit events, export, and a supported deployment model before storing business data centrally.
3. **Add workflow and evidence.** Let users assign owners and due dates, attest to controls, attach non-secret evidence, track remediation, and rerun assessments. Add business-context-specific threat scenarios and reviewable dependency records.
4. **Evaluate with practitioners.** Have security professionals validate every control mapping and instruction for common SMB stacks. Measure false positives, actionability, time to triage, and whether risk ranking matches expert judgment. Add regression tests for each rule and mapping.
5. **Consider a triage agent after the rules are reliable.** An agent can normalize free-text technology names, detect missing or contradictory answers, ask focused follow-up questions, and draft explanations from the approved catalog. Keep scoring and framework mapping deterministic; ground agent output in versioned sources, show citations and uncertainty, require human approval, and never let the agent change production systems. Compare agent-assisted results with the same fixed test set before enabling it.

## Triage-agent recommendation

Do **not** make an autonomous agent the first-line risk assessor. Start with deterministic, inspectable rules so users can see why a finding exists and reviewers can reproduce it. A constrained triage agent can be useful later for intake and clarification—especially when a user says “we use cloud email with a few admins” rather than selecting structured settings. Have it produce structured candidate answers and questions; require user confirmation before those answers enter the assessment. The rule engine should remain the source of risk scores, NIST mappings, and approved remediation guidance.

## Scope and framework note

The built-in rules are illustrative and intentionally product-agnostic; a technology name alone does not imply a control is missing. The user-provided posture answers drive findings. The NIST CSF 2.0 identifiers are selected outcome references, not a complete CSF implementation or a claim of compliance. Confirm product-specific setup steps in the vendor's current documentation and assess applicability with a qualified practitioner.
