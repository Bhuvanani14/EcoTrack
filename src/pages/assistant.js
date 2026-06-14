/**
 * EcoTrack Smart Chat Agent
 * Context-aware assistant with Q&A, survey, and recommendations.
 */
import { findAnswer } from '../core/knowledge-base.js';
import { SurveyEngine } from '../core/survey-engine.js';
import { getTopRecommendations, getRecommendationsByCategory } from '../core/recommendation-engine.js';
import { ContextEngine } from '../core/context-engine.js';
import { getRandomFact } from '../core/fun-facts.js';
import { calculateTotalFootprint } from '../core/calculator-engine.js';
import { Storage } from '../core/storage.js';
import { formatNumber } from '../utils/format.js';
import { sanitizeString } from '../utils/sanitize.js';

const ctx = new ContextEngine();
const storage = new Storage();
let survey = new SurveyEngine();
let messages = [];
let shownFactIds = [];

function addMessage(role, text, options = null) {
  messages.push({ role, text, options, time: new Date().toISOString() });
}

function getWelcomeMessage() {
  const fact = getRandomFact(shownFactIds);
  shownFactIds.push(fact.id);
  return `👋 Hi! I'm **EcoBot**, your carbon footprint assistant. I can help you:\n\n• Answer questions about carbon footprint\n• Calculate your individual footprint through a quick survey\n• Give personalized tips to reduce your emissions\n\n💡 *${fact.icon} ${fact.text}*\n\nWhat would you like to do?`;
}

function processUserInput(text) {
  const input = text.toLowerCase().trim();

  // Check if survey is active
  if (survey.isActive) {
    return handleSurveyInput(input, text);
  }

  // Intent detection
  if (input.includes('calculate') || input.includes('find my') || input.includes('my footprint') || input.includes('survey') || input.includes('measure')) {
    return startSurvey();
  }

  if (input.includes('recommend') || input.includes('reduce') || input.includes('tips') || input.includes('how can i') || input.includes('suggestion')) {
    return getRecommendationResponse(input);
  }

  if (input.includes('compare') || input.includes('average') || input.includes('how do i compare')) {
    return getComparisonResponse();
  }

  if (input.includes('biggest') || input.includes('hotspot') || input.includes('highest') || input.includes('most impact')) {
    return getHotspotResponse();
  }

  if (input.includes('quiz') || input.includes('test')) {
    return { text: '🧠 Want to test your carbon knowledge? Head to the **Quizzes** section from the sidebar! We have Quick Quiz, Category Deep Dive, and a Daily Challenge.', options: [{ label: '📝 Go to Quizzes', value: '__nav_quiz' }] };
  }

  if (input.includes('fun fact') || input.includes('tell me something') || input.includes('random fact')) {
    const fact = getRandomFact(shownFactIds);
    shownFactIds.push(fact.id);
    return { text: `Here's a fun fact:\n\n${fact.icon} **${fact.text}**\n\n*Source: ${fact.source}*`, options: [{ label: '🎲 Another fact', value: 'fun fact' }, { label: '📊 Calculate my footprint', value: 'calculate' }] };
  }

  if (input === 'help' || input === 'menu' || input === 'start') {
    return { text: 'Here\'s what I can do:', options: [{ label: '🌍 What is carbon footprint?', value: 'what is carbon footprint' }, { label: '📊 Calculate my footprint', value: 'calculate' }, { label: '💡 How can I reduce emissions?', value: 'how can i reduce' }, { label: '🎲 Tell me a fun fact', value: 'fun fact' }] };
  }

  // Knowledge base Q&A
  const answer = findAnswer(text);
  if (answer.found) {
    return {
      text: `**${answer.question}**\n\n${answer.answer}\n\n*Source: ${answer.source}*`,
      options: [{ label: '📊 Calculate my footprint', value: 'calculate' }, { label: '🎲 Fun fact', value: 'fun fact' }, { label: '💡 More tips', value: 'tips' }]
    };
  }

  // Fallback with suggestions
  if (answer.suggestions && answer.suggestions.length > 0) {
    return {
      text: answer.message,
      options: answer.suggestions.map(s => ({ label: s, value: s })).concat([{ label: '📊 Calculate my footprint', value: 'calculate' }])
    };
  }

  return {
    text: "I'm not sure about that. I can help with carbon footprint questions, calculate your footprint, or give reduction tips. Try asking something like:",
    options: [{ label: '🌍 What is carbon footprint?', value: 'what is carbon footprint' }, { label: '📊 Calculate my footprint', value: 'calculate' }, { label: '🥩 Impact of beef?', value: 'beef carbon footprint' }]
  };
}

function startSurvey() {
  survey = new SurveyEngine();
  const step = survey.start();
  return { text: step.message, options: step.options, isSurvey: true, progress: 0 };
}

function handleSurveyInput(input, originalText) {
  // Find matching option
  const currentStep = survey.getCurrentStep();
  let value = input;
  if (currentStep?.options) {
    const match = currentStep.options.find(o => o.value.toString() === input || o.label.toLowerCase().includes(input));
    if (match) value = match.value;
    else {
      // Try to match by text
      const textMatch = currentStep.options.find(o => input.includes(o.value.toString().toLowerCase()));
      if (textMatch) value = textMatch.value;
      else value = currentStep.options[0]?.value; // default to first
    }
  }

  const nextStep = survey.processAnswer(value);

  if (nextStep?.cancelled) {
    return { text: nextStep.message, options: [{ label: '📊 Calculate my footprint', value: 'calculate' }, { label: '💡 Reduction tips', value: 'tips' }] };
  }

  if (survey.isComplete) {
    // Generate results
    const results = survey.getResults();
    const rawData = survey.getRawData();
    // Save to profile
    storage.set('userProfile', rawData);
    ctx.saveFootprintSnapshot(results);

    const fact = getRandomFact(shownFactIds);
    shownFactIds.push(fact.id);

    return {
      text: `🎉 **Your Carbon Footprint Results!**\n\n📊 **Annual Total: ${formatNumber(results.annual.total)}t CO₂e**\n\n🚗 Transport: ${formatNumber(results.annual.transport)}t\n🥗 Food: ${formatNumber(results.annual.food)}t\n⚡ Energy: ${formatNumber(results.annual.energy)}t\n🛍️ Lifestyle: ${formatNumber(results.annual.lifestyle)}t\n\n📈 Eco Score: **${results.ecoScore.grade}** (${results.ecoScore.score}/100)\n🌍 vs Global Average: ${results.comparison.vs_global}%\n🌳 Trees to offset: ${results.equivalents.trees}\n\n💡 *${fact.icon} ${fact.text}*\n\nYour results are saved to your dashboard!`,
      options: [{ label: '📊 View Dashboard', value: '__nav_dashboard' }, { label: '💡 Reduction tips', value: 'recommend' }, { label: '🔄 Recalculate', value: 'calculate' }]
    };
  }

  if (nextStep) {
    const microInsight = getMicroInsight(currentStep?.id, value);
    const prefix = microInsight ? `${microInsight}\n\n` : '';
    return {
      text: prefix + nextStep.message,
      options: nextStep.options,
      isSurvey: true,
      progress: survey.getProgress(),
      section: survey.getSectionLabel()
    };
  }

  return { text: 'Something went wrong. Let me restart.', options: [{ label: 'Start over', value: 'calculate' }] };
}

function getMicroInsight(stepId, value) {
  const insights = {
    commute_mode: { car_petrol: '🚗 Cars are typically the biggest personal transport emitter.', bicycle: '🚲 Great choice! Cycling = zero emissions!', walking: '🚶 Walking is the greenest option!', bus: '🚌 Buses emit ~80% less per passenger than cars.' },
    diet_type: { vegan: '🌱 Vegan diets have the lowest food carbon footprint!', heavy_meat: '🥩 Meat-heavy diets produce ~4x more emissions than vegan diets.' },
    renewable: { yes: '☀️ Awesome! Renewables can cut electricity emissions by 95%!', no: '💡 Switching to green energy is one of the highest-impact changes you can make.' },
  };
  return insights[stepId]?.[value] || null;
}

function getRecommendationResponse(input) {
  const profile = ctx.getUserProfile();
  let recs;
  if (input.includes('transport') || input.includes('car') || input.includes('drive')) {
    recs = getRecommendationsByCategory(profile, 'transport');
  } else if (input.includes('food') || input.includes('diet') || input.includes('eat') || input.includes('meat')) {
    recs = getRecommendationsByCategory(profile, 'food');
  } else if (input.includes('energy') || input.includes('home') || input.includes('electric')) {
    recs = getRecommendationsByCategory(profile, 'energy');
  } else {
    recs = getTopRecommendations(profile, 5);
  }

  if (recs.length === 0) {
    return { text: "You're already doing great! I don't have additional recommendations right now. Keep up the good work! 🌟", options: [{ label: '📊 View Dashboard', value: '__nav_dashboard' }] };
  }

  const recText = recs.slice(0, 4).map(r => `${r.icon} **${r.title}** — ${r.description} *(saves ~${r.savingsKgPerMonth} kg/mo)*`).join('\n\n');
  return {
    text: `Here are my top recommendations for you:\n\n${recText}`,
    options: [{ label: '🚗 Transport tips', value: 'reduce transport' }, { label: '🥗 Food tips', value: 'reduce food' }, { label: '⚡ Energy tips', value: 'reduce energy' }]
  };
}

function getComparisonResponse() {
  const profile = ctx.getUserProfile();
  if (!profile?.transport) {
    return { text: "I don't have your footprint data yet. Let's calculate it first!", options: [{ label: '📊 Calculate now', value: 'calculate' }] };
  }
  const fp = calculateTotalFootprint(profile);
  return {
    text: `📊 **Your Footprint Comparison**\n\n🌍 Your annual footprint: **${formatNumber(fp.annual.total)}t CO₂e**\n\n• vs Global Average (4.7t): **${fp.comparison.vs_global}%**\n• vs US Average (16t): **${fp.comparison.vs_us}%**\n• vs 2050 Target (2t): **${fp.comparison.vs_target}%**\n\n${fp.annual.total <= 4.7 ? '🎉 Great job! You\'re below the global average!' : '💪 There\'s room for improvement. Want some tips?'}`,
    options: [{ label: '💡 Reduction tips', value: 'recommend' }, { label: '📊 Dashboard', value: '__nav_dashboard' }]
  };
}

function getHotspotResponse() {
  const profile = ctx.getUserProfile();
  if (!profile?.transport) {
    return { text: "I need your footprint data first. Let's do a quick survey!", options: [{ label: '📊 Calculate now', value: 'calculate' }] };
  }
  const fp = calculateTotalFootprint(profile);
  const highest = ctx.getHighestImpactCategory(fp);
  const val = fp.monthly[highest];
  return {
    text: `🔍 **Your Biggest Carbon Hotspot**\n\nYour highest-impact category is **${highest.toUpperCase()}** at **${formatNumber(val, 0)} kg CO₂e/month** (${Math.round((val / fp.monthly.total) * 100)}% of your total).\n\nLet me suggest ways to reduce your ${highest} emissions:`,
    options: [{ label: `💡 Reduce ${highest}`, value: `reduce ${highest}` }, { label: '📊 Full breakdown', value: '__nav_dashboard' }]
  };
}

function renderMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  container.innerHTML = messages.map((m, i) => {
    const isAgent = m.role === 'agent';
    const bubbleClass = isAgent ? 'chat-bubble--agent' : 'chat-bubble--user';
    // Simple markdown: bold and italic
    let text = sanitizeString(m.text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    let optionsHTML = '';
    if (m.options && i === messages.length - 1) {
      optionsHTML = `<div class="quick-replies" style="margin-top:var(--space-3)">${m.options.map(o =>
        `<button class="chip quick-reply-btn" data-value="${sanitizeString(o.value)}">${o.label}</button>`
      ).join('')}</div>`;
    }

    let progressHTML = '';
    if (m.progress !== undefined && m.progress > 0) {
      progressHTML = `<div style="margin-bottom:var(--space-2)"><div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:4px"><span>${m.section || 'Survey'}</span><span>${m.progress}%</span></div><div class="progress-bar"><div class="progress-bar__fill" style="width:${m.progress}%"></div></div></div>`;
    }

    return `<div class="chat-bubble ${bubbleClass}">${progressHTML}${text}${optionsHTML}</div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;

  // Bind quick replies
  container.querySelectorAll('.quick-reply-btn').forEach(btn => {
    btn.addEventListener('click', () => handleQuickReply(btn.dataset.value));
  });
}

function handleQuickReply(value) {
  if (value.startsWith('__nav_')) {
    const route = value.replace('__nav_', '');
    if (route === 'dashboard') window.location.hash = '#/dashboard';
    else if (route === 'quiz') window.location.hash = '#/quizzes';
    return;
  }
  sendMessage(value);
}

function sendMessage(text) {
  if (!text.trim()) return;
  addMessage('user', text);
  renderMessages();

  // Show typing indicator
  const container = document.getElementById('chat-messages');
  const typing = document.createElement('div');
  typing.className = 'chat-bubble chat-bubble--agent chat-bubble__typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  container?.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const response = processUserInput(text);
    const msg = { role: 'agent', text: response.text, options: response.options };
    if (response.progress !== undefined) { msg.progress = response.progress; msg.section = response.section; }
    messages.push({ ...msg, time: new Date().toISOString() });
    renderMessages();
  }, 600 + Math.random() * 400);
}

export function renderAssistant() {
  // Reset state
  messages = [];
  shownFactIds = [];
  survey = new SurveyEngine();

  // Add welcome
  const welcome = getWelcomeMessage();
  addMessage('agent', welcome, [
    { label: '🌍 What is carbon footprint?', value: 'what is carbon footprint' },
    { label: '📊 Calculate my footprint', value: 'calculate' },
    { label: '💡 Reduce my emissions', value: 'how can i reduce' },
    { label: '🎲 Fun fact', value: 'fun fact' }
  ]);

  const page = `
    <div class="page-header">
      <h1 class="page-header__title">🤖 EcoBot Assistant</h1>
      <p class="page-header__subtitle">Ask me anything about carbon footprint</p>
    </div>
    <div class="card chat-layout" style="padding:0;overflow:hidden">
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-area">
        <input class="chat-input" id="chat-input" type="text" placeholder="Ask me anything about carbon footprint..." aria-label="Type your message" />
        <button class="btn btn--primary btn--round" id="chat-send" aria-label="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;

  setTimeout(() => {
    renderMessages();
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { sendMessage(input.value); input.value = ''; } });
    sendBtn?.addEventListener('click', () => { sendMessage(input.value); input.value = ''; });
  }, 100);

  return page;
}
