/**
 * EcoTrack Quiz Engine
 * 40+ quiz questions with scoring, modes, and history tracking.
 */
import { Storage } from './storage.js';

const QUIZ_QUESTIONS = [
  // --- EASY ---
  { id: 'q1', question: 'What does CO₂ stand for?', type: 'multiple', difficulty: 'easy', category: 'Climate Science', options: ['Carbon Dioxide', 'Carbon Disulfide', 'Calcium Oxide', 'Cobalt Dioxide'], correctIndex: 0, explanation: 'CO₂ stands for Carbon Dioxide — the primary greenhouse gas driving climate change.' },
  { id: 'q2', question: 'Which of these produces ZERO direct emissions?', type: 'multiple', difficulty: 'easy', category: 'Transport', options: ['Cycling', 'Hybrid car', 'Electric scooter', 'Natural gas bus'], correctIndex: 0, explanation: 'Cycling produces zero direct emissions. Even electric vehicles have indirect emissions from electricity generation.' },
  { id: 'q3', question: 'Trees absorb CO₂ from the atmosphere.', type: 'truefalse', difficulty: 'easy', category: 'Climate Science', correctAnswer: true, explanation: 'True! Trees absorb CO₂ through photosynthesis. A mature tree absorbs about 22 kg CO₂ per year.' },
  { id: 'q4', question: 'What is a "carbon footprint"?', type: 'multiple', difficulty: 'easy', category: 'Climate Science', options: ['Total GHG emissions caused by a person', 'A footprint made of coal', 'The weight of carbon in your body', 'Carbon residue from burning'], correctIndex: 0, explanation: 'A carbon footprint is the total greenhouse gas emissions caused by an individual, event, or product.' },
  { id: 'q5', question: 'Which gas is the most abundant greenhouse gas emitted by humans?', type: 'multiple', difficulty: 'easy', category: 'Climate Science', options: ['Carbon Dioxide (CO₂)', 'Methane (CH₄)', 'Nitrous Oxide (N₂O)', 'Ozone (O₃)'], correctIndex: 0, explanation: 'CO₂ accounts for about 76% of global greenhouse gas emissions from human activities.' },
  { id: 'q6', question: 'Recycling aluminum saves energy compared to making new aluminum.', type: 'truefalse', difficulty: 'easy', category: 'Lifestyle', correctAnswer: true, explanation: 'True! Recycling aluminum saves 95% of the energy needed to make new aluminum from raw bauxite ore.' },
  { id: 'q7', question: 'Which type of light bulb is most energy-efficient?', type: 'multiple', difficulty: 'easy', category: 'Energy', options: ['LED', 'Incandescent', 'Halogen', 'Fluorescent'], correctIndex: 0, explanation: 'LEDs use 75% less energy than incandescent bulbs and last about 25 times longer.' },
  { id: 'q8', question: 'The fashion industry produces more emissions than aviation.', type: 'truefalse', difficulty: 'easy', category: 'Lifestyle', correctAnswer: true, explanation: 'True! Fashion accounts for ~10% of global emissions, while aviation accounts for ~2.5%.' },

  // --- MEDIUM ---
  { id: 'q9', question: 'Approximately how much CO₂ does producing 1 kg of beef generate?', type: 'multiple', difficulty: 'medium', category: 'Food', options: ['27 kg CO₂e', '5 kg CO₂e', '50 kg CO₂e', '12 kg CO₂e'], correctIndex: 0, explanation: 'Beef production generates about 27 kg CO₂e per kg — equivalent to driving 100 km in a car.' },
  { id: 'q10', question: 'What is the Paris Agreement target for global warming?', type: 'multiple', difficulty: 'medium', category: 'Climate Science', options: ['Below 2°C, ideally 1.5°C', 'Below 3°C', 'Below 1°C', 'Below 5°C'], correctIndex: 0, explanation: 'The Paris Agreement aims to limit warming to well below 2°C, preferably 1.5°C above pre-industrial levels.' },
  { id: 'q11', question: 'How much of food produced globally is wasted?', type: 'multiple', difficulty: 'medium', category: 'Food', options: ['About one-third', 'About 10%', 'About half', 'About 5%'], correctIndex: 0, explanation: 'Around 1/3 of all food produced globally is wasted, contributing ~8-10% of global emissions.' },
  { id: 'q12', question: 'Which country has the highest per-capita carbon footprint?', type: 'multiple', difficulty: 'medium', category: 'Climate Science', options: ['United States (~16t)', 'China (~7.4t)', 'India (~1.9t)', 'Germany (~8t)'], correctIndex: 0, explanation: 'The US has one of the highest per-capita footprints at ~16 tonnes CO₂e per person per year.' },
  { id: 'q13', question: 'Electric cars produce zero emissions over their lifetime.', type: 'truefalse', difficulty: 'medium', category: 'Transport', correctAnswer: false, explanation: 'False! EVs have zero tailpipe emissions, but battery manufacturing and electricity generation do produce emissions. However, lifecycle emissions are still 50-70% lower than petrol cars.' },
  { id: 'q14', question: 'What percentage of global emissions comes from energy/electricity?', type: 'multiple', difficulty: 'medium', category: 'Energy', options: ['~25%', '~10%', '~50%', '~5%'], correctIndex: 0, explanation: 'Energy and heat production account for about 25% of global greenhouse gas emissions.' },
  { id: 'q15', question: 'A vegan diet produces more emissions than a meat-heavy diet.', type: 'truefalse', difficulty: 'medium', category: 'Food', correctAnswer: false, explanation: 'False! A vegan diet produces about 85 kg CO₂e/month vs 330 kg for heavy meat — that\'s 74% less.' },
  { id: 'q16', question: 'Which mode of transport has the lowest emissions per passenger-km?', type: 'multiple', difficulty: 'medium', category: 'Transport', options: ['Metro/Subway', 'Bus', 'Train', 'Taxi'], correctIndex: 0, explanation: 'Metro/subway systems emit ~0.033 kg CO₂ per passenger-km, the lowest of motorized options.' },
  { id: 'q17', question: 'How many trees would you need to offset 1 tonne of CO₂ per year?', type: 'multiple', difficulty: 'medium', category: 'Climate Science', options: ['About 45 trees', 'About 10 trees', 'About 100 trees', 'About 5 trees'], correctIndex: 0, explanation: 'Since a mature tree absorbs ~22 kg CO₂/year, you need about 45 trees to offset 1 tonne annually.' },
  { id: 'q18', question: 'Streaming video produces CO₂ emissions.', type: 'truefalse', difficulty: 'medium', category: 'Lifestyle', correctAnswer: true, explanation: 'True! Streaming uses data centers and networks that consume electricity. 1 hour of video ≈ 36g CO₂.' },

  // --- HARD ---
  { id: 'q19', question: 'What is "Scope 3" in carbon accounting?', type: 'multiple', difficulty: 'hard', category: 'Climate Science', options: ['Indirect emissions from the value chain', 'Direct emissions from owned sources', 'Emissions from purchased electricity', 'Government-regulated emissions'], correctIndex: 0, explanation: 'Scope 3 covers all indirect emissions in a company\'s value chain — both upstream and downstream. It often represents the largest portion (up to 90%) of total emissions.' },
  { id: 'q20', question: 'Methane is how many times more potent than CO₂ over 20 years?', type: 'multiple', difficulty: 'hard', category: 'Climate Science', options: ['~80 times', '~10 times', '~25 times', '~200 times'], correctIndex: 0, explanation: 'Methane (CH₄) has a Global Warming Potential of ~80 over 20 years, though it breaks down faster than CO₂.' },
  { id: 'q21', question: 'Which food product has a higher carbon footprint than beef?', type: 'multiple', difficulty: 'hard', category: 'Food', options: ['Lamb (39.2 kg CO₂e/kg)', 'Pork (12.1 kg CO₂e/kg)', 'Cheese (13.5 kg CO₂e/kg)', 'Chocolate (19 kg CO₂e/kg)'], correctIndex: 0, explanation: 'Lamb produces ~39.2 kg CO₂e per kg, making it the highest-impact common food — even above beef at 27 kg/kg.' },
  { id: 'q22', question: 'What percentage of global emissions does transport account for?', type: 'multiple', difficulty: 'hard', category: 'Transport', options: ['~16%', '~5%', '~30%', '~40%'], correctIndex: 0, explanation: 'Transport accounts for about 16% of global greenhouse gas emissions, with road vehicles being the largest contributor.' },
  { id: 'q23', question: 'Heat pumps are 3-4x more efficient than traditional heating.', type: 'truefalse', difficulty: 'hard', category: 'Energy', correctAnswer: true, explanation: 'True! Heat pumps move heat rather than generating it, achieving efficiencies of 300-400% (COP of 3-4).' },
  { id: 'q24', question: 'What is the target individual carbon footprint by 2050?', type: 'multiple', difficulty: 'hard', category: 'Climate Science', options: ['2 tonnes CO₂e', '5 tonnes CO₂e', '0 tonnes CO₂e', '10 tonnes CO₂e'], correctIndex: 0, explanation: 'To limit warming to 1.5°C, individual footprints need to drop to about 2 tonnes CO₂e per year by 2050.' },
  { id: 'q25', question: 'What percentage of energy can recycling aluminum save?', type: 'multiple', difficulty: 'hard', category: 'Lifestyle', options: ['95%', '50%', '75%', '30%'], correctIndex: 0, explanation: 'Recycling aluminum saves 95% of the energy required to produce it from raw materials.' },
  { id: 'q26', question: 'Carbon capture and storage (CCS) is currently scalable enough to solve climate change alone.', type: 'truefalse', difficulty: 'hard', category: 'Climate Science', correctAnswer: false, explanation: 'False! While CCS is promising, current capacity is far too small. We capture ~40 Mt CO₂/year but emit ~36 Gt. Emission reduction must remain the primary strategy.' },

  // --- MYTHS VS FACTS ---
  { id: 'q27', question: 'Individual actions don\'t matter because corporations cause most emissions.', type: 'truefalse', difficulty: 'medium', category: 'Myths vs Facts', correctAnswer: false, explanation: 'False! While corporations are major emitters, consumer demand drives production. Individual choices influence markets, policy, and culture. Both individual and systemic change are needed.' },
  { id: 'q28', question: 'Paper bags are always better for the environment than plastic bags.', type: 'truefalse', difficulty: 'medium', category: 'Myths vs Facts', correctAnswer: false, explanation: 'False! Paper bags require more energy and water to produce and generate more CO₂ than plastic bags. The best option is reusable bags used many times.' },
  { id: 'q29', question: 'Leaving your computer on sleep mode uses zero energy.', type: 'truefalse', difficulty: 'easy', category: 'Myths vs Facts', correctAnswer: false, explanation: 'False! Sleep mode still draws 1-5 watts. "Vampire power" from idle devices accounts for 5-10% of household electricity use.' },
  { id: 'q30', question: 'Locally produced food always has a lower carbon footprint than imported food.', type: 'truefalse', difficulty: 'hard', category: 'Myths vs Facts', correctAnswer: false, explanation: 'False! Transport is often a small part of food emissions (typically <10%). A tomato grown in a heated greenhouse locally can have higher emissions than one shipped from a sunny climate.' },

  // Additional
  { id: 'q31', question: 'What is the main greenhouse gas from agriculture?', type: 'multiple', difficulty: 'medium', category: 'Food', options: ['Methane (CH₄)', 'Carbon Dioxide (CO₂)', 'Nitrous Oxide (N₂O)', 'CFCs'], correctIndex: 0, explanation: 'Methane from livestock (especially cattle) and rice paddies is agriculture\'s main GHG contribution.' },
  { id: 'q32', question: 'A return long-haul flight produces approximately how much CO₂?', type: 'multiple', difficulty: 'medium', category: 'Transport', options: ['~3 tonnes', '~500 kg', '~10 tonnes', '~100 kg'], correctIndex: 0, explanation: 'A return long-haul flight (e.g., NYC to London) produces ~1.6 tonnes, and longer routes can exceed 3 tonnes per passenger.' },
  { id: 'q33', question: 'Which sector is the largest source of methane emissions?', type: 'multiple', difficulty: 'hard', category: 'Climate Science', options: ['Agriculture & livestock', 'Energy production', 'Waste management', 'Industry'], correctIndex: 0, explanation: 'Agriculture and livestock account for ~40% of human-caused methane emissions, primarily from cattle digestion and rice cultivation.' },
  { id: 'q34', question: 'Using a clothesline instead of a dryer can save approximately how much CO₂ per year?', type: 'multiple', difficulty: 'medium', category: 'Lifestyle', options: ['~200 kg', '~50 kg', '~500 kg', '~20 kg'], correctIndex: 0, explanation: 'Tumble dryers are energy-intensive. Air-drying clothes can save 150-250 kg CO₂ per year for an average household.' },
  { id: 'q35', question: 'Concrete production accounts for what percentage of global CO₂ emissions?', type: 'multiple', difficulty: 'hard', category: 'Climate Science', options: ['~8%', '~1%', '~15%', '~25%'], correctIndex: 0, explanation: 'Cement/concrete production accounts for about 8% of global CO₂ emissions, making it one of the largest industrial contributors.' },
];

export class QuizEngine {
  constructor() {
    this.storage = new Storage();
  }

  getQuestions(mode = 'quick', category = null) {
    let pool = [...QUIZ_QUESTIONS];
    if (category) pool = pool.filter(q => q.category === category);

    switch (mode) {
      case 'quick':
        return this._shuffleArray(pool).slice(0, 5);
      case 'deep_dive':
        return this._shuffleArray(pool).slice(0, 10);
      case 'daily': {
        const today = new Date().toDateString();
        const seed = this._hashCode(today);
        return [pool[Math.abs(seed) % pool.length]];
      }
      default:
        return this._shuffleArray(pool).slice(0, 5);
    }
  }

  getCategories() {
    return [...new Set(QUIZ_QUESTIONS.map(q => q.category))];
  }

  checkAnswer(question, userAnswer) {
    if (question.type === 'truefalse') {
      return userAnswer === question.correctAnswer;
    }
    return userAnswer === question.correctIndex;
  }

  calculateScore(answers, timeBonus = 0) {
    let points = 0;
    let correct = 0;
    answers.forEach(a => {
      if (a.isCorrect) {
        correct++;
        points += 100;
        if (a.timeRemaining > 20) points += 50;
        else if (a.timeRemaining > 10) points += 25;
      }
    });
    // Streak bonus
    let streak = 0, maxStreak = 0;
    answers.forEach(a => {
      if (a.isCorrect) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 0;
    });
    points += maxStreak * 20;
    return { points, correct, total: answers.length, accuracy: Math.round((correct / answers.length) * 100), maxStreak };
  }

  saveQuizResult(result) {
    const history = this.storage.get('quizHistory') || [];
    history.push({ date: new Date().toISOString(), ...result });
    if (history.length > 50) history.splice(0, history.length - 50);
    this.storage.set('quizHistory', history);
  }

  getQuizHistory() {
    return this.storage.get('quizHistory') || [];
  }

  getBestScore() {
    const history = this.getQuizHistory();
    if (!history.length) return null;
    return history.reduce((best, r) => r.points > (best?.points || 0) ? r : best, null);
  }

  getBadges() {
    const history = this.getQuizHistory();
    const badges = [];
    if (history.length >= 1) badges.push({ id: 'first_quiz', name: 'First Steps', icon: '🌱', desc: 'Completed your first quiz' });
    if (history.length >= 10) badges.push({ id: 'quiz_master', name: 'Quiz Master', icon: '🧠', desc: 'Completed 10 quizzes' });
    if (history.some(r => r.accuracy === 100)) badges.push({ id: 'perfect', name: 'Perfect Score', icon: '⭐', desc: 'Got 100% accuracy' });
    if (history.some(r => r.maxStreak >= 5)) badges.push({ id: 'streak5', name: 'On Fire', icon: '🔥', desc: '5 correct answers in a row' });
    const totalCorrect = history.reduce((s, r) => s + r.correct, 0);
    if (totalCorrect >= 50) badges.push({ id: 'eco_scholar', name: 'Eco Scholar', icon: '🎓', desc: '50 correct answers total' });
    return badges;
  }

  getDailyCompleted() {
    const today = new Date().toDateString();
    const history = this.getQuizHistory();
    return history.some(r => new Date(r.date).toDateString() === today && r.mode === 'daily');
  }

  _shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  _hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }
}
