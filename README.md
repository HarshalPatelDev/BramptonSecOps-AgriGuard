# AgriGuard Risk Planner

A food supply-chain security and operational resilience MVP. It follows perishable ingredients through supplier pickup, receiving, cold storage, processing/packaging, and delivery to grocery customers. It links technology risks to product, process, and estimated financial impact. It is a planning aid, not a live operations system, scanner, food-safety authority, accounting system, or certification.

## Run it

Open `index.html` in a modern browser. There is no build step, backend, real account, or external dependency. The **Sign in** link opens `login.html`, which contains sign-in and signup UI only; it does not authenticate users or save form data. Do not enter real passwords. Inventory, dispatches, and physical issues are stored in the planner browser's local storage and are not sent to a server. Use **Reset demo** to restore sample records.

## MVP workflow

1. **Discover resources:** inventory supplier, dispatch, identity, fleet, receiving, cold-storage, production, labeling, and grocery customer systems. Record what each tool enables, the lots/processes/data it touches, who can access it, and the fallback if unavailable.
2. **Follow the product:** add shipments and batches through supplier pickup, inbound transport, receiving/quality check, cold storage, processing/packaging, outbound, and grocery delivery. Record origin/destination, ETA, stage, carrier/line, and tracked product value.
3. **Record operational loss:** link a physical issue to its affected shipment or batch. Record gross product loss, salvage/recovered value, disposal/rework, delay/replacement, and other direct costs. The finance dashboard separates tracked record values from product loss and additional estimated disruption costs. Goods recorded at multiple linked stages may be counted more than once in throughput/pipeline totals; these are not unique inventory or revenue.
4. **Learn the control procedure:** each risk recommendation opens a finding- and technology-specific implementation guide, an illustrative step diagram, official documentation, framework references, and Microsoft Learn video/training resources where relevant. Validate configuration steps against the exact product, license, and deployment.
5. **Prioritize cyber gaps:** deterministic rules rank missing/unknown controls using control gap, business criticality, and internet exposure. Filter high, medium, or low findings. Scores are planning signals, not quantified loss forecasts.
6. **Understand disruption statistics:** delays are derived from entered arrival times or user estimates; product loss and direct costs are reported estimates in CAD. They are not audited financial values or proof of cyber causation.
7. **Visualize the supply chain:** choose the asset graph, zone view, or combined topology. Add internal nodes and third parties to relate business services to the network zones they touch.

## Transportation demo boundaries

The demo has no live ERP/TMS, accounting, GPS, traffic, cold-chain sensor, lot traceability, production, or warehouse integration. Operational, loss, and cost records are manually entered and browser-local. A single event may be represented by both a batch/shipment and a linked issue; avoid summing the same delay or cost twice. Product loss is gross written-off product value less salvage/recovered value; additional costs are separately summed. Values are optional, unverified CAD estimates.

Network nodes and vendor links are also entered manually and saved in browser-local storage. The network node inventory appears before the diagram controls. The **asset graph** shows technology assets; **network zones** groups assets, nodes, and vendors without drawing links; **full topology** places those records into vendor/service, business-asset, and network-node tiers and draws declared relationships. Click a map item or use its inventory card to edit it. Removing a node/vendor clears its declared links from other records. The diagram is an explanatory supply-chain/network view, not a discovered network topology or proof of actual access.

For centralized production, add authenticated company accounts, a tenant-isolated backend/database, access controls, retention/audit policy, and approved ERP/TMS, finance, cold-chain, warehouse, and production integrations. Normalize updates into timestamped records retaining source and confidence. Recompute deterministic risk rules when verified facts change; task completion should be owner-confirmed and keep its audit history. Label metrics as measured, source-reported, user-entered, or estimated. Never treat a model-generated summary as verified telemetry, accounting, food-safety advice, or proof an incident was cyber-caused.

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
