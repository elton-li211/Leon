// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - Stock API Routes
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { getDb } from '../database.js';
import { generateConvictionGrid, saveConvictionGrid } from '../services/analysis.js';

const router = express.Router();

/**
 * GET /api/stocks
 * List all stocks in watchlist
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const stocks = db.prepare(`
      SELECT * FROM stock_master
      WHERE in_watchlist = 1
      ORDER BY symbol
    `).all();

    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stocks/:symbol
 * Get stock details
 */
router.get('/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const db = getDb();

    const stock = db.prepare('SELECT * FROM stock_master WHERE symbol = ?').get(symbol.toUpperCase());

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stocks/:symbol/profile
 * Get conviction grid for stock
 */
router.get('/:symbol/profile', (req, res) => {
  try {
    const { symbol } = req.params;
    const db = getDb();

    const stock = db.prepare('SELECT id FROM stock_master WHERE symbol = ?').get(symbol.toUpperCase());

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const profile = db.prepare(`
      SELECT * FROM stock_profile
      WHERE stock_id = ?
      ORDER BY last_updated DESC
      LIMIT 1
    `).get(stock.id);

    if (!profile) {
      return res.status(404).json({ error: 'No profile found. Run analysis first.' });
    }

    // Parse JSON fields
    const gridData = {
      symbol: symbol.toUpperCase(),
      overall_conviction: profile.overall_conviction,
      confidence_level: profile.confidence_level,
      agreement_pct: profile.grok_perplexity_agreement,
      technical: JSON.parse(profile.a3_technical_json),
      fundamental: JSON.parse(profile.a3_fundamental_json),
      sentiment: JSON.parse(profile.a3_sentiment_json),
      meta: JSON.parse(profile.a3_meta_json),
      risk: JSON.parse(profile.a3_risk_json),
      last_updated: profile.last_updated
    };

    res.json(gridData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/stocks/:symbol/analyze
 * Generate conviction grid for stock
 */
router.post('/:symbol/analyze', async (req, res) => {
  try {
    const { symbol } = req.params;

    console.log(`\n📊 Analyzing ${symbol}...`);

    const gridData = await generateConvictionGrid(symbol.toUpperCase(), true);
    saveConvictionGrid(symbol.toUpperCase(), gridData);

    res.json(gridData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
