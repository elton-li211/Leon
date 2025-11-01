// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - SQLite Database Schema
//
// BUBBLE MIGRATION NOTE:
// These tables map to Bubble Data Types with same field names.
// JSON columns in SQLite → JSON fields in Bubble.
// ═══════════════════════════════════════════════════════════════

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export function initDatabase() {
  db = new Database(path.join(__dirname, 'leon.db'));

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  createTables();
  seedMockData();

  console.log('✓ Database initialized');
  return db;
}

export function getDb() {
  if (!db) {
    db = new Database(path.join(__dirname, 'leon.db'));
  }
  return db;
}

function createTables() {
  const db = getDb();

  // Stock_Master - Core stock data
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      sector TEXT,
      current_price REAL,
      price_change_pct REAL,
      market_cap REAL,
      last_price_update TEXT,
      in_watchlist INTEGER DEFAULT 0,
      date_added_watchlist TEXT,
      discovery_source TEXT,
      discovery_query TEXT,
      user_tags TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stock_Profile - A3 Conviction Analysis (5 JSON blobs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_id INTEGER NOT NULL,
      profile_version INTEGER DEFAULT 1,
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      user_notes TEXT,

      -- Core Metrics (quick access)
      overall_conviction REAL,
      confidence_level TEXT,
      data_quality TEXT,
      grok_perplexity_agreement REAL,
      cross_check_status TEXT,

      -- JSON Blobs (detailed analysis)
      a3_technical_json TEXT,
      a3_fundamental_json TEXT,
      a3_sentiment_json TEXT,
      a3_meta_json TEXT,
      a3_risk_json TEXT,

      -- User customization
      custom_weights_json TEXT,

      FOREIGN KEY (stock_id) REFERENCES stock_master(id)
    )
  `);

  // AI_Chat_History - Conversation log
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      user_message TEXT NOT NULL,
      intent_parsed TEXT,
      grok_response TEXT,
      perplexity_response TEXT,
      synthesized_response TEXT,
      resulted_in_action INTEGER DEFAULT 0,
      action_type TEXT,
      cost_logged REAL
    )
  `);

  // API_Usage_Log - Cost tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      service TEXT NOT NULL,
      endpoint TEXT,
      query_text TEXT,
      tokens_used INTEGER,
      estimated_cost REAL,
      cache_hit INTEGER DEFAULT 0,
      response_time_ms INTEGER
    )
  `);
}

function seedMockData() {
  const db = getDb();

  // Check if data already exists
  const count = db.prepare('SELECT COUNT(*) as count FROM stock_master').get();
  if (count.count > 0) return;

  console.log('📦 Seeding mock data for RIOT and NVDA...');

  // Insert mock stocks
  const insertStock = db.prepare(`
    INSERT INTO stock_master (symbol, name, sector, current_price, price_change_pct, market_cap, in_watchlist)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  insertStock.run('RIOT', 'Riot Platforms', 'Crypto Mining', 12.45, 3.2, 2500000000);
  insertStock.run('NVDA', 'NVIDIA Corporation', 'Semiconductors', 485.50, 2.1, 1200000000000);

  console.log('✓ Mock data seeded');
}

export default { initDatabase, getDb };
