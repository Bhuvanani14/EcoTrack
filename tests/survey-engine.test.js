/**
 * Tests for Survey Engine
 */
import { describe, it, expect } from 'vitest';
import { SurveyEngine } from '../src/core/survey-engine.js';

describe('SurveyEngine', () => {
  it('should start a survey', () => {
    const survey = new SurveyEngine();
    const step = survey.start();
    expect(step).toBeTruthy();
    expect(step.id).toBe('intro');
    expect(survey.isActive).toBe(true);
  });

  it('should handle cancel', () => {
    const survey = new SurveyEngine();
    survey.start();
    const result = survey.processAnswer('cancel');
    expect(result.cancelled).toBe(true);
    expect(survey.isActive).toBe(false);
  });

  it('should progress through steps', () => {
    const survey = new SurveyEngine();
    survey.start();
    const step2 = survey.processAnswer('start');
    expect(step2.id).toBe('commute_mode');
  });

  it('should track progress', () => {
    const survey = new SurveyEngine();
    survey.start();
    expect(survey.getProgress()).toBe(0);
    survey.processAnswer('start');
    survey.processAnswer('car_petrol');
    expect(survey.getProgress()).toBeGreaterThan(0);
  });

  it('should complete full survey and return results', () => {
    const survey = new SurveyEngine();
    survey.start();
    survey.processAnswer('start'); // intro
    survey.processAnswer('car_petrol'); // commute_mode
    survey.processAnswer(15); // commute_distance
    survey.processAnswer('2_0'); // flights
    survey.processAnswer('mixed'); // diet_type
    survey.processAnswer('weekly'); // red_meat
    survey.processAnswer('mixed'); // local_food
    survey.processAnswer('apartment'); // housing_type
    survey.processAnswer('gas'); // heating
    survey.processAnswer('no'); // renewable
    survey.processAnswer('quarterly'); // clothing
    survey.processAnswer(2); // streaming
    survey.processAnswer('sometimes'); // recycling

    expect(survey.isComplete).toBe(true);
    const results = survey.getResults();
    expect(results).toHaveProperty('annual');
    expect(results.annual.total).toBeGreaterThan(0);
  });

  it('should skip red meat question for vegans', () => {
    const survey = new SurveyEngine();
    survey.start();
    survey.processAnswer('start');
    survey.processAnswer('bicycle'); // commute
    survey.processAnswer(3); // distance
    survey.processAnswer('0_0'); // flights
    const step = survey.processAnswer('vegan'); // diet — should skip red_meat
    expect(step.id).toBe('local_food'); // skipped red_meat
  });

  it('should reset properly', () => {
    const survey = new SurveyEngine();
    survey.start();
    survey.processAnswer('start');
    survey.processAnswer('car_petrol');
    survey.reset();
    expect(survey.isActive).toBe(false);
    expect(survey.isComplete).toBe(false);
    expect(survey.currentIndex).toBe(0);
  });
});
