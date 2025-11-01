# 🚀 LEON FINANCE v3.0 - Investment Operating System MVP

Professional-grade investment platform built with **React**, **Tailwind CSS**, **Express**, and **SQLite**.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Bubble.io Migration Guide](#bubbleio-migration-guide)
- [API Documentation](#api-documentation)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

---

## ✨ Features

### Phase 1 MVP (Current)

✅ **Component A: Conviction Grid Analysis**
- AI-powered stock analysis across 5 dimensions
- **Technical**: 13 sub-components (momentum, volume, RSI, MACD, etc.)
- **Fundamental**: 19 sub-components (EPS, revenue, margins, etc.)
- **Sentiment**: 13 sub-components (social buzz, analyst ratings, etc.)
- **Meta**: 20 sub-components (smart money, narrative, sector)
- **Risk**: 15 sub-components (volatility, valuation, etc.)

✅ **Chat-First Interface**
- Conversational AI (Grok + Perplexity concurrent execution)
- Intent parsing and component routing
- Natural language stock analysis

✅ **Mock Data**
- Pre-loaded data for RIOT and NVDA
- Instant results (no API costs during development)

✅ **Real-time Database**
- SQLite for persistent storage
- Chat history logging
- API usage tracking

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn

### Installation & Run (1-2 minutes)

```bash
# 1. Clone/navigate to the project
cd Leon

# 2. Install all dependencies
npm run install:all

# 3. Copy environment template
cp .env.example .env

# 4. (Optional) Add your API keys to .env
# For MVP, it works WITHOUT keys using mock data

# 5. Start the app
npm run dev
```

### Access the App

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

### Try It Out

1. Type in chat: **"Analyze RIOT"**
2. Watch the conviction grid appear with full A3 analysis
3. Expand each dimension to see sub-scores and AI reasoning
4. Try: **"Analyze NVDA"**

---

## 🏗️ Architecture

### Mesh Topology (v3.0 Key Innovation)

```
┌─────────────────────────────────────────┐
│      UNIFIED AI CHAT INTERFACE          │
│   Grok + Perplexity Concurrent          │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│   A    │ │   B    │ │   C    │
│Analysis│ │Strategy│ │Tracking│
└────────┘ └────────┘ └────────┘
```

**Key Principles**:
1. ✅ All components are **equal peers** (not sequential)
2. ✅ Chat invokes any component **directly**
3. ✅ Timeline is the **integration backbone**
4. ✅ **Event-driven** communication
5. ✅ Bi-directional data flow

### Data Flow

```
User Message → Intent Parser (Grok) → Route to Component
                                    ↓
Component A: Grok + Perplexity (concurrent) → Analysis
                                    ↓
                        Store in SQLite (JSON blobs)
                                    ↓
                        Return to Chat UI → Display Grid
```

---

## 🎨 Bubble.io Migration Guide

### Component Mapping

| React Component | Bubble Equivalent |
|----------------|-------------------|
| `App.jsx` | Main page with groups |
| `ChatInterface.jsx` | Repeating Group + Input + Button |
| `ConvictionGrid.jsx` | Repeating Group with collapsible sub-groups |
| `Header.jsx` | Header group (reusable element) |

### Data Type Mapping

| SQLite Table | Bubble Data Type |
|-------------|------------------|
| `stock_master` | Stock_Master |
| `stock_profile` | Stock_Profile |
| `chat_history` | AI_Chat_History |
| `api_usage_log` | API_Usage_Log |

### Key Migration Steps

#### 1. **Database Setup**

In Bubble Data tab:
```
Create Data Type: Stock_Master
Fields:
- symbol (text, unique)
- name (text)
- current_price (number)
- in_watchlist (yes/no)
... (see schema in spec)

Create Data Type: Stock_Profile
Fields:
- stock (Stock_Master)
- overall_conviction (number)
- a3_technical_json (text) ← JSON blob
- a3_fundamental_json (text) ← JSON blob
... etc
```

#### 2. **API Connector Setup**

```
API Name: LeonBackend
Authentication: None (or API key)

Call 1: SendChatMessage
- Type: POST
- URL: https://your-backend.com/api/chat
- Body: { "message": <message> }
- Use as: Action

Call 2: AnalyzeStock
- Type: POST
- URL: https://your-backend.com/api/stocks/<symbol>/analyze
- Use as: Data
```

#### 3. **Parsing JSON in Bubble**

To display sub-scores from `a3_technical_json`:

```
Text element:
Dynamic data = Stock_Profile's a3_technical_json:extract with JSONata "sub_scores.price_momentum"

Progress bar:
Width % = (extracted score) × 10
```

#### 4. **Repeating Group for Conviction Grid**

```
Repeating Group: Type = Text (manual list)
Data source = List: Technical, Fundamental, Sentiment, Meta, Risk

Inside cell:
- Text: This Text (dimension name)
- Text: Stock_Profile's a3_technical_json:extract "overall_score"
- Progress bar: Width based on score
- Collapsible group: Trigger on click
```

#### 5. **Workflows**

**Workflow: Send Chat Message**
```
Step 1: API Call - SendChatMessage (message = Input's value)
Step 2: Display response in Repeating Group
Step 3: If response contains componentData:
        → Navigate to Conviction Grid page
        → Set state: current_stock = response's symbol
```

### Migration Checklist

- [ ] Create all Data Types in Bubble
- [ ] Set up API Connector with backend endpoints
- [ ] Build chat interface (RG + Input)
- [ ] Build conviction grid (nested RGs)
- [ ] Test JSON parsing with JSONata
- [ ] Set up workflows for chat → analysis flow
- [ ] Style with Bubble's responsive engine

---

## 🔌 API Documentation

### Base URL: `http://localhost:3001/api`

### Endpoints

#### 1. **POST /api/chat**

Send a chat message to Leon AI.

**Request:**
```json
{
  "message": "Analyze RIOT"
}
```

**Response:**
```json
{
  "message": "✓ Analysis complete for RIOT!...",
  "intent": {
    "component": "A",
    "action": "analyze",
    "stocks": ["RIOT"],
    "confidence": 9
  },
  "componentData": {
    "type": "conviction_grid",
    "data": { ... }
  }
}
```

#### 2. **GET /api/stocks**

Get all stocks in watchlist.

**Response:**
```json
[
  {
    "id": 1,
    "symbol": "RIOT",
    "name": "Riot Platforms",
    "current_price": 12.45,
    "in_watchlist": 1
  }
]
```

#### 3. **GET /api/stocks/:symbol/profile**

Get conviction grid for a stock.

**Response:**
```json
{
  "symbol": "RIOT",
  "overall_conviction": 8.2,
  "confidence_level": "High",
  "technical": { ... },
  "fundamental": { ... },
  "sentiment": { ... },
  "meta": { ... },
  "risk": { ... }
}
```

#### 4. **POST /api/stocks/:symbol/analyze**

Generate new conviction grid analysis.

**Response:**
```json
{
  "symbol": "RIOT",
  "overall_conviction": 8.2,
  ... (same as profile endpoint)
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - Server
- **SQLite (better-sqlite3)** - Database
- **Axios** - AI API calls

### AI Services
- **Grok (xAI)** - Analysis & reasoning
- **Perplexity** - Research & citations

### Deployment
- **Vercel** - Frontend hosting (ready)
- **Railway/Render** - Backend hosting (optional)

---

## 📁 Project Structure

```
Leon/
├── backend/
│   ├── server.js              # Express server
│   ├── database.js            # SQLite schema & init
│   ├── routes/
│   │   ├── chat.js            # Chat endpoints
│   │   └── stocks.js          # Stock endpoints
│   └── services/
│       ├── ai.js              # Grok + Perplexity integration
│       └── analysis.js        # Component A logic
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   └── ConvictionGrid.jsx
│   │   └── services/
│   │       └── api.js         # API client
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .env.example               # Environment template
├── package.json               # Root workspace config
└── README.md                  # This file
```

---

## 📸 Screenshots

### Chat Interface
```
┌─────────────────────────────────────┐
│ 💬 Chat with Leon AI                │
│ Powered by Grok + Perplexity        │
├─────────────────────────────────────┤
│                                     │
│  You: Analyze RIOT                 │
│                                     │
│  Leon: ✓ Analysis complete!        │
│  Overall Conviction: 8.2/10        │
│  • Technical: 7.5/10               │
│  • Fundamental: 8.0/10             │
│  ...                               │
│                                     │
├─────────────────────────────────────┤
│ [Type message...] [Send]           │
└─────────────────────────────────────┘
```

### Conviction Grid
```
┌─────────────────────────────────────┐
│ RIOT         8.2/10                │
│ Confidence: High • Agreement: 91%  │
├─────────────────────────────────────┤
│ 📈 Technical        7.5/10 ▼       │
│ ████████░░                         │
│   → Grok: Strong uptrend...        │
│   → Sub-scores: momentum 8.0...    │
│                                     │
│ 💰 Fundamental      8.0/10 ▼       │
│ ████████░░                         │
│                                     │
│ ... (5 dimensions total)           │
└─────────────────────────────────────┘
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```bash
# Required for REAL AI analysis (optional for MVP with mock data)
GROK_API_KEY=xai-your-grok-api-key
PERPLEXITY_API_KEY=pplx-your-perplexity-key

# Optional: Market data APIs
POLYGON_API_KEY=your_polygon_key
FINNHUB_API_KEY=your_finnhub_key

# Server config
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**MVP Note**: The app works **WITHOUT API keys** using mock data for RIOT and NVDA.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Start app with `npm run dev`
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:3001/api/health
- [ ] Chat: Send "Analyze RIOT" → Grid appears
- [ ] Chat: Send "Analyze NVDA" → Different grid
- [ ] Click dimension → Expands to show sub-scores
- [ ] Grok + Perplexity reasoning visible
- [ ] Database: Check `backend/leon.db` created

### Testing with Real APIs

1. Add API keys to `.env`
2. In `backend/services/analysis.js`, change:
   ```js
   const gridData = await generateConvictionGrid(symbol, false); // false = real API
   ```
3. Send chat message → Will call Grok + Perplexity

---

## 🚢 Deployment

### Vercel (Frontend)

```bash
cd frontend
vercel
```

### Railway (Backend)

```bash
cd backend
# Connect to Railway via dashboard
# Set environment variables
# Deploy
```

### Full Stack on Render

- Create Web Service for backend
- Create Static Site for frontend
- Set `FRONTEND_URL` env var in backend

---

## 💰 Cost Management

### API Usage (Real Calls)

- **Grok**: ~$0.002 per request
- **Perplexity**: ~$0.003 per request
- **Total per analysis**: ~$0.01 (5 dimensions × 2 models)

### MVP with Mock Data

- **Cost**: $0 (no API calls)
- Perfect for development and testing

### Cost Monitoring

The app logs all API usage to `api_usage_log` table:
```sql
SELECT SUM(estimated_cost) FROM api_usage_log WHERE DATE(timestamp) = DATE('now');
```

---

## 🎯 Roadmap

### ✅ Phase 1 (Current)
- Component A: Conviction Grid
- Chat interface
- Mock data
- SQLite database

### 📋 Phase 2 (Next)
- Component B: Strategy Generation (B1-B10)
- Component C: Milestone Tracking
- Timeline integration
- Event triggers

### 📋 Phase 3 (Future)
- Component D: Portfolio Management
- Component E: Trade Journal
- Playbook templates
- Full integration

---

## 🤝 Contributing

This is a private MVP. For questions:
1. Check this README
2. Review code comments (marked with BUBBLE MIGRATION NOTE)
3. Check the original spec document

---

## 📄 License

Private project. All rights reserved.

---

## 🙏 Acknowledgments

- **Grok (xAI)** - Analytical reasoning
- **Perplexity** - Research & citations
- **Bubble.io** - Target migration platform

---

## 📞 Support

For issues or questions:
- Review `/backend/services/analysis.js` for Component A logic
- Review `/frontend/src/components/ConvictionGrid.jsx` for UI
- Check browser console for errors
- Check terminal for backend logs

---

**Built with ❤️ for serious investors.**

**LEON FINANCE v3.0** - Where AI meets investment strategy.
