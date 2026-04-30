import { useState } from "react";

/** Matches App.jsx brand tokens */
const C = {
  blue: "#405D73",
  amber: "#AC6919",
  gold: "#B59E60",
  cream: "#FAF7F0",
  dark: "#1C2B38",
  mid: "#7A96AA",
  lite: "#E6EEF4",
  border: "#D8D0C5",
  white: "#FFFFFF",
};

const serif = (sz, w = 700) => ({
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: sz,
  fontWeight: w,
  color: C.blue,
  lineHeight: 1.2,
});

const overline = {
  fontSize: 12,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: C.gold,
  fontWeight: 600,
};

const section = { maxWidth: 1100, margin: "0 auto", padding: "0 24px" };

const features = [
  {
    title: "Structured assessment",
    body: "Forty-six scored items across estate, continuity, valuation, operations, and leadership—so nothing important slips through the cracks.",
    icon: "◆",
  },
  {
    title: "Live facilitator view",
    body: "Session codes, rolling participant scores, and group-level gaps so you can coach the room in real time—not after the fact.",
    icon: "◎",
  },
  {
    title: "AI action plans",
    body: "Turn individual results into a concrete 90-day plan in clear language your clients can execute with their advisors.",
    icon: "→",
  },
];

const steps = [
  { n: "01", t: "Create a session", d: "Set a short session code and share it in the room or over Zoom." },
  { n: "02", t: "Participants score", d: "Each person completes the assessment at their own pace while you monitor progress." },
  { n: "03", t: "Discuss & plan", d: "Review aggregates, facilitate dialogue, then generate personalized next-step plans." },
];

const faqs = [
  {
    q: "Who is this for?",
    a: "Professional advisors and workshop facilitators running exit readiness sessions for business owners and families.",
  },
  {
    q: "Do participants need accounts?",
    a: "No. They enter the session code and their first name—built for live workshops and minimal friction.",
  },
  {
    q: "Where is data stored?",
    a: "Progress can be persisted via your deployment’s secure storage so facilitators see aggregate results without passing spreadsheets.",
  },
  {
    q: "Does this replace legal advice?",
    a: "No. It structures discovery and education; clients still work with counsel on documents and strategy.",
  },
];

export default function Landing({ onEnterWorkshop }) {
  const [openFaq, setOpenFaq] = useState(0);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.cream,
        color: C.dark,
        fontFamily: "'Lora', Georgia, serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(250,247,240,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            ...section,
            maxWidth: 1140,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            paddingTop: 14,
            paddingBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ ...serif(22), color: C.blue }}>jarvis</span>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.gold }}>
              Exit Readiness
            </span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", fontSize: 14 }}>
            <button
              type="button"
              onClick={() => scrollTo("features")}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.mid, fontFamily: "inherit" }}
            >
              Product
            </button>
            <button
              type="button"
              onClick={() => scrollTo("pricing")}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.mid, fontFamily: "inherit" }}
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => scrollTo("faq")}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.mid, fontFamily: "inherit" }}
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={onEnterWorkshop}
              style={{
                padding: "10px 22px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: 14,
                background: C.blue,
                color: C.white,
              }}
            >
              Enter workshop
            </button>
          </nav>
        </div>
      </header>

      <section style={{ ...section, paddingTop: 56, paddingBottom: 72 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
            gap: 48,
            alignItems: "center",
          }}
          className="landing-hero-grid"
        >
          <div>
            <div style={{ ...overline, marginBottom: 14 }}>SaaS for live exit workshops</div>
            <h1 style={{ ...serif(44), margin: "0 0 18px", letterSpacing: "-0.02em" }}>
              Know where every owner stands—before the closing conversation.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: C.mid, margin: "0 0 28px", maxWidth: 520 }}>
              Exit Readiness Workshop gives facilitators a structured assessment, real-time visibility into the room, and
              AI-drafted 90-day plans so clients leave with clarity—not just slides.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <button
                type="button"
                onClick={onEnterWorkshop}
                style={{
                  padding: "14px 28px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 16,
                  background: C.blue,
                  color: C.white,
                  boxShadow: "0 8px 24px rgba(64,93,115,0.25)",
                }}
              >
                Start a session
              </button>
              <button
                type="button"
                onClick={() => scrollTo("features")}
                style={{
                  padding: "14px 22px",
                  borderRadius: 6,
                  border: `1.5px solid ${C.blue}`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 16,
                  background: "transparent",
                  color: C.blue,
                }}
              >
                See how it works
              </button>
            </div>
            <p style={{ marginTop: 22, fontSize: 13, color: C.mid }}>
              Built for Jarvis Legacy / Strategic Legal Works · Tucson, Arizona
            </p>
          </div>
          <div
            style={{
              background: `linear-gradient(145deg, ${C.blue} 0%, #2d4558 100%)`,
              borderRadius: 16,
              padding: "36px 32px",
              color: C.white,
              boxShadow: "0 24px 48px rgba(28,43,56,0.18)",
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>
              Session snapshot
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
              87%
            </div>
            <div style={{ opacity: 0.85, fontSize: 14, marginBottom: 24 }}>Average readiness · live cohort</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 20 }} />
            <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9 }}>
              Top shared gaps update as assessments complete—so your facilitation stays anchored to what the room actually
              needs.
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 880px) {
            .landing-hero-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <div
          style={{
            ...section,
            padding: "28px 24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 32,
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.mid,
          }}
        >
          <span>Estate & succession</span>
          <span>Business continuity</span>
          <span>Valuation readiness</span>
          <span>Operations & IP</span>
          <span>Leadership bench</span>
        </div>
      </section>

      <section id="features" style={{ padding: "80px 0" }}>
        <div style={section}>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 48px" }}>
            <div style={{ ...overline, marginBottom: 12 }}>Product</div>
            <h2 style={{ ...serif(34), margin: 0 }}>Everything you need for a credible workshop flywheel</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 22,
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: C.white,
                  borderRadius: 12,
                  padding: "28px 26px",
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 4px 20px rgba(28,43,56,0.06)",
                }}
              >
                <div style={{ fontSize: 28, color: C.amber, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ ...serif(20), marginBottom: 10 }}>{f.title}</div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.mid }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: C.lite, padding: "80px 0" }}>
        <div style={section}>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 40px" }}>
            <div style={{ ...overline, marginBottom: 12 }}>Flow</div>
            <h2 style={{ ...serif(34), margin: 0 }}>From session code to facilitated insight</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: C.amber, marginBottom: 8 }}>
                  {s.n}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: C.dark }}>{s.t}</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: C.mid }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0" }}>
        <div style={{ ...section, maxWidth: 720 }}>
          <div
            style={{
              borderLeft: `4px solid ${C.gold}`,
              padding: "24px 28px",
              background: C.white,
              borderRadius: "0 12px 12px 0",
              boxShadow: "0 4px 24px rgba(28,43,56,0.06)",
            }}
          >
            <p style={{ fontSize: 18, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 16px", color: C.dark }}>
              “When owners see their gaps next to peers’ scores, the dialogue shifts—from anxiety to prioritization. This
              tool makes that moment repeatable.”
            </p>
            <div style={{ fontSize: 13, color: C.mid }}>— Workshop facilitator, wealth & exit planning</div>
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: "0 0 80px" }}>
        <div style={section}>
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 36px" }}>
            <div style={{ ...overline, marginBottom: 12 }}>Pricing</div>
            <h2 style={{ ...serif(34), margin: 0 }}>Simple packaging for professional workshops</h2>
          </div>
          <div
            style={{
              maxWidth: 440,
              margin: "0 auto",
              background: C.white,
              borderRadius: 16,
              padding: "40px 36px",
              border: `2px solid ${C.blue}`,
              textAlign: "center",
              boxShadow: "0 16px 40px rgba(64,93,115,0.12)",
            }}
          >
            <div style={{ ...serif(24), marginBottom: 8 }}>Workshop edition</div>
            <p style={{ fontSize: 14, color: C.mid, margin: "0 0 24px" }}>Assessment, facilitator dashboard, and AI plans for live cohorts.</p>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: C.blue, marginBottom: 6 }}>
              Custom
            </div>
            <div style={{ fontSize: 13, color: C.mid, marginBottom: 28 }}>Talk to Jarvis Legacy for deployment & training.</div>
            <button
              type="button"
              onClick={onEnterWorkshop}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: 16,
                background: C.blue,
                color: C.white,
              }}
            >
              Enter workshop
            </button>
          </div>
        </div>
      </section>

      <section id="faq" style={{ background: C.white, padding: "72px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...section, maxWidth: 720 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ ...overline, marginBottom: 12 }}>FAQ</div>
            <h2 style={{ ...serif(34), margin: 0 }}>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((item, i) => (
              <div
                key={item.q}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: openFaq === i ? C.lite : C.cream,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px 20px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.dark,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {item.q}
                  <span style={{ color: C.amber, fontSize: 18 }}>{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: 15, lineHeight: 1.65, color: C.mid }}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: C.blue, color: C.white, padding: "48px 24px" }}>
        <div style={{ ...section, maxWidth: 1140, textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 8 }}>jarvis</div>
          <p style={{ opacity: 0.85, fontSize: 15, margin: "0 0 24px", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            Exit Readiness Workshop — structured assessments and facilitated insight for owners planning what comes next.
          </p>
          <button
            type="button"
            onClick={onEnterWorkshop}
            style={{
              padding: "12px 28px",
              borderRadius: 6,
              border: `1.5px solid rgba(255,255,255,0.4)`,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: 15,
              background: "transparent",
              color: C.white,
            }}
          >
            Enter workshop
          </button>
          <div style={{ marginTop: 28, fontSize: 13, opacity: 0.65 }}>
            info@jarvislegacy.com · (520) 333-5123
          </div>
        </div>
      </footer>
    </div>
  );
}
