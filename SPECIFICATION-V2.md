# NEXUS V2 — Competitive Edge Features

## Context
NEXUS already has: Knowledge graph canvas, multi-agent reasoning trace, decision timeline, smart info drop, voice input, new joiner onboarding, and Ask NEXUS chat. These V2 features fill the remaining rubric gaps to maximize judging score.

## Evaluation Criteria Gap Analysis

| Criterion | Current Coverage | V2 Target |
|-----------|-----------------|-----------|
| Communication Intelligence | Info Drop routing | + Proactive ticker, Meeting auto-update |
| Knowledge Graph | Static view + click | + Living graph (meeting updates), propagation viz |
| UI & Visualization | Reasoning trace, particles | + Understanding spread wave, cascade viz |
| UX & Interaction | Voice, suggested queries | + Zero-click proactive insights |
| Creativity & Moonshot | Multi-agent trace | + What-If simulation (nobody else will have this) |
| Deconfliction & Critique | Contradiction detection | + Cascade failure analysis, overload prediction |
| Demo Quality | Demo script, fallbacks | + Auto-play ticker creates instant wow |

---

## F1: What-If Simulation — Person Departure Cascade (P0)

**Rubric**: Moonshot Thinking + Deconfliction + Knowledge Graph

### Scenario
"What if Catherine Moore (CSO) leaves?" → NEXUS shows the organizational cascade:
- Her node greys out, edges break (dashed/faded)
- Connected nodes' workload bars spike in real-time
- Panel shows: 6 stalled workstreams, 3 affected divisions, $2.4M impact
- Recovery suggestion: redistribute to Sarah Chen, Alex Reeves, promote Yuki Tanaka

### Why It Wins
- No other team will have a simulation mode
- Proves NEXUS understands *structural* consequences
- Judges see numbers change in real-time — viscerally compelling
- The "recovery suggestion" shows the AI thinks ahead, not just reports

### Implementation
- New `WhatIfPanel.tsx` component
- New overlay type `'whatif'` in DemoView
- Canvas: conditional rendering for removed node (grey + dashed edges)
- Pre-computed cascade data derived from graph topology
- Animate workload transitions on canvas

---

## F2: Understanding Spread — Knowledge Propagation (P0)

**Rubric**: Visualization (PDF literally says "Visualize how understanding spreads")

### Scenario
Decision is made by Alex Reeves → information ripples through the org graph:
- All nodes dim to 30% opacity
- Wave expands along edges; nodes light up as info reaches them
- Counter: "5/24 → 12/24 → 22/24 INFORMED"
- 2 nodes stay dim: "NOT REACHED — knowledge gap detected"
- Summary: "2 people uninformed. Recommend creating direct link."

### Why It Wins
- Directly answers the rubric's exact language
- Shows who DOESN'T know — silo detection as a visual
- The "gap detected" insight is the AI providing value, not just visualizing

### Implementation
- BFS traversal from source node, delay proportional to 1/edge.weight
- Canvas: node opacity driven by informed Set
- Counter component overlay
- Unreached nodes get yellow pulse + "NOT REACHED" label

---

## F3: Proactive AI Ticker — Auto-Surface on Load (P0)

**Rubric**: Communication Intelligence + UX + Creativity

### Behavior
Within 3-7 seconds of page load (no user action):
1. T=3s: CRITICAL toast — contradiction ($30K ARR risk)
2. T=5s: WARNING toast — Catherine at 88% load (SPOF)
3. T=7s: INFO toast — silo detected ($45K duplicated effort)

Each toast has a "View →" button opening the relevant overlay. Auto-dismiss after 8s.

### Why It Wins
- Judges see value before they touch anything
- NEXUS feels alive — an intelligence, not a dashboard
- Staggered timing mimics AI "discovering" issues in real-time
- Connects features together (toast → overlay deep-dive)

### Implementation
- Inline toast system in DemoView (or new ProactiveToast component)
- framer-motion AnimatePresence for slide-in/out
- setTimeout chain (3s, 5s, 7s)
- Once-per-session flag (useRef)

---

## F4: Meeting Simulation — Auto-Update Graph (P1)

**Rubric**: Communication Intelligence (PDF example #1: "A meeting ends → AI updates graph")

### Scenario
"Meeting Ended" button → NEXUS processes Q1 Strategy Review:
1. Attendee nodes highlighted (Alex, Catherine, Sarah, Marcus)
2. "Extracting decisions..." → 2 decisions with version stamps (v13, v14)
3. "Updating graph..." → edges between attendees glow/thicken
4. "Notifying stakeholders..." → particles fan out to affected nodes
5. "Routing action items..." → 3 action items with owners
6. Summary: "2 decisions stamped, 6 notified, 3 actions routed"

### Why It Wins
- Matches the PDF's first example scenario word-for-word
- Shows the graph is LIVING, not static
- Full pipeline visible: ingest → extract → update → route → notify
- v13/v14 appear in Timeline if judges check — detail consistency

### Implementation
- New `MeetingSimPanel.tsx` component
- New overlay type `'meeting'` in DemoView
- Pre-scripted meeting data
- Canvas: temporary edge highlights, fan-out particles
- Step-by-step setTimeout chain

---

## NEW: Prerequisite Tasks (from Triad Review)

### F0: Extract DemoView Overlay Panels
DemoView is 920 lines. Extract 5 overlay panels into `src/components/overlays/`:
ContradictionPanel, BriefingPanel, ReasoningTracePanel, NodeDetailPanel, DemoButtonBar.
Target: DemoView under 650 lines. Consolidate button bar to max 5-6 buttons.

### F0b: Deterministic Node Layout + Canvas Visual Override Layer
- Replace `Math.random()` with seeded positions (use node ID charCodes)
- Introduce `CanvasOverrides` interface: `{ dimmedNodes, removedNodes, dashedEdges, highlightedNodes, nodeOpacities, glowingNodes }`
- Draw helpers read overrides generically instead of branching per overlay type

### F5: Live Org Risk Dollar Counter (Gamma's suggestion)
Persistent "ORG RISK: $75.2K" in top bar. Spikes to "$2.4M" during What-If.
Drops during resolution. Animated number transitions. 30-60 min work, massive impact.

### F6: Demo Narrative Script
Not a feature tour — a STORY with escalating stakes:
$30K contradiction → $75K base risk → $2.4M cascade → $45K silo gap → "3 seconds"

---

## Implementation Order (Updated per Triad)

### Phase 1 — Prerequisites (parallel)
- **F0** (Extract overlays) + **F0b** (Deterministic layout + overrides) — run in parallel
- **F3** (Proactive Ticker) — independent, no deps

### Phase 2 — Hero Features (sequential, de-risk first)
- **F1** (What-If Simulation) — blocked by F0, F0b. Build FIRST to de-risk the moonshot.
- **F5** (Dollar Counter) — wire into F1 for cascade spike

### Phase 3 — Polish
- **F2** (Understanding Spread) — blocked by F0, F0b. Direct rubric hit.
- **F6** (Demo narrative script) — write after features are testable

### Stretch Goal
- **F4** (Meeting Simulation) — only if all above are polished. Minimal version for Q&A.

## Dependencies
```
F0 ──┬──→ F1 (What-If) ──→ F5 (Dollar Counter)
F0b ─┘
F0 ──┬──→ F2 (Understanding Spread)
F0b ─┘
F3 (Ticker) ──→ (independent)
F6 (Script) ──→ (after features testable)
F4 (Meeting) ──→ (stretch, after everything else)
```
