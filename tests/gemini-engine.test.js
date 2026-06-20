import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { askGemini, generateDailyInsights, isAIEnabled } from '../src/core/gemini-engine.js';

// Setup environment variable mock for Vitest
let mockTime = 1000000;
beforeEach(() => {
  import.meta.env.VITE_GEMINI_API_KEY = 'AIzaMockKey_1234567890';
  mockTime += 10000; // Advance time by 10 seconds per test to bypass debounce
  vi.spyOn(Date, 'now').mockReturnValue(mockTime);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Gemini AI Engine', () => {
  it('should verify AI is enabled when a valid key is provided', () => {
    expect(isAIEnabled()).toBe(true);
  });

  it('should query the API and return the response text', async () => {
    import.meta.env.VITE_GEMINI_API_KEY = 'AIzaMockKey_123';
    
    const mockResponseText = 'Climate change is real and caused by emissions.';
    
    // Mock global fetch
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: mockResponseText }]
          }
        }]
      })
    });

    const response = await askGemini('What is climate change?');
    expect(response).toBe(mockResponseText);
    expect(fetchSpy).toHaveBeenCalled();
    
    fetchSpy.mockRestore();
  });

  it('should return null and fall back on fetch failure', async () => {
    import.meta.env.VITE_GEMINI_API_KEY = 'AIzaMockKey_123';
    
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500
    });

    const response = await askGemini('What is climate change?');
    expect(response).toBeNull();
    
    fetchSpy.mockRestore();
  });

  it('should generate daily insights in correct format', async () => {
    import.meta.env.VITE_GEMINI_API_KEY = 'AIzaMockKey_123';
    
    const mockTips = '["Turn off lights", "Eat plant-based meal today", "Bike instead of drive"]';
    
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: mockTips }]
          }
        }]
      })
    });

    const profile = { food: { dietType: 'mixed' }, transport: { commuteMode: 'car_petrol' } };
    const fp = { annual: { total: 5.5 } };
    
    const insights = await generateDailyInsights(profile, fp);
    expect(insights).toEqual([
      "Turn off lights",
      "Eat plant-based meal today",
      "Bike instead of drive"
    ]);
    
    fetchSpy.mockRestore();
  });
});
