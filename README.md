# 🌱 EcoTrack — Carbon Footprint Awareness Platform

> A smart, dynamic web application that helps individuals understand, track, and reduce their carbon footprint through personalized insights, interactive quizzes, fun facts, and an AI-powered chat assistant.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![Vite](https://img.shields.io/badge/built%20with-Vite-646CFF)

---

## 🎯 Chosen Vertical

**Carbon Footprint Awareness** — Empowering individuals with actionable, personalized carbon reduction strategies through an intelligent tracking platform.

---

## 🧠 Approach & Logic

### Architecture
EcoTrack is a **single-page application (SPA)** built with **Vite + Vanilla JavaScript (ES Modules)** for maximum performance and zero framework overhead. The architecture follows a modular pattern:

```
Core Engines → Pages → Router → User
```

### Core Decision Engines

1. **Emission Calculator Engine** — Computes CO₂e emissions using the formula `Emissions = Activity Data × Emission Factor` across 4 categories (Transport, Food, Energy, Lifestyle). Factors sourced from EPA, DEFRA, and IEA public data.

2. **Context Engine** — Profiles user behavior, identifies highest-impact categories, tracks trends over time, and detects anomalies. Powers personalized recommendations.

3. **Recommendation Engine** — Rule-based + scoring system that prioritizes 16 actionable suggestions by impact magnitude, ease of adoption, and user context. Categories: Quick Wins, Medium Effort, Lifestyle Changes.

4. **Smart Chat Agent (EcoBot)** — Context-aware conversational assistant with 3 capabilities:
   - **Q&A Mode**: Answers carbon footprint questions using a 23-entry knowledge base with fuzzy keyword matching
   - **Survey Mode**: Conversational 13-step footprint calculator via chat interface with quick-reply buttons
   - **Recommendation Mode**: Personalized reduction tips based on user's actual data

5. **Quiz Engine** — 35+ questions across Easy/Medium/Hard difficulties with 3 modes (Quick Quiz, Category Deep Dive, Daily Challenge), timed gameplay, scoring with streak bonuses, and badge system.

6. **Fun Facts Database** — 60 curated facts with emoji icons, categories, impact ratings, and sources. Rotation system prevents repetition.

### User Context & Decision Flow

```
User Input → Context Engine → Profile Analysis → Decision Engine → Personalized Output
                                    ↓
                          Highest-Impact Category
                                    ↓
                    Recommendation Engine (sorted by impact × ease)
                                    ↓
                          Actionable Suggestions
```

---

## 🚀 How It Works

### For Users
1. **Onboarding** — A 6-step guided wizard collects baseline data (transport, diet, energy, lifestyle)
2. **Dashboard** — Real-time footprint overview with eco-score, category breakdown, trend tracking, and top recommendations
3. **Calculator** — Detailed tabbed calculator with sliders and real-time emission previews
4. **EcoBot Chat** — Ask questions, calculate footprint through conversation, get personalized tips
5. **Quizzes** — Test carbon literacy with timed quizzes, earn badges, and learn from explanations
6. **Learn** — Browse 60+ fun facts, myth-busting flip cards, and CO₂ comparison charts
7. **Challenges** — Join eco-challenges (Car-Free Week, Meatless Monday, etc.) and track progress
8. **Profile** — Export/import data, accessibility settings, and privacy controls

### Key Features
- 🌓 **Dark mode by default** with glassmorphism UI
- 📱 **Fully responsive** — works on mobile, tablet, and desktop
- 🔒 **Privacy-first** — all data stored locally in browser, nothing sent to any server
- ♿ **Accessible** — WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- ⚡ **Offline-capable** — no external API dependencies
- 🎮 **Gamified** — eco-score, streaks, badges, challenges, and leaderboards

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
|:------|:-----------|:----------|
| Build Tool | Vite | Lightning-fast HMR, optimized production builds |
| Language | Vanilla JavaScript (ES Modules) | Zero framework overhead, maximum performance |
| Styling | Vanilla CSS (Custom Properties) | Full design control, dark-mode-first |
| Charts | Chart.js | Beautiful charts with small bundle |
| Storage | LocalStorage | Offline-first, privacy-preserving |
| Testing | Vitest | Native Vite integration |

---

## 📁 Project Structure

```
├── index.html              # App shell with semantic HTML5
├── package.json
├── vite.config.js
├── src/
│   ├── main.js             # Entry point, router & sidebar
│   ├── styles/             # Design system (tokens, global, components, layouts)
│   ├── core/               # Business logic engines
│   │   ├── emission-factors.js    # EPA/DEFRA emission factor database
│   │   ├── calculator-engine.js   # Footprint computation
│   │   ├── context-engine.js      # User profiling & trends
│   │   ├── recommendation-engine.js # Smart recommendations
│   │   ├── knowledge-base.js      # Q&A database for chat
│   │   ├── quiz-engine.js         # Quiz questions & scoring
│   │   ├── fun-facts.js           # 60+ curated fun facts
│   │   ├── survey-engine.js       # Conversational survey flow
│   │   └── storage.js             # LocalStorage with sanitization
│   ├── router/             # Hash-based SPA router
│   ├── pages/              # Page modules (dashboard, calculator, assistant, etc.)
│   └── utils/              # Sanitization & formatting
└── tests/                  # Vitest unit tests
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
git clone https://github.com/Bhuvanani/GreenCarbon.git
cd GreenCarbon
npm install
```

### Development
```bash
npm run dev
```
Opens at `http://localhost:3000`

### Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## ✅ Testing

Unit tests cover all core engines:
- `calculator-engine.test.js` — Emission calculations, eco-scoring
- `knowledge-base.test.js` — Q&A matching, fallback behavior
- `quiz-engine.test.js` — Question generation, scoring, streaks
- `fun-facts.test.js` — Rotation, filtering, daily fact
- `survey-engine.test.js` — Survey flow, conditional logic, results

---

## 🔒 Security

- **No external API calls** — all data stays in the user's browser
- **Input sanitization** — all user inputs sanitized for XSS prevention
- **Content Security Policy** — strict CSP headers
- **No eval()** — no dynamic code execution
- **Data portability** — users can export/import/delete their data

---

## ♿ Accessibility

- Semantic HTML5 (`<nav>`, `<main>`, `<section>`, `<article>`)
- ARIA labels on all interactive elements
- Keyboard navigation support
- `prefers-reduced-motion` support
- 4.5:1+ contrast ratios
- Skip-to-content link
- Screen reader announcements

---

## 📊 Assumptions

1. **No backend** — All computation and storage happens client-side for privacy
2. **Emission factors** — Based on global averages from EPA/DEFRA/IEA public data
3. **Smart assistant** — Rule-based decision trees (no LLM API calls) for offline capability
4. **Single user per device** — No multi-user authentication
5. **Modern browser** — ES2020+, CSS custom properties, backdrop-filter support

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">Made with 💚 for the planet</p>
