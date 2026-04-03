# Crusader AI - Specification

## Overview
**Crusader** is a standalone web application AI chatbot focused on Christian information, theological debate, and scripture sharing. It has access to the internet for current Christian news, debates, and information.

## Platform
- **Type**: Web application (React + TypeScript + Tailwind CSS + Vite)
- **Deployment**: GitHub Pages (free)
- **Backend**: Convex (built-in backend) or simple API calls for AI processing

## Core Features

### 1. Christian Information Bot
- Answer Bible questions with accurate scripture references
- Provide theological explanations
- Share devotional information
- Fetch current Christian news from the web

### 2. Debate Mode
- Engage in theological debates with skeptics/atheists
- Use Christian apologetics (classical and contemporary arguments)
- Access internet for current debate topics and responses
- Present arguments with scripture backing

### 3. Scripture Helper
- Look up Bible verses and passages
- Provide context and interpretation
- Cross-reference verses
- Daily scripture/proverbs

### 4. Chat Interface
- Modern, clean chat UI with Christian aesthetic
- Dark mode support
- Mobile responsive
- Conversation history

## Technical Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: Use Hermes/OpenAI API for responses
- **Web Search**: Browser tools for fetching current Christian content
- **State**: TanStack Query

## Architecture
- `src/components/ChatInterface.tsx` - Main chat UI
- `src/components/MessageBubble.tsx` - Individual messages
- `src/components/DebateMode.tsx` - Debate-specific features
- `src/components/ScriptureLookup.tsx` - Bible search/lookup
- `src/hooks/useChat.ts` - Chat state management
- `src/lib/api.ts` - API calls to AI backend

## Design Direction
- **Aesthetic**: Clean, reverent, modern church aesthetic
- **Colors**: Deep blue/gold (royal, sacred feel), white/cream backgrounds
- **Typography**: Serif for scripture quotes (Merriweather), sans-serif for UI
- **Accent**: Cross or flame iconography subtly incorporated

## AI Personality
- **Name**: Crusader
- **Personality**: Confident in faith, respectful in debate, informative
- **Traits**: Knowledgeable in scripture and theology, wins debates with logic and love
- **Catchphrase**: End responses with "God bless!" or similar

## Development Workflow
1. Create React + Vite + TypeScript project
2. Install dependencies (Tailwind, Lucide, etc.)
3. Build chat interface UI
4. Integrate AI API
5. Add web search capabilities
6. Test and deploy to GitHub Pages

## Budget
- $0 (free hosting on GitHub Pages)
- Use free-tier AI API or local processing
