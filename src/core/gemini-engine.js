/**
 * EcoTrack Gemini AI Engine
 * Wraps the Gemini REST API with rate limiting, error handling, and fallback.
 */

// Rate limiter: max 10 AI calls per session
let sessionCallCount = 0;
const SESSION_LIMIT = 10;
let lastCallTime = 0;
const DEBOUNCE_MS = 1500;

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
 * Send a prompt to Gemini and return the text response.
 * Falls back gracefully if unavailable.
 */
export async function askGemini(userMessage, userProfile = null) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Check if API key is configured
  if (!apiKey || apiKey === 'undefined') {
    return null; // Fallback to local engine
  }

  // Rate limiting
  if (sessionCallCount >= SESSION_LIMIT) {
    return null; // Exhausted quota, fall back
  }

  // Debounce
  const now = Date.now();
  if (now - lastCallTime < DEBOUNCE_MS) {
    return null;
  }

  const profileContext = userProfile?.transport
    ? `\nUser Profile: Commute mode: ${userProfile.transport.commuteMode}, Diet: ${userProfile.food?.dietType}, Housing: ${userProfile.energy?.housingType}.`
    : '';

  try {
    lastCallTime = Date.now();
    sessionCallCount++;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: SYSTEM_CONTEXT + profileContext + '\n\nUser: ' + userMessage
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      })
    });

    if (!response.ok) {
      console.warn('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.warn('Gemini API unavailable, using fallback:', err.message);
    return null;
  }
}

/**
 * Generate AI-powered daily insights based on user profile.
 * Returns array of 3 actionable tips.
 */
export async function generateDailyInsights(userProfile, footprintResult) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') return null;
  if (sessionCallCount >= SESSION_LIMIT) return null;

  const prompt = `Based on this user's carbon footprint data:
- Annual footprint: ${footprintResult?.annual?.total?.toFixed(1)}t CO₂e
- Biggest category: ${footprintResult?.monthly ? Object.entries(footprintResult.monthly).filter(([k]) => k !== 'total').sort((a,b) => b[1]-a[1])[0]?.[0] : 'unknown'}
- Diet: ${userProfile?.food?.dietType || 'unknown'}
- Commute: ${userProfile?.transport?.commuteMode || 'unknown'}

Give exactly 3 short, specific, actionable tips (1 sentence each) to reduce their carbon footprint today. Format as a JSON array of strings. Example: ["Tip 1", "Tip 2", "Tip 3"]`;

  try {
    lastCallTime = Date.now();
    sessionCallCount++;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 200 }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get remaining AI call quota for this session.
 */
export function getAIQuota() {
  return { used: sessionCallCount, limit: SESSION_LIMIT, remaining: SESSION_LIMIT - sessionCallCount };
}

/**
 * Check if Gemini API is configured.
 */
export function isAIEnabled() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'undefined' && apiKey.startsWith('AIza'));
}
