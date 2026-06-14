/**
 * Tests for Quiz Engine
 */
import { describe, it, expect } from 'vitest';
import { QuizEngine } from '../src/core/quiz-engine.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('QuizEngine', () => {
  const engine = new QuizEngine();

  it('should return 5 questions for quick mode', () => {
    const questions = engine.getQuestions('quick');
    expect(questions.length).toBe(5);
  });

  it('should return 10 questions for deep_dive mode', () => {
    const questions = engine.getQuestions('deep_dive');
    expect(questions.length).toBe(10);
  });

  it('should return 1 question for daily mode', () => {
    const questions = engine.getQuestions('daily');
    expect(questions.length).toBe(1);
  });

  it('should filter by category', () => {
    const questions = engine.getQuestions('deep_dive', 'Transport');
    questions.forEach(q => expect(q.category).toBe('Transport'));
  });

  it('should return available categories', () => {
    const cats = engine.getCategories();
    expect(cats).toContain('Transport');
    expect(cats).toContain('Food');
    expect(cats).toContain('Energy');
  });

  it('should check multiple choice answers correctly', () => {
    const q = { type: 'multiple', correctIndex: 2 };
    expect(engine.checkAnswer(q, 2)).toBe(true);
    expect(engine.checkAnswer(q, 1)).toBe(false);
  });

  it('should check true/false answers correctly', () => {
    const q = { type: 'truefalse', correctAnswer: true };
    expect(engine.checkAnswer(q, true)).toBe(true);
    expect(engine.checkAnswer(q, false)).toBe(false);
  });

  it('should calculate scores with streak bonus', () => {
    const answers = [
      { isCorrect: true, timeRemaining: 25 },
      { isCorrect: true, timeRemaining: 15 },
      { isCorrect: true, timeRemaining: 5 },
      { isCorrect: false, timeRemaining: 10 },
      { isCorrect: true, timeRemaining: 20 },
    ];
    const result = engine.calculateScore(answers);
    expect(result.correct).toBe(4);
    expect(result.total).toBe(5);
    expect(result.accuracy).toBe(80);
    expect(result.points).toBeGreaterThan(400);
    expect(result.maxStreak).toBe(3);
  });
});
