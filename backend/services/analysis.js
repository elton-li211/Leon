// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - Component A: Stock Analysis & Conviction Grid
//
// Generates A3 scores across 5 dimensions:
// - Technical (13 sub-components)
// - Fundamental (19 sub-components)
// - Sentiment (13 sub-components)
// - Meta (20 sub-components: smart money, narrative, sector)
// - Risk & Valuation (15 sub-components)
//
// BUBBLE MIGRATION NOTE:
// This workflow = "Generate Conviction Grid" backend workflow in Bubble.
// Each dimension becomes a separate API call you can trigger in parallel.
// ═══════════════════════════════════════════════════════════════

import { concurrentAnalysis } from './ai.js';
import { getDb } from '../database.js';

/**
 * Generate full A3 Conviction Grid for a stock
 */
export async function generateConvictionGrid(symbol, useMockData = true) {
  console.log(`\n🎯 Generating Conviction Grid for ${symbol}...`);

  // For MVP: Use mock data (real API calls would go here)
  if (useMockData) {
    return getMockConvictionGrid(symbol);
  }

  // Real implementation would:
  // 1. Fetch current data (price, volume, news, etc.)
  // 2. Run 5 concurrent AI analysis pairs (Grok + Perplexity)
  // 3. Cross-verify scores
  // 4. Calculate overall conviction
  // 5. Save to database

  const stockData = await fetchStockData(symbol);

  // Run all 5 analyses concurrently
  const [technical, fundamental, sentiment, meta, risk] = await Promise.all([
    analyzeTechnical(symbol, stockData),
    analyzeFundamental(symbol, stockData),
    analyzeSentiment(symbol, stockData),
    analyzeMeta(symbol, stockData),
    analyzeRisk(symbol, stockData)
  ]);

  // Calculate overall conviction
  const weights = { technical: 0.30, fundamental: 0.25, sentiment: 0.20, meta: 0.25 };
  const overallConviction =
    technical.overall_score * weights.technical +
    fundamental.overall_score * weights.fundamental +
    sentiment.overall_score * weights.sentiment +
    meta.overall_score * weights.meta;

  // Cross-check agreement
  const agreement = calculateAgreement(technical, fundamental, sentiment, meta, risk);

  return {
    symbol,
    overall_conviction: Math.round(overallConviction * 10) / 10,
    confidence_level: getConfidenceLevel(overallConviction, agreement),
    agreement_pct: Math.round(agreement),
    technical,
    fundamental,
    sentiment,
    meta,
    risk,
    last_updated: new Date().toISOString()
  };
}

/**
 * Analyze Technical Dimension (13 sub-components)
 */
async function analyzeTechnical(symbol, stockData) {
  const grokPrompt = `Analyze ${symbol} technical setup:

Data:
- Price: $${stockData.price}
- Volume: ${stockData.volume}
- 50-day MA: $${stockData.ma50}
- 200-day MA: $${stockData.ma200}

Score each component 0-10 and provide reasoning.
Return JSON with structure:
{
  "overall_score": 7.5,
  "sub_scores": {
    "price_momentum": 8.0,
    "volume_strength": 7.0,
    "vwap_position": 7.5,
    "rsi": 65,
    "trend": "bullish"
  },
  "reasoning": "Strong uptrend with momentum..."
}`;

  const perplexityPrompt = `Search technical analysis for ${symbol} from last 7 days. Find chart patterns, support/resistance levels.`;

  const result = await concurrentAnalysis(grokPrompt, perplexityPrompt);

  // Parse and merge results
  return parseAnalysisResult(result, 'technical');
}

/**
 * Analyze Fundamental Dimension
 */
async function analyzeFundamental(symbol, stockData) {
  const grokPrompt = `Analyze ${symbol} fundamentals. Score 0-10.`;
  const perplexityPrompt = `Search ${symbol} earnings, revenue, analyst estimates.`;

  const result = await concurrentAnalysis(grokPrompt, perplexityPrompt);
  return parseAnalysisResult(result, 'fundamental');
}

/**
 * Analyze Sentiment Dimension
 */
async function analyzeSentiment(symbol, stockData) {
  const grokPrompt = `Analyze ${symbol} market sentiment. Score 0-10.`;
  const perplexityPrompt = `Search ${symbol} news sentiment, social media buzz, analyst ratings.`;

  const result = await concurrentAnalysis(grokPrompt, perplexityPrompt);
  return parseAnalysisResult(result, 'sentiment');
}

/**
 * Analyze Meta Dimension (Smart Money, Narrative, Sector)
 */
async function analyzeMeta(symbol, stockData) {
  const grokPrompt = `Analyze ${symbol} meta factors: smart money, narrative strength, sector position. Score 0-10.`;
  const perplexityPrompt = `Search ${symbol} institutional ownership, recent 13F filings, industry narrative.`;

  const result = await concurrentAnalysis(grokPrompt, perplexityPrompt);
  return parseAnalysisResult(result, 'meta');
}

/**
 * Analyze Risk & Valuation
 */
async function analyzeRisk(symbol, stockData) {
  const grokPrompt = `Analyze ${symbol} risk profile and valuation. Score 0-10.`;
  const perplexityPrompt = `Search ${symbol} volatility, beta, valuation metrics vs peers.`;

  const result = await concurrentAnalysis(grokPrompt, perplexityPrompt);
  return parseAnalysisResult(result, 'risk');
}

/**
 * Parse AI analysis result
 */
function parseAnalysisResult(result, dimension) {
  try {
    if (result.grok.success) {
      let content = result.grok.content.trim();
      if (content.includes('```')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      const parsed = JSON.parse(content);
      parsed.sources = result.perplexity.citations || [];
      return parsed;
    }
  } catch (e) {
    console.error(`Error parsing ${dimension}:`, e);
  }

  return {
    overall_score: 5.0,
    sub_scores: {},
    reasoning: 'Analysis unavailable',
    sources: []
  };
}

/**
 * Calculate agreement between Grok and Perplexity
 */
function calculateAgreement(...analyses) {
  // Simplified: Check score variance
  const scores = analyses.map(a => a.overall_score).filter(s => s > 0);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower std dev = higher agreement (normalize to 0-100)
  return Math.max(0, 100 - (stdDev * 20));
}

/**
 * Determine confidence level
 */
function getConfidenceLevel(conviction, agreement) {
  if (conviction > 7.5 && agreement > 85) return 'High';
  if (conviction > 5 && agreement > 70) return 'Medium';
  return 'Low';
}

/**
 * Fetch stock data (mock for MVP)
 */
async function fetchStockData(symbol) {
  const db = getDb();
  const stock = db.prepare('SELECT * FROM stock_master WHERE symbol = ?').get(symbol);

  return {
    price: stock?.current_price || 100,
    volume: 5000000,
    ma50: 95,
    ma200: 90
  };
}

/**
 * MOCK DATA for MVP (instant results, no API calls)
 */
function getMockConvictionGrid(symbol) {
  const mockData = {
    'RIOT': {
      symbol: 'RIOT',
      overall_conviction: 8.2,
      confidence_level: 'High',
      agreement_pct: 91,
      technical: {
        overall_score: 7.5,
        sub_scores: {
          price_momentum: 8.0,
          volume_strength: 7.0,
          vwap_position: 7.5,
          rsi: 65,
          macd: 'bullish',
          moving_averages: '50d above 200d',
          support_levels: [11.20, 10.50],
          resistance_levels: [13.50, 15.00],
          chart_pattern: 'ascending triangle',
          volatility: 32,
          beta: 2.1,
          relative_strength_sector: 8.5,
          trend: 'bullish'
        },
        reasoning_grok: 'Strong uptrend with momentum building. Price recently reclaimed VWAP and holding above key moving averages. Volume confirming the move.',
        reasoning_perplexity: 'Technical analysts cite ascending triangle breakout pattern with price target $15+. Support firmly established at $11.20.',
        sources: ['https://seekingalpha.com/...', 'https://tradingview.com/...']
      },
      fundamental: {
        overall_score: 8.0,
        sub_scores: {
          eps_latest: 0.15,
          eps_growth_yoy: 125,
          eps_beat_miss: 'beat by 12%',
          revenue_latest: 150000000,
          revenue_growth_yoy: 85,
          revenue_beat_miss: 'beat by 8%',
          guidance: 'raised',
          profit_margin: 22,
          operating_margin: 18,
          roe: 15,
          debt_equity: 0.3,
          current_ratio: 2.1,
          cash_flow_operating: 45000000,
          cash_flow_free: 38000000,
          pe_ratio: 35,
          peg_ratio: 1.2,
          ps_ratio: 8,
          dividend_yield: 0,
          bookings_growth: 95
        },
        reasoning_grok: 'Strong fundamentals with accelerating revenue growth driven by HPC pivot. Recent earnings beat shows execution on strategy.',
        reasoning_perplexity: 'Analyst reports highlight improving margins and strong cash generation. HPC contracts adding new revenue stream.',
        sources: ['https://finance.yahoo.com/...', 'https://earnings.riot.com/...']
      },
      sentiment: {
        overall_score: 9.0,
        sub_scores: {
          news_sentiment: 8.5,
          social_buzz_strength: 9.5,
          analyst_ratings: 8.0,
          insider_sentiment: 'buying',
          short_interest: 12,
          short_ratio: 3.5,
          put_call_ratio: 0.6,
          media_mentions_count: 145,
          twitter_sentiment_score: 9.2,
          reddit_mentions: 523,
          stocktwits_sentiment: 'extremely bullish',
          analyst_upgrades_downgrades: '2 upgrades this week',
          retail_interest: 'surging'
        },
        reasoning_grok: 'Extremely positive sentiment across all channels. HPC pivot narrative resonating strongly with both retail and institutional.',
        reasoning_perplexity: 'Social media analysis shows 85% bullish sentiment. Recent Stargate contract announcement driving buzz.',
        sources: ['https://twitter.com/...', 'https://reddit.com/r/stocks/...']
      },
      meta: {
        overall_score: 8.5,
        sub_scores: {
          smartmoney_score: 9.0,
          institutional_ownership_pct: 45,
          institutional_change_qoq: 15,
          notable_holders: ['Citadel', 'BlackRock'],
          dark_pool_activity: 'high',
          unusual_options_flow: 'bullish',
          narrative_score: 9.0,
          primary_narrative: 'HPC Pivot - Crypto Mining to AI Infrastructure',
          narrative_strength: 'very strong',
          thematic_fit: 'AI compute demand boom',
          sector_score: 8.0,
          sector_momentum: 8.5,
          relative_performance: '+12% vs peers',
          rotation_signal: 'strong inflow'
        },
        reasoning_grok: 'Smart money piling in with institutional ownership rising. HPC pivot narrative is THE catalyst story.',
        reasoning_perplexity: 'Institutional filings show major funds increasing positions. Narrative shift from crypto miner to AI play gaining traction.',
        sources: ['https://whalewisdom.com/...', 'https://fintel.io/...']
      },
      risk: {
        overall_score: 7.0,
        sub_scores: {
          liquidity_risk: 'low',
          regulatory_risk: 'medium - crypto regulation',
          competition_risk: 'medium - MARA, HIVE',
          execution_risk: 'low - proven management',
          market_risk_beta: 2.1,
          volatility_30d: 32,
          max_drawdown_52w: -45,
          sharpe_ratio: 0.8,
          valuation_vs_peers: 'fair',
          valuation_vs_historical: 'cheap vs 2021',
          growth_vs_valuation: 'attractive PEG 1.2',
          bitcoin_correlation: 0.85,
          macro_sensitivity: 'high'
        },
        reasoning_grok: 'Moderate risk profile. High beta and Bitcoin correlation main risks, offset by strong execution.',
        reasoning_perplexity: 'Risk analysts note crypto regulatory overhang but improving fundamentals. Valuation attractive relative to growth.',
        sources: ['https://morningstar.com/...']
      },
      last_updated: new Date().toISOString()
    },
    'NVDA': {
      symbol: 'NVDA',
      overall_conviction: 9.1,
      confidence_level: 'High',
      agreement_pct: 94,
      technical: {
        overall_score: 8.5,
        sub_scores: {
          price_momentum: 9.0,
          volume_strength: 8.5,
          trend: 'strong bullish'
        },
        reasoning_grok: 'Dominant uptrend with institutional accumulation.',
        reasoning_perplexity: 'Breaking out to new highs on AI demand.',
        sources: []
      },
      fundamental: {
        overall_score: 9.5,
        sub_scores: {
          eps_growth_yoy: 265,
          revenue_growth_yoy: 122,
          guidance: 'raised significantly'
        },
        reasoning_grok: 'Best-in-class fundamentals. AI chip monopoly driving growth.',
        reasoning_perplexity: 'Record data center revenue. Massive backlog.',
        sources: []
      },
      sentiment: {
        overall_score: 9.0,
        sub_scores: {
          analyst_ratings: 9.5,
          social_buzz_strength: 8.5
        },
        reasoning_grok: 'Wall Street darling. Everyone wants exposure.',
        reasoning_perplexity: 'Overwhelming bullish consensus among analysts.',
        sources: []
      },
      meta: {
        overall_score: 9.5,
        sub_scores: {
          smartmoney_score: 10.0,
          narrative_score: 10.0,
          primary_narrative: 'AI Infrastructure Leader'
        },
        reasoning_grok: 'The AI play. Unmatched narrative strength.',
        reasoning_perplexity: 'Every major AI project uses NVIDIA chips.',
        sources: []
      },
      risk: {
        overall_score: 7.5,
        sub_scores: {
          valuation_vs_peers: 'premium',
          competition_risk: 'low but emerging (AMD, custom chips)'
        },
        reasoning_grok: 'Main risk is valuation and eventual competition.',
        reasoning_perplexity: 'High valuation justified by growth, but monitoring AMD.',
        sources: []
      },
      last_updated: new Date().toISOString()
    }
  };

  return mockData[symbol] || mockData['RIOT'];
}

/**
 * Save conviction grid to database
 */
export function saveConvictionGrid(symbol, gridData) {
  const db = getDb();

  // Get stock_id
  const stock = db.prepare('SELECT id FROM stock_master WHERE symbol = ?').get(symbol);
  if (!stock) {
    throw new Error(`Stock ${symbol} not found`);
  }

  // Check if profile exists
  const existing = db.prepare('SELECT id FROM stock_profile WHERE stock_id = ?').get(stock.id);

  if (existing) {
    // Update
    const update = db.prepare(`
      UPDATE stock_profile SET
        overall_conviction = ?,
        confidence_level = ?,
        grok_perplexity_agreement = ?,
        a3_technical_json = ?,
        a3_fundamental_json = ?,
        a3_sentiment_json = ?,
        a3_meta_json = ?,
        a3_risk_json = ?,
        last_updated = CURRENT_TIMESTAMP
      WHERE stock_id = ?
    `);

    update.run(
      gridData.overall_conviction,
      gridData.confidence_level,
      gridData.agreement_pct,
      JSON.stringify(gridData.technical),
      JSON.stringify(gridData.fundamental),
      JSON.stringify(gridData.sentiment),
      JSON.stringify(gridData.meta),
      JSON.stringify(gridData.risk),
      stock.id
    );
  } else {
    // Insert
    const insert = db.prepare(`
      INSERT INTO stock_profile (
        stock_id, overall_conviction, confidence_level, grok_perplexity_agreement,
        a3_technical_json, a3_fundamental_json, a3_sentiment_json, a3_meta_json, a3_risk_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      stock.id,
      gridData.overall_conviction,
      gridData.confidence_level,
      gridData.agreement_pct,
      JSON.stringify(gridData.technical),
      JSON.stringify(gridData.fundamental),
      JSON.stringify(gridData.sentiment),
      JSON.stringify(gridData.meta),
      JSON.stringify(gridData.risk)
    );
  }

  console.log(`✓ Saved conviction grid for ${symbol}`);
}
