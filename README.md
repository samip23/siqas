# SIQAS — QA Feature Tracker

Production-ready multi-page React web app for tracking QA feature progress from CSV uploads.

---

## Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Enable **Firestore Database** (start in test mode)
3. Go to **Project Settings** → **Your Apps** → **Web** → copy the config values

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase values:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Update Firebase Project ID

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual project ID.

### 4. Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Deployment (Firebase Hosting)

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools

# Login and initialise
firebase login
firebase use your-project-id

# Deploy Firestore rules + indexes + hosting
npm run deploy
# OR manually:
npm run build && firebase deploy
```

---

## CSV Format

| Column        | Required | Notes                            |
|---------------|----------|----------------------------------|
| Feature #     | ✅       | Numeric ID                       |
| Name          | ✅       | Feature title                    |
| Priority      | ✅       | Text (High/Medium/Low) or 1–5    |
| Assignee      | ✅       | Full name or username            |
| Sprint #      | ✅       | Sprint number (numeric)          |
| Completed Date| ✅       | Leave blank if not done. MM/DD/YYYY or YYYY-MM-DD |

**Headers are case-insensitive.** Minor variations (e.g. "Sprint#" vs "Sprint #") are accepted.

---

## Project Structure

```
src/
├── firebase/
│   └── config.js           Firebase init + Firestore export
├── services/
│   ├── csvParser.js        PapaParse wrapper with validation
│   └── featureService.js   Firestore CRUD (batch upload/delete)
├── hooks/
│   └── useFeatures.js      Real-time onSnapshot subscription
├── utils/
│   ├── metrics.js          Data aggregation (sprint/assignee/priority/trend)
│   └── pdfExport.js        jsPDF + html2canvas PDF generator
├── components/
│   ├── Navigation/Navbar.jsx
│   ├── common/             LoadingSpinner, ErrorAlert, EmptyState
│   ├── FeatureTable/       MUI DataGrid with sort/filter/pagination
│   └── Charts/             SprintBarChart, PriorityPieChart, AssigneeBarChart, CompletionTrendChart
└── pages/
    ├── FeatureUpload/      Drag-drop upload + preview + overwrite confirm
    └── Dashboard/          KPI cards + all charts + PDF export
```

---

## Firestore Schema

```
Collection: features
─────────────────────────────
featureNumber   : number
name            : string
priority        : string | number
assignee        : string
sprintNumber    : number
completedDate   : Timestamp | null
createdAt       : Timestamp
```

---

## Enabling Auth (Optional)

To restrict access to authenticated users only:

1. Enable **Authentication** in Firebase Console (Google / Email provider)
2. Update `firestore.rules` — replace `if true` with `if request.auth != null`
3. Add a login page and wrap routes with an auth guard

---

## Tech Stack

| Layer       | Library                     |
|-------------|---------------------------  |
| UI          | React 18 + MUI v5           |
| Table       | MUI DataGrid (free)         |
| Charts      | Recharts                    |
| CSV parsing | PapaParse                   |
| Database    | Firebase Firestore v10      |
| PDF export  | jsPDF + html2canvas         |
| Routing     | React Router v6             |
| Build       | Vite 5                      |
| Hosting     | Firebase Hosting            |
