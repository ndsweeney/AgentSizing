# Agent Sizing Workshop

A client-side React + TypeScript tool to help consultants and customers size Copilot Studio agent deployments across 8 key dimensions, providing a T-shirt size estimation and architectural recommendations.

## Project Setup
- [x] Initialize project with Vite (React + TypeScript)
- [x] Install and configure Tailwind CSS
- [x] Set up project structure (components, hooks, types, utils)
- [x] Install `lucide-react` for icons
- [x] Install `zustand` for state management
- [x] Create a basic Layout component (Header, Main, Footer)
- [x] Configure basic theme/colors in Tailwind config

## Domain Model & Scoring
- [x] Define TypeScript interfaces for the 8 dimensions
    - [x] Business scope
    - [x] Number & types of agents
    - [x] Systems to integrate
    - [x] Workflow complexity
    - [x] Data sensitivity & governance
    - [x] User reach
    - [x] Change & adoption needs
    - [x] Platform mix
- [x] Define Scoring Logic
    - [x] Create enums for Small (1), Medium (2), Large (3)
    - [x] Implement scoring function (sum of dimensions)
    - [x] Define T-shirt size thresholds (e.g., Small < 12, Medium < 20, Large >= 20)
- [x] Create a store (Zustand) to hold current assessment state

## Wizard / Questionnaire UI
- [x] Create a `Questionnaire` container component
- [x] Implement a Stepper or Tab navigation for the 8 dimensions
- [x] Create a reusable `DimensionCard` component
    - [x] Title and description of the dimension
    - [x] Radio group or selection cards for Small/Medium/Large options
    - [x] Visual feedback for selected option
- [x] Implement navigation (Next/Previous buttons)
- [x] Add validation (ensure selection before proceeding, or allow skip)
- [x] Add sidebar navigation for progress tracking

## Results & Recommendation Screen
- [x] Create a `ResultsDashboard` component
- [x] Display calculated Total Score
- [x] Display calculated T-shirt Size (S/M/L) with visual emphasis
- [x] Generate and display dynamic recommendation text based on score
- [x] Show a summary breakdown of the 8 dimensions (e.g., a radar chart or simple list)

## Agent Architecture Suggestion
- [x] Define agent patterns based on T-shirt size/complexity
    - [x] Simple FAQ/Q&A pattern
    - [x] Orchestrator pattern
    - [x] Multi-agent collaboration pattern
- [x] Create `ArchitectureView` component
- [x] Render suggested pattern (text description + placeholder for diagram/icon)

## Persistence & Export
- [x] Implement `localStorage` sync in Zustand store
    - [x] Save progress automatically
    - [x] Load previous session on startup
- [x] Add "Reset Assessment" functionality
- [x] Implement "Export to JSON" feature
- [x] Implement "Export to Markdown" feature (for copy-pasting into docs)
- [x] Add "Copy to Clipboard" for Markdown summary
- [x] Add "Import from JSON" feature (Restore session)

## v1.5 Enhancements (Now vs Target)
- [x] Update Store to support "Target Scores" and "Compare Mode"
- [x] Add "Compare Mode" toggle in Sidebar
- [x] Update Question UI to accept Current vs Target inputs
- [x] Update Results View to show Gap Analysis (Current vs Target)
- [x] Add Roadmap Suggestions based on gaps
- [x] Update Export to include comparison data
- [x] Extend results engine with structured recommendations (Architecture, Delivery, Team, Risks)

## Polish & UX
- [x] Add animations for transitions (framer-motion)
- [x] Add tooltips or "Learn More" info for each dimension
- [x] Improve transitions between wizard steps
- [x] Add empty states and error boundaries
- [x] Final code cleanup and linting
- [x] Hero Results Card with Attribute Chips
- [x] Enhanced Sidebar Styling
- [x] Interactive Question Cards

## v1.5 Enhancements (Improvements 1–6)

### 1. Multi-Scenario Support
- [x] Add a scenario manager:
  - [x] Create `scenarios` store (array of scenarios).
  - [x] Each scenario: id, name, scores, lastUpdated, createdAt.
  - [x] Add “New Scenario” button.
  - [x] Add “Duplicate Scenario”.
  - [x] Add “Delete Scenario”.
  - [x] Add UI list/dropdown for switching scenarios.
- [x] Modify sizingStore so each scenario has its own scores and step.
- [x] Ensure results view stores its results per scenario.
- [x] Persist all scenarios in localStorage.

### 2. Now vs Target Mode
- [x] Add "comparison mode":
  - [x] `currentScores` and `targetScores`.
  - [x] Toggle to enable/disable mode.
  - [x] Update DimensionQuestion to show two selectable values.
  - [x] Results view compares Current → Target.
- [x] Add gap analysis summary section.
- [x] Add roadmap suggestion section.
- [x] Update export (JSON + MD) to include comparison mode.

### 3. Enhanced Recommendation Sections
- [x] Split recommendations into:
  - [x] Architecture recommendations
  - [x] Delivery / timeline estimate
  - [x] Team composition
  - [x] Risks & controls
- [x] Build simple rules in `scoring.ts` to populate each section.
- [x] Create UI cards for each recommendation.

### 4. UX & Visual Polish
- [x] Add hero results card with:
  - [x] Big T-shirt size
  - [x] Tags (high governance, multi-system, medium change, etc.)
- [x] Add progress bar at top of wizard.
- [x] Improve sidebar styles.
- [x] Add animations (Framer Motion optional).
- [x] Improve mobile responsiveness.

### 5. Stronger Types & Rules Engine Extraction
- [x] Convert dimension IDs to `enum DimensionId`.
- [x] Replace generic `Record<string, number>` with typed record.
- [x] Move all sizing thresholds into `rules.ts`.
- [x] Move recommendation rules into `rules.ts`.
- [x] Create helper to compute agent architecture hints.

### 6. Copilot Studio-Specific Architecture Mapping
- [x] Add a “Suggested Copilot Studio Architecture” panel:
  - [x] Experience Agent count estimate
  - [x] Value Stream Agent presence
  - [x] Function Agents needed
  - [x] Process Agents count
  - [x] Task Agents estimate
  - [x] Control Agents requirements
- [x] Tie each piece back to dimension scoring rules.
- [x] Add export section containing full Copilot Studio agent spec (markdown).

## v2 – Technical Diagrams (Mermaid)

### 1. Mermaid Integration & Component
- [x] Add `mermaid` dependency and basic config.
- [x] Create a reusable `MermaidDiagram` React component:
  - [x] Accepts `code: string`, `title?: string`, `description?: string`.
  - [x] Renders Mermaid diagrams safely in React.
  - [x] Handles loading/error states.
- [x] Add simple example diagram to verify rendering.
- [x] Ensure diagrams work in dark/light backgrounds.

### 2. Agent Architecture Diagram (Mermaid)
- [x] Design data model for diagrams:
  - [x] `DiagramType` enum (e.g. "AGENT_ARCHITECTURE", "SYSTEM_INTEGRATION", "GOVERNANCE").
  - [x] `DiagramDefinition` type with `type`, `title`, `description`, `code`.
- [x] Create helper in `src/domain/diagrams.ts`:
  - [x] `buildAgentArchitectureMermaid(result, recommendations)`:
    - [x] Show Experience → Value Stream → Function → Process → Task flow.
    - [x] Show Control Agent linked appropriately.
    - [x] Adapt structure for Small/Medium/Large.
- [x] Wire Agent Architecture diagram into `ResultsView`:
  - [x] Render `MermaidDiagram` with architecture code.
  - [x] Add heading: "Agent Architecture Diagram".
  - [x] Only show when sizing is complete.

### 3. System Integration Diagram (Mermaid)
- [x] Decide how to capture systems in the UI (for now: simple free-text or chips).
- [x] Extend domain model to store `systems: string[]` for each scenario.
- [x] Create helper in `diagrams.ts`:
  - [x] `buildSystemIntegrationMermaid(result, systems)`:
    - [x] Show agent layers on top and systems as boxes below.
    - [x] Draw lines from appropriate layers to systems.
- [x] Add "System Integration Diagram" section in `ResultsView` using `MermaidDiagram`.
- [x] Update Markdown/JSON export to include system list.

### 4. Governance / Control-Focused Diagram
- [x] Create helper in `diagrams.ts`:
  - [x] `buildGovernanceMermaid(result, scores)`:
    - [x] Highlight where Control Agents sit.
    - [x] Show high-risk flows (data sensitivity + user reach).
- [x] Add a "Governance View" tab/section under diagrams.
- [x] Show simple legend explaining colours / emphasis (even if Mermaid stays mostly monochrome).

### 5. Export & Scenario Persistence for Diagrams
- [x] Extend scenario model to optionally store generated diagram code:
  - [x] `architectureDiagramCode`
  - [x] `systemIntegrationDiagramCode`
  - [x] `governanceDiagramCode`
- [x] Ensure diagram code can be reconstructed from scores if not stored.
- [x] Update Markdown export:
  - [x] Include Mermaid code blocks for each diagram.
  - [x] Clearly label each section.
- [x] Update JSON export to include diagram fields or raw code.
- [x] Verify that imported/exported scenarios can reproduce diagrams.

### 6. UX Polish for Diagrams
- [x] Add collapsible panels or tabs for:
  - [x] "Architecture"
  - [x] "System Integration"
  - [x] "Governance"
- [x] Add short helper text above each diagram explaining what it shows.
- [x] Handle error states gracefully (invalid Mermaid, etc.).
- [x] Ensure diagrams look acceptable on mobile (scrollable container).


## v2.0 Enhancements

### 1. Multi-User Collaboration / Team Features
- [ ] Add user identity field per scenario:
  - [ ] Facilitator name
  - [ ] Customer name
  - [ ] Workshop title
- [ ] Add workshop notes panel (rich text or markdown)
- [ ] Add per-dimension comment fields
- [ ] Add read-only “Share Link” mode:
  - [ ] Generate unique share token
  - [ ] Display a read-only version of the results
- [ ] Optional authentication scaffold for future (stub only)
- [ ] Persist collaboration metadata in localStorage

---

### 2. Portfolio / Analytics Dashboard
- [x] Add Portfolio View route
- [x] Implement Scenario List with filtering and sorting
- [x] Add Charts (Size Distribution, Avg Scores, Complexity Drivers, Tag Frequency)
- [x] Add "Export Portfolio Summary" (JSON)
- [x] Update Data Model with Industry and Use Case tags

---

### 3. Industry Templates / Presets
- [ ] Add template engine:
  - [ ] Create JSON for each template with default dimension scores + notes
- [ ] Include initial templates:
  - [ ] Retail Customer Service
  - [ ] FSI Contact Centre
  - [ ] Manufacturing Field Service
  - [ ] Professional Services (Consulting)
  - [ ] Public Sector Citizen Service
- [ ] Add UI modal:
  - [ ] “Create Scenario from Template”
  - [ ] Preview: description + typical agent architecture
- [ ] Allow user to tweak template before committing

---

### 6. Governance, Risk & EU AI / ISO 42001
- [x] Add Risk Profile scoring:
  - [x] Low / Medium / High (derived from dimensions)
- [x] Add Governance Checklist panel:
  - [x] DPIA / FRIA required?
  - [x] Human oversight needed?
  - [x] Logging & traceability guidance
  - [x] Model monitoring expectations
- [x] Add automatic risk-based recommendations:
  - [x] Control agents required?
  - [x] Review gates
  - [x] Compliance documentation
- [x] Add “Regulator-ready Export”:
  - [x] Purpose & scope
  - [x] Data categories
  - [x] Complexity & agent mesh overview
  - [x] Risk mitigations

---

### 8. Copilot Studio Deep Integration
- [x] Add “Agent Spec Generator”:
  - [x] Generate YAML/Markdown agent specs for:
      - Experience Agents
      - Value Stream Agents
      - Function Agents
      - Process Agents
      - Task Agents
      - Control Agents
- [x] Add Topic Skeleton Generator:
  - [x] For each Process Agent, generate topic structure
  - [x] Trigger phrases
  - [x] Steps
  - [x] Required connectors / actions
- [x] Add “Build Plan Generator”:
  - [x] Generate Epics / Stories for DevOps/Jira
  - [x] Export JSON for import later
- [x] Add “Industry-Optimised Architectures”

## Collaboration Features
- [x] Add metadata fields (Facilitator, Customer, Title, Notes)
- [x] Create Workshop Details UI
- [x] Add per-dimension comments
- [x] Add Results Notes panel
- [x] Implement Share Scenario (URL generation)
- [x] Implement Read-only mode for shared scenarios

## v2.1 Industry Templates
- [x] Create template data structure (Retail, FSI, Manufacturing, etc.)
- [x] Implement "Create from Template" functionality in store
- [x] Add Template Selector Modal UI
- [x] Integrate Template Selector into Sidebar

## v2.5 Deep Dive Assets for Copilot Studio Builds

### 1. Mermaid Diagrams per Agent

- [x] Define a standard Mermaid template for:
  - [x] Experience Agents (conversation & routing)
  - [x] Value Stream Agents (journey orchestration)
  - [x] Function Agents (domain logic)
  - [x] Process Agents (workflow steps)
  - [x] Task Agents (API calls & system steps)
  - [x] Control Agents (guardrail checkpoints)
- [x] Implement helper(s) to generate Mermaid code based on sizing/scenario data.
- [x] Add a “Diagrams” tab in the results view to show Mermaid snippets.
- [x] Add export or copy-to-clipboard for all diagrams.

### 2. Example Data Sets (POC Ready)

- [x] Design a minimal example data model for:
  - [x] Customers
  - [x] Products
  - [x] Quotes/Orders
  - [x] Tickets/Cases
- [x] Add JSON mock data files under a `mock-data/` or `data/` folder.
- [x] Add UI section in results for “Example Data Sets”:
  - [x] Show data schemas
  - [x] Show sample records
  - [x] Download buttons for example datasets.

### 3. Agent Blueprint Specs (Markdown)

- [x] Define a reusable Markdown blueprint template for agents:
  - [x] Purpose, triggers, inputs, outputs, steps, connectors, governance, dependencies.
- [x] Implement generator functions that:
  - [x] Create blueprints for each agent type from scenario & scoring.
- [x] Add “Blueprints” section in UI:
  - [x] Copy-to-clipboard for each blueprint
  - [x] “Download all blueprints as .md”

### 4. Topic Skeletons (Developer Ready)

- [x] Define a topic skeleton structure:
  - [x] Trigger phrases
  - [x] Variables to capture
  - [x] Steps & actions
  - [x] Response templates
  - [x] Guardrail notes
- [x] Generate skeletons for Process Agents and key Experience/Function Agents.
- [x] Add “Topic Skeletons” export in Markdown & JSON.

### 5. End-to-End Architecture Diagrams

- [ ] Define layers for L1/L2/L3 diagrams:
  - [ ] L1: High-level overview (user → agents → systems)
  - [ ] L2: Agent mesh (experience, value stream, function, process, task, control)
  - [ ] L3: System & data flow
- [x] Implement helpers to generate these as:
  - [x] Mermaid or similar diagram syntax
  - [x] Simple, labelled SVG/ASCII representation in UI
- [x] Add “Architecture” tab with these views.
- [x] Add export for architecture diagrams (text / markdown-friendly).

### 6. Example Prompts for Each Step

- [x] Define prompt templates for:
  - [x] AI actions in Process Agents
  - [x] Data transformation actions
  - [x] Output formatting (structured JSON, bullet summaries)
- [x] Bind prompts to agent types & dimensions (e.g. complexity, governance).
- [x] Expose in UI under “LLM Prompts” section:
  - [x] Per agent
  - [x] Copy-to-clipboard buttons
- [x] Include prompts in Markdown export.

### 7. Connector Schemas & API Mocks

- [x] Define schema templates for common systems (e.g. D365, SAP, ServiceNow, SQL).
- [x] Add mock request/response JSONs.
- [x] Link Task Agents to relevant connector schemas.
- [x] Add “Connector & API Mocks” section in UI and export.

### 8. Test Harness & Test Cases

- [x] Define test case structure:
  - [x] Input, expected output, edge cases, negative cases.
- [x] Generate sample test suites per agent type.
- [x] Add “Test Plan” section to blueprints & exports.
- [x] Add a combined “Test Harness” export (Markdown/JSON).

### 9. Governance Pack (EU AI / ISO 42001)

- [x] Extend risk profile and governance section:
  - [x] Map dimensions → impact category
  - [x] Add logging & traceability expectations
  - [x] Add human oversight & escalation points
- [x] Generate “Governance Annex” in exports:
  - [x] Purpose, risk level, controls applied, monitoring strategy
- [x] Tag Control Agents with governance roles (e.g. policy check, audit logging).

### 10. Delivery Accelerator Templates

- [x] Define sprint patterns for Small/Medium/Large builds.
- [x] Generate:
  - [x] Epics & user stories
  - [x] Acceptance criteria
  - [x] RACI snippets
  - [x] Implementation checklist
- [x] Add “Delivery Plan” section to results & exports.
- [x] Add optional export format tuned for DevOps/Jira (JSON/Markdown).


## v3.0 Full Expansion Pack (All Enhancements Except AI Architect)

### 2. Scenario Simulator (What-If Analysis)
- [x] Add “simulation mode” toggle.
- [x] Duplicate scenario into a simulated version.
- [x] Allow dimension adjustments without overwriting the original.
- [x] Adjust architecture, risk, governance, effort, and cost in real time.
- [x] Add comparison charts: baseline vs simulated.
- [x] Add “Simulation Summary” export.

### 3. Decision-Tree Guided Wizard
- [x] Add optional “Guided Mode”.
- [x] Build decision-tree questions for each dimension.
- [x] Convert answers into dimension scores automatically.
- [x] Show explanation of how each score was chosen.
- [x] Add “Switch to manual mode” toggle.

### 4. Costing & Licensing Engine
- [x] Build cost model for:
  - [x] Copilot Studio licensing
  - [x] Azure AI Foundry usage (estimated tokens)
  - [x] Connector usage
  - [x] Storage + hosting estimates
  - [x] Labour/time estimates
- [x] Add Cost tab summarising all cost categories.
- [x] Add estimated annualised costs (12-month view).
- [x] Add “Cost Assumptions” dictionary for transparency.
- [x] Export costing breakdown.

### 5. Reusable Agent Templates + Code Stubs
- [x] Add JSON template definitions for:
  - [x] Experience Agents
  - [x] Function Agents
  - [x] Process Agents
  - [x] Task Agents
  - [x] Control Agents
- [x] Create code stub generator:
  - [x] Dataverse schema starter
  - [x] Power Automate skeleton flows
  - [x] Connector/action definitions
  - [x] Foundry Prompt Flow scaffolds
  - [x] Sample React front-end shells
- [x] Add “Download Starter Pack (ZIP)” button.

### 6. Component Marketplace (Modular Blocks)
- [ ] Create marketplace catalogue (JSON-driven).
- [ ] Include components like:
  - [ ] Pricing module
  - [ ] Case routing module
  - [ ] Knowledge retrieval module
  - [ ] Document ingestion module
  - [ ] Risk assessment module
- [ ] Add UI to select components.
- [ ] Auto-adjust sizing, architecture, governance, testing, and delivery plans based on selected components.

### 7. Multi-Agent Debugger / Execution Trace Simulator
- [x] Build a sequence diagram generator for execution trace.
- [x] Simulate agent activation path:
  - [x] Experience → Value Stream → Function → Process → Task → Control
- [x] Add toggles for:
  - [x] Happy path
  - [x] Error path
  - [x] Exception / approval path
- [x] Add Mermaid sequence diagrams for each trace.
- [x] Export trace for documentation.

### 8. Compliance Heatmap
- [x] Add compliance matrix:
  - Rows = Agents
  - Columns = Controls
- [x] Score each intersection (green/yellow/red).
- [x] Add “compliance score” per agent and overall.
- [x] Add exportable heatmap tile view.

### 9. Organisational Maturity Assessment
- [x] Add new assessment module:
  - [x] Data quality
  - [x] Integration maturity
  - [x] Governance maturity
  - [x] AI literacy
  - [x] Automation maturity
  - [x] Security posture
- [x] Generate “Readiness Score” (0–100).
- [x] Provide recommendations tied to low-scoring areas.
- [x] Add export: “Org Maturity Report.”

### 10. Time-to-Value Accelerator
- [x] Analyse dimension scores + maturity to propose:
  - [x] Quick wins
  - [x] Medium wins
  - [x] Transformational projects
- [x] Provide value impact estimates (Low/Med/High).
- [x] Add an ordered roadmap.
- [x] Add export: “Value Roadmap.”

### 11. Team & Persona Profiles
- [ ] Add persona presets (Sales, Service, HR, Finance, CX, IT).
- [ ] Prefill typical dimensions + risk patterns + architectures.
- [ ] Allow custom persona creation.
- [ ] Add persona summary card.

### 12. Consultant “Coach Mode”
- [x] Hidden consultant mode (toggle via URL param or hotkey).
- [x] Add workshop facilitation notes.
- [x] Add suggested questions to ask customers.
- [x] Add prompts for steering discussions.
- [x] Add “Common pitfalls” guidance.
- [x] This mode never appears in shared/scenario URLs.

### 13. Project Plan Generator (Gantt, Cost, Resourcing)
- [x] Create simple Gantt generator.
- [x] Estimate:
  - [x] Sprints
  - [x] Hours per role
  - [x] Cost per role
- [x] Add role demand charts.
- [x] Add output for PMO (Markdown + CSV).
- [x] Export “Delivery Plan Package.”

### 14. Knowledge Hub
- [x] Create structured knowledge database:
  - [x] Glossary (systems, connectors, concepts)
  - [x] Architecture patterns
  - [x] Governance guidance
  - [x] Example agents
- [x] Add search UI.
- [x] Add links to generated artefacts.
- [x] Exportable as Markdown or JSON.

### 15. Full AgentOps Workbench Functions
- [ ] Add Agent Registry
- [ ] Add version tracking per agent
- [ ] Add metrics placeholders (build for future integrations)
- [ ] Add “Change log” model per scenario
- [ ] Add role-based access (placeholder / stub)

### ROI Layer on Cost Estimator

- [x] Add "Benefits Assumptions" model:
  - [x] Time savings (minutes per transaction, volume, automation %, hourly rate)
  - [x] Error reduction (error rates, cost per error) [optional]
  - [x] Revenue / capacity uplift [optional]
  - [x] Adoption rate (% of users using agents)
- [x] Implement benefit calculations:
  - [x] AnnualTimeSavingBenefit
  - [x] AnnualErrorBenefit (optional)
  - [x] AnnualRevenueBenefit (optional)
  - [x] AnnualBenefit (total)
- [x] Integrate with existing cost model:
  - [x] Pull AnnualCost from cost estimator
  - [x] Compute NetBenefit, ROI%, PaybackMonths
- [x] Update Cost tab UI:
  - [x] Benefits assumptions controls (sliders/inputs)
  - [x] ROI & Payback summary card
  - [x] Optional chart: Cost vs Benefit
- [x] Add ROI & Payback to exports (Markdown + JSON):
  - [x] Detailed assumptions
  - [x] ROI, NetBenefit, Payback
  - [ ] 1-year, 3-year and 5-year views
- [ ] Extend ROI model to multi-year view:
  - [ ] Compute 1-year totals (benefit, cost, net, ROI%)
  - [ ] Compute 3-year totals (benefit, cost, net, ROI%)
  - [ ] Compute 5-year totals (benefit, cost, net, ROI%)
- [ ] Update ROI UI:
  - [ ] Add a small comparison table for 1 / 3 / 5 years
  - [ ] Highlight primary horizon (default 3 years)
- [ ] Update exports:
  - [ ] Include 1 / 3 / 5-year ROI and net benefit in Markdown
  - [ ] Include 1 / 3 / 5-year ROI and net benefit in JSON

### Report Module A — Core Report Builder

- [x] Create `src/report/reportModel.ts`
  - [x] Define ReportModel type (all sections optional)
  - [x] Define helper sub-types: diagrams, blueprints, datasets, roi, cost, governance

- [x] Create `src/report/reportBuilder.ts`
  - [x] Add buildReportModel(scenarioId)
  - [x] Fetch:
      - scenario metadata
      - dimension scoring
      - simulator outputs
      - architecture hints + diagrams
      - blueprints
      - topic skeletons
      - datasets
      - connectors
      - governance outputs
      - cost + ROI
      - value accelerator
      - delivery plan
      - marketplace selections
      - knowledge hub
  - [ ] Normalize into final ReportModel

- [x] Add unit test for reportBuilder
### Report Module B — Markdown & JSON Exporters

- [x] Create `src/report/renderMarkdown.ts`
  - [x] Render full Markdown using ReportModel
  - [x] Implement sections 1–20 via helper functions
  - [x] Wrap diagrams in fenced ```mermaid blocks
  - [x] Include datasets as fenced JSON

- [x] Create `src/report/renderJson.ts`
  - [x] Output entire ReportModel as a JSON object

- [x] Add tests for both renderers
### Report Module C — ZIP Export

- [x] Add JSZip dependency
- [x] Create `src/report/exportZip.ts`
  - [x] Accept ReportModel
  - [x] Add Markdown file
  - [x] Add JSON file
  - [x] Add each Mermaid diagram as .mmd
  - [x] Add datasets as JSON files
  - [x] Add blueprints as .md
  - [x] Add topic skeletons as .md or .json
- [x] Return a Blob for download
### Report Module D — Report UI

- [x] Create `ReportGeneratorView.tsx`
  - [x] Generate ReportModel via buildReportModel
  - [x] Show a preview of included sections
  - [x] Buttons:
    - [x] Download Markdown
    - [x] Download JSON
    - [x] Download ZIP

- [x] Integrate:
  - [x] Add a new tab: “Report”
  - [ ] Or add a floating button “Generate Report”

- [ ] Add success toast after exporting
### Report Module E — Integration & Validation

- [x] Validate all report sections populate correctly
- [x] Add graceful fallbacks if a section has no data
- [x] Add scenario metadata:
  - Timestamp
  - App version
  - Scenario hash
- [x] Add e2e test:
  - Generate full report for sample scenario
  - Validate ZIP structure
  - Validate Markdown structure
### Report Module F — PDF Export

- [x] Choose PDF generation approach:
  - [x] Client-side library (e.g. jsPDF, pdf-lib, or html2pdf.js)
  - [x] Use existing Markdown renderer as source (Markdown → HTML/text → PDF)

- [x] Create `src/report/renderPdf.ts`:
  - [x] Accept `ReportModel`
  - [x] Reuse `renderReportMarkdown` (or HTML equivalent) as the content source
  - [x] Convert to paginated PDF:
    - [x] Add cover page
    - [x] Add section headings with clear page breaks
    - [x] Reasonable margins & fonts
  - [x] Return a `Blob` suitable for client-side download

- [x] Update `ReportGeneratorView`:
  - [x] Add “Download PDF” button
  - [x] Wire it to `renderPdf` and trigger browser download

- [x] Ensure:
  - [x] Large reports still export without crashing
  - [x] Graceful fallback if PDF generation fails (show error toast)

- [x] Update exports:
  - [x] Include PDF option in export modal/info
