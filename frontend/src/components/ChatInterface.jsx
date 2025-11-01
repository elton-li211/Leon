// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - Chat Interface Component
//
// BUBBLE MIGRATION NOTE:
// This = Repeating Group for messages + Input field + Button
// In Bubble:
// - Repeating Group: Type = chat_history, sorted by timestamp DESC
// - Input: Multiline, placeholder "Ask Leon..."
// - Button: "Send" → Trigger workflow "Send Chat Message"
// - Workflow calls API Connector → /api/chat
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { sendChatMessage } from '../services/api'

export default function ChatInterface({ onAnalysisComplete }) {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: '👋 Hi! I\'m Leon, your AI investment analyst. Try:\n• "Analyze RIOT"\n• "Analyze NVDA"\n• "What stocks for HPC pivot?"'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])

    setLoading(true)

    try {
      const response = await sendChatMessage(userMessage)

      // Add assistant response
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.message
      }])

      // If conviction grid data returned, trigger visualization
      if (response.componentData?.type === 'conviction_grid') {
        onAnalysisComplete(response.componentData.data)
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: '❌ Error: ' + error.message
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-white font-semibold text-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Chat with Leon AI
        </h2>
        <p className="text-blue-100 text-sm mt-1">Powered by Grok + Perplexity</p>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.type === 'error'
                  ? 'bg-red-600/20 text-red-300 border border-red-600'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4 bg-slate-800/30">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Leon... (e.g., 'Analyze RIOT')"
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2"
          >
            <span>Send</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
