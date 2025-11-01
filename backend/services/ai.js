// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - AI Service (Grok + Perplexity Concurrent)
//
// BUBBLE MIGRATION NOTE:
// In Bubble, these become API Connector calls to OpenAI-compatible endpoints.
// Use "API Workflow" with concurrent execution for parallel calls.
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';

const GROK_API_BASE = 'https://api.x.ai/v1';
const PERPLEXITY_API_BASE = 'https://api.perplexity.ai';

/**
 * Call Grok API (xAI)
 */
export async function callGrok(systemPrompt, userPrompt) {
  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${GROK_API_BASE}/chat/completions`,
      {
        model: 'grok-beta',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const responseTime = Date.now() - startTime;
    const content = response.data.choices[0].message.content;
    const usage = response.data.usage;

    return {
      success: true,
      content,
      usage,
      responseTime,
      model: 'grok-beta'
    };
  } catch (error) {
    console.error('Grok API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Call Perplexity API
 */
export async function callPerplexity(prompt, searchFocus = true) {
  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${PERPLEXITY_API_BASE}/chat/completions`,
      {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        search_domain_filter: searchFocus ? ['finance.yahoo.com', 'seekingalpha.com', 'bloomberg.com'] : undefined
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const responseTime = Date.now() - startTime;
    const content = response.data.choices[0].message.content;
    const usage = response.data.usage;
    const citations = response.data.citations || [];

    return {
      success: true,
      content,
      usage,
      citations,
      responseTime,
      model: 'llama-3.1-sonar-large-128k-online'
    };
  } catch (error) {
    console.error('Perplexity API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * CONCURRENT EXECUTION: Run Grok + Perplexity in parallel
 * This is the key to the mesh architecture
 */
export async function concurrentAnalysis(grokPrompt, perplexityPrompt) {
  console.log('🔄 Running concurrent AI analysis (Grok + Perplexity)...');

  const [grokResult, perplexityResult] = await Promise.all([
    callGrok(
      'You are a financial analysis expert. Provide structured, data-driven analysis. Return valid JSON when requested.',
      grokPrompt
    ),
    callPerplexity(perplexityPrompt)
  ]);

  return {
    grok: grokResult,
    perplexity: perplexityResult,
    totalTime: Math.max(grokResult.responseTime, perplexityResult.responseTime)
  };
}

/**
 * Parse intent from user message
 */
export async function parseIntent(userMessage, context = {}) {
  const prompt = `Parse this user's intent for a financial app:

User message: "${userMessage}"

Context:
${JSON.stringify(context, null, 2)}

Determine:
1. component: Which component? (A=Analysis, B=Strategy, C=Tracking, D=Portfolio, E=Journal, Timeline)
2. action: What specific action? (analyze, discover, generate_strategy, etc.)
3. stocks: List of stock symbols mentioned (uppercase)
4. confidence: Your confidence 0-10

Return ONLY valid JSON:
{
  "component": "A",
  "action": "analyze",
  "stocks": ["RIOT"],
  "confidence": 9
}`;

  const result = await callGrok('You parse user intent. Return only valid JSON, no other text.', prompt);

  if (result.success) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = result.content.trim();
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse intent JSON:', e);
      return { component: 'A', action: 'general', stocks: [], confidence: 5 };
    }
  }

  return { component: 'A', action: 'general', stocks: [], confidence: 0 };
}

/**
 * Log API usage for cost tracking
 */
export function logApiUsage(db, service, usage, cost, cacheHit = false) {
  const insert = db.prepare(`
    INSERT INTO api_usage_log (service, tokens_used, estimated_cost, cache_hit)
    VALUES (?, ?, ?, ?)
  `);

  insert.run(service, usage?.total_tokens || 0, cost, cacheHit ? 1 : 0);
}
