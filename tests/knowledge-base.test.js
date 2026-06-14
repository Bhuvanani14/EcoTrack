/**
 * Tests for Knowledge Base
 */
import { describe, it, expect } from 'vitest';
import { findAnswer, getRandomQuestion, getQuestionsByCategory } from '../src/core/knowledge-base.js';

describe('findAnswer', () => {
  it('should find answer for carbon footprint question', () => {
    const result = findAnswer('What is a carbon footprint?');
    expect(result.found).toBe(true);
    expect(result.answer).toBeTruthy();
    expect(result.source).toBeTruthy();
  });

  it('should find answer for beef question', () => {
    const result = findAnswer('Which food has the highest carbon footprint?');
    expect(result.found).toBe(true);
    expect(result.answer).toContain('Lamb');
  });

  it('should find answer for car emissions', () => {
    const result = findAnswer('How much CO2 does a car emit?');
    expect(result.found).toBe(true);
  });

  it('should find answer for electric vs petrol', () => {
    const result = findAnswer('Is electric car better than petrol?');
    expect(result.found).toBe(true);
  });

  it('should return suggestions for unknown queries', () => {
    const result = findAnswer('xyzabc random gibberish');
    expect(result.found).toBe(false);
  });

  it('should match partial keywords', () => {
    const result = findAnswer('reduce carbon');
    expect(result.found).toBe(true);
  });
});

describe('getRandomQuestion', () => {
  it('should return a valid question', () => {
    const q = getRandomQuestion();
    expect(q).toHaveProperty('question');
    expect(q).toHaveProperty('answer');
    expect(q).toHaveProperty('category');
  });
});

describe('getQuestionsByCategory', () => {
  it('should filter by category', () => {
    const questions = getQuestionsByCategory('transport');
    expect(questions.length).toBeGreaterThan(0);
    questions.forEach(q => expect(q.category).toBe('transport'));
  });
});
