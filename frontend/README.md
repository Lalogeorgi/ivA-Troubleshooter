# ivA-Troubleshooter — Frontend Application

This directory contains the user interface for **ivA-Troubleshooter**, an open-source, AI-native medical device service intelligence and diagnostic troubleshooting platform.

For full project overview, stakeholder value guides, and knowledge vault documentation, see the [Root README](../README.md).

---

## 🛠️ Technology Stack
* **Framework**: [Next.js 16.1 (App Router)](https://nextjs.org/)
* **UI Runtime**: [React 19.2](https://react.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with ivA Clinical Design Tokens
* **3D Spatial Graphics**: [Three.js](https://threejs.org/) WebGL Canvas
* **Iconography**: [Lucide React](https://lucide.dev/)
* **Typography**: Geist Sans & Geist Mono with Tabular Monospace Numerics

---

## 📁 Directory Structure
```
frontend/
├── app/
│   ├── globals.css                # Clinical design tokens, 56px touch ergonomics, focus rings
│   ├── layout.tsx                 # Root layout, fonts, and ivA-Troubleshooter metadata
│   ├── page.tsx                   # Central landing portal & telemetry summary
│   ├── workspace/                 # FSE Case Operations Center
│   │   ├── page.tsx               # Active field cases list & case creation modal
│   │   └── [caseId]/page.tsx      # Diagnostic stepper, live tolerances, approval gates, RTS report
│   ├── vault/                     # Clinical Knowledge Vault Explorer
│   │   ├── page.tsx               # Entity category filter, search & sync trigger
│   │   └── [id]/page.tsx          # Entity viewer with bidirectional wikilink graph edges
│   ├── machine-context/           # Legacy equipment serial number & intervention setup
│   └── intervention-session/      # Legacy diagnostic and procedure sessions
├── components/
│   ├── DigitalTwinViewer.tsx      # Interactive Three.js 3D spatial digital twin (BioMed X200)
│   └── DocumentViewer.tsx         # Layout-aware PDF manual & AI provenance chunk viewer
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Linting
```bash
# Verify TypeScript and create production bundle
npm run build

# Run ESLint
npm run lint
```
