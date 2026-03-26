# LoanSense Frontend — Complete Update Summary

## Design System

All components use **inline styles + CSS variables** (not Tailwind class names) to avoid Tailwind v4 JIT issues.

### Core tokens ([src/index.css](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/index.css))
| Token | Purpose |
|---|---|
| `--glass` / `--glass-border` | Glassmorphism background + border |
| `--lime` / `--lime-dark` | Primary accent (CTA buttons, progress bars) |
| `--text` / `--text-muted` / `--text-faint` | Text hierarchy |
| `--success` / `--danger` | Semantic loan decision colors |
| `--font-display` / `--font-ui` / `--font-body` | Typography stack |

`.glass-card` utility class applies `backdrop-filter: blur(32px)` + border + radius.

---

## Pages

### Landing ([Landing.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/Landing.jsx))
- Framer Motion scroll-triggered reveals for each section
- Hero with animated headline + CTA
- Feature cards with `whileHover` lift + glow effects
- How-It-Works step strip with staggered entrance

### Login ([Login.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/Login.jsx))
- Two-column split layout (branding left / glass form right)
- Role toggle (Applicant / Loan Officer) with lime active pill
- Animated error banner with AnimatePresence
- Loading spinner state during sign-in

### Register ([Register.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/Register.jsx))
- Same two-column layout as Login
- Password strength bar (color-coded: weak → strong)
- Officer info strip (role is approved by admin)
- Success state animation on account creation

### Applicant Dashboard ([applicant/Dashboard.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/applicant/Dashboard.jsx)) ⭐ Latest
- **4 KPI stat cards**: Total / Favorable / High Risk / Total Amount
- **Application cards grid** (not a plain table):
  - Colored top accent bar (green / red / neutral)
  - Loan amount hero number
  - AI confidence progress bar
  - Term / Credit Score / Property Area chips
  - Prediction pill with live color dot
  - Hover lift animation
- **Empty state**: Lime glow orb, spring icon, feature pills (⚡ AI · SHAP · What-If)
- **Footer summary strip**: count + pending status + quick New Application button

### Apply Wizard ([applicant/Apply.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/applicant/Apply.jsx))
- 5-step wizard with lime progress bar segments
- `AnimatePresence` cross-fade between steps (slide left/right)
- Framer Motion entrance for the card
- Step navigation (Back / Next / Submit with spinner)
- Error banner with AnimatePresence

### Result ([applicant/Result.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/applicant/Result.jsx))
- 2-column layout:
  - **Decision card**: watermark text (PASS / RISK), radial glow, metric rows
  - **SHAP chart panel**: feature impact explanation
- **What-If Simulator** section below with lime accent border
- Animated back button

### Officer Dashboard ([officer/Dashboard.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/officer/Dashboard.jsx))
- Glass table with staggered row animations
- Badge component for status
- Review button navigates with app state

### Officer Review ([officer/Review.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/officer/Review.jsx))
- 3-zone layout: **Profile grid** left + **SHAP chart** + **sticky Decision panel** right
- Audit timeline with dot-and-line connector
- Approve / Reject toggle buttons (color on selection)
- Override reason textarea (required badge when decision differs from ML)
- Sticky right panel stays visible while scrolling left column

### Officer Analytics ([officer/Analytics.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/pages/officer/Analytics.jsx))
- 4 KPI glass cards (Active Model / Uptime / Applications / Queue progress bar)
- Dark-themed recharts `BarChart` for bias audit by gender
- MLOps controls panel with Force Retrain button
- Model version history table with hover rows

---

## Components

### [AppShell.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/AppShell.jsx)
- Dark sidebar (not light)
- Active nav item: lime left inset `box-shadow`
- Role-colored avatar (lime for officer, indigo for applicant)
- Grouped nav sections with labels
- Hover logout button at bottom

### UI Primitives
| Component | Change |
|---|---|
| [Button.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/Button.jsx) | 4 variants: `primary` (lime) / `secondary` / `ghost` / `danger` — all Framer Motion `whileHover` + `whileTap` |
| [Card.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/Card.jsx) | Uses `.glass-card` utility class |
| [Input.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/Input.jsx) | Dark glass background, lime focus border |
| [Label.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/Label.jsx) | Uppercase font-ui, faint color |
| [Select.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/Select.jsx) | Dark glass dropdown with custom SVG caret |
| [Badge.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/Badge.jsx) | 6 status variants: `approved` / `rejected` / `submitted` / `pending` / `under_review` / `default` |
| [ShapChart.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/ShapChart.jsx) | Dark tooltip (#131318), muted axes, rgba fill cells |
| [WhatIfSimulator.jsx](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/frontend/src/components/ui/WhatIfSimulator.jsx) | Custom lime range slider (injected CSS), dark glass outcome panel, debounced API calls |

---

## Backend Fixes

| Fix | Detail |
|---|---|
| WeasyPrint crash | `from weasyprint import HTML` crashed uvicorn on Windows (missing `libgobject-2.0`). Wrapped in `try/except` in [pdf_service.py](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/backend/services/pdf_service.py) |
| Login timeout | `pbkdf2_sha256` with 200k+ iterations blocked the event loop. Switched to `sha256_crypt` at 50k rounds (~50ms) |
| Officer re-seed | [fix_officer.py](file:///c:/Users/gauth/Desktop/Projects/MiniProject_F/loansense/fix_officer.py) deletes stale hash and re-inserts with new scheme |

---

## Verified Working
- ✅ Uvicorn starts without crash
- ✅ Login returns JWT in ~100ms
- ✅ Officer credentials: `officer@loansense.com` / `Officer@123`
