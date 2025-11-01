// ═══════════════════════════════════════════════════════════════
// LEON FINANCE - API Service
//
// BUBBLE MIGRATION NOTE:
// These functions = API Connector calls in Bubble
// Each function maps to an API endpoint you'll configure in Bubble's API Connector
// ═══════════════════════════════════════════════════════════════

import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Send chat message
 */
export async function sendChatMessage(message) {
  const response = await api.post('/chat', { message })
  return response.data
}

/**
 * Get chat history
 */
export async function getChatHistory() {
  const response = await api.get('/chat/history')
  return response.data
}

/**
 * Get stocks in watchlist
 */
export async function getWatchlist() {
  const response = await api.get('/stocks')
  return response.data
}

/**
 * Get stock details
 */
export async function getStock(symbol) {
  const response = await api.get(`/stocks/${symbol}`)
  return response.data
}

/**
 * Get conviction grid for stock
 */
export async function getConvictionGrid(symbol) {
  const response = await api.get(`/stocks/${symbol}/profile`)
  return response.data
}

/**
 * Analyze stock (generate conviction grid)
 */
export async function analyzeStock(symbol) {
  const response = await api.post(`/stocks/${symbol}/analyze`)
  return response.data
}

export default api
