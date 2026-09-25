# AgriGuard Risk Planner

A small-business security planning MVP. It records the tools and technologies a business uses, why they are used, and a few security-relevant facts; then it turns gaps into a prioritized, explainable action plan. It is a planning aid, not a scanner, certification, or substitute for a security professional.

## Run it

Open `index.html` in a modern browser. There is no build step, server, account, or external dependency. Inventory data is stored in that browser's local storage and is not sent anywhere. Use **Reset demo** to restore the sample inventory.

## MVP workflow

1. **Discover:** inventory business applications, infrastructure, identity providers, endpoints, and data stores. For each, record its purpose, owner, business criticality, exposure, identity/access controls, backups, logging, and known dependencies.
2. **Triage:** identify missing or weak controls with transparent rules. Rank findings by an indicative 0–100 score using control-gap severity, business criticality, and internet exposure. Review the evidence and assumptions; the score is a planning signal, not a quantified loss forecast.
3. **Plan:** follow the concrete setup checklist on each finding, assign an owner, and prioritize critical/high risks first. The MVP maps suggested outcomes to a small curated set of NIST CSF 2.0 categories and subcategories.
4. **Visualize:** inspect recorded dependencies in the asset graph and network zones. These are only as complete as the inventory; links are declared business/technical dependencies, not discovered traffic paths.
5. **Review:** validate recommendations against the actual product, deployment, and business context before changing production settings. Track evidence and completion in a future version.

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
