/**
 * EcoTrack Gemini AI Engine
 * Wraps the Gemini REST API with rate limiting, error handling, and fallback.
 * @module gemini-engine
 */
import { AI_SESSION_LIMIT, AI_DEBOUNCE_MS } from './constants.js';

let sessionCallCount = 0;
let lastCallTime = 0;

const SYSTEM_CONTEXT = `You are EcoBot, a friendly and knowledgeable carbon footprint assistant embedded in EcoTrack — a sustainability app. 
Your role is to:
- Answer questions about carbon emissions, climate change, and sustainability
- Provide personalized, actionable advice to reduce carbon footprints  
- Give encouraging, non-guilt-tripping responses
- Be concise (max 3-4 sentences unless asked for detail)
- Use emojis sparingly but effectively
- Focus on practical, real-world impact

Always prioritize accuracy using scientific consensus. When uncertain, say so.`;

/**
 * Shared internal helper to handle rate limiting, debounce, and fetching the Gemini API.
 * @param {string} prompt - The prompt text.
 * @param {Object} [generationConfig] - Generation options.
 * @param {Array} [safetySettings] - Safety options.
 * @returns {Promise<string|null>} The text response or null on failure.
 */
async function callGeminiAPI(prompt, generationConfig = {}, safetySettings = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') return null;

  if (sessionCallCount >= AI_SESSION_LIMIT) return null;

  const now = Date.now();
  if (now - lastCallTime < AI_DEBOUNCE_MS) return null;

  try {
    lastCallTime = Date.now();
    sessionCallCount++;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
        ...(safetySettings.length ? { safetySettings } : {})
      })
    });

    if (!response.ok) {
      console.warn('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini API unavailable, using fallback:', err.message);
    return null;
  }
}

/**
 * Send a prompt to Gemini and return the text response.
 * Falls back gracefully if unavailable.
 * @param {string} userMessage - User input text.
 * @param {Object} [userProfile] - Optional user context to inform response.
 * @returns {Promise<string|null>} AI response or null.
 */
export async function askGemini(userMessage, userProfile = null) {
  const profileContext = userProfile?.transport
    ? `\nUser Profile: Commute mode: ${userProfile.transport.commuteMode}, Diet: ${userProfile.food?.dietType}, Housing: ${userProfile.energy?.housingType}.`
    : '';

  const prompt = SYSTEM_CONTEXT + profileContext + '\n\nUser: ' + userMessage;
  
  return callGeminiAPI(
    prompt,
    { temperature: 0.7, maxOutputTokens: 300, topP: 0.9 },
    [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  );
}

/**
 * Generate AI-powered daily insights based on user profile.
 * Returns array of 3 actionable tips.
 * @param {Object} userProfile - User data.
 * @param {Object} footprintResult - Precomputed footprint results.
 * @returns {Promise<string[]|null>} Array of tips or null.
 */
export async function generateDailyInsights(userProfile, footprintResult) {
  const prompt = `Based on this user's carbon footprint data:
- Annual footprint: ${footprintResult?.annual?.total?.toFixed(1)}t CO₂e
- Biggest category: ${footprintResult?.monthly ? Object.entries(footprintResult.monthly).filter(([k]) => k !== 'total').sort((a,b) => b[1]-a[1])[0]?.[0] : 'unknown'}
- Diet: ${userProfile?.food?.dietType || 'unknown'}
- Commute: ${userProfile?.transport?.commuteMode || 'unknown'}

Give exactly 3 short, specific, actionable tips (1 sentence each) to reduce their carbon footprint today. Format as a JSON array of strings. Example: ["Tip 1", "Tip 2", "Tip 3"]`;

  const text = await callGeminiAPI(prompt, { temperature: 0.8, maxOutputTokens: 200 });
  if (!text) return null;

  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {
    return null;
  }
  return null;
}

/**
 * Get remaining AI call quota for this session.
 * @returns {Object} Quota info with `used`, `limit`, `remaining`.
 */
export function getAIQuota() {
  return { used: sessionCallCount, limit: AI_SESSION_LIMIT, remaining: AI_SESSION_LIMIT - sessionCallCount };
}

/**
 * Check if Gemini API is configured and accessible.
 * @returns {boolean}
 */
export function isAIEnabled() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'undefined' && apiKey.startsWith('AIza'));
}
