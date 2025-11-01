// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - Conviction Grid Component (Component A)
//
// Displays A3 analysis across 5 dimensions with expandable sub-scores
//
// BUBBLE MIGRATION NOTE:
// In Bubble, this becomes:
// - Group: "Conviction Grid Container"
// - Repeating Group: Type = "Dimension" (manual list: Technical, Fundamental, etc.)
// - Each cell has:
//   - Text: Dimension name
//   - Progress bar: Width = score × 10%
//   - Collapsible group for sub-scores (another Repeating Group)
// - Use JSON extract to pull sub_scores from stock_profile's a3_*_json fields
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'

export default function ConvictionGrid({ data }) {
  const [expandedDimension, setExpandedDimension] = useState(null)

  const dimensions = [
    {
      name: 'Technical',
      key: 'technical',
      color: 'blue',
      icon: '📈',
      data: data.technical
    },
    {
      name: 'Fundamental',
      key: 'fundamental',
      color: 'green',
      icon: '💰',
      data: data.fundamental
    },
    {
      name: 'Sentiment',
      key: 'sentiment',
      color: 'purple',
      icon: '🎯',
      data: data.sentiment
    },
    {
      name: 'Meta (Smart Money)',
      key: 'meta',
      color: 'orange',
      icon: '🧠',
      data: data.meta
    },
    {
      name: 'Risk & Valuation',
      key: 'risk',
      color: 'red',
      icon: '⚠️',
      data: data.risk
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-600 border-blue-500 text-blue-300',
      green: 'bg-green-600 border-green-500 text-green-300',
      purple: 'bg-purple-600 border-purple-500 text-purple-300',
      orange: 'bg-orange-600 border-orange-500 text-orange-300',
      red: 'bg-red-600 border-red-500 text-red-300'
    }
    return colors[color] || colors.blue
  }

  const toggleExpand = (key) => {
    setExpandedDimension(expandedDimension === key ? null : key)
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">{data.symbol}</span>
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {data.overall_conviction}/10
              </span>
            </h2>
            <p className="text-slate-300 mt-1">
              Confidence: <span className={`font-semibold ${
                data.confidence_level === 'High' ? 'text-green-400' :
                data.confidence_level === 'Medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>{data.confidence_level}</span>
              <span className="mx-2">•</span>
              Agreement: <span className="font-semibold text-blue-400">{data.agreement_pct}%</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Last Updated</div>
            <div className="text-sm text-slate-300">
              {new Date(data.last_updated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="p-6 space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.key} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
            {/* Dimension Header */}
            <button
              onClick={() => toggleExpand(dim.key)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center space-x-4 flex-1">
                <span className="text-2xl">{dim.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-semibold">{dim.name}</span>
                    <span className="text-xl font-bold text-white">{dim.data.overall_score}/10</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2 bg-slate-700 rounded-full h-2 w-full max-w-md">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getColorClasses(dim.color).split(' ')[0]}`}
                      style={{ width: `${dim.data.overall_score * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Expand Icon */}
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${expandedDimension === dim.key ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Content */}
            {expandedDimension === dim.key && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-700">
                {/* AI Reasoning */}
                <div className="mb-4 space-y-2">
                  <div className="bg-slate-800/50 rounded p-3">
                    <div className="text-xs text-blue-400 font-semibold mb-1">🤖 Grok Analysis</div>
                    <p className="text-sm text-slate-300">{dim.data.reasoning_grok || dim.data.reasoning}</p>
                  </div>
                  {dim.data.reasoning_perplexity && (
                    <div className="bg-slate-800/50 rounded p-3">
                      <div className="text-xs text-purple-400 font-semibold mb-1">🔍 Perplexity Research</div>
                      <p className="text-sm text-slate-300">{dim.data.reasoning_perplexity}</p>
                    </div>
                  )}
                </div>

                {/* Sub-scores Grid */}
                {dim.data.sub_scores && Object.keys(dim.data.sub_scores).length > 0 && (
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-3 uppercase">Sub-Components</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(dim.data.sub_scores).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/30 rounded p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-slate-300 capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {typeof value === 'number' && value <= 10 ? `${value}/10` : value}
                            </span>
                          </div>
                          {typeof value === 'number' && value <= 10 && (
                            <div className="bg-slate-700 rounded-full h-1 w-full">
                              <div
                                className={`h-full rounded-full ${getColorClasses(dim.color).split(' ')[0]}`}
                                style={{ width: `${value * 10}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {dim.data.sources && dim.data.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-xs text-slate-400 font-semibold mb-2">📚 Sources</div>
                    <div className="space-y-1">
                      {dim.data.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 block truncate"
                        >
                          {source}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-800/30 px-6 py-4 border-t border-slate-700 flex justify-between items-center">
        <div className="text-sm text-slate-400">
          Powered by concurrent Grok + Perplexity analysis
        </div>
        <div className="space-x-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
            Generate Strategy
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition">
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  )
}
