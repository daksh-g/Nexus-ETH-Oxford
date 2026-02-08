# Feature Specification

> Generated on 2026-02-07

## Overview

**Feature:** NEXUS AI Chief of Staff — Hackathon Enhancement Sprint

Transform NEXUS from a polished mock demo into a live AI-powered Organizational Nervous System for the OpenAI-sponsored "Build the Superhuman AI Chief of Staff" track at Hack-Nation MIT (Feb 7-8, 2026).

**Core thesis:** Judges evaluate on *vision and interaction quality, not feature count*. Every feature must be self-evidently impressive in a 3-minute pitch window — no explanation needed.

## Requirements

### R1: OpenAI API Integration (Foundation Layer)
- Create a shared `src/lib/openai.ts` service module
- Use OpenAI Chat Completions API (gpt-4o or gpt-4o-mini)
- System prompt includes full organizational context: nodes, edges, alerts, decision history
- The LLM acts as NEXUS — the organizational brain — not a generic chatbot
- Wire into Ask NEXUS view replacing hardcoded keyword matching
- Wire into Info Drop (PulseView) for classification and routing
- Wire into New Joiner onboarding for dynamic briefing generation
- API key stored in `.env` (`VITE_OPENAI_API_KEY`), gitignored
- Streaming responses via `ReadableStream` for real-time typewriter effect

### R2: AI Reasoning Trace Visualization (Highest-Impact Visual Feature)
**Why it matters:** The challenge PDF says *"Special emphasis will be placed on visualizing agentic AI reasoning and communication flows."* This is the single most important differentiator.

**What judges see:** When NEXUS detects an anomaly or processes a query, a step-by-step reasoning chain appears overlaid on the network graph, with edges lighting up sequentially as each reasoning step executes.

- New component: `src/components/ReasoningTrace.tsx`
- Triggered by: contradiction detection, info drop processing, any Ask NEXUS query
- Renders as a translucent side panel (right side of DemoView) showing numbered steps
- Each step has: timestamp, action description, affected nodes, confidence score
- As each step renders, the corresponding edge(s) on the canvas glow/pulse
- Canvas integration: expose a `highlightPath(nodeIds: string[], color: string)` function from DemoView
- Steps animate in sequentially (200ms stagger) with a typing/fade effect
- Example trace for contradiction detection:
  ```
  [1] INGESTED: Nova-Sales sent proposal to Acme Corp at $15/seat
  [2] CROSS-REFERENCED: Sarah Chen quoted $20/seat on Feb 3 call
  [3] DETECTED: Price contradiction — $5/seat delta, $30K ARR impact
  [4] TRACED: Nova-Sales used Q3 pricing sheet (deprecated Oct 2025)
  [5] ROUTED: Alert → Sarah Chen, Tom Bradley, Robert Daniels (CFO)
  [6] ACTION: Nova-Sales trust level downgraded to review_required
  ```

### R3: Decision Timeline / Truth Ledger (Version Control for Organizational Truth)
**Why it matters:** The challenge explicitly asks for *"versioned organizational memory"* and *"a living source of truth."* This is the structural backbone.

- New view: `src/views/TimelineView.tsx` at route `/timeline`
- Add to sidebar navigation in AppLayout
- Vertical timeline showing versioned decisions, facts, and state changes
- Each entry has: timestamp, decision text, author, affected nodes, version number
- Entries are color-coded by type: decision (cyan), contradiction (red), resolution (green), context update (yellow)
- Click an entry → affected nodes highlight on a mini knowledge graph
- "Diff" view: show what changed between versions (e.g., "Pricing: $15 → $20")
- Include a "Truth Snapshot" card at the top showing current organizational state
- Data: extend `mockData.ts` with a `decisions[]` array containing ~10-15 timestamped entries
- The timeline should make it visually obvious that NEXUS maintains institutional memory

### R4: Smart Info Drop with LLM-Powered Routing (Live AI Demo Moment)
**Why it matters:** This is the most demo-able feature. Drop text in → watch AI classify it → see it flow to the right people on the graph. Instant "wow."

- Replace the fake `handleInfoDrop` in PulseView with a real OpenAI call
- LLM classifies the dropped info: type (fact, decision, question, escalation), topic, urgency
- LLM identifies which nodes need to know (returns node IDs from the org graph)
- After classification, animate "info particles" flowing from the Info Drop widget to each target node on the canvas
- Show a classification card: type badge, topic, urgency level, target nodes with reasons
- The particles should be visually distinct from normal edge particles (larger, brighter, different color)
- Add a brief "routing reasoning" display: "This affects pricing → Sarah Chen (VP Sales), Robert Daniels (CFO), Nova-Sales (trust audit pending)"

### R5: Voice Input via Web Speech API
**Why it matters:** The rubric explicitly scores "Voice and low-friction interaction, minimal typing and clicks." Even basic voice input checks this box dramatically.

- Add microphone button to Ask NEXUS input bar and Info Drop widget
- Use browser-native `webkitSpeechRecognition` / `SpeechRecognition` API
- Visual feedback: pulsing mic icon while recording, waveform-style animation
- On speech end → transcript populates the input field → auto-submit
- Fallback: if Speech API unavailable (non-Chrome), hide mic button gracefully
- No external dependencies needed

### R6: Dynamic New Joiner Briefing (LLM-Generated Context)
**Why it matters:** This is a named example scenario in the challenge PDF: "A new stakeholder joins → the AI creates an instant context view." Making this AI-generated instead of hardcoded is a direct hit on the rubric.

- Modify the OnboardingModal in DemoView
- After the user enters their info (step 0), call OpenAI to generate personalized steps 1-5
- The LLM receives: joiner info + full org graph + active alerts + decision history
- It generates: relevant team context, key decisions, who to know, open tensions, first-week priorities
- Show a loading state with "NEXUS is analyzing your context..." while the API responds
- The rest of the modal steps display the LLM-generated content instead of hardcoded text

## Acceptance Criteria

### R1: OpenAI Integration
- [ ] `.env` file with `VITE_OPENAI_API_KEY` works locally
- [ ] Ask NEXUS returns real LLM responses about the organization
- [ ] Responses stream in with typewriter effect (not block-loaded)
- [ ] System prompt includes org graph context
- [ ] Fallback to mock responses if API fails (graceful degradation)

### R2: AI Reasoning Trace
- [ ] Clicking "Contradiction" demo button shows animated reasoning trace
- [ ] Each trace step appears sequentially with stagger animation
- [ ] Corresponding edges on the canvas light up as each step renders
- [ ] Trace is visually stunning and immediately comprehensible to a first-time viewer
- [ ] Works on the DemoView (main pitch view)

### R3: Decision Timeline
- [ ] New `/timeline` route accessible from sidebar
- [ ] Shows 10+ timestamped organizational decisions
- [ ] Entries are versioned and color-coded by type
- [ ] "Truth Snapshot" shows current state at a glance
- [ ] Diff indicators show what changed

### R4: Smart Info Drop
- [ ] Typing/pasting text and submitting triggers real LLM classification
- [ ] Classification result shows: type, topic, urgency, target nodes
- [ ] Animated particles flow from Info Drop to target nodes on canvas
- [ ] Routing reasoning is displayed explaining why each node was selected

### R5: Voice Input
- [ ] Microphone button visible on Ask NEXUS and Info Drop
- [ ] Clicking mic → recording indicator → speech-to-text → auto-populate input
- [ ] Works in Chrome/Edge (WebKit Speech API)
- [ ] Hidden gracefully in unsupported browsers

### R6: Dynamic New Joiner
- [ ] Entering joiner info triggers OpenAI call
- [ ] Loading state visible while AI generates context
- [ ] Generated briefing is personalized to the role/team entered
- [ ] All modal steps display LLM-generated content

## Technical Approach

**Architecture:** Keep it as a frontend-only app. OpenAI calls happen directly from the browser (API key in env). This avoids needing to set up a backend server during the hackathon.

**OpenAI Service (`src/lib/openai.ts`):**
- Single module exporting: `askNexus(query)`, `classifyInfoDrop(text)`, `generateJoinerBrief(info)`, `generateReasoningTrace(alertId)`
- Each function builds a system prompt with serialized org context
- Uses `fetch` with streaming for real-time responses
- Temperature: 0.3 (factual), max_tokens: ~1000

**Canvas Integration for Reasoning Trace:**
- DemoView exposes node positions via a ref/callback
- ReasoningTrace component receives node position data
- Uses absolute-positioned SVG overlay on top of canvas for path highlighting
- Or: pass highlight state back to DemoView's draw loop via shared state

**State Management:**
- Keep using local React state (no Redux/Zustand needed)
- Shared org context imported from mockData (already works)
- API responses stored in component state

**File Changes:**
- New: `src/lib/openai.ts`, `src/components/ReasoningTrace.tsx`, `src/views/TimelineView.tsx`
- Modified: `src/views/AskNexusView.tsx`, `src/views/PulseView.tsx`, `src/views/DemoView.tsx`, `src/data/mockData.ts`, `src/App.tsx`, `src/components/AppLayout.tsx`
- New: `.env` (gitignored)

*Assumptions made:*
- OpenAI API key has sufficient quota for demo + testing
- Using gpt-4o-mini for speed during live demo (lower latency)
- Browser is Chrome/Edge for voice input (Web Speech API)
- No backend needed — direct browser-to-OpenAI calls are acceptable for a hackathon
- The API key exposure in frontend code is acceptable for a hackathon demo (not production)

## Edge Cases

- **API rate limits during demo:** Pre-cache key demo responses, fall back to cached if API fails
- **Slow API response:** Show skeleton/loading states, never leave user with blank screen
- **Voice API unavailable:** Feature detection, hide mic button, no error shown
- **Long LLM responses:** Cap at 1000 tokens, truncate gracefully
- **Network failure:** Toast notification + graceful degradation to mock data

## Open Questions

- Should the reasoning trace use a canvas overlay (SVG) or integrate into the existing canvas draw loop? (Assumption: SVG overlay for simplicity and separation of concerns)
- Should we use gpt-4o or gpt-4o-mini? (Assumption: gpt-4o-mini for latency during live demo, can switch to gpt-4o for pre-cached responses)

---

- [x] Ready for implementation
