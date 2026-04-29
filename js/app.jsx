// =============================================================================
// ASQ CMQ/OE Study Portal — app.jsx
// LaTeX-inspired technical documentation UI
// Backward-compatible: renders both base schema and enhanced schema (visuals,
// summaryBullets, definitionBullets). Falls back gracefully when fields absent.
// =============================================================================

const { useState, useEffect, useRef, useMemo } = React;

// -----------------------------------------------------------------------------
// Domain registry — add new domains here
// -----------------------------------------------------------------------------
const DOMAIN_INDEX = [
  { id: 1, num: "I",   file: "content/domain-1.json", title: "Leadership" },
  { id: 2, num: "II",  file: "content/domain-2.json", title: "Strategic Plan Development & Deployment" },
  { id: 3, num: "III", file: "content/domain-3.json", title: "Management Elements & Methods" },
  { id: 4, num: "IV",  file: "content/domain-4.json", title: "Quality Management Tools" },
  { id: 5, num: "V",   file: "content/domain-5.json", title: "Customer-Focused Organizations" },
  { id: 6, num: "VI",  file: "content/domain-6.json", title: "Supply Chain Management" },
  { id: 7, num: "VII", file: "content/domain-7.json", title: "Training & Development" },
];

// -----------------------------------------------------------------------------
// Simple inline markdown parser — only handles **bold** within text
// Avoids react-markdown bundle bloat. CDN-friendly.
// -----------------------------------------------------------------------------
function parseInlineMarkdown(text) {
  if (!text) return [];
  const parts = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={m.index}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// -----------------------------------------------------------------------------
// Mermaid diagram renderer
// -----------------------------------------------------------------------------
function MermaidDiagram({ code, id }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.mermaid) return;
    const render = async () => {
      try {
        ref.current.innerHTML = "";
        const { svg } = await window.mermaid.render(`m-${id}-${Date.now()}`, code);
        if (ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (ref.current) ref.current.innerHTML = `<pre class="mermaid-error">${e.message || "Diagram error"}</pre>`;
      }
    };
    render();
  }, [code, id]);
  return <div className="mermaid-container" ref={ref} />;
}

// -----------------------------------------------------------------------------
// Table renderer — renders { columns: [], rows: [[]] }
// -----------------------------------------------------------------------------
function VisualTable({ columns, rows }) {
  return (
    <div className="visual-table-wrap">
      <table className="visual-table">
        <thead>
          <tr>{columns.map((c, i) => <th key={i}>{parseInlineMarkdown(c)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci}>{parseInlineMarkdown(cell)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Visual block dispatcher — { type: "mermaid" | "table", title, ... }
// -----------------------------------------------------------------------------
function VisualBlock({ visual, idx }) {
  return (
    <figure className="visual-block">
      {visual.title && <figcaption className="visual-caption">Figure {idx + 1}. {visual.title}</figcaption>}
      {visual.type === "mermaid" && <MermaidDiagram code={visual.code} id={`v${idx}`} />}
      {visual.type === "table" && <VisualTable columns={visual.columns} rows={visual.rows} />}
    </figure>
  );
}

// -----------------------------------------------------------------------------
// Summary view — uses summaryBullets if present, else summary paragraph
// Visuals render after summary text
// -----------------------------------------------------------------------------
function SummaryView({ section }) {
  const hasBullets = Array.isArray(section.summaryBullets) && section.summaryBullets.length > 0;
  const visuals = section.visuals || [];

  return (
    <div className="view-summary">
      <h3 className="view-heading">Overview</h3>
      {hasBullets ? (
        <ul className="bullet-list summary-bullets">
          {section.summaryBullets.map((b, i) => (
            <li key={i}>{parseInlineMarkdown(b)}</li>
          ))}
        </ul>
      ) : (
        <p className="prose">{section.summary}</p>
      )}

      {section.keyFigures && section.keyFigures.length > 0 && (
        <>
          <h3 className="view-heading">Key Figures</h3>
          <ul className="bullet-list">
            {section.keyFigures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </>
      )}

      {visuals.length > 0 && (
        <>
          <h3 className="view-heading">Diagrams &amp; Tables</h3>
          {visuals.map((v, i) => <VisualBlock key={i} visual={v} idx={i} />)}
        </>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Concepts view — uses definitionBullets if present, else definition prose
// -----------------------------------------------------------------------------
function ConceptsView({ section }) {
  return (
    <div className="view-concepts">
      {section.concepts.map((c, i) => {
        const hasBullets = Array.isArray(c.definitionBullets) && c.definitionBullets.length > 0;
        return (
          <article className="concept-card" key={i}>
            <header className="concept-header">
              <h3 className="concept-term">{c.term}</h3>
            </header>
            {hasBullets ? (
              <ul className="bullet-list concept-bullets">
                {c.definitionBullets.map((b, bi) => <li key={bi}>{parseInlineMarkdown(b)}</li>)}
              </ul>
            ) : (
              <p className="concept-definition prose">{c.definition}</p>
            )}
            {c.formula && (
              <div className="concept-formula">
                <code>{c.formula}</code>
              </div>
            )}
            {c.examTip && (
              <div className="concept-tip">
                <span className="tip-label">Exam Tip</span>
                <span className="tip-body">{c.examTip}</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Practice questions view
// -----------------------------------------------------------------------------
function PracticeView({ section }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const select = (qi, oi) => setAnswers({ ...answers, [qi]: oi });
  const reveal = (qi) => setRevealed({ ...revealed, [qi]: true });

  if (!section.practiceQuestions || section.practiceQuestions.length === 0) {
    return <p className="empty-state">No practice questions for this section yet.</p>;
  }

  return (
    <div className="view-practice">
      {section.practiceQuestions.map((pq, qi) => {
        const sel = answers[qi];
        const isRevealed = revealed[qi];
        return (
          <article className="question-card" key={qi}>
            <h3 className="question-number">Question {qi + 1}</h3>
            <p className="question-text prose">{pq.q}</p>
            <ul className="option-list">
              {pq.options.map((opt, oi) => {
                const isSelected = sel === oi;
                const isCorrect = oi === pq.correct;
                let cls = "option";
                if (isRevealed) {
                  if (isCorrect) cls += " option-correct";
                  else if (isSelected && !isCorrect) cls += " option-wrong";
                } else if (isSelected) {
                  cls += " option-selected";
                }
                return (
                  <li key={oi} className={cls} onClick={() => !isRevealed && select(qi, oi)}>
                    <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                    <span className="option-text">{opt}</span>
                  </li>
                );
              })}
            </ul>
            {!isRevealed && sel !== undefined && (
              <button className="btn-reveal" onClick={() => reveal(qi)}>Check Answer</button>
            )}
            {isRevealed && (
              <div className={`answer-explanation ${sel === pq.correct ? "correct" : "incorrect"}`}>
                <strong>{sel === pq.correct ? "Correct." : "Incorrect."}</strong>
                <p className="prose">{pq.explanation}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Flashcards view
// -----------------------------------------------------------------------------
function FlashcardsView({ section }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setIdx(0);
    setFlipped(false);
  }, [section.id]);

  if (!section.flashcards || section.flashcards.length === 0) {
    return <p className="empty-state">No flashcards for this section yet.</p>;
  }

  const card = section.flashcards[idx];
  const next = () => { setIdx((idx + 1) % section.flashcards.length); setFlipped(false); };
  const prev = () => { setIdx((idx - 1 + section.flashcards.length) % section.flashcards.length); setFlipped(false); };

  return (
    <div className="view-flashcards">
      <div className="flashcard-counter">Card {idx + 1} / {section.flashcards.length}</div>
      <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        <div className="flashcard-side flashcard-front">
          <div className="flashcard-label">Question</div>
          <div className="flashcard-content prose">{card.front}</div>
        </div>
        <div className="flashcard-side flashcard-back">
          <div className="flashcard-label">Answer</div>
          <div className="flashcard-content prose">{card.back}</div>
        </div>
      </div>
      <div className="flashcard-controls">
        <button className="btn" onClick={prev}>← Previous</button>
        <button className="btn btn-primary" onClick={() => setFlipped(!flipped)}>
          {flipped ? "Show Question" : "Show Answer"}
        </button>
        <button className="btn" onClick={next}>Next →</button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Section view — mode tabs (Summary | Concepts | Practice | Flashcards)
// -----------------------------------------------------------------------------
function SectionView({ section }) {
  const [mode, setMode] = useState("summary");

  useEffect(() => { setMode("summary"); }, [section.id]);

  const counts = {
    summary: (section.summaryBullets?.length || 0) + (section.visuals?.length || 0),
    concepts: section.concepts?.length || 0,
    practice: section.practiceQuestions?.length || 0,
    flashcards: section.flashcards?.length || 0,
  };

  return (
    <section className="section-view">
      <header className="section-header">
        <div className="section-ref-row">
          <span className="section-ref">§{section.ref}</span>
          <span className="section-cognitive">Cognitive: {section.cognitive}</span>
        </div>
        <h2 className="section-title">{section.title}</h2>
      </header>

      <nav className="mode-tabs">
        <button className={`mode-tab ${mode === "summary" ? "active" : ""}`} onClick={() => setMode("summary")}>
          Summary
        </button>
        <button className={`mode-tab ${mode === "concepts" ? "active" : ""}`} onClick={() => setMode("concepts")}>
          Concepts <span className="tab-count">{counts.concepts}</span>
        </button>
        <button className={`mode-tab ${mode === "practice" ? "active" : ""}`} onClick={() => setMode("practice")}>
          Practice <span className="tab-count">{counts.practice}</span>
        </button>
        <button className={`mode-tab ${mode === "flashcards" ? "active" : ""}`} onClick={() => setMode("flashcards")}>
          Flashcards <span className="tab-count">{counts.flashcards}</span>
        </button>
      </nav>

      <div className="section-body">
        {mode === "summary" && <SummaryView section={section} />}
        {mode === "concepts" && <ConceptsView section={section} />}
        {mode === "practice" && <PracticeView section={section} />}
        {mode === "flashcards" && <FlashcardsView section={section} />}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Sidebar — domain list + section list for active domain
// -----------------------------------------------------------------------------
function Sidebar({ domains, activeDomain, activeSectionId, onSelectDomain, onSelectSection }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark">ASQ CMQ/OE</div>
        <div className="brand-sub">Body of Knowledge</div>
      </div>
      <nav className="domain-nav">
        {domains.map((d) => {
          const isActive = activeDomain && activeDomain.id === d.id;
          return (
            <div key={d.id} className={`domain-block ${isActive ? "active" : ""}`}>
              <button className="domain-btn" onClick={() => onSelectDomain(d)}>
                <span className="domain-num">{d.num}</span>
                <span className="domain-name">{d.title}</span>
              </button>
              {isActive && activeDomain.sections && (
                <ul className="section-list">
                  {activeDomain.sections.map((s) => (
                    <li
                      key={s.id}
                      className={`section-item ${s.id === activeSectionId ? "active" : ""}`}
                      onClick={() => onSelectSection(s.id)}
                    >
                      <span className="section-item-ref">{s.ref}</span>
                      <span className="section-item-title">{s.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <a href="https://github.com/ondrejholub/ASQ-CMQ" target="_blank" rel="noopener">GitHub</a>
        <span className="dot">·</span>
        <span>Based on ASQ BoK</span>
      </div>
    </aside>
  );
}

// -----------------------------------------------------------------------------
// Domain header — exam stats, weight, etc.
// -----------------------------------------------------------------------------
function DomainHeader({ domain }) {
  return (
    <header className="domain-header">
      <div className="domain-header-top">
        <span className="domain-header-num">Part {domain.num}</span>
        <span className="domain-header-stats">
          {domain.examQuestions} questions · {domain.examWeight}% of exam
        </span>
      </div>
      <h1 className="domain-header-title">{domain.title}</h1>
    </header>
  );
}

// -----------------------------------------------------------------------------
// Main App
// -----------------------------------------------------------------------------
function App() {
  const [activeDomain, setActiveDomain] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});

  // Load a domain JSON
  const loadDomain = async (domainMeta) => {
    if (cacheRef.current[domainMeta.id]) {
      const cached = cacheRef.current[domainMeta.id];
      setActiveDomain(cached);
      setActiveSectionId(cached.sections?.[0]?.id || null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(domainMeta.file);
      if (!res.ok) throw new Error(`Failed to load ${domainMeta.file}: ${res.status}`);
      const data = await res.json();
      cacheRef.current[domainMeta.id] = data;
      setActiveDomain(data);
      setActiveSectionId(data.sections?.[0]?.id || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load — Domain I
  useEffect(() => { loadDomain(DOMAIN_INDEX[0]); }, []);

  // Initialize Mermaid once
  useEffect(() => {
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        themeVariables: {
          primaryColor: "#fef3c7",
          primaryTextColor: "#1a1a1a",
          primaryBorderColor: "#92400e",
          lineColor: "#525252",
          secondaryColor: "#dbeafe",
          tertiaryColor: "#f3f4f6",
        },
      });
    }
  }, []);

  const activeSection = useMemo(() => {
    if (!activeDomain) return null;
    return activeDomain.sections.find((s) => s.id === activeSectionId) || activeDomain.sections[0];
  }, [activeDomain, activeSectionId]);

  return (
    <div className="app-shell">
      <Sidebar
        domains={DOMAIN_INDEX}
        activeDomain={activeDomain}
        activeSectionId={activeSectionId}
        onSelectDomain={loadDomain}
        onSelectSection={setActiveSectionId}
      />

      <main className="main-content">
        {loading && <div className="loading">Loading…</div>}
        {error && <div className="error-state">Error: {error}</div>}
        {!loading && !error && activeDomain && (
          <>
            <DomainHeader domain={activeDomain} />
            {activeSection && <SectionView section={activeSection} />}
          </>
        )}
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Mount
// -----------------------------------------------------------------------------
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
