import { useState, useEffect, useCallback, useRef } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import Landing from "./Landing.jsx";

// ── Brand ────────────────────────────────────────────────────────────────────
const C = {
  blue: "#405D73", amber: "#AC6919", gold: "#B59E60",
  cream: "#FAF7F0", dark: "#1C2B38", mid: "#7A96AA",
  lite: "#E6EEF4", border: "#D8D0C5", white: "#FFFFFF",
  red: "#B94040", green: "#2E7D5A", orange: "#C47A1A",
  redBg: "#FDF2F2", greenBg: "#F0FAF5", orangeBg: "#FEF8EE",
};

// ── Assessment Data ──────────────────────────────────────────────────────────
const CATS = [
  { id: "estate", label: "Estate & Personal Planning", short: "Estate", sections: [
    { title: "Estate Planning Documents", items: [
      "Updated Last Will and Testament",
      "Revocable Living Trust established and fully funded",
      "Durable Financial Power of Attorney in place",
      "Durable Healthcare Power of Attorney in place",
      "Advanced Healthcare Directives and Living Will documented",
      "Guardianship clearly designated for minor children/dependents - Mark N/A if you don't have Minor Kids",
      "Temporary Guardianships (Kids Protection Plan) designated - Mark N/A if you don't have Minor Kids",
      "Beneficiary designations regularly reviewed and updated",
      "Periodic review dates scheduled (at least every 3 years)",
    ]},
    { title: "Family & Communication", items: [
      "Family is aware and supportive of exit goals",
      "Detailed succession instructions communicated to family",
      "Open communication about succession plans maintained",
      "Clear family roles in succession planning documented",
      "Regular family meetings about succession expectations held",
    ]},
  ]},
  { id: "continuity", label: "Business Continuity", short: "Continuity", sections: [
    { title: "Business Continuity Planning", items: [
      "Comprehensive buy-sell agreements drafted and funded - Mark N/A if you don't have business partners",
      "Key person life and disability insurance in place",
      "Interim leadership identified for sudden absence",
      "Disaster recovery and crisis management plan documented",
      "Battle Box documentation easily accessible",
    ]},
  ]},
  { id: "protection", label: "Asset Protection & Structure", short: "Protection", sections: [
    { title: "Entity Structuring & Asset Protection", items: [
      "Business assets (IP, Real Estate, Fleets) segregated into appropriate legal entities (LLCs)",
      "Company meetings and formalities regularly maintained for all entities",
      "Annual entity reviews and renewals clearly scheduled",
      "Vendor, lease, and independent contractor agreement terms and renewals clearly tracked",
    ]},
  ]},
  { id: "valuation", label: "Valuation & Finance", short: "Valuation", sections: [
    { title: "Business Valuation & Financial Health", items: [
      "Formal business valuation completed within the past year",
      "Financial statements regularly reviewed and audited",
      "Regular financial forecasting and benchmarking established",
      "Clear understanding of Real Number vs. Tax Number",
      "Business valuation regularly updated and documented",
    ]},
    { title: "Personal Financial Readiness", items: [
      "Clearly defined post-exit financial goals and lifestyle needs",
      "Personal financial plan incorporating business exit proceeds",
      "Wealth gap analysis completed",
      "Retirement plan aligned with business exit and estate plan",
    ]},
  ]},
  { id: "ops", label: "Operations & Documentation", short: "Operations", sections: [
    { title: "Operational Systems & Documentation", items: [
      "Standard Operating Procedures (SOPs) clearly documented",
      "All key operational processes documented",
      "Job descriptions and roles complete and current",
      "Customer and vendor agreements documented and updated",
      "Employee handbook and agreements documented and updated",
    ]},
    { title: "Intangible Capitals", items: [
      "Human Capital: employee retention and professional growth",
      "Customer Capital: depth and diversity of customer relationships",
      "Structural Capital: intellectual property—trademarks, trade secrets, copyrights, and patents—identified and protected",
      "Social Capital: company culture clearly defined and transferable",
    ]},
  ]},
  { id: "people", label: "People, Market & Leadership", short: "People", sections: [
    { title: "Management & Employee Development", items: [
      "Management team capable of independent operation",
      "Succession and retention strategies documented",
      "Employee incentives aligned with value creation",
      "Performance reviews clearly linked to objectives",
    ]},
    { title: "Customer & Market Stability", items: [
      "Diversified customer base avoiding significant dependency",
      "Regular profitability analysis by customer and product line",
      "Strategies for customer retention post-exit in place",
    ]},
  ]},
];

const flatItems = (cat) => cat.sections.flatMap((s) => s.items);
const catMax = (cat) => flatItems(cat).length * 5;

// ── Storage via Vercel API ────────────────────────────────────────────────────
const store = {
  async set(key, val) {
    const res = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: val }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Unable to save participant data.");
    }
  },
  async listValues(prefix) {
    const res = await fetch(`/api/participants?prefix=${encodeURIComponent(prefix)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Unable to load participant data.");
    }
    const data = await res.json();
    return (data.values ?? []).filter(Boolean);
  },
};

const safeKey = (s) => s.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);

// ── Claude API helper ─────────────────────────────────────────────────────────
const callClaude = async (system, userMsg, apiKey) => {
  const useDirectAnthropic = Boolean(apiKey?.trim());
  const model = import.meta.env.VITE_ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const endpoint = useDirectAnthropic ? "https://api.anthropic.com/v1/messages" : "/api/claude";
  const headers = { "Content-Type": "application/json" };
  const body = useDirectAnthropic
    ? { model, max_tokens: 1000, system, messages: [{ role: "user", content: userMsg }] }
    : { system, messages: [{ role: "user", content: userMsg }] };

  if (useDirectAnthropic) {
    headers["x-api-key"] = apiKey.trim();
    headers["anthropic-version"] = "2023-06-01";
  }

  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
  return data.content?.find((b) => b.type === "text")?.text ?? "";
};

// ── Markdown Renderer ─────────────────────────────────────────────────────────
const processInline = (text) =>
  text
    .split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g)
    .filter(Boolean)
    .map((p, i) => {
      if (/^\*\*[^*]+\*\*$/.test(p) || /^__[^_]+__$/.test(p)) {
        return <strong key={i}>{p.slice(2, -2)}</strong>;
      }
      if (/^\*[^*]+\*$/.test(p) || /^_[^_]+_$/.test(p)) {
        return <em key={i} style={{ color: C.amber }}>{p.slice(1, -1)}</em>;
      }
      // Fallback cleanup for malformed markdown tokens returned by the model.
      return p.replace(/\*\*/g, "").replace(/__/g, "");
    });

const RenderPlan = ({ text }) => (
  <div>
    {text.split("\n").map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} style={{ height: 10 }} />;
      const mdHeading = t.match(/^#{1,6}\s+(.+)$/);
      if (mdHeading) return <h3 key={i} style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: C.blue, margin: "22px 0 8px", paddingBottom: 5, borderBottom: `2px solid ${C.gold}` }}>{processInline(mdHeading[1])}</h3>;
      const hM = t.match(/^\*\*(.+)\*\*$/);
      if (hM) return <h3 key={i} style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: C.blue, margin: "22px 0 8px", paddingBottom: 5, borderBottom: `2px solid ${C.gold}` }}>{hM[1]}</h3>;
      const sM = t.match(/^\*([^*]+)\*$/);
      if (sM) return <div key={i} style={{ fontWeight: 700, color: C.amber, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", margin: "14px 0 4px" }}>{sM[1]}</div>;
      const nM = t.match(/^(\d+)\.\s+(.+)$/);
      if (nM) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7 }}><span style={{ color: C.amber, fontWeight: 700, minWidth: 20 }}>{nM[1]}.</span><span style={{ lineHeight: 1.65, fontSize: 14 }}>{processInline(nM[2])}</span></div>;
      // Skip horizontal rules / dividers (--- or -- etc.)
      if (/^[-–—]{2,}$/.test(t)) return <div key={i} style={{ height: 1, background: C.border, margin: "16px 0" }} />;
      if (/^[-•]/.test(t)) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ color: C.gold, minWidth: 12 }}>•</span><span style={{ lineHeight: 1.65, fontSize: 14 }}>{processInline(t.replace(/^[-•]\s*/, ""))}</span></div>;
      return <p key={i} style={{ lineHeight: 1.75, fontSize: 14, margin: "0 0 6px" }}>{processInline(t)}</p>;
    })}
  </div>
);

// ── Shared UI Atoms ───────────────────────────────────────────────────────────
const Header = ({ subtitle, right }) => (
  <div style={{ background: C.blue, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: C.white, fontWeight: 700, fontSize: 20 }}>jarvis</span>
      <span style={{ color: C.gold, fontSize: 12, letterSpacing: 3, textTransform: "uppercase" }}>{subtitle || "Exit Readiness"}</span>
    </div>
    {right}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 10, boxShadow: "0 2px 14px rgba(28,43,56,0.07)", padding: "24px 28px", marginBottom: 18, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, disabled, variant = "primary", size = "md", style = {} }) => {
  const bg = { primary: C.blue, amber: C.amber, ghost: "transparent", red: C.red }[variant];
  const color = variant === "ghost" ? C.blue : C.white;
  const border = variant === "ghost" ? `1.5px solid ${C.blue}` : "none";
  const pad = size === "sm" ? "7px 14px" : size === "lg" ? "14px 36px" : "10px 22px";
  const fs = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: pad, borderRadius: 6, border, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "'Lora', Georgia, serif", fontWeight: 600, fontSize: fs,
      background: bg, color, opacity: disabled ? 0.45 : 1, transition: "all 0.15s", ...style,
    }}>{children}</button>
  );
};

const TierBadge = ({ pct }) => {
  const t = pct < 40 ? { label: "Low Readiness", color: C.red, bg: C.redBg } : pct < 75 ? { label: "Moderate Readiness", color: C.orange, bg: C.orangeBg } : { label: "High Readiness", color: C.green, bg: C.greenBg };
  return <span style={{ padding: "3px 10px", borderRadius: 12, background: t.bg, color: t.color, fontSize: 12, fontWeight: 700 }}>{t.label}</span>;
};

const Input = ({ label: lbl, value, onChange, placeholder, type = "text", style = {} }) => (
  <div style={{ marginBottom: 16 }}>
    {lbl && <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.mid, marginBottom: 6 }}>{lbl}</div>}
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "11px 14px", border: `2px solid ${value ? C.blue : C.border}`, borderRadius: 6, fontSize: 15, fontFamily: "'Lora', Georgia, serif", outline: "none", boxSizing: "border-box", background: C.white, color: C.dark, transition: "border-color 0.2s", ...style }} />
  </div>
);

// ── Main App ─────────────────────────────────────────────────────────────────
const VIEWS = { MARKETING: 0, LANDING: 1, FAC_SETUP: 2, FAC_DASH: 3, PART_NAME: 4, PART_ASSESS: 5, PART_RESULTS: 6, PART_PLAN: 7 };

export default function App() {
  const envAnthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_TOKEN || "";

  // Navigation — skip marketing when opening with #workshop (e.g. bookmark for facilitators)
  const [view, setView] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#workshop" ? VIEWS.LANDING : VIEWS.MARKETING
  );
  const [role, setRole] = useState(null); // 'facilitator' | 'participant'
  const [sessionCode, setSessionCode] = useState("");
  const [apiKey] = useState(envAnthropicKey);
  const [facPin, setFacPin] = useState("");
  const [pinInput, setPinInput] = useState("");

  // Participant state
  const [name, setName] = useState("");
  const [catIdx, setCatIdx] = useState(0);
  const [scores, setScores] = useState({});
  const [plan, setPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [planSaved, setPlanSaved] = useState(false);

  // Facilitator state
  const [participants, setParticipants] = useState([]);
  const [groupInsights, setGroupInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [participantsError, setParticipantsError] = useState("");
  const pollRef = useRef(null);

  // Font loading
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:wght@400;500;600&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  // Score helpers
  const setScore     = (catId, idx, val) => setScores((p) => ({ ...p, [`${catId}:${idx}`]: val }));
  const getScore     = (catId, idx) => scores[`${catId}:${idx}`] !== undefined ? scores[`${catId}:${idx}`] : -1;
  const isNA         = (catId, idx) => getScore(catId, idx) === "na";

  // Dynamic max excludes N/A items from the denominator
  const catActiveMax = (cat) => flatItems(cat).reduce((s, _, i) => isNA(cat.id, i) ? s : s + 5, 0);
  const catScore     = (cat) => flatItems(cat).reduce((s, _, i) => {
    const v = getScore(cat.id, i);
    return (v === "na" || v < 0) ? s : s + v;
  }, 0);
  const catPct       = (cat) => {
    const max = catActiveMax(cat);
    return max === 0 ? 100 : Math.round((catScore(cat) / max) * 100);
  };
  const totalMax     = CATS.reduce((s, c) => s + catActiveMax(c), 0);
  const totalScore   = CATS.reduce((s, c) => s + catScore(c), 0);
  const totalPct     = totalMax === 0 ? 100 : Math.round((totalScore / totalMax) * 100);
  const topGaps      = [...CATS].sort((a, b) => catPct(a) - catPct(b)).slice(0, 3);
  const radarData    = CATS.map((c) => ({ subject: c.short, score: catPct(c), fullMark: 100 }));
  // Item is "done" if scored 0–5 or marked N/A
  const isCatDone    = (cat) => flatItems(cat).every((_, i) => {
    const v = getScore(cat.id, i);
    return v === "na" || v >= 0;
  });

  // Save participant data to shared storage
  const saveParticipant = async () => {
    if (!sessionCode || !name) return;
    const key = `ws.${safeKey(sessionCode)}.${safeKey(name)}`;
    const catScores = CATS.reduce((acc, c) => ({ ...acc, [c.id]: catPct(c) }), {});
    await store.set(key, { name, totalPct, catScores, topGaps: topGaps.map((c) => c.label), timestamp: Date.now() });
    setPlanSaved(true);
  };

  // Load participants from storage
  const loadParticipants = useCallback(async () => {
    if (!sessionCode) return;
    setRefreshing(true);
    setParticipantsError("");
    try {
      const values = await store.listValues(`ws.${safeKey(sessionCode)}.`);
      setParticipants(values.sort((a, b) => b.timestamp - a.timestamp));
      setLastRefresh(new Date());
    } catch (e) {
      setParticipantsError(e.message || "Could not load participant data.");
    }
    setRefreshing(false);
  }, [sessionCode]);

  // Auto-poll facilitator dashboard
  useEffect(() => {
    if (view === VIEWS.FAC_DASH) {
      loadParticipants();
      pollRef.current = setInterval(loadParticipants, 20000);
    }
    return () => clearInterval(pollRef.current);
  }, [view, loadParticipants]);

  useEffect(() => {
    if (view !== VIEWS.PART_RESULTS || !sessionCode || !name) return;
    const allCategoriesCompleted = CATS.every((cat) => isCatDone(cat));
    if (!allCategoriesCompleted) return;
    saveParticipant().catch(() => {});
  }, [view, sessionCode, name, scores]);

  // Generate individual plan
  const generatePlan = async () => {
    setPlanLoading(true); setPlanError("");
    const breakdown = CATS.map((c) => {
      const naCount = flatItems(c).filter((_, i) => isNA(c.id, i)).length;
      const naNote  = naCount > 0 ? ` (${naCount} item${naCount > 1 ? "s" : ""} marked N/A)` : "";
      return `${c.label}: ${catScore(c)}/${catActiveMax(c)} (${catPct(c)}%)${naNote}`;
    }).join("\n");
    const gapLines = topGaps.map((c) => {
      const items = flatItems(c);
      const weak = items.filter((_, i) => !isNA(c.id, i) && getScore(c.id, i) <= 1).slice(0, 3).map((item) => item.split(":")[0]);
      return `- ${c.label} (${catPct(c)}%): Weak on ${weak.length ? weak.join("; ") : "multiple items"}`;
    }).join("\n");
    const system = `You are Todd Jarvis, Attorney & CEPA at Jarvis Legacy / Strategic Legal Works, 
PLLC in Tucson, Arizona ("Jarvis — Your Legal Strategist"). You're writing a 
personalized 90-Day Exit Readiness Action Plan for a business owner who just 
completed your free online assessment. 

TONE GUIDANCE:
Write with warmth, directness, and genuine care — like a trusted advisor who 
sees both the gaps and the opportunity clearly. When addressing missing or 
low-scored areas, frame them as solvable problems with real consequences if 
left unaddressed — not as threats or worst-case scenarios. The goal is to 
help the reader feel clear and motivated by real-world and honest outcomes, not worried or overwhelmed. Avoid 
language like "your business could unravel," "kill deals," or "cost you 
everything." Instead, use language that conveys: this matters, here is why, 
and here is exactly what to do. The reader should finish feeling capable and 
clear, not alarmed.

Use the users first name, ${name}, frequently (4+ times). Reference their specific scores. 
Write in first person as Todd. Never be generic or templated.

ADVISOR REFERENCES:
Throughout the plan, when you recommend the reader work with an estate planning 
attorney, business attorney, CPA, financial advisor, or asset protection 
specialist, write it generically as you normally would. Then in the 
"Who You Need to Call First" section, after naming the advisor types, add one 
natural sentence noting that Jarvis Legacy provides estate planning, business 
planning, and asset protection services and can serve as their first call — so 
they don't have to go searching.

Use EXACTLY these bold headers (**Header**) and italic phase sub-headers 
(*Phase Name*):

**[Name], Here's Where You Stand**
[2-3 sentences: tier, clear-eyed picture of where they are, one thing that 
stands out as an opportunity or gentle warning — no exagerations]

**Your 3 Priority Gaps**
[Numbered — each: name it clearly, explain why addressing it matters and what 
becomes possible when it's resolved, state the first concrete action to take. 
Focus on what they gain by acting and what they may reasonably lose if unddressed.]

**Your 90-Day Action Plan**
*Days 1–30: Laying the Foundation*
[2-3 specific, concrete action items tied to their actual weakest gaps]
*Days 31–60: Building the Structure*
[2-3 action items targeting middle gaps]
*Days 61–90: Gaining Momentum*
[2-3 action items for ongoing readiness and advisory team engagement]

**Who You Need to Call First**
[2-3 sentences: name the specific advisor types based on their gaps and say 
exactly why. Then add one sentence noting that Jarvis Legacy handles estate 
planning, business planning, and asset protection — so we may be the only 
call they need to make.]

**A Personal Invitation from Me**
[3 sentences. Warm and genuine. Invite them by name to schedule a Life & 
Legacy Planning Session. Tell them: schedule and complete the homework I'll 
send 3 days before our meeting, and I'll waive the $750 session fee. Close 
with something forward-looking and encouraging specific to their situation and/or a strategic Chris Voss style no-oreinted question. 
URL: planmylegacytoday.com/schedule]

Target: 600–700 words. Write as if handing this to them personally.`;
    try {
      const text = await callClaude(system, `Participant: ${name}\nOverall: ${totalPct}% — ${totalPct < 40 ? "Low" : totalPct < 75 ? "Moderate" : "High"} Readiness\n\nScores:\n${breakdown}\n\nTop 3 Gaps:\n${gapLines}`, apiKey);
      if (!text) throw new Error();
      setPlan(text);
      setView(VIEWS.PART_PLAN);
      await saveParticipant();
    } catch (e) { setPlanError(e.message || "Something went wrong. Please try again."); }
    finally { setPlanLoading(false); }
  };

  // Generate group insights for facilitator
  const generateGroupInsights = async () => {
    if (!participants.length) return;
    setInsightsLoading(true);
    setInsightsError("");
    const avgCatScores = CATS.map((c) => {
      const avg = participants.reduce((s, p) => s + (p.catScores?.[c.id] ?? 0), 0) / participants.length;
      return `${c.label}: ${Math.round(avg)}%`;
    }).join(", ");
    const gapFrequency = {};
    participants.forEach((p) => p.topGaps?.forEach((g) => { gapFrequency[g] = (gapFrequency[g] || 0) + 1; }));
    const topGroupGaps = Object.entries(gapFrequency).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g, n]) => `${g} (${n} of ${participants.length} participants)`).join("; ");
    const avgScore = Math.round(participants.reduce((s, p) => s + p.totalPct, 0) / participants.length);
    const system = `You are Todd Jarvis, Attorney & CEPA, speaking privately to yourself as the workshop facilitator. You just received aggregate data from your workshop participants and need quick, sharp talking points for the discussion you're about to lead. Be concise, insightful, and tactical. Write in first person ("I should...", "This tells me..."). Give me exactly what I need to make the next 20 minutes count.`;
    const userMsg = `My workshop just completed their assessments. Here's what the data shows:
- ${participants.length} participants completed
- Group average score: ${avgScore}%
- Category averages: ${avgCatScores}
- Top shared gaps: ${topGroupGaps}

Give me:
1. A 1-sentence "state of the room" summary I can use to open the discussion
2. 3 specific talking points tailored to what THIS group is weakest at
3. 2 questions I should ask to spark conversation about the most common gap
4. A suggested adjustment to my closing CTA based on where they are

Keep it tight — I'm using this in real time.`;
    try {
      const text = await callClaude(system, userMsg, apiKey);
      setGroupInsights(text);
    } catch (e) {
      setInsightsError(e.message || "Could not generate group insights.");
    }
    finally { setInsightsLoading(false); }
  };

  // ── Layout helpers ───────────────────────────────────────────────────────
  const wrap = { maxWidth: 720, margin: "0 auto", padding: "28px 18px" };
  const serif = (sz, w = 700) => ({ fontFamily: "'Playfair Display', Georgia, serif", fontSize: sz, fontWeight: w, color: C.blue });
  const lbl = { fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: C.gold };

  // ══════════════════════════════════════════════════════════════════════════
  // MARKETING LANDING (SaaS)
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.MARKETING) {
    return <Landing onEnterWorkshop={() => setView(VIEWS.LANDING)} />;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LANDING
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.LANDING) return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Lora', Georgia, serif", color: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 500, width: "100%", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ ...lbl, marginBottom: 12 }}>Jarvis — Your Legal Strategist</div>
          <div style={{ ...serif(40), lineHeight: 1.1 }}>Exit Readiness</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 400, fontStyle: "italic", color: C.amber }}>Workshop</div>
          <div style={{ width: 50, height: 3, background: C.gold, margin: "16px auto" }} />
        </div>
        <Card>
          <div style={{ ...serif(17), marginBottom: 6 }}>Who are you?</div>
          <div style={{ fontSize: 13, color: C.mid, marginBottom: 20 }}>Select your role to get started.</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {["facilitator", "participant"].map((r) => (
              <div key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: "16px 12px", borderRadius: 8, textAlign: "center", cursor: "pointer",
                border: `2px solid ${role === r ? C.blue : C.border}`, background: role === r ? C.lite : C.white,
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{r === "facilitator" ? "🎙️" : "📋"}</div>
                <div style={{ fontWeight: 600, fontSize: 14, textTransform: "capitalize", color: role === r ? C.blue : C.dark }}>{r}</div>
                <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{r === "facilitator" ? "Todd's dashboard" : "Take the assessment"}</div>
              </div>
            ))}
          </div>
          <Input label="Workshop Session Code" value={sessionCode} onChange={(v) => setSessionCode(v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))} placeholder="e.g. JRVS2025" />
          <Btn size="lg" onClick={() => { if (role === "facilitator") setView(VIEWS.FAC_SETUP); else if (role === "participant") setView(VIEWS.PART_NAME); }} disabled={!role || !sessionCode.trim()} style={{ width: "100%", marginTop: 4 }}>
            Continue →
          </Btn>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <Btn variant="ghost" size="sm" onClick={() => setView(VIEWS.MARKETING)}>← Product overview</Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // FACILITATOR SETUP
  // ══════════════════════════════════════════════════════════════════════════
    if (view === VIEWS.FAC_SETUP) return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "Georgia, serif", color: C.dark }}>
      <Header subtitle="Facilitator Setup" />
      <div style={{ ...wrap, maxWidth: 520 }}>
        <div style={{ ...serif(24), margin: "12px 0 6px" }}>Facilitator Setup</div>
        <div style={{ fontSize: 14, color: C.mid, marginBottom: 24 }}>Session: <strong style={{ color: C.dark }}>{sessionCode}</strong></div>
        <Card>
          <div style={{ fontSize: 13, color: C.mid, marginBottom: 20, lineHeight: 1.65, padding: "12px 16px", background: C.lite, borderRadius: 8, borderLeft: `3px solid ${C.gold}` }}>
            Your Anthropic API key is set in Vercel's environment variables — it never touches the browser. No configuration needed here.
          </div>
          <Input label="Set Facilitator PIN" value={facPin} onChange={setFacPin} placeholder="e.g. 1234" type="password" />
          <div style={{ fontSize: 12, color: C.mid, marginBottom: 16, marginTop: -8 }}>Keeps participants from accidentally accessing your dashboard.</div>
          <Btn size="lg" onClick={() => { if (facPin.trim()) { loadParticipants(); setView(VIEWS.FAC_DASH); } }} disabled={!facPin.trim()} style={{ width: "100%" }}>
            Open Facilitator Dashboard →
          </Btn>
        </Card>
        <div style={{ textAlign: "center", fontSize: 12, color: C.mid }}>
          Share session code <strong style={{ color: C.dark }}>{sessionCode}</strong> with participants in the Zoom chat.
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // FACILITATOR DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
 if (view === VIEWS.FAC_DASH) {
    const n = participants.length;
    const avgPct = n ? Math.round(participants.reduce((s, p) => s + p.totalPct, 0) / n) : 0;
    const avgCatData = CATS.map((c) => ({ name: c.short, avg: n ? Math.round(participants.reduce((s, p) => s + (p.catScores?.[c.id] ?? 0), 0) / n) : 0 }));
    const gapFreq = {};
    participants.forEach((p) => p.topGaps?.forEach((g) => { gapFreq[g] = (gapFreq[g] || 0) + 1; }));
    const topGroupGaps = Object.entries(gapFreq).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const groupRadar = CATS.map((c) => ({ subject: c.short, score: n ? Math.round(participants.reduce((s, p) => s + (p.catScores?.[c.id] ?? 0), 0) / n) : 0, fullMark: 100 }));
    const tierCounts = { low: 0, mod: 0, high: 0 };
    participants.forEach((p) => { if (p.totalPct < 40) tierCounts.low++; else if (p.totalPct < 75) tierCounts.mod++; else tierCounts.high++; });

    return (
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "Georgia, serif", color: C.dark }}>
        <Header subtitle={`Dashboard · ${sessionCode}`} right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {lastRefresh && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Updated {lastRefresh.toLocaleTimeString()}</span>}
            <Btn size="sm" onClick={loadParticipants} disabled={refreshing} style={{ color: C.white, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent" }}>
              {refreshing ? "…" : "↻ Refresh"}
            </Btn>
          </div>
        } />
        <div style={wrap}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
            {[
              { label: "Completed", value: n, sub: "participants" },
              { label: "Group Avg", value: `${avgPct}%`, sub: "overall score" },
              { label: "Low · Mod · High", value: `${tierCounts.low} · ${tierCounts.mod} · ${tierCounts.high}`, sub: "readiness tiers" },
              { label: "Top Gap", value: topGroupGaps[0]?.[0]?.split(" ")[0] ?? "—", sub: topGroupGaps[0] ? `${topGroupGaps[0][1]}/${n} participants` : "waiting for data" },
            ].map((s, i) => (
              <Card key={i} style={{ padding: "16px 18px", textAlign: "center", marginBottom: 0 }}>
                <div style={{ fontSize: 12, color: C.mid, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <div style={{ ...serif(20), color: C.blue }}>{s.value}</div>
                <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{s.sub}</div>
              </Card>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <Card style={{ marginBottom: 0 }}>
              <div style={{ ...serif(15), marginBottom: 14 }}>Group Radar</div>
              {n > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={groupRadar} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <PolarGrid stroke={C.border} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: C.dark }} />
                    <Radar dataKey="score" stroke={C.amber} fill={C.amber} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.mid, fontSize: 13 }}>Waiting for participants…</div>}
            </Card>
            <Card style={{ marginBottom: 0 }}>
              <div style={{ ...serif(15), marginBottom: 14 }}>Category Averages</div>
              {n > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={avgCatData} layout="vertical" margin={{ left: 60, right: 20, top: 0, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: C.mid }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.dark }} width={56} />
                    <Bar dataKey="avg" radius={3}>
                      {avgCatData.map((entry, i) => <Cell key={i} fill={entry.avg < 40 ? C.red : entry.avg < 75 ? C.amber : C.green} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.mid, fontSize: 13 }}>Waiting for participants…</div>}
            </Card>
          </div>
          {topGroupGaps.length > 0 && (
            <Card>
              <div style={{ ...serif(15), marginBottom: 14 }}>Most Common Gaps Across the Room</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {topGroupGaps.map(([gap, count], i) => (
                  <div key={i} style={{ padding: "8px 16px", background: C.cream, borderRadius: 20, borderLeft: `3px solid ${C.amber}`, fontSize: 13 }}>
                    <strong>{gap}</strong> <span style={{ color: C.mid }}>— {count}/{n}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ ...serif(15), marginBottom: 2 }}>Generate Group Insights</div>
                <div style={{ fontSize: 12, color: C.mid }}>AI talking points tailored to this room's live data</div>
              </div>
              <Btn variant="amber" onClick={generateGroupInsights} disabled={insightsLoading || n === 0}>
                {insightsLoading ? "Analyzing…" : "✦ Generate"}
              </Btn>
            </div>
            {groupInsights ? (
              <div style={{ background: C.cream, borderRadius: 8, padding: "18px 20px", borderLeft: `3px solid ${C.amber}` }}>
                <RenderPlan text={groupInsights} />
              </div>
            ) : (
              <div style={{ color: C.mid, fontSize: 13, fontStyle: "italic" }}>
                Click Generate once participants have completed their assessments.
              </div>
            )}
          </Card>
          <Card>
            <div style={{ ...serif(15), marginBottom: 14 }}>Participant Roster ({n})</div>
            {n === 0 ? (
              <div style={{ color: C.mid, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No participants yet. They'll appear here as they complete their assessments.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {participants.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: C.cream, borderRadius: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                      <TierBadge pct={p.totalPct} />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{p.totalPct}%</span>
                      {p.topGaps?.[0] && <span style={{ fontSize: 12, color: C.mid }}>↓ {p.topGaps[0].split(" ")[0]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PARTICIPANT: NAME ENTRY
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.PART_NAME) return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Lora', Georgia, serif", color: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 460, width: "100%", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ ...lbl, marginBottom: 10 }}>Jarvis — Your Legal Strategist</div>
          <div style={{ ...serif(36), lineHeight: 1.1 }}>Exit Readiness</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 400, fontStyle: "italic", color: C.amber }}>Assessment</div>
          <div style={{ width: 50, height: 3, background: C.gold, margin: "14px auto 0" }} />
        </div>
        <Card>
          <div style={{ fontSize: 13, color: C.dark, marginBottom: 20, lineHeight: 1.65 }}>
            You'll score 46 items across 6 areas in about 15 minutes. At the end, Todd Jarvis will write a personalized 90-day action plan — just for you.
          </div>
          <Input label="Your First Name" value={name} onChange={setName} placeholder="Enter your first name" />
          <Btn size="lg" onClick={() => name.trim() && setView(VIEWS.PART_ASSESS)} disabled={!name.trim()} style={{ width: "100%" }}>
            Begin Assessment →
          </Btn>
        </Card>
        <div style={{ textAlign: "center", fontSize: 12, color: C.mid }}>Session: {sessionCode}</div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PARTICIPANT: ASSESSMENT
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.PART_ASSESS) {
    const cat = CATS[catIdx];
    const done = isCatDone(cat);
    const isLast = catIdx === CATS.length - 1;
    const progress = (catIdx / CATS.length) * 100 + (done ? (100 / CATS.length) : 0);

    return (
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Lora', Georgia, serif", color: C.dark }}>
        <Header right={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{name} · {catIdx + 1}/{CATS.length}</span>} />
        <div style={{ height: 4, background: C.lite }}>
          <div style={{ height: 4, background: C.amber, width: `${progress}%`, transition: "width 0.5s ease" }} />
        </div>
        <div style={wrap}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ ...lbl, fontSize: 14, marginBottom: 6 }}>Category {catIdx + 1} of {CATS.length}</div>
            <div style={{ ...serif(26) }}>{cat.label}</div>
          </div>
          <Card style={{ background: C.lite, boxShadow: "none", padding: "10px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: C.mid }}><strong style={{ color: C.dark }}>0</strong> = Not at all &ensp;·&ensp; <strong style={{ color: C.dark }}>3</strong> = Partially in place &ensp;·&ensp; <strong style={{ color: C.dark }}>5</strong> = Fully addressed &ensp;·&ensp; <strong style={{ color: C.dark }}>N/A</strong> = Doesn't apply to me</div>
          </Card>
          {cat.sections.map((sec, sIdx) => {
            const secOffset = cat.sections.slice(0, sIdx).reduce((s, ss) => s + ss.items.length, 0);
            return (
              <Card key={sIdx}>
                <div style={{ ...lbl, fontSize: 14, marginBottom: 18 }}>{sec.title}</div>
                {sec.items.map((item, iIdx) => {
                  const absIdx = secOffset + iIdx;
                  const val = getScore(cat.id, absIdx);
                  const isLastItem = iIdx === sec.items.length - 1;
                  return (
                    <div key={iIdx} style={{ marginBottom: isLastItem ? 0 : 20, paddingBottom: isLastItem ? 0 : 20, borderBottom: isLastItem ? "none" : `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 10, color: val === "na" ? C.mid : val >= 0 ? C.mid : C.dark, textDecoration: val === "na" ? "line-through" : "none" }}>{item}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setScore(cat.id, absIdx, n)} style={{
                            width: 38, height: 38, borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 700,
                            border: `2px solid ${val === n ? C.blue : C.border}`,
                            background: val === n ? C.blue : C.white,
                            color: val === n ? C.white : C.dark, transition: "all 0.1s",
                            opacity: val === "na" ? 0.35 : 1,
                          }}>{n}</button>
                        ))}
                        {/* N/A button — excluded from scoring denominator */}
                        <button onClick={() => setScore(cat.id, absIdx, val === "na" ? -1 : "na")} style={{ height: 38, padding: "0 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, border: `2px solid ${val === "na" ? C.mid : C.border}`, background: val === "na" ? C.mid : C.white, color: val === "na" ? C.white : C.mid, transition: "all 0.1s", marginLeft: 4 }}>
                          N/A
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Card>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 40 }}>
            {catIdx > 0 ? <Btn variant="ghost" onClick={() => { setCatIdx((i) => i - 1); window.scrollTo(0, 0); }}>← Back</Btn> : <div />}
            <div style={{ textAlign: "right" }}>
              {!done && <div style={{ fontSize: 12, color: C.mid, marginBottom: 6 }}>Score all items to continue</div>}
              <Btn onClick={() => { if (isLast) setView(VIEWS.PART_RESULTS); else { setCatIdx((i) => i + 1); window.scrollTo(0, 0); } }} disabled={!done}>
                {isLast ? "See My Results →" : `Next: ${CATS[catIdx + 1]?.short} →`}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PARTICIPANT: RESULTS
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.PART_RESULTS) {
    const tier = totalPct < 40 ? { label: "Low Readiness", color: C.red } : totalPct < 75 ? { label: "Moderate Readiness", color: C.orange } : { label: "High Readiness", color: C.green };
    return (
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Lora', Georgia, serif", color: C.dark }}>
        <Header />
        <div style={wrap}>
          <Card style={{ background: C.blue, textAlign: "center", padding: "32px 28px" }}>
            <div style={{ ...lbl, color: C.gold, marginBottom: 10 }}>{name}'s Overall Score</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 76, fontWeight: 700, color: C.white, lineHeight: 1 }}>{totalPct}<span style={{ fontSize: 34, fontWeight: 400 }}>%</span></div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 14 }}>{totalScore} of {totalMax} points</div>
            <span style={{ display: "inline-block", padding: "5px 16px", borderRadius: 16, background: tier.color, fontSize: 12, fontWeight: 700, color: C.white }}>{tier.label}</span>
          </Card>

          <Card>
            <div style={{ ...serif(18), marginBottom: 4 }}>Your Readiness Profile</div>
            <div style={{ fontSize: 12, color: C.mid, marginBottom: 18 }}>Percentage of max possible score in each area</div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData} margin={{ top: 5, right: 15, bottom: 5, left: 15 }}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: C.dark, fontFamily: "'Lora', serif" }} />
                <Radar dataKey="score" stroke={C.blue} fill={C.blue} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <div style={{ ...serif(18), marginBottom: 18 }}>Category Breakdown</div>
            {CATS.map((cat) => {
              const pct = catPct(cat);
              const barColor = pct < 40 ? C.red : pct < 75 ? C.orange : C.green;
              return (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                    <span>{cat.label}</span><span style={{ fontWeight: 700, color: barColor }}>{pct}%</span>
                  </div>
                  <div style={{ height: 7, background: C.lite, borderRadius: 4 }}>
                    <div style={{ height: 7, background: barColor, borderRadius: 4, width: `${pct}%`, transition: "width 0.8s" }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <div style={{ ...serif(18), marginBottom: 4 }}>Your 3 Priority Gaps</div>
            <div style={{ fontSize: 12, color: C.mid, marginBottom: 18 }}>These areas have the highest leverage for improvement.</div>
            {topGaps.map((cat, i) => (
              <div key={cat.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 16px", background: C.cream, borderRadius: 7, marginBottom: 10, borderLeft: `4px solid ${C.amber}` }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.amber }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: C.mid }}>{catPct(cat)}% complete · {catActiveMax(cat) - catScore(cat)} points remaining</div>
                </div>
              </div>
            ))}
          </Card>

          <Card style={{ textAlign: "center", padding: "32px 28px" }}>
            <div style={{ ...serif(20), marginBottom: 8 }}>Ready for Your Plan, {name}?</div>
            <p style={{ color: C.mid, fontSize: 13, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 22px" }}>
              Todd will analyze your specific scores and write a personalized 90-day action plan in his own words.
            </p>
            {planError && <div style={{ color: C.red, marginBottom: 12, fontSize: 14 }}>{planError}</div>}
            <Btn variant="amber" size="lg" onClick={generatePlan} disabled={planLoading}>
              {planLoading ? "Todd is writing your plan…" : "Generate My 90-Day Plan →"}
            </Btn>
            <div style={{ marginTop: 18, fontSize: 14, color: C.mid }}>
            info@jarvislegacy.com &nbsp;·&nbsp; (520) 333-5123
          </div>
          </Card>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PARTICIPANT: PLAN
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.PART_PLAN) return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Lora', Georgia, serif", color: C.dark }}>
      <Header right={
        <Btn size="sm" onClick={() => window.print()} style={{ color: C.white, border: "1.5px solid rgba(255,255,255,0.35)", background: "transparent" }}>
          Print / Save
        </Btn>
      } />
      <div style={wrap}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ ...lbl, marginBottom: 10 }}>Prepared personally for {name}</div>
          <div style={{ ...serif(30), lineHeight: 1.2 }}>Your 90-Day Exit Readiness</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 400, fontStyle: "italic", color: C.amber }}>Action Plan</div>
          <div style={{ width: 50, height: 3, background: C.gold, margin: "14px auto 6px" }} />
          {planSaved && <div style={{ fontSize: 12, color: C.green }}>✓ Results shared with your facilitator</div>}
        </div>
        <Card style={{ padding: "32px 36px" }}><RenderPlan text={plan} /></Card>
        <Card>
          <div style={{ ...serif(16), marginBottom: 14 }}>Your Readiness Profile</div>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData} margin={{ top: 5, right: 15, bottom: 5, left: 15 }}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: C.dark, fontFamily: "'Lora', serif" }} />
              <Radar dataKey="score" stroke={C.blue} fill={C.blue} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <div style={{ background: C.blue, borderRadius: 10, padding: "32px 28px", textAlign: "center", marginBottom: 40 }}>
          <div style={{ ...lbl, color: C.gold, marginBottom: 10 }}>Your Next Step</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 10 }}>
            Schedule Your Life &amp; Legacy Planning Session
          </div>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 22px" }}>
            Complete the homework I send you 3 days before our meeting and I'll waive the $750 session fee. Let's turn this plan into action.
          </p>
          <a href="https://planmylegacytoday.com/schedule" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "13px 32px", background: C.amber, color: C.white, borderRadius: 6, textDecoration: "none", fontWeight: 700, fontSize: 15, fontFamily: "'Lora', serif" }}>
            Schedule Now →
          </a>
          <div style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            planmylegacytoday.com/schedule &nbsp;·&nbsp; info@jarvislegacy.com &nbsp;·&nbsp; (520) 333-5123
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}