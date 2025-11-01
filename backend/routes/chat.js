// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - Chat API Routes
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { parseIntent, concurrentAnalysis } from '../services/ai.js';
import { generateConvictionGrid, saveConvictionGrid } from '../services/analysis.js';
import { getDb } from '../database.js';

const router = express.Router();

/**
 * Simple intent parser (works without API keys for MVP)
 * Uses keyword matching instead of AI
 */
function parseIntentSimple(message) {
  const msg = message.toLowerCase();

  // Extract stock symbols (uppercase words, typically 1-5 chars)
  const symbolPattern = /\b[A-Z]{1,5}\b/g;
  const stocks = message.match(symbolPattern) || [];

  // Analyze intent
  if (msg.includes('analyze') || msg.includes('analysis') || msg.includes('check')) {
    return {
      component: 'A',
      action: 'analyze',
      stocks: stocks,
      confidence: 9
    };
  }

  // Discover intent
  if (msg.includes('find') || msg.includes('search') || msg.includes('discover') ||
      msg.includes('stocks for') || msg.includes('what stocks')) {
    return {
      component: 'A',
      action: 'discover',
      stocks: stocks,
      confidence: 8
    };
  }

  // Default
  return {
    component: 'A',
    action: 'general',
    stocks: stocks,
    confidence: 5
  };
}

/**
 * POST /api/chat
 * Main chat endpoint - parses intent and routes to appropriate component
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`\n💬 User: ${message}`);

    // Parse intent using simple keyword matching (no API needed for MVP)
    const intent = parseIntentSimple(message);
    console.log(`🎯 Intent:`, intent);

    let response = '';
    let componentData = null;

    // Route based on component
    if (intent.component === 'A' && intent.action === 'analyze') {
      // Component A: Generate Conviction Grid
      const symbol = intent.stocks[0];

      if (!symbol) {
        response = "Please specify a stock symbol to analyze (e.g., 'analyze RIOT').";
      } else {
        response = `Analyzing ${symbol}... Generating conviction grid across 5 dimensions.`;

        // Generate conviction grid (using mock data for MVP)
        const gridData = await generateConvictionGrid(symbol, true);

        // Save to database
        saveConvictionGrid(symbol, gridData);

        componentData = {
          type: 'conviction_grid',
          data: gridData
        };

        response = `✓ Analysis complete for ${symbol}!\n\nOverall Conviction: ${gridData.overall_conviction}/10 (${gridData.confidence_level} confidence)\n\n` +
          `📊 Dimension Scores:\n` +
          `• Technical: ${gridData.technical.overall_score}/10\n` +
          `• Fundamental: ${gridData.fundamental.overall_score}/10\n` +
          `• Sentiment: ${gridData.sentiment.overall_score}/10\n` +
          `• Meta: ${gridData.meta.overall_score}/10\n` +
          `• Risk: ${gridData.risk.overall_score}/10\n\n` +
          `Model Agreement: ${gridData.agreement_pct}%`;
      }
    } else if (intent.component === 'A' && intent.action === 'discover') {
      response = `🔍 Searching for stocks matching your criteria...\n\nFound candidates:\n• RIOT (8.2/10) - HPC Pivot\n• MARA (7.8/10) - Crypto Mining\n\nWould you like me to analyze any of these?`;
    } else {
      // General response
      response = `I understand you want to ${intent.action}. ` +
        (intent.stocks.length > 0 ? `Stocks mentioned: ${intent.stocks.join(', ')}.` : '') +
        `\n\nFor MVP, try:\n• "Analyze RIOT"\n• "Analyze NVDA"\n• "What stocks for HPC pivot?"`;
    }

    // Save to chat history
    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO chat_history (user_message, intent_parsed, synthesized_response, resulted_in_action)
      VALUES (?, ?, ?, ?)
    `);
    insert.run(message, intent.component, response, componentData ? 1 : 0);

    res.json({
      message: response,
      intent,
      componentData
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * GET /api/chat/history
 * Get chat history
 */
router.get('/history', (req, res) => {
  try {
    const db = getDb();
    const history = db.prepare(`
      SELECT * FROM chat_history
      ORDER BY timestamp DESC
      LIMIT 50
    `).all();

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
