/**
 * Google Gemini API Integration
 * Uses Gemini 2.5 Flash Lite for fast, free AI workout generation
 */

import { AIWorkout, AIWorkoutParams, RateLimitInfo } from '../types/aiWorkout';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
const RATE_LIMIT_KEY = 'ai_workout_rate_limit';
const DAILY_LIMIT = 3; // Free tier: 3 generations per day
const TIMEOUT_MS = 15000; // 15 second timeout

/**
 * Check if API key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Get current rate limit status
 */
export function getRateLimitInfo(): RateLimitInfo {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  
  if (!stored) {
    const newInfo: RateLimitInfo = {
      count: 0,
      lastReset: new Date().toISOString(),
      limit: DAILY_LIMIT,
    };
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newInfo));
    return newInfo;
  }

  const info: RateLimitInfo = JSON.parse(stored);
  
  // Reset if it's a new day
  const lastReset = new Date(info.lastReset);
  const now = new Date();
  if (
    now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    info.count = 0;
    info.lastReset = now.toISOString();
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(info));
  }

  return info;
}

/**
 * Increment rate limit counter
 */
function incrementRateLimit(): void {
  const info = getRateLimitInfo();
  info.count += 1;
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(info));
}

/**
 * Check if user has reached rate limit
 */
export function isRateLimited(): boolean {
  const info = getRateLimitInfo();
  return info.count >= info.limit;
}

/**
 * Build the prompt for Gemini API
 */
function buildPrompt(params: AIWorkoutParams): string {
  const { selectedMuscles, duration, level, equipment, goal = 'Hypertrophy' } = params;
  
  // Muscle volume recommendations (MEV = Minimum Effective Volume, MAV = Maximum Adaptive Volume)
  const volumeGuidelines = `
Chest: MEV 10 sets, MAV 16-20 sets
Back: MEV 12 sets, MAV 18-22 sets
Shoulders: MEV 8 sets, MAV 14-18 sets
Biceps: MEV 8 sets, MAV 14-18 sets
Triceps: MEV 8 sets, MAV 14-18 sets
Quads: MEV 10 sets, MAV 16-20 sets
Hamstrings: MEV 8 sets, MAV 14-18 sets
Glutes: MEV 8 sets, MAV 14-18 sets
Calves: MEV 8 sets, MAV 12-16 sets
Abs/Core: MEV 6 sets, MAV 12-16 sets
`;

  // Rep ranges based on goal
  const repGuidelines = goal === 'Strength'
    ? '3-5 reps (80-90% 1RM)'
    : goal === 'Hypertrophy'
    ? '8-12 reps (60-75% 1RM)'
    : '15-20 reps (50-60% 1RM)';

  const prompt = `You are an expert strength coach and exercise scientist. Generate an optimized workout plan based on the following parameters:

Selected muscle groups: ${selectedMuscles.join(', ')}
Duration: ${duration} minutes
Level: ${level}
Equipment available: ${equipment}
Goal: ${goal}

IMPORTANT RULES:
1. Volume optimization: Use these evidence-based volume landmarks (Dr. Mike Israetel / Renaissance Periodization):
${volumeGuidelines}

2. Compound movement overlap: Account for indirect muscle stimulation. For example:
   - Bench press hits chest + front delts + triceps
   - Rows hit back + rear delts + biceps
   - Squats hit quads + glutes + hamstrings
   - Overhead press hits shoulders + triceps
   When multiple muscle groups are selected, reduce direct isolation work for muscles that get hit indirectly.

3. Exercise ordering: Always follow this sequence:
   - Compound exercises first (multi-joint)
   - Isolation exercises second (single-joint)
   - Exercises for the same muscle group should be grouped together

4. Time constraints: Each working set takes approximately 2 minutes including rest time.
   For ${duration} minutes, aim for ${Math.floor(duration / 2)} total working sets maximum.

5. Rep ranges for ${goal}:
   - ${repGuidelines}
   - Adjust rest times accordingly: Strength (3-5 min), Hypertrophy (60-90s), Endurance (30-60s)

6. Equipment constraint: Only use exercises that can be performed with: ${equipment}

7. Progressive difficulty:
   - ${level === 'Beginner' ? 'Focus on fundamental movements, simpler exercises, lower volume' : ''}
   - ${level === 'Intermediate' ? 'Mix of compound and isolation, moderate volume' : ''}
   - ${level === 'Advanced' ? 'Advanced techniques allowed (drop sets, supersets), higher volume' : ''}

8. Include a brief warmup recommendation (5-10 min) and 2-3 training tips.

Return ONLY valid JSON in this EXACT format (no markdown, no code blocks, no extra text):
{
  "workoutName": "Descriptive workout name",
  "estimatedTime": 45,
  "muscleGroups": [
    {
      "name": "Chest",
      "totalSets": 12,
      "note": "Optimal volume for hypertrophy",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "reps": "8",
          "restSeconds": 90,
          "notes": "Control the eccentric, pause at chest"
        }
      ]
    }
  ],
  "warmup": "5 min light cardio + dynamic stretching + 2 warm-up sets",
  "tips": ["Focus on progressive overload", "Mind-muscle connection"]
}`;

  return prompt;
}

/**
 * Parse and validate AI response
 */
function parseAIResponse(text: string): AIWorkout {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleaned);
    
    // Validate required fields
    if (!parsed.workoutName || !parsed.muscleGroups || !Array.isArray(parsed.muscleGroups)) {
      throw new Error('Invalid workout structure');
    }
    
    return parsed as AIWorkout;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

/**
 * Generate workout using Gemini API
 */
export async function generateWorkout(params: AIWorkoutParams): Promise<AIWorkout> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
  }

  if (isRateLimited()) {
    const info = getRateLimitInfo();
    throw new Error(`Daily limit reached (${info.limit} workouts). Try again tomorrow or upgrade to Pro for unlimited generations!`);
  }

  const prompt = buildPrompt(params);

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a few moments.');
      }
      
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid API response structure');
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const workout = parseAIResponse(aiText);
    
    // Increment rate limit on successful generation
    incrementRateLimit();
    
    // Cache the workout
    localStorage.setItem('last_generated_workout', JSON.stringify({
      params,
      workout,
      timestamp: new Date().toISOString(),
    }));
    
    return workout;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    console.error('Workout generation error:', error);
    throw error;
  }
}

/**
 * Get last generated workout from cache
 */
export function getLastGeneratedWorkout(): { params: AIWorkoutParams; workout: AIWorkout; timestamp: string } | null {
  try {
    const cached = localStorage.getItem('last_generated_workout');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
