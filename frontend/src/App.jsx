// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - Main React App
//
// BUBBLE MIGRATION NOTE:
// This component = Your main Bubble page with groups for:
// - Chat interface (sticky header)
// - Context view (dynamic content area)
// - Component tabs
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import ConvictionGrid from './components/ConvictionGrid'
import Header from './components/Header'

function App() {
  const [currentView, setCurrentView] = useState('chat') // 'chat', 'grid', 'watchlist'
  const [selectedStock, setSelectedStock] = useState(null)
  const [convictionData, setConvictionData] = useState(null)

  const handleAnalysisComplete = (data) => {
    setConvictionData(data)
    setSelectedStock(data.symbol)
    setCurrentView('grid')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header selectedStock={selectedStock} />

      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Chat Interface - Always Visible */}
        <div className="mb-6">
          <ChatInterface onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* Dynamic Content Area */}
        {convictionData && currentView === 'grid' && (
          <div className="mb-6">
            <ConvictionGrid data={convictionData} />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Watchlist</div>
            <div className="text-2xl font-bold text-white">2 Stocks</div>
            <div className="text-sm text-green-400 mt-1">RIOT, NVDA</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">AI Models</div>
            <div className="text-2xl font-bold text-white">Grok + Perplexity</div>
            <div className="text-sm text-blue-400 mt-1">Concurrent Execution</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">MVP Phase</div>
            <div className="text-2xl font-bold text-white">Component A</div>
            <div className="text-sm text-purple-400 mt-1">Conviction Grid</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>LEON FINANCE v3.0 - Investment Operating System MVP</p>
          <p className="mt-2">Built with React + Tailwind + Express + SQLite</p>
          <p className="mt-1 text-xs">Ready for Bubble.io migration</p>
        </div>
      </div>
    </div>
  )
}

export default App
