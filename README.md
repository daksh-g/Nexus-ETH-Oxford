<p align="center">
  <img src="https://img.shields.io/badge/NEXUS-Organizational%20Nervous%20System-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="NEXUS" />
</p>

<h1 align="center">NEXUS</h1>
<p align="center">
  <strong>Superhuman AI Chief of Staff</strong><br>
  <em>An agentic system that models how information flows inside an organization and adapts communication routing in real time.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Hack%20Nation-MIT%202026-22c55e?style=flat-square" />
  <img src="https://img.shields.io/badge/Track-OpenAI-0ea5e9?style=flat-square" />
  <img src="https://img.shields.io/badge/Built%20in-24%20hours-f59e0b?style=flat-square" />
  <img src="https://img.shields.io/badge/Lines-5.5K%20custom-8b5cf6?style=flat-square" />
</p>

---

## The Problem

Organizations don't fail because they lack information. They fail because information reaches the **wrong people**, at the **wrong time**, in the **wrong format**.

A 50-person company has 1,225 potential communication channels. A 500-person company has **124,750**. No human — not even a brilliant Chief of Staff — can monitor, prioritize, and route across that combinatorial explosion. The result is predictable:

- **Contradictions propagate unchecked** — two people in different divisions quote different prices to the same client. Nobody notices for days. $30K gone.
- **Knowledge silos calcify** — two teams independently build the same retry logic. 83% code overlap. Zero communication. $45K wasted.
- **Cognitive overload concentrates** — your CSO manages 14 workstreams across 3 divisions at 88% capacity. She's one sick day away from stalling half the company.
- **Information gaps compound silently** — a CEO announces a strategic pivot. 21 out of 24 people hear about it. The 3 who don't? They keep building the old thing.

Every tool on the market — Slack, dashboards, notification systems — optimizes for **delivery**. They treat all recipients equally and all information identically. None of them optimize for what actually matters: **decision correctness**.

---

## What NEXUS Does

NEXUS is not a dashboard. It's not a chatbot. It's not a notification filter.

NEXUS is an **organizational nervous system** — a multi-agent AI that maintains a living model of your company's structure, knowledge, and judgment, and uses it to ensure the right information reaches the right person at the right time in the right form.

It **reasons** about your organization in real time:
- Detects contradictions before they reach customers
- Predicts cascade failures when key people leave
- Measures knowledge propagation and auto-corrects gaps
- Learns individual communication preferences and adapts routing
- Maintains an auditable, version-controlled truth ledger of every decision

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 18 + TypeScript | Type-safe component architecture with hooks-based state management |
| **Build** | Vite 5 + SWC | Sub-second HMR, 1.6s production builds |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first with accessible, composable primitives |
| **Animation** | Framer Motion | Physics-based spring animations for all panel transitions |
| **Visualization** | Custom Canvas 2D Engine | Hand-written 60fps rendering — force-directed graph, particle systems, BFS wave propagation |
| **LLM** | OpenAI GPT-4o-mini | Streaming Q&A, information classification, onboarding generation |
| **Voice** | Web Speech API | Browser-native speech recognition with feature detection fallback |
| **Routing** | React Router v6 | Multi-view SPA (Overview, Pulse, Alerts, Ask NEXUS) |
| **Icons** | Lucide React | 20+ contextual icons across the interface |

---

## Architecture

```
                          ┌─────────────────────────────┐
                          │     NEXUS Canvas Engine      │
                          │  60fps · 26 nodes · 34 edges │
                          │  Particles · BFS · Glow FX   │
                          └──────────────┬──────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
    ┌─────────▼─────────┐    ┌──────────▼──────────┐    ┌─────────▼─────────┐
    │   Overlay System   │    │   Agent Mesh (4)     │    │   OpenAI Service   │
    │                    │    │                      │    │                    │
    │ Contradiction      │    │ Coordinator ─ route  │    │ askNexus()         │
    │ What-If Cascade    │    │ Memory ─ truth query │    │ classifyInfoDrop() │
    │ Knowledge Spread   │    │ Critic ─ validate    │    │ generateBrief()    │
    │ Decision Timeline  │    │ Router ─ deliver     │    │                    │
    │ Briefing + Feedback│    │                      │    │ 3-tier fallback:   │
    │ New Joiner         │    │ Trust governance:    │    │ cache → API → demo │
    │ Node Detail + Tasks│    │ auto/supervised/     │    │                    │
    │ Email Auto-Correct │    │ review_required      │    │ Streaming + abort  │
    └────────────────────┘    └──────────────────────┘    └────────────────────┘
              │                          │                          │
              └──────────────────────────┼──────────────────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │    Organizational Graph      │
                          │  26 nodes · 34 edges · 7 alerts │
                          │  12-version truth ledger     │
                          │  29 tasks · 4 divisions      │
                          └─────────────────────────────┘
```

---

## Technical Accomplishments

### Custom Canvas 2D Rendering Engine
We didn't use D3, Cytoscape, or any graph library. We wrote a **custom Canvas 2D engine from scratch** that renders 26 pulsing nodes, 34 weighted edges, 50+ concurrent particles, division labels, a legend, and multiple overlay effects — all at **60fps** with smooth sine-wave animations. Node positions are deterministically seeded (no `Math.random()`) so the layout is reproducible across sessions. The particle system uses edge-weight-modulated speed with cubic easing. Every node breathes. Every edge carries data.

### Multi-Agent Reasoning Visualization
NEXUS implements a **4-agent reasoning pipeline** (Coordinator, Memory, Critic, Router) that's not just logic — it's **visible on the canvas**. When a contradiction is detected, you can watch agent-to-agent message particles travel between AI nodes in real time. Each agent lights up in the mesh status bar as it activates. Each reasoning step renders with confidence scores. The entire 7-step trace animates over 10 seconds with staggered reveals, making the AI's decision process fully transparent and auditable.

### BFS Knowledge Propagation with Gap Detection and Auto-Correction
We built a **breadth-first-search simulation** that models how a CEO's announcement propagates through the organizational graph, weighted by edge strength. The system deliberately identifies 3 structurally unreachable nodes (people who would never hear the news through normal channels), renders them with "NOT REACHED" labels and dimmed opacity, then offers a **one-click auto-correction flow** that generates and displays targeted email previews for each unreached person, animates green confirmation particles from the CEO to each corrected node, and visually marks them with a pulsing green glow. The entire gap-detection-to-correction pipeline runs in under 6 seconds.

### What-If Cascade Simulation
Click one button and watch your org fall apart. The **What-If engine** simulates an executive departure by greying out their node, dashing their edges, and then cascading the impact: 6 stalled workstreams, 3 affected divisions, load redistribution calculations (Sarah Chen: 78% → 95%), and a dollar counter that **animates in real time** from $75.2K to $2.4M using an eased cubic interpolation. Then it generates a recovery plan with specific people stepping into specific roles. A consulting firm charges six figures for this analysis. We do it in 2 seconds.

### Adaptive Feedback Loop with Canvas Edge Effects
The feedback system isn't cosmetic — it's a **closed-loop signal pipeline**. When a user rates a briefing as "not useful," a feedback sub-panel slides in with 6 specific reasons (not relevant, too detailed, not enough context, already knew, wrong priority, missing info). Each rating triggers a visible canvas effect: green edge glow for positive feedback (channel strengthened), red dashed edge for negative (rerouting), cyan dashed for "need more" (reverse information request). The system demonstrates how explicit human signals can rewire organizational communication in real time.

### Three-Tier LLM Fallback with Pre-Warming
The OpenAI integration is built for **zero-downtime demo reliability**. On mount, the system pre-warms 5 cached responses by firing requests in parallel. At query time, the resolution order is: (1) pre-cache hit → instant response, (2) live API with 3-second timeout and AbortController support → streaming response, (3) hardcoded demo fallback → guaranteed response. The system prompt encodes the entire organizational graph — all 26 nodes, 34 edges, 7 alerts, and recent decisions — giving the LLM full context for every query. Streaming uses async generators with character-by-character delivery simulation for cached responses.

### 12-Version Truth Ledger
Every organizational decision, contradiction, resolution, and context update is recorded in a **version-controlled truth ledger** (v1–v12) with author attribution, affected node tracking, timestamp, and diff against the previous version. Color-coded by type (purple=decision, red=contradiction, green=resolution, amber=context update, orange=escalation) with staggered animation entry. This is organizational git — you can trace exactly how any piece of truth evolved over time.

### Voice-First Input with Graceful Degradation
Voice input uses the Web Speech API with **proper feature detection** — the component returns `null` entirely if the browser doesn't support it, rather than rendering a broken button. Three visual states (idle, recording with pulsing red ring, processing) provide clear feedback. Single-utterance mode prevents runaway recordings.

---

## Features

| # | Feature | What It Does |
|---|---------|-------------|
| 1 | **Live Knowledge Graph** | 26 nodes, 34 weighted edges, 4 divisions rendered on custom Canvas 2D at 60fps |
| 2 | **Multi-Agent Reasoning Trace** | 4-agent pipeline (Coordinator, Memory, Critic, Router) with visible step-by-step logic |
| 3 | **Contradiction Detection** | Catches pricing conflicts ($20 vs $15/seat), calculates $30K exposure, auto-escalates |
| 4 | **Cognitive Load Monitoring** | Per-person workload percentage with color-coded overload warnings at 80%+ |
| 5 | **What-If Cascade Simulation** | Executive departure modeling — $2.4M risk analysis with recovery plan generation |
| 6 | **Knowledge Propagation Spread** | BFS wave animation showing how fast information travels, identifying unreached nodes |
| 7 | **Auto-Correction Flow** | Generates targeted emails to unreached people, confirms delivery with green canvas glow |
| 8 | **Communication Feedback System** | Useful / Not Useful / Need More ratings with adaptive routing and canvas edge effects |
| 9 | **Decision Timeline** | 12-version immutable truth ledger with diffs, conflict markers, and author tracking |
| 10 | **Smart Info Classification** | LLM-powered classification of incoming info by type, urgency, and routing targets |
| 11 | **Dynamic New Joiner Briefing** | AI-generated personalized onboarding — 5 minutes to full context vs 3–6 month industry avg |
| 12 | **Proactive Alert Toasts** | 3 critical alerts auto-surface on first interaction without user prompting |
| 13 | **AI Agent Trust Governance** | Dynamic trust levels (autonomous / supervised / review_required) with incident-based downgrade |
| 14 | **Real-Time Org Risk Counter** | Animated dollar counter ($75.2K → $2.4M) with cubic-eased interpolation |
| 15 | **Voice Query Input** | Web Speech API with feature detection and graceful fallback |
| 16 | **Streaming Ask NEXUS** | Natural language organizational queries with 3-tier LLM fallback |
| 17 | **Silo Detection** | Identifies 83% code overlap between non-communicating teams, quantifies $45K waste |
| 18 | **"What Changed Today?" Briefing** | Typewriter-animated daily briefing with feedback loop and action buttons |
| 19 | **Per-Person Workstreams** | 29 tasks across 12 people with active/blocked/done status and progress bars |
| 20 | **Agent Mesh Status Bar** | Real-time indicator showing which AI agents are actively reasoning |

---

## Project Structure

```
src/
  views/
    DemoView.tsx          # Main canvas + all overlays (~1,100 lines)
    PulseView.tsx         # Info drop classification + particle routing
    AlertsView.tsx        # Alert dashboard with filtering
    AskNexusView.tsx      # Chat interface with streaming LLM
  components/
    overlays/
      BriefingPanel.tsx   # Daily briefing with feedback sub-panel
      ContradictionPanel.tsx
      NodeDetailPanel.tsx # Person inspector + tasks + feedback
      WhatIfPanel.tsx     # Cascade simulation
    DecisionTimeline.tsx  # 12-version truth ledger
    OnboardingModal.tsx   # 6-step new joiner briefing
    ProactiveToasts.tsx   # Auto-surfacing alerts
    VoiceMicButton.tsx    # Web Speech API input
  lib/
    openai.ts             # Shared OpenAI service layer (~420 lines)
  data/
    mockData.ts           # Full org graph, alerts, tasks, demo responses
```

---

## Quick Start

```bash
# Clone and install
git clone <repo-url> && cd nexus
npm install

# Optional: enable live AI responses
echo "VITE_OPENAI_API_KEY=sk-..." > .env

# Run
npm run dev
# Open http://localhost:5173/demo
```

> The demo works fully without an API key — all AI features fall back to pre-cached responses.

---

## The Big Idea

NEXUS is not a product — it's a new abstraction: **organizational intelligence**.

Just as an operating system abstracts hardware into a programmable interface, NEXUS abstracts organizational complexity into a reasoning layer that learns, adapts, and acts. Dashboards show you data. Chatbots answer your questions. NEXUS understands your organization's structure, memory, and judgment — and rewires communication to optimize for collective decision-making.

This unlocks superhuman problem-solving: not by replacing human judgment, but by ensuring that every human receives exactly the information their judgment requires, exactly when it matters.

The organization becomes smarter than any individual within it.

---

<p align="center">
  <strong>Built at Hack Nation MIT 2026</strong><br>
  <em>OpenAI-Sponsored Track</em>
</p>
