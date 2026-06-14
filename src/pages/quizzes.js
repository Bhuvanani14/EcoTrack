/**
 * EcoTrack Quizzes Page
 * Interactive quiz with multiple modes, timer, and scoring.
 */
import { QuizEngine } from '../core/quiz-engine.js';
import { formatNumber } from '../utils/format.js';

const quizEngine = new QuizEngine();
let currentQuiz = null;
let currentQuestionIndex = 0;
let answers = [];
let timerInterval = null;
let timeRemaining = 30;

function showQuizSelection() {
  const badges = quizEngine.getBadges();
  const best = quizEngine.getBestScore();
  const history = quizEngine.getQuizHistory();
  const dailyDone = quizEngine.getDailyCompleted();
  const categories = quizEngine.getCategories();

  return `
    <div class="page-header">
      <h1 class="page-header__title">🧠 Quizzes</h1>
      <p class="page-header__subtitle">Test your carbon literacy and learn something new!</p>
    </div>

    <!-- Badges -->
    ${badges.length > 0 ? `
      <div class="card" style="margin-bottom:var(--space-6)">
        <h3 style="margin-bottom:var(--space-3)">🏆 Your Badges</h3>
        <div style="display:flex;gap:var(--space-4);flex-wrap:wrap">
          ${badges.map(b => `
            <div class="tooltip" data-tooltip="${b.desc}" style="text-align:center">
              <div style="font-size:2rem">${b.icon}</div>
              <div style="font-size:var(--text-xs);color:var(--text-secondary)">${b.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Quiz Modes -->
    <div class="dashboard-grid" style="margin-bottom:var(--space-6)">
      <div class="card card--interactive" id="quiz-quick" style="text-align:center">
        <div style="font-size:2.5rem;margin-bottom:var(--space-3)">⚡</div>
        <h3>Quick Quiz</h3>
        <p style="color:var(--text-secondary);font-size:var(--text-sm)">5 random questions, 30s each</p>
        <button class="btn btn--primary" style="margin-top:var(--space-4)" data-mode="quick">Start</button>
      </div>
      <div class="card card--interactive" id="quiz-daily" style="text-align:center">
        <div style="font-size:2.5rem;margin-bottom:var(--space-3)">📅</div>
        <h3>Daily Challenge</h3>
        <p style="color:var(--text-secondary);font-size:var(--text-sm)">${dailyDone ? '✅ Completed today!' : '1 unique question per day'}</p>
        <button class="btn btn--secondary" style="margin-top:var(--space-4)" data-mode="daily" ${dailyDone ? 'disabled' : ''}>
          ${dailyDone ? 'Done' : 'Play'}
        </button>
      </div>
      <div class="card card--interactive" id="quiz-deep" style="text-align:center">
        <div style="font-size:2.5rem;margin-bottom:var(--space-3)">🎯</div>
        <h3>Category Deep Dive</h3>
        <p style="color:var(--text-secondary);font-size:var(--text-sm)">10 questions from one topic</p>
        <select class="input-group__field" id="quiz-category" style="margin-top:var(--space-3)">
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <button class="btn btn--secondary" style="margin-top:var(--space-3)" data-mode="deep_dive">Start</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="card">
      <h3 style="margin-bottom:var(--space-3)">📊 Quiz Stats</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:var(--space-4);text-align:center">
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-teal)">${history.length}</div><small style="color:var(--text-secondary)">Quizzes Taken</small></div>
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)">${best ? best.points : 0}</div><small style="color:var(--text-secondary)">Best Score</small></div>
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-amber)">${history.length ? Math.round(history.reduce((s, r) => s + r.accuracy, 0) / history.length) : 0}%</div><small style="color:var(--text-secondary)">Avg Accuracy</small></div>
        <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-purple)">${history.reduce((s, r) => s + r.correct, 0)}</div><small style="color:var(--text-secondary)">Total Correct</small></div>
      </div>
    </div>
  `;
}

function startQuiz(mode, category) {
  currentQuiz = quizEngine.getQuestions(mode, category);
  currentQuestionIndex = 0;
  answers = [];
  showQuestion();
}

function showQuestion() {
  const container = document.getElementById('main-content');
  if (!container || !currentQuiz) return;
  const q = currentQuiz[currentQuestionIndex];
  timeRemaining = 30;

  let optionsHTML;
  if (q.type === 'truefalse') {
    optionsHTML = `
      <button class="quiz-option" data-answer="true">✅ True</button>
      <button class="quiz-option" data-answer="false">❌ False</button>
    `;
  } else {
    optionsHTML = q.options.map((opt, i) => `<button class="quiz-option" data-answer="${i}">${opt}</button>`).join('');
  }

  container.innerHTML = `
    <div class="quiz-container animate-scale-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-6)">
        <span style="color:var(--text-secondary);font-size:var(--text-sm)">Question ${currentQuestionIndex + 1} of ${currentQuiz.length}</span>
        <span class="badge badge--${q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'coral'}">${q.difficulty}</span>
      </div>
      <div class="progress-bar" style="margin-bottom:var(--space-6)"><div class="progress-bar__fill" style="width:${((currentQuestionIndex) / currentQuiz.length) * 100}%"></div></div>
      <div class="card quiz-question-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
          <span class="badge badge--teal">${q.category}</span>
          <span id="quiz-timer" style="font-size:var(--text-xl);font-weight:700;color:var(--accent-amber)">⏱ ${timeRemaining}s</span>
        </div>
        <h2 style="margin-bottom:var(--space-6);font-size:var(--text-xl)">${q.question}</h2>
        <div class="quiz-options" id="quiz-options">${optionsHTML}</div>
      </div>
    </div>
  `;

  // Timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeRemaining--;
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl) timerEl.textContent = `⏱ ${timeRemaining}s`;
    if (timeRemaining <= 5 && timerEl) timerEl.style.color = 'var(--accent-coral)';
    if (timeRemaining <= 0) { clearInterval(timerInterval); handleAnswer(null); }
  }, 1000);

  // Option click handlers
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(timerInterval);
      let userAnswer;
      if (q.type === 'truefalse') userAnswer = btn.dataset.answer === 'true';
      else userAnswer = parseInt(btn.dataset.answer);
      handleAnswer(userAnswer, btn);
    });
  });
}

function handleAnswer(userAnswer, clickedBtn = null) {
  const q = currentQuiz[currentQuestionIndex];
  const isCorrect = userAnswer !== null && quizEngine.checkAnswer(q, userAnswer);
  answers.push({ questionId: q.id, isCorrect, timeRemaining, userAnswer });

  // Visual feedback
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.style.pointerEvents = 'none';
    let correctVal;
    if (q.type === 'truefalse') correctVal = q.correctAnswer.toString();
    else correctVal = q.correctIndex.toString();
    if (btn.dataset.answer === correctVal) btn.classList.add('quiz-option--correct');
    else if (btn === clickedBtn && !isCorrect) btn.classList.add('quiz-option--wrong');
  });

  // Show explanation
  const optionsDiv = document.getElementById('quiz-options');
  if (optionsDiv) {
    const expDiv = document.createElement('div');
    expDiv.className = 'card animate-slide-up';
    expDiv.style.cssText = 'margin-top:var(--space-4);text-align:left;background:var(--bg-surface-solid);border-color:var(--border-default)';
    expDiv.innerHTML = `
      <div style="font-weight:600;margin-bottom:var(--space-2);color:${isCorrect ? 'var(--accent-green)' : 'var(--accent-coral)'}">
        ${isCorrect ? '✅ Correct!' : userAnswer === null ? '⏰ Time\'s up!' : '❌ Not quite!'}
      </div>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);margin:0">${q.explanation}</p>
    `;
    optionsDiv.appendChild(expDiv);
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) showQuestion();
    else showResults();
  }, 2500);
}

function showResults() {
  clearInterval(timerInterval);
  const result = quizEngine.calculateScore(answers);
  result.mode = currentQuiz.length === 1 ? 'daily' : 'quick';
  quizEngine.saveQuizResult(result);

  const container = document.getElementById('main-content');
  if (!container) return;

  const wrongAnswers = answers.filter(a => !a.isCorrect);
  const wrongQuestions = wrongAnswers.map(a => currentQuiz.find(q => q.id === a.questionId)).filter(Boolean);

  container.innerHTML = `
    <div class="quiz-container animate-scale-in" style="text-align:center">
      <div class="card" style="padding:var(--space-8)">
        <div style="font-size:4rem;margin-bottom:var(--space-4)">${result.accuracy >= 80 ? '🏆' : result.accuracy >= 50 ? '👏' : '💪'}</div>
        <h2 style="margin-bottom:var(--space-2)">Quiz Complete!</h2>
        <div style="font-size:var(--text-4xl);font-weight:700;font-family:var(--font-heading);background:var(--gradient-hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:var(--space-4) 0">${result.points} pts</div>
        <div style="display:flex;justify-content:center;gap:var(--space-6);margin:var(--space-4) 0">
          <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-green)">${result.correct}/${result.total}</div><small style="color:var(--text-secondary)">Correct</small></div>
          <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-teal)">${result.accuracy}%</div><small style="color:var(--text-secondary)">Accuracy</small></div>
          <div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-amber)">🔥 ${result.maxStreak}</div><small style="color:var(--text-secondary)">Best Streak</small></div>
        </div>

        ${wrongQuestions.length > 0 ? `
          <div class="divider"></div>
          <h4 style="margin-bottom:var(--space-3);text-align:left">📚 You Learned</h4>
          <div style="text-align:left;display:flex;flex-direction:column;gap:var(--space-2)">
            ${wrongQuestions.slice(0, 3).map(q => `
              <div style="font-size:var(--text-sm);color:var(--text-secondary);padding:var(--space-2);background:var(--bg-surface);border-radius:var(--radius-sm)">
                <strong style="color:var(--text-primary)">${q.question}</strong><br>${q.explanation}
              </div>
            `).join('')}
          </div>
        ` : '<p style="color:var(--accent-green);font-weight:600;margin-top:var(--space-4)">🌟 Perfect score! Amazing carbon knowledge!</p>'}

        <div style="display:flex;gap:var(--space-3);justify-content:center;margin-top:var(--space-6)">
          <button class="btn btn--primary" id="quiz-retry">🔄 Try Again</button>
          <button class="btn btn--secondary" id="quiz-back">← All Quizzes</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('quiz-retry')?.addEventListener('click', () => { startQuiz('quick'); });
  document.getElementById('quiz-back')?.addEventListener('click', () => {
    container.innerHTML = showQuizSelection();
    bindQuizEvents();
  });
}

function bindQuizEvents() {
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      const category = mode === 'deep_dive' ? document.getElementById('quiz-category')?.value : null;
      startQuiz(mode, category);
    });
  });
}

export function renderQuizzes() {
  const html = showQuizSelection();
  setTimeout(bindQuizEvents, 100);
  return html;
}
