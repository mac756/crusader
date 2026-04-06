# Crusader AI - Specification

## Purpose
**"To bring the love and truth of Christ to everyone through AI - answering questions, defending faith, and guiding seekers home."**

## Why We Made Crusader
We believe everyone deserves access to Biblical wisdom and spiritual guidance, regardless of their background or location. Crusader exists to:
- Answer hard questions about faith with compassion and truth
- Defend Christianity using Scripture and credible sources
- Teach and disciple believers of all ages
- Be a safe space for seekers to explore faith
- Honor God in everything we build

---

## Vision
A professional, visually stunning Christian AI that feels like having a personal pastor, teacher, and apologist in your pocket - all free, all local, all for God's glory.

---

## Design Language

### Aesthetic
- **Style**: Professional, warm, reverent - like a modern church app meets premium software
- **Theme**: Dark red/black base with gold accents and subtle glowing effects
- **Feel**: Serious but welcoming, beautiful but not flashy

### Color Palette
- **Primary**: `#991b1b` (deep red)
- **Secondary**: `#450a0a` (darker red)
- **Accent/Gold**: `#d4af37` (gold)
- **Background**: `#0f0f0f` to `#1a1a1a` (near black)
- **Text**: `#ffffff` (white), `#d4d4d4` (light gray)
- **Glow**: Gold glow effects on key elements (`box-shadow: 0 0 20px rgba(212, 175, 55, 0.3)`)

### Typography
- **Headers**: Inter Bold, clean sans-serif
- **Body**: Inter Regular
- **Scripture**: Merriweather serif (italic)
- **Monospace**: JetBrains Mono (for terminal-style elements)

### Visual Effects
- Subtle gold glow on borders and active elements
- Smooth animations (fade-in, slide-up)
- Glass-morphism on panels (semi-transparent with blur)
- No "terminal zombie" look - keep it elegant and modern

---

## Layout - NO SCROLLING except chat

### Window Structure (Fixed Height ~600-700px)
```
┌─────────────────────────────────────────┐
│  LOGO + HEADER (fixed, ~80px)           │
│  Sword & Shield with Cross               │
├─────────────────────────────────────────┤
│  MODE TABS (fixed, ~50px)               │
│  [Debator] [Instructor] [Reader]         │
├─────────────────────────────────────────┤
│                                         │
│  CHAT MESSAGES (scrollable, flex-1)     │
│  - User messages (right, red)            │
│  - AI messages (left, dark card)         │
│  - Scripture highlighted in gold          │
│                                         │
├─────────────────────────────────────────┤
│  INPUT AREA (fixed, ~80px)              │
│  [Mic] [Text Input..............] [Send]│
└─────────────────────────────────────────┘
```

### Responsive
- Desktop: 700px wide centered panel
- Mobile: Full width with padding

---

## Features

### 1. Three Modes

**DEBATOR**
- Defends Christianity against objections
- Uses Bible verses AND credible external sources
- When given a question, picks ONE strong point and defends it COMPLETELY
- Follow-up questions deepen the same point
- Respectful but confident tone
- Always cites sources

**INSTRUCTOR**
- Gentle teaching mode
- Explains concepts with patience
- Offers guidance on Christian living
- devotionals and prayer help
- Encouraging and warm tone

**READER**
- Bible-focused study mode
- Scripture lookup and explanation
- Verse-by-verse breakdown
- Cross-references
- Commentary on scripture meaning

### 2. Chat Interface
- Messages scroll internally (only this section scrolls)
- User messages: Right side, red background, white text
- AI messages: Left side, dark card with gold accents
- Scripture references highlighted with gold background
- Timestamps on messages
- Typing indicator with Bible verse

### 3. AI Behavior
- Picks ONE theological point to defend per conversation
- Provides deep, thorough answers
- Uses Bible verses as primary source
- Supplements with credible Christian sources (can web search)
- Explains and defends that single point completely
- If user asks follow-up, continues defending same point
- If user changes topic completely, AI may shift point OR ask "Do you want to explore this new topic or continue with [previous topic]?"

### 4. Voice (Future)
- Microphone input
- espeak-ng for output (or better if available)

---

## Components

### Header
- Logo: Sword AND Shield AND Cross combined (detailed SVG)
- Title: "CRUSADER" in gold gradient text
- Subtitle: "Christian AI Assistant"
- Mode indicator

### Mode Tabs
- 3 large clickable tabs
- Active tab has gold glow border
- Icons for each mode
- Hover effects

### Chat Messages
- Rounded corners
- Subtle shadows
- Scripture quotes in styled cards
- Source citations in smaller text

### Input Area
- Dark input field with gold border on focus
- Microphone button
- Send button (red with glow when active)
- Placeholder text changes based on mode

---

## Technical

### Stack
- React 18 + TypeScript
- Vite (build)
- Tailwind CSS (styling)
- Express.js (backend)
- MiniMax API (AI)

### API Endpoints
- `POST /api/chat` - Main chat endpoint
- `GET /api/bible/:reference` - Bible lookup
- `POST /api/transcribe` - Voice to text

### Environment
- Local only (no cloud)
- All data stays on machine
- $0 budget

---

## Safety & Boundaries
- **NO aggression** - always gentle, loving, patient
- **NO vulgar language** - filter everything
- **Age appropriate** - suitable for all ages
- **No doctrinal division** - focus on core Christianity
- **Honest** - if unsure, say so

---

## Future Goals (When Ready)
- Mobile app (React Native)
- Push notifications
- Prayer journal database
- Scripture memorization tracker
- Community features
- Better voice synthesis
- Multi-language support

---

## Build Checklist
- [ ] New Header with Sword + Shield + Cross logo
- [ ] Purpose statement in UI
- [ ] 3 mode tabs (Debator, Instructor, Reader)
- [ ] Compact layout (no scroll except chat)
- [ ] Beautiful glowing design
- [ ] Deep defense AI behavior
- [ ] Bible lookup with gold styling
- [ ] Smooth animations
- [ ] Test locally
- [ ] Push to GitHub (local backup)
