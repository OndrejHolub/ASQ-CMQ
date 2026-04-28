# ASQ CMQ/OE — Body of Knowledge Reference

Professional study reference for the ASQ **Certified Manager of Quality / Organizational Excellence** examination.

## Architecture

Modular content-first architecture. The UI is generic — all domain-specific content lives in JSON files that can be expanded independently.

```
ASQ-CMQ/
├── index.html              ← entry point (loads React + KaTeX from CDN)
├── css/style.css           ← LaTeX-inspired documentation theme
├── js/app.jsx              ← application logic (content-agnostic)
├── content/
│   ├── domain-1.json       ← I. Leadership
│   ├── domain-2.json       ← II. Strategic Planning
│   ├── domain-3.json       ← III–VII (add as needed)
└── README.md
```

## Expanding Content

Each domain JSON follows this schema:

```json
{
  "id": 1,
  "num": "I",
  "title": "Domain Title",
  "examQuestions": 28,
  "examWeight": 17,
  "sections": [
    {
      "id": "1A",
      "ref": "I.A",
      "title": "Section Title",
      "cognitive": "Analyze",
      "summary": "Section overview text...",
      "concepts": [
        {
          "term": "Term Name",
          "definition": "Full definition...",
          "formula": "Optional formula or null",
          "examTip": "Optional exam strategy tip"
        }
      ],
      "keyFigures": ["Author (contribution)"],
      "practiceQuestions": [
        {
          "q": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correct": 1,
          "explanation": "Why B is correct..."
        }
      ],
      "flashcards": [
        { "front": "Prompt", "back": "Answer" }
      ]
    }
  ]
}
```

**To add content:** edit the relevant `domain-N.json` file. Add sections, concepts, questions, or flashcards. The UI renders whatever it finds — no code changes needed.

**To add a new domain:** create `domain-N.json` in `content/`, add the entry to `DOMAIN_INDEX` in `js/app.jsx`.

## Design

- **Typography:** Crimson Pro (serif body) + JetBrains Mono (code/labels) — inspired by LaTeX/Computer Modern
- **Theme:** Light, paper-like background with academic color palette
- **Layout:** Fixed sidebar navigation + scrolling content area, documentation-style

## Live Site

**[https://ondrejholub.github.io/ASQ-CMQ/](https://ondrejholub.github.io/ASQ-CMQ/)**

## Disclaimer

Based on the ASQ CMQ/OE Body of Knowledge (2019). Not affiliated with or endorsed by ASQ.
