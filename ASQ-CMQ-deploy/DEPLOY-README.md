# ASQ-CMQ Deployment Bundle

Drop these files into your GitHub repo at `github.com/ondrejholub/ASQ-CMQ`, preserving the folder structure exactly.

## File Mapping

| In this bundle | Goes to GitHub repo path |
|---|---|
| `index.html` | `/index.html` |
| `js/app.jsx` | `/js/app.jsx` |
| `css/style.css` | `/css/style.css` |
| `content/domain-1.json` ... `domain-7.json` | `/content/domain-N.json` |

## Steps

1. Open `github.com/ondrejholub/ASQ-CMQ` in browser
2. Click **Add file → Upload files**
3. Drag the entire `ASQ-CMQ-deploy` folder contents in (GitHub preserves structure)
4. Commit message: `Enhanced renderer + Mermaid visuals + bullet summaries`
5. Click **Commit changes**
6. Wait ~60 seconds for GitHub Pages to rebuild
7. Visit `https://ondrejholub.github.io/ASQ-CMQ/` and **hard refresh** (Cmd+Shift+R / Ctrl+Shift+R)

## What You'll See

- LaTeX-inspired light theme with Crimson Pro serif + JetBrains Mono
- Sidebar: 7 Roman-numeral domains with section drill-down
- Each section has 4 mode tabs: Summary | Concepts | Practice | Flashcards
- 144 visuals (Mermaid diagrams + tables) across all domains
- 178 scannable summary bullets
- Practice questions with reveal/check answer
- Interactive flashcards with flip animation

## If It Doesn't Work

Hit `F12` to open browser console, look for errors:
- `404` on any file → wrong upload path; verify folder structure
- `JSX SyntaxError` → cached old Babel; hard refresh again
- `Mermaid not defined` → CDN block; check ad-blockers

## Authoritative File Tree

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.jsx
└── content/
    ├── domain-1.json   (Leadership)
    ├── domain-2.json   (Strategic Plan)
    ├── domain-3.json   (Management Elements)
    ├── domain-4.json   (Quality Tools)
    ├── domain-5.json   (Customer-Focused)
    ├── domain-6.json   (Supply Chain)
    └── domain-7.json   (Training & Development)
```
