# NEXUS Demo Script v2
## AI Chief of Staff — Organizational Nervous System
**OpenAI Track | Hack-Nation MIT | Feb 7-8, 2026**

**Runtime:** 4 minutes | **Format:** One continuous story, not a feature tour

---

## SETUP (Before Judges Arrive)

```bash
./start.sh          # or: npm run dev
```

- Browser at `http://localhost:5173/demo`
- Optional: set `VITE_OPENAI_API_KEY` in `.env` for live AI responses
- Full-screen browser, dark room if possible

---

## THE STORY

*You are NEXUS. You are the nervous system of a 300-person company. This is one morning.*

---

### ACT 1: "Good Morning" — The Canvas Speaks
**[0:00 – 0:30]**

**Do nothing.** Let the canvas breathe for 5 seconds. Judges see:
- 24 pulsing nodes across 4 global divisions
- Particle flows on 34 pathways — real-time information movement
- AI agents (hexagons) embedded alongside humans (circles)
- **$75.2K ORG RISK** in the top bar — the organization's current exposure

> "This is NEXUS — a living map of your organization's intelligence. Every node is a person or AI agent. Every particle is information flowing between them. That number in the top right? That's real-time organizational risk."

**Click a node** (any person) to show the detail panel:

> "Click anyone — workload percentage, trust level, division. This isn't a dashboard; it's a nervous system."

Close the detail panel.

**Wait 3-5 seconds.** Proactive toasts slide in from the right:
- CRITICAL: Contradiction detected
- WARNING: Overload risk on Catherine Moore
- INFO: Knowledge silo between two teams

> "See those alerts? NEXUS didn't wait for you to ask. It found three problems while you were getting coffee."

---

### ACT 2: "Show Me the Reasoning" — Contradiction Trace
**[0:30 – 1:15]**

**Click the "Contradiction" button** (or click "View" on the first toast).

> "Let's follow how NEXUS caught this. Watch the left panel."

**Narrate along with the 7-step trace animation:**

1. "Coordinator receives Nova-Sales sent a $15/seat proposal to Acme Corp..."
2. "Memory queries the truth ledger — what did we actually promise them?"
3. "Found it: Sarah Chen verbally committed $20/seat on a client call."
4. "Critic validates: that's a $5 per seat conflict..."
5. "CONTRADICTION CONFIRMED. $30K in annual revenue at risk."
6. "Router escalates to Sarah Chen, Tom Bradley, and the CFO."
7. "Nova-Sales trust level downgraded to review_required."

**Point at the canvas:**

> "See the agent mesh bar? Each agent lights up as it works. Watch the particles — those are agent-to-agent messages, visible on the graph. This is not a black box. Every step is auditable."

---

### ACT 3: "What If We Lose Her?" — Departure Cascade
**[1:15 – 2:15]**

**Click "What If?" button.**

> "Catherine Moore, our CSO, just resigned. What happens?"

**Canvas:** Catherine's node greys out, marked "DEPARTED." Her connections go dashed.

**Watch the left panel cascade:**

> "Six workstreams stall. Three divisions lose coordination. Sarah Chen's load jumps from 78% to 95%. The APAC launch delays two quarters — $1.8M revenue at risk."

**Point at the top bar:**

> "Watch the dollar counter — it's climbing. $75K baseline... $420K... $1.2M... **$2.4M organizational risk** from losing one person."

**Wait for recovery suggestions to appear:**

> "But NEXUS doesn't just show the problem — it shows the recovery plan. Sarah Chen absorbs client strategy. Alex Reeves takes direct oversight. Yuki Tanaka gets promoted to fill the APAC gap."

**Key line:**

> "This is the kind of scenario that takes a consulting firm two weeks. NEXUS runs it in two seconds."

**Click "Reset"** to clear state.

---

### ACT 4: "Does Everyone Know?" — Understanding Spread
**[2:15 – 2:45]**

**Click "Spread" button.**

> "When the CEO makes a strategic decision, how fast does knowledge actually propagate?"

**Canvas:** Alex Reeves lights up first. Then nodes illuminate outward — BFS wave visible on the graph.

**Point at the center counter:**

> "Watch: 1 informed... 5... 12... 18... but look — two nodes stay dim. 'NOT REACHED.' Those are knowledge gaps."

> "NEXUS just showed you that two people in your organization will never hear about this decision through normal channels. That's how silos form. That's how contradictions happen."

---

### ACT 5: "The Truth Ledger" — Version-Controlled Organizational Memory
**[2:45 – 3:15]**

**Click "Timeline" button.**

> "Every decision, contradiction, and resolution — version-controlled."

**Point at entries:**

> "Purple: decisions. Red: contradictions. Green: resolutions. This is organizational git — you can trace how any piece of truth evolved."

**Point at truth snapshot:**

> "94% alignment across the organization. Two active alerts. This is the number your CEO should see every morning."

---

### ACT 6: "Welcome Aboard" — 5-Minute Onboarding
**[3:15 – 3:45]**

**Click "New Joiner" button.**

> "Jordan Mitchell starts Monday as a Senior Engineer. What does onboarding look like today?"

**Fill in form, click Generate Briefing:**

> "In 5 seconds, Jordan gets: team context, key relationships, active decisions, open tensions, and who to talk to first. Powered by OpenAI, grounded in the truth ledger."

**Key stat:**

> "Time to full organizational context: **5 minutes.** Industry average: **3 to 6 months.**"

---

### CLOSE: The Big Idea
**[3:45 – 4:00]**

> "NEXUS is not a dashboard. It's an organizational nervous system — multi-agent reasoning you can see, a truth ledger you can audit, and intelligence that flows to the right people before they even ask."

> "This is what happens when you stop treating information as documents and start treating it as a living system."

---

## IF JUDGES ASK...

**"How does the AI reasoning work?"**
> Four specialized agents: Coordinator orchestrates, Memory retrieves context, Critic validates against truth, Router escalates to the right humans. All built on OpenAI GPT-4o, all visible on the canvas.

**"Is this real data?"**
> Mock data for the demo, but the architecture is production-ready. Every panel connects to the OpenAI API with fallback to cached responses.

**"What about scale?"**
> The graph is force-directed with deterministic layout. BFS propagation is pre-computed. The canvas handles hundreds of nodes at 60fps.

**"How is this different from Slack/Teams?"**
> Slack is a message pipe — information goes in and never comes out. NEXUS ingests from Slack, extracts truth, detects contradictions, and pushes intelligence back to the right people.

**"What's the business case?"**
> Companies lose $5M/year to internal misalignment (Gartner). Average executive spends 23 hours/week finding information. One undetected pricing contradiction cost Acme $30K ARR — NEXUS caught it in 200ms.

---

## EMERGENCY FALLBACK

If the demo breaks mid-presentation:

1. **Tell the Catherine Moore story verbally.** "Our CSO just quit. Six workstreams freeze. $2.4M at risk. NEXUS maps the cascade and generates a recovery plan in 2 seconds."

2. **Show the canvas.** Even a frozen canvas with glowing nodes and particles is visually compelling. Gesture at the agent hexagons and human circles.

3. **End with the stat.** "5 minutes to full context. Industry average: 3 to 6 months."

---

## REHEARSAL CHECKLIST

- [ ] Run through the full 4-minute flow 3 times
- [ ] Practice clicking buttons without looking at keyboard
- [ ] Time the What-If cascade — know when to say each line
- [ ] Have the "big stat" (5 min vs 3-6 months) memorized for the close
- [ ] Test mic permissions for voice input (bonus if time allows)

**The story is: One morning. Three crises. One nervous system. Go.**
