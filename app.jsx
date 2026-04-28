/* ═══════════════════════════════════════════════════════════════
   ASQ CMQ/OE Reference — Application Layer
   Architecture: Content JSON files → React components → DOM
   Each domain lives in content/domain-{n}.json
   ═══════════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef, useCallback } = React;

/* ── Domain metadata (index) — content loaded on demand ──── */
const DOMAIN_INDEX = [
  { id: 1, num: "I",   title: "Leadership",                                  file: "domain-1.json", questions: 28, color: "var(--d1)" },
  { id: 2, num: "II",  title: "Strategic Plan Development and Deployment",    file: "domain-2.json", questions: 25, color: "var(--d2)" },
  { id: 3, num: "III", title: "Management Elements and Methods",              file: "domain-3.json", questions: 32, color: "var(--d3)" },
  { id: 4, num: "IV",  title: "Quality Management Tools",                     file: "domain-4.json", questions: 28, color: "var(--d4)" },
  { id: 5, num: "V",   title: "Customer-Focused Organizations",              file: "domain-5.json", questions: 25, color: "var(--d5)" },
  { id: 6, num: "VI",  title: "Supply Chain Management",                     file: "domain-6.json", questions: 15, color: "var(--d6)" },
  { id: 7, num: "VII", title: "Training and Development",                    file: "domain-7.json", questions: 12, color: "var(--d7)" },
];

const TOTAL_Q = DOMAIN_INDEX.reduce((s, d) => s + d.questions, 0);

/* ── Content cache ─────────────────────────────────────────── */
const contentCache = {};

async function loadDomain(id) {
  if (contentCache[id]) return contentCache[id];
  const meta = DOMAIN_INDEX.find(d => d.id === id);
  try {
    const resp = await fetch(`content/${meta.file}`);
    const data = await resp.json();
    contentCache[id] = data;
    return data;
  } catch (err) {
    console.error(`Failed to load domain ${id}:`, err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Sidebar ───────────────────────────────────────────────── */
function Sidebar({ activeDomain, activeSection, onNavigate }) {
  const domain = contentCache[activeDomain];

  return (
    <nav className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Domains</div>
        {DOMAIN_INDEX.map(d => (
          <div key={d.id}>
            <div
              className={`sidebar-item ${activeDomain === d.id && !activeSection ? 'active' : ''}`}
              onClick={() => onNavigate(d.id, null)}
            >
              <span className="sidebar-item-num">{d.num}</span>
              <span className="sidebar-item-title">{d.title}</span>
            </div>
            {activeDomain === d.id && domain && domain.sections && (
              <div className="sidebar-sub">
                {domain.sections.map(s => (
                  <div
                    key={s.id}
                    className={`sidebar-item ${activeSection === s.id ? 'active' : ''}`}
                    onClick={() => onNavigate(d.id, s.id)}
                  >
                    <span className="sidebar-item-num">{s.ref}</span>
                    <span className="sidebar-item-title">{s.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="sidebar-section" style={{ marginTop: 16 }}>
        <div className="sidebar-label">Reference</div>
        <div className="sidebar-item" onClick={() => onNavigate(0, null)}>
          <span className="sidebar-item-num">§</span>
          <span className="sidebar-item-title">Exam Blueprint</span>
        </div>
      </div>
    </nav>
  );
}

/* ── Definition Block ──────────────────────────────────────── */
function DefinitionBlock({ concept, index, domainColor }) {
  return (
    <div className="definition-block" style={{ borderLeftColor: domainColor }}>
      <div className="definition-term">
        <span className="definition-label" style={{ color: domainColor }}>Definition {index + 1}</span>
        {concept.term}
      </div>
      <div className="definition-body">{concept.definition}</div>
      {concept.formula && (
        <div className="formula-block">{concept.formula}</div>
      )}
      {concept.examTip && (
        <div className="exam-tip">{concept.examTip}</div>
      )}
    </div>
  );
}

/* ── Quiz Component ────────────────────────────────────────── */
function Quiz({ questions, domainColor }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const letters = ["A", "B", "C", "D"];

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrent(0); setSelected(null); setScore(0); setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="results-card">
        <div className="results-score">{score}/{questions.length}</div>
        <div className="results-verdict">
          {pct >= 80 ? "Proficient" : pct >= 60 ? "Developing" : "Needs Review"}
        </div>
        <div className="results-advice">
          {pct >= 80
            ? "Strong command of this section. Consider reviewing edge cases."
            : pct >= 60
            ? "Solid foundation — revisit the definition blocks for areas you missed."
            : "Recommended: re-read the section summary and all definition blocks before retaking."}
        </div>
        <button className="btn btn-primary" onClick={restart}>Retake</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <span>Question {current + 1} of {questions.length}</span>
        <span>{score} correct</span>
      </div>
      <div className="quiz-bar">
        <div className="quiz-bar-fill" style={{ width: `${((current + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <div className="quiz-question">{q.q}</div>

      {q.options.map((opt, i) => {
        let cls = "quiz-option";
        if (selected !== null) {
          cls += " disabled";
          if (i === q.correct) cls += " correct";
          else if (i === selected) cls += " incorrect";
        }
        return (
          <button key={i} className={cls} onClick={() => handleSelect(i)}>
            <span className="quiz-option-letter" style={
              selected !== null && i === q.correct ? { background: 'var(--correct-bg)', color: 'var(--correct)' } :
              selected === i && i !== q.correct ? { background: 'var(--incorrect-bg)', color: 'var(--incorrect)' } : {}
            }>{letters[i]}</span>
            <span>{opt}</span>
          </button>
        );
      })}

      {selected !== null && (
        <div className="quiz-explanation">
          <div className="quiz-explanation-label" style={{ color: selected === q.correct ? 'var(--correct)' : 'var(--incorrect)' }}>
            {selected === q.correct ? "✓ Correct" : "✗ Incorrect"}
          </div>
          <div>{q.explanation}</div>
          <div className="quiz-nav">
            <button className="btn btn-primary" onClick={next}>
              {current < questions.length - 1 ? "Next Question" : "View Results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Flashcard Component ───────────────────────────────────── */
function Flashcards({ cards }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());

  const card = cards[current];

  const toggleMastered = () => {
    const s = new Set(mastered);
    if (s.has(current)) s.delete(current); else s.add(current);
    setMastered(s);
  };

  return (
    <div>
      <div className="flashcard-dots">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`flashcard-dot ${i === current ? 'active' : ''} ${mastered.has(i) ? 'mastered' : ''}`}
            onClick={() => { setCurrent(i); setFlipped(false); }}
          />
        ))}
      </div>

      <div className="flashcard" onClick={() => setFlipped(!flipped)}>
        <div className="flashcard-label">{flipped ? "Answer" : "Prompt"}</div>
        {flipped
          ? <div className="flashcard-back">{card.back}</div>
          : <div className="flashcard-front">{card.front}</div>
        }
        {!flipped && <div className="flashcard-hint">Click to reveal</div>}
      </div>

      <div className="flashcard-nav">
        <button className="btn btn-ghost" onClick={() => { setCurrent(c => Math.max(0, c-1)); setFlipped(false); }} disabled={current === 0}>
          Previous
        </button>
        <button
          className="btn"
          onClick={toggleMastered}
          style={{
            background: mastered.has(current) ? 'var(--correct-bg)' : 'none',
            borderColor: mastered.has(current) ? 'var(--correct-border)' : 'var(--border)',
            color: mastered.has(current) ? 'var(--correct)' : 'var(--ink-secondary)'
          }}
        >
          {mastered.has(current) ? "✓ Mastered" : "Mark Mastered"}
        </button>
        <button className="btn btn-ghost" onClick={() => { setCurrent(c => Math.min(cards.length-1, c+1)); setFlipped(false); }} disabled={current === cards.length - 1}>
          Next
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 'var(--fs-xs)', color: 'var(--ink-faint)' }}>
        {mastered.size} of {cards.length} mastered
      </div>
    </div>
  );
}

/* ── Section Detail View ───────────────────────────────────── */
function SectionView({ section, domainColor }) {
  const [tab, setTab] = useState("content");

  return (
    <div>
      <h2 className="chapter-heading">
        <span className="section-number">{section.ref}</span>{" "}
        {section.title}
      </h2>
      <div className="chapter-cognitive">
        <span>Maximum cognitive level:</span>
        <span className="cognitive-badge">{section.cognitive}</span>
      </div>
      <p className="chapter-summary">{section.summary}</p>

      <div className="tab-bar">
        {[
          { key: "content", label: "Definitions & Concepts" },
          { key: "quiz", label: "Practice Questions" },
          { key: "flashcards", label: "Flashcards" },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {tab === "content" && (
        <div>
          {section.concepts.map((c, i) => (
            <DefinitionBlock key={i} concept={c} index={i} domainColor={domainColor} />
          ))}
          {section.keyFigures && section.keyFigures.length > 0 && (
            <div className="key-figures">
              <div className="key-figures-label">Key Figures & Theorists</div>
              <div className="key-figures-list">{section.keyFigures.join(" · ")}</div>
            </div>
          )}
        </div>
      )}

      {tab === "quiz" && section.practiceQuestions && (
        <Quiz questions={section.practiceQuestions} domainColor={domainColor} />
      )}

      {tab === "flashcards" && section.flashcards && (
        <Flashcards cards={section.flashcards} />
      )}
    </div>
  );
}

/* ── Domain Overview (when no section is selected) ─────────── */
function DomainOverview({ domain, meta, onSelectSection }) {
  return (
    <div>
      <div className="page-header">
        <div className="section-number">Domain {domain.num}</div>
        <h1>{domain.title}</h1>
        <div className="page-meta">
          {domain.examQuestions} examination questions · {domain.examWeight}% of total exam weight · {domain.sections.length} sections
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 20, fontWeight: 600 }}>Sections</h3>

      {domain.sections.map((s, i) => (
        <div
          key={s.id}
          onClick={() => onSelectSection(s.id)}
          style={{
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderLeft: `3px solid ${meta.color}`,
            borderRadius: 2,
            marginBottom: 12,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderLeftColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderLeftColor = meta.color; e.currentTarget.style.background = 'var(--bg-surface)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span className="section-number" style={{ marginRight: 12 }}>{s.ref}</span>
              <span style={{ fontSize: 'var(--fs-md)', fontWeight: 600 }}>{s.title}</span>
            </div>
            <span className="cognitive-badge">{s.cognitive}</span>
          </div>
          <p style={{
            fontSize: 'var(--fs-sm)', color: 'var(--ink-muted)', marginTop: 8, lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>{s.summary}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Exam Blueprint (home page) ────────────────────────────── */
function ExamBlueprint({ onNavigate }) {
  return (
    <div>
      <div className="page-header">
        <div className="section-number">Reference</div>
        <h1>ASQ CMQ/OE Body of Knowledge</h1>
        <div className="page-meta">
          Certified Manager of Quality / Organizational Excellence · 165 scored questions · 4 hours 18 minutes · Open-book format
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 8, fontWeight: 600 }}>Examination Weight Distribution</h3>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-muted)', marginBottom: 24 }}>
        The table below shows the number of scored questions allocated to each domain. Use this to calibrate study time — domains with more questions warrant proportionally more preparation.
      </p>

      <table className="weight-table">
        <thead>
          <tr>
            <th style={{ width: 50 }}>§</th>
            <th>Domain</th>
            <th style={{ width: 80 }}>Items</th>
            <th style={{ width: 70 }}>Weight</th>
            <th style={{ width: 160 }}>Distribution</th>
          </tr>
        </thead>
        <tbody>
          {DOMAIN_INDEX.map(d => (
            <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate(d.id, null)}>
              <td className="mono" style={{ color: 'var(--ink-muted)' }}>{d.num}</td>
              <td style={{ fontWeight: 500 }}>{d.title}</td>
              <td className="mono">{d.questions}</td>
              <td className="mono">{Math.round((d.questions / TOTAL_Q) * 100)}%</td>
              <td>
                <div className="weight-bar-container">
                  <div className="weight-bar" style={{
                    width: `${(d.questions / TOTAL_Q) * 100 * 2.5}%`,
                    background: d.color
                  }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td style={{ fontWeight: 600 }}>Total</td>
            <td className="mono" style={{ fontWeight: 600 }}>{TOTAL_Q}</td>
            <td className="mono" style={{ fontWeight: 600 }}>100%</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="key-figures" style={{ marginTop: 40 }}>
        <div className="key-figures-label">Architecture Note</div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-secondary)', lineHeight: 1.7 }}>
          Each domain is stored as a standalone JSON module in the <span className="mono">content/</span> directory.
          To expand a domain, edit its corresponding <span className="mono">domain-N.json</span> file — add sections,
          concepts, practice questions, or flashcards without modifying the application code. The UI adapts automatically
          to any content additions.
        </div>
      </div>

      <div style={{ marginTop: 32, fontSize: 'var(--fs-sm)', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
        <p style={{ marginBottom: 12 }}>
          <strong>File structure:</strong>
        </p>
        <div className="formula-block" style={{ lineHeight: 2 }}>
{`ASQ-CMQ/
├── index.html              ← entry point
├── css/style.css           ← LaTeX-inspired theme
├── js/app.jsx              ← application logic
├── content/
│   ├── domain-1.json       ← I. Leadership
│   ├── domain-2.json       ← II. Strategic Planning
│   ├── domain-3.json       ← III. Management Elements
│   ├── domain-4.json       ← IV. Quality Tools
│   ├── domain-5.json       ← V. Customer Focus
│   ├── domain-6.json       ← VI. Supply Chain
│   └── domain-7.json       ← VII. Training & Development
└── README.md`}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════════ */
function App() {
  const [activeDomain, setActiveDomain] = useState(0); // 0 = blueprint/home
  const [activeSection, setActiveSection] = useState(null);
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useCallback(async (domainId, sectionId) => {
    setActiveDomain(domainId);
    setActiveSection(sectionId);

    if (domainId > 0) {
      setLoading(true);
      const data = await loadDomain(domainId);
      setDomainData(data);
      setLoading(false);
    } else {
      setDomainData(null);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const meta = DOMAIN_INDEX.find(d => d.id === activeDomain);
  const section = domainData && activeSection
    ? domainData.sections.find(s => s.id === activeSection)
    : null;

  return (
    <div>
      {/* Top nav */}
      <header className="top-nav">
        <div className="top-nav-title" style={{ cursor: 'pointer' }} onClick={() => navigate(0, null)}>
          ASQ CMQ/OE<span>Reference</span>
        </div>
        <div className="top-nav-links">
          <a onClick={() => navigate(0, null)}>Blueprint</a>
          <a onClick={() => navigate(1, null)}>Domains</a>
        </div>
      </header>

      <div className="layout">
        <Sidebar activeDomain={activeDomain} activeSection={activeSection} onNavigate={navigate} />

        <main className="main-content">
          {loading && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Loading domain content…
            </div>
          )}

          {!loading && activeDomain === 0 && (
            <ExamBlueprint onNavigate={navigate} />
          )}

          {!loading && activeDomain > 0 && domainData && !section && (
            <DomainOverview
              domain={domainData}
              meta={meta}
              onSelectSection={(sid) => navigate(activeDomain, sid)}
            />
          )}

          {!loading && activeDomain > 0 && domainData && section && (
            <div>
              <div style={{ marginBottom: 8 }}>
                <button className="btn btn-ghost" style={{ fontSize: 'var(--fs-xs)', padding: '6px 14px' }}
                  onClick={() => navigate(activeDomain, null)}>
                  ← Domain {domainData.num} Overview
                </button>
              </div>
              <SectionView section={section} domainColor={meta.color} />
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: 80, paddingTop: 24,
            borderTop: '1px solid var(--border)',
            fontSize: 'var(--fs-xs)', color: 'var(--ink-faint)', lineHeight: 1.6
          }}>
            <p>Based on the ASQ CMQ/OE Body of Knowledge (2019). This reference is not affiliated with or endorsed by ASQ.</p>
            <p style={{ marginTop: 4 }}>For official examination information, visit{' '}
              <a href="https://asq.org/cert/manager-of-quality" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener">
                asq.org/cert/manager-of-quality
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
