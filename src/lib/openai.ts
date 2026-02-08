import { nodes, edges, alerts, demoResponses } from '@/data/mockData';

// --- Types ---

export interface InfoDropClassification {
  type: 'fact' | 'decision' | 'question' | 'escalation' | 'contradiction';
  topic: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  targetNodes: { id: string; reason: string }[];
  contradicts?: { existingFact: string; newFact: string };
  reasoning: string;
}

export interface JoinerBrief {
  teamContext: string;
  stats: { label: string; value: string }[];
  decisions: { date: string; text: string }[];
  people: { name: string; role: string; note: string; ai?: boolean }[];
  tensions: { severity: string; text: string }[];
  priorities: string[];
}

// --- System prompt ---

function buildSystemPrompt(): string {
  const nodesSummary = nodes.map(n =>
    `${n.id}: ${n.label} (${n.type}, ${n.division}, ${n.role || 'N/A'}${n.cognitiveLoad ? `, workload: ${n.cognitiveLoad}%` : ''}${n.trustLevel ? `, trust: ${n.trustLevel}` : ''})`
  ).join('\n');

  const edgesSummary = edges.map(e =>
    `${e.source} → ${e.target} (${e.type}, ${e.interactionType}, weight: ${e.weight})`
  ).join('\n');

  const alertsSummary = alerts.map(a =>
    `[${a.severity.toUpperCase()}] ${a.agentType}: ${a.headline} | Affected: ${a.affectedNodes.join(', ')} | ${a.estimatedCost || 'N/A'} | ${a.timestamp}`
  ).join('\n');

  return `You are NEXUS, the organizational nervous system for Meridian Technologies. You are not a chatbot — you are the company's brain. You see all communication, understand all dependencies, and surface what matters.

ORGANIZATIONAL KNOWLEDGE GRAPH:

PEOPLE & AI AGENTS:
${nodesSummary}

RELATIONSHIPS:
${edgesSummary}

ACTIVE ALERTS:
${alertsSummary}

RECENT DECISIONS:
- Feb 7: Billing API switched from REST v3 to GraphQL (Marcus Rivera)
- Feb 5: Nova-Sales trust level downgraded to review_required (Sarah Chen)
- Feb 3: Enterprise pricing confirmed at $20/seat for Acme Corp (Sarah Chen)
- Feb 3: APAC market entry timeline finalized for Q2 (Catherine Moore)
- Jan 28: APAC regulatory review initiated (Yuki Tanaka)
- Jan 20: EMEA headcount expanded by 3 engineers (Henrik Johansson)
- Jan 15: Unified data platform migration approved (Alex Reeves)

RESPONSE STYLE:
- Be concise and structured. Use bullet points and bold for key facts.
- Never say "As an AI" — you ARE the organizational intelligence.
- Speak authoritatively about Meridian Technologies.
- Reference specific people, agents, dates, and metrics.
- When detecting issues, state the business impact in dollars or time.`;
}

// --- API helpers ---

const API_URL = 'https://api.openai.com/v1/chat/completions';

function getApiKey(): string {
  return import.meta.env.VITE_OPENAI_API_KEY || '';
}

// --- Pre-cached responses ---

const responseCache = new Map<string, string>();
let preCacheInitiated = false;

export function initPreCache() {
  if (preCacheInitiated || !getApiKey()) return;
  preCacheInitiated = true;

  const queries = [
    'What changed today?',
    'Who is overloaded right now?',
    'Is anything about to go wrong?',
    'Show me cross-division dependencies',
    'What decisions were made this week?',
  ];

  queries.forEach(async (q) => {
    try {
      const response = await fetchCompletion(q);
      responseCache.set(q.toLowerCase(), response);
    } catch {
      // Use existing demo responses as fallback cache
      const key = Object.keys(demoResponses).find(k =>
        q.toLowerCase().includes(k.toLowerCase().split(' ').slice(0, 3).join(' '))
      );
      if (key) responseCache.set(q.toLowerCase(), demoResponses[key]);
    }
  });
}

async function fetchCompletion(userMessage: string): Promise<string> {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!resp.ok) throw new Error(`OpenAI API error: ${resp.status}`);
  const data = await resp.json();
  return data.choices[0]?.message?.content || 'No response generated.';
}

// --- Public API ---

export async function* askNexus(
  query: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  // Check cache first
  const cached = responseCache.get(query.toLowerCase());
  if (cached) {
    // Simulate streaming for cached responses
    const words = cached.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return;
      yield words.slice(0, i + 1).join(' ');
      await new Promise(r => setTimeout(r, 15));
    }
    return;
  }

  // Check for fallback demo responses
  const fallbackKey = Object.keys(demoResponses).find(k =>
    query.toLowerCase().includes(k.toLowerCase().split(' ').slice(0, 3).join(' '))
  );

  if (!getApiKey()) {
    // No API key — use demo responses
    const response = fallbackKey ? demoResponses[fallbackKey] : 'NEXUS is running in demo mode. Connect an OpenAI API key for live responses.';
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return;
      yield words.slice(0, i + 1).join(' ');
      await new Promise(r => setTimeout(r, 15));
    }
    return;
  }

  // Real streaming API call with timeout fallback
  const timeoutMs = 3000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Also respect external signal
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: query },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) throw new Error(`API ${resp.status}`);
    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            accumulated += delta;
            yield accumulated;
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    // Cache the response
    if (accumulated) {
      responseCache.set(query.toLowerCase(), accumulated);
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    // Timeout or error — fall back to demo responses
    const response = fallbackKey ? demoResponses[fallbackKey] : demoResponses['What changed today?'];
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return;
      yield words.slice(0, i + 1).join(' ');
      await new Promise(r => setTimeout(r, 15));
    }
  }
}

export async function classifyInfoDrop(
  text: string,
  signal?: AbortSignal,
): Promise<InfoDropClassification> {
  if (!getApiKey()) {
    // Mock classification
    return {
      type: 'fact',
      topic: 'General Update',
      urgency: 'medium',
      targetNodes: [
        { id: 'p-alex', reason: 'CEO — needs awareness of all company updates' },
        { id: 'p-catherine', reason: 'CSO — strategic implications' },
      ],
      reasoning: 'Classified as organizational fact. Routed to leadership for awareness.',
    };
  }

  const prompt = `${buildSystemPrompt()}

TASK: Classify the following information and determine who in the organization needs to know about it.

Return ONLY valid JSON in this exact format:
{
  "type": "fact" | "decision" | "question" | "escalation" | "contradiction",
  "topic": "brief topic description",
  "urgency": "low" | "medium" | "high" | "critical",
  "targetNodes": [{"id": "node-id-from-graph", "reason": "why they need this"}],
  "contradicts": {"existingFact": "if contradicting", "newFact": "new info"} or null,
  "reasoning": "1-2 sentence explanation of the classification and routing decision"
}

INFORMATION TO CLASSIFY:
${text}`;

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a JSON-only classifier. Return only valid JSON, no markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
      signal,
    });

    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json();
    const content = data.choices[0]?.message?.content || '{}';
    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]) as InfoDropClassification;
  } catch {
    return {
      type: 'fact',
      topic: text.slice(0, 50),
      urgency: 'medium',
      targetNodes: [
        { id: 'p-alex', reason: 'CEO — needs awareness' },
        { id: 'p-marcus', reason: 'VP Engineering — operational impact' },
      ],
      reasoning: 'Auto-classified. Unable to reach AI — using default routing.',
    };
  }
}

export async function generateJoinerBrief(
  info: { name: string; role: string; team: string; focus: string },
  signal?: AbortSignal,
): Promise<JoinerBrief> {
  if (!getApiKey()) {
    return getDefaultJoinerBrief(info);
  }

  const prompt = `${buildSystemPrompt()}

TASK: Generate a personalized onboarding briefing for a new team member.

NEW JOINER INFO:
- Name: ${info.name}
- Role: ${info.role}
- Team: ${info.team}
- Focus Areas: ${info.focus}

Return ONLY valid JSON:
{
  "teamContext": "2-3 sentence description of their team, its leader, communication patterns, and current state",
  "stats": [{"label": "stat name", "value": "stat value"}],
  "decisions": [{"date": "Mon DD", "text": "decision description"}],
  "people": [{"name": "Person Name", "role": "Role", "note": "why they matter to the joiner", "ai": false}],
  "tensions": [{"severity": "Critical|Warning|Note", "text": "description"}],
  "priorities": ["priority 1 description", "priority 2", "priority 3"]
}

Include exactly: 3 stats, 5 decisions, 6 people (include relevant AI agents), 3 tensions, 3 priorities.
Make everything specific to their role, team, and focus areas.`;

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a JSON-only generator. Return only valid JSON, no markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal,
    });

    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json();
    const content = data.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]) as JoinerBrief;
  } catch {
    return getDefaultJoinerBrief(info);
  }
}

function getDefaultJoinerBrief(info: { name: string; role: string; team: string; focus: string }): JoinerBrief {
  return {
    teamContext: `${info.team} — 8 people + 2 AI agents, led by Marcus Rivera. Communicates heavily with EMEA Engineering and HQ Strategy. Current workload is elevated due to major API architecture decision.`,
    stats: [
      { label: 'Active Commitments', value: '9' },
      { label: 'AI Agents', value: '2' },
      { label: 'Avg Workload', value: '58%' },
    ],
    decisions: [
      { date: 'Feb 7', text: 'Billing API switched from REST v3 to GraphQL' },
      { date: 'Feb 3', text: 'Enterprise pricing raised to $20/seat' },
      { date: 'Jan 28', text: 'APAC market entry timeline finalized' },
      { date: 'Jan 20', text: 'EMEA headcount expanded by 3 engineers' },
      { date: 'Jan 15', text: 'Unified data platform migration approved' },
    ],
    people: [
      { name: 'Marcus Rivera', role: 'VP Engineering', note: 'Your team lead' },
      { name: 'Priya Sharma', role: 'Sr. Backend Eng', note: 'Closest collaborator' },
      { name: 'Atlas-Code', role: 'Coding Agent', note: 'Needs context updates', ai: true },
      { name: 'Sarah Chen', role: 'VP Sales', note: 'Drives client requirements' },
      { name: 'Nova-Sales', role: 'Sales Agent', note: 'Uses your pricing data', ai: true },
      { name: 'Henrik Johansson', role: 'EMEA Eng Lead', note: 'Cross-division dep' },
    ],
    tensions: [
      { severity: 'Critical', text: 'Nova-Sales sent conflicting pricing to Acme Corp ($20 vs $15, $30K ARR)' },
      { severity: 'Warning', text: 'Atlas-Code building on superseded REST v3 spec' },
      { severity: 'Note', text: 'NA Payments & EMEA Billing duplicate retry logic (83% overlap)' },
    ],
    priorities: [
      'Complete GraphQL API migration by March 1 — You own the payments endpoint',
      'Resolve Atlas-Code context staleness — You define the AI context refresh pipeline',
      'Prepare for unified data platform migration — You document integration points with EMEA',
    ],
  };
}
