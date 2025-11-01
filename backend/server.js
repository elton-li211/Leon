// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - Express Server
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import chatRouter from './routes/chat.js';
import stockRouter from './routes/stocks.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/stocks', stockRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ═══════════════════════════════════════════════════════════════
  🚀 LEON FINANCE v3.0 - Backend Server Running
  ═══════════════════════════════════════════════════════════════

  📡 Server: http://localhost:${PORT}
  🗄️  Database: SQLite (leon.db)
  🤖 AI: Grok + Perplexity ${process.env.GROK_API_KEY ? '✓' : '✗'}

  Ready for requests!
  ═══════════════════════════════════════════════════════════════
  `);
});
