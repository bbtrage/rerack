/**
 * Groq API Integration
 * Uses Groq's Llama models for fast, free AI workout generation
 * OpenAI-compatible chat completions API
 */

import { AIWorkout, AIWorkoutParams, RateLimitInfo } from '../types/aiWorkout';

const API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'llama-3.3-70b-versatile'; // Best quality on free tier
const FALLBACK_MODEL = 'llama-3.1-8b-instant'; // Faster, higher rate limits
const RATE_LIMIT_KEY = 'ai_workout_rate_limit';
const WORKOUT_CACHE_KEY = 'ai_workout_cache';
const DAILY_LIMIT = 1000; // Groq free tier: 1000 requests per day
const RATE_LIMIT_PER_MINUTE = 30; // Groq free tier: 30 requests per minute
const TIMEOUT_MS = 15000; // 15 second timeout
const MAX_RETRIES = 3;
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const COOLDOWN_MS = 30 * 1000; // 30 seconds

/**
 * Check if API key is configured
 */
export function isGroqConfigured(): boolean {
  return !!API_KEY;
}

// Legacy alias for backward compatibility
export const isGeminiConfigured = isGroqConfigured;

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
 * Generate cache key from workout parameters
 */
function getCacheKey(params: AIWorkoutParams): string {
  const { selectedMuscles, duration, level, equipment, goal } = params;
  return `workout_${selectedMuscles.sort().join('_')}_${duration}_${level}_${equipment}_${goal}`;
}

/**
 * Get cached workout if available and not expired
 */
export function getCachedWorkout(params: AIWorkoutParams): AIWorkout | null {
  try {
    const cacheKey = getCacheKey(params);
    const cached = localStorage.getItem(`${WORKOUT_CACHE_KEY}_${cacheKey}`);
    
    if (!cached) {
      return null;
    }

    const { workout, timestamp } = JSON.parse(cached);
    const age = Date.now() - new Date(timestamp).getTime();

    // Check if cache is expired
    if (age > CACHE_EXPIRY_MS) {
      localStorage.removeItem(`${WORKOUT_CACHE_KEY}_${cacheKey}`);
      return null;
    }

    console.log('✅ Using cached workout (age:', Math.round(age / 1000 / 60), 'minutes)');
    return workout;
  } catch (error) {
    console.warn('Failed to get cached workout:', error);
    return null;
  }
}

/**
 * Cache workout with params
 */
function cacheWorkout(params: AIWorkoutParams, workout: AIWorkout): void {
  try {
    const cacheKey = getCacheKey(params);
    localStorage.setItem(`${WORKOUT_CACHE_KEY}_${cacheKey}`, JSON.stringify({
      workout,
      timestamp: new Date().toISOString(),
    }));
    console.log('💾 Workout cached with key:', cacheKey);
  } catch (error) {
    console.warn('Failed to cache workout:', error);
  }
}

/**
 * Get last generation timestamp for cooldown check
 */
export function getLastGenerationTime(): number | null {
  try {
    const lastGen = localStorage.getItem('last_generation_time');
    return lastGen ? parseInt(lastGen, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Set last generation timestamp
 */
function setLastGenerationTime(): void {
  localStorage.setItem('last_generation_time', Date.now().toString());
}

/**
 * Check if user is in cooldown period
 */
export function isInCooldown(): boolean {
  const lastGen = getLastGenerationTime();
  if (!lastGen) return false;
  
  const elapsed = Date.now() - lastGen;
  return elapsed < COOLDOWN_MS;
}

/**
 * Get remaining cooldown time in seconds
 */
export function getCooldownRemaining(): number {
  const lastGen = getLastGenerationTime();
  if (!lastGen) return 0;
  
  const elapsed = Date.now() - lastGen;
  const remaining = COOLDOWN_MS - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Track API request for per-minute rate limiting
 */
interface RateLimitTracker {
  timestamps: number[];
}

function getMinuteRateLimitTracker(): RateLimitTracker {
  try {
    const stored = localStorage.getItem('rate_limit_tracker');
    if (!stored) {
      return { timestamps: [] };
    }
    return JSON.parse(stored);
  } catch {
    return { timestamps: [] };
  }
}

function updateMinuteRateLimit(): void {
  const tracker = getMinuteRateLimitTracker();
  const now = Date.now();
  
  // Remove timestamps older than 1 minute
  tracker.timestamps = tracker.timestamps.filter(ts => now - ts < 60000);
  
  // Add current timestamp
  tracker.timestamps.push(now);
  
  localStorage.setItem('rate_limit_tracker', JSON.stringify(tracker));
  
  console.log(`📊 API calls in last minute: ${tracker.timestamps.length}/${RATE_LIMIT_PER_MINUTE}`);
}

/**
 * Check if per-minute rate limit is exceeded
 */
export function isMinuteRateLimitExceeded(): boolean {
  const tracker = getMinuteRateLimitTracker();
  const now = Date.now();
  
  // Filter to timestamps in the last minute
  const recentCalls = tracker.timestamps.filter(ts => now - ts < 60000);
  
  return recentCalls.length >= RATE_LIMIT_PER_MINUTE;
}

/**
 * Get remaining calls in current minute
 */
export function getRemainingMinuteCalls(): number {
  const tracker = getMinuteRateLimitTracker();
  const now = Date.now();
  
  const recentCalls = tracker.timestamps.filter(ts => now - ts < 60000);
  return Math.max(0, RATE_LIMIT_PER_MINUTE - recentCalls.length);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retryCount: number = 0,
  onRetry?: (attempt: number, delay: number) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Only retry on 429 errors, and only up to MAX_RETRIES attempts
    if (error.status !== 429 || retryCount >= MAX_RETRIES) {
      throw error;
    }

    // Calculate delay: 5s, 10s, 20s for attempts 1, 2, 3
    const delay = Math.pow(2, retryCount) * 5000;
    
    const attemptNumber = retryCount + 1;
    console.log(`⏳ Rate limited (429). Retrying in ${delay / 1000}s... (retry ${attemptNumber}/${MAX_RETRIES})`);
    
    // Notify caller about retry
    if (onRetry) {
      onRetry(attemptNumber, delay);
    }
    
    await sleep(delay);
    
    return retryWithBackoff(fn, retryCount + 1, onRetry);
  }
}

/**
 * Build the system and user prompts for Groq API
 */
function buildPrompts(params: AIWorkoutParams): { systemPrompt: string; userPrompt: string } {
  const { selectedMuscles, duration, level, equipment, goal = 'Hypertrophy' } = params;
  
  // Muscle volume recommendations (MEV = Minimum Effective Volume, MAV = Maximum Adaptive Volume)
  const volumeGuidelines = `
Chest: MEV 10 sets, MAV 16-20 sets
Back: MEV 12 sets, MAV 18-22 sets
Shoulders: MEV 8 sets, MAV 14-18 sets
Biceps: MEV 8 sets, MAV 14-18 sets
Triceps: MEV 8 sets, MAV 14-18 sets
Forearms: MEV 6 sets, MAV 10-14 sets
Quads: MEV 10 sets, MAV 16-20 sets
Hamstrings: MEV 8 sets, MAV 14-18 sets
Glutes: MEV 8 sets, MAV 14-18 sets
Calves: MEV 8 sets, MAV 12-16 sets
Abs/Core: MEV 6 sets, MAV 12-16 sets
Obliques: MEV 6 sets, MAV 10-14 sets
Traps: MEV 6 sets, MAV 12-16 sets
Lats: MEV 10 sets, MAV 16-20 sets
Rear Delts: MEV 8 sets, MAV 14-18 sets
Front Delts: MEV 6 sets, MAV 12-16 sets (often trained with chest pressing)
Side Delts: MEV 8 sets, MAV 14-18 sets
`;

  // Rep ranges based on goal
  const repGuidelines = goal === 'Strength'
    ? '3-5 reps (80-90% 1RM)'
    : goal === 'Hypertrophy'
    ? '8-12 reps (60-75% 1RM)'
    : '15-20 reps (50-60% 1RM)';

  const systemPrompt = `You are an expert strength coach and exercise scientist. Generate an optimized workout plan based on the user's selections.

RULES:
- Optimize volume distribution per muscle group based on scientific recommendations
- Account for compound movement overlap (e.g., bench press trains triceps, so reduce direct tricep isolation volume)
- Order exercises: compound movements first, then isolation exercises
- Each working set takes approximately 2 minutes including rest
- Include warm-up recommendations
- Provide form cues for key exercises

You MUST respond with ONLY valid JSON in this exact format:
{
  "workoutName": "string",
  "estimatedTime": number,
  "warmup": "string",
  "muscleGroups": [
    {
      "name": "string",
      "totalSets": number,
      "note": "string (e.g., 'Optimal for hypertrophy' or 'Reduced — already hit during pressing')",
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string (e.g., '8-10' or 'AMRAP')",
          "restSeconds": number,
          "notes": "string (form cue or tip)"
        }
      ]
    }
  ],
  "tips": ["string"]
}`;

  const userPrompt = `Generate an optimized workout plan:

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

8. Include a brief warmup recommendation (5-10 min) and 2-3 training tips.`;

  return { systemPrompt, userPrompt };
}

/**
 * Parse and validate AI response from Groq
 */
function parseAIResponse(text: string): AIWorkout {
  try {
    // With response_format: json_object, Groq returns clean JSON
    // But still handle edge cases
    let cleaned = text.trim();
    
    // Remove markdown code blocks if present
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
 * Call Groq API with specific model
 */
async function callGroqAPI(model: string, params: AIWorkoutParams): Promise<AIWorkout> {
  const { systemPrompt, userPrompt } = buildPrompts(params);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' }, // Forces JSON response
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      
      if (response.status === 429) {
        const error: any = new Error('API rate limit exceeded. Please try again in a few moments.');
        error.status = 429;
        throw error;
      }
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your REACT_APP_GROQ_API_KEY.');
      }
      
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response structure');
    }

    const aiText = data.choices[0].message.content;
    return parseAIResponse(aiText);
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw error;
  }
}

/**
 * Generate workout using Groq API with model fallback
 * @param params - Workout generation parameters
 * @param bypassCache - If true, ignores cached results and generates fresh workout
 * @param onRetry - Callback for retry attempts (attempt number, delay in ms)
 */
export async function generateWorkout(
  params: AIWorkoutParams,
  bypassCache: boolean = false,
  onRetry?: (attempt: number, delay: number) => void
): Promise<AIWorkout> {
  if (!isGroqConfigured()) {
    throw new Error('Groq API key not configured. Please add REACT_APP_GROQ_API_KEY to your .env file.\n\nGet a free key at: https://console.groq.com');
  }

  // Check per-minute rate limit
  if (isMinuteRateLimitExceeded()) {
    throw new Error(`Rate limit reached (${RATE_LIMIT_PER_MINUTE} requests per minute). Please wait a moment before trying again.`);
  }

  // Check daily limit
  if (isRateLimited()) {
    const info = getRateLimitInfo();
    throw new Error(`Daily limit reached (${info.limit} workouts). Try again tomorrow!`);
  }

  // Check cache first (unless bypassing)
  if (!bypassCache) {
    const cached = getCachedWorkout(params);
    if (cached) {
      return cached;
    }
  }

  // Track this API call for per-minute rate limiting
  updateMinuteRateLimit();

  // Make API call with retry logic and model fallback
  const workout = await retryWithBackoff(async () => {
    try {
      // Try primary model first (best quality)
      console.log(`🤖 Using Groq model: ${PRIMARY_MODEL}`);
      return await callGroqAPI(PRIMARY_MODEL, params);
    } catch (error: any) {
      // If primary model is rate limited, try fallback model
      if (error.status === 429) {
        console.log(`⚡ Falling back to ${FALLBACK_MODEL} (faster model)`);
        return await callGroqAPI(FALLBACK_MODEL, params);
      }
      throw error;
    }
  }, 0, onRetry);
  
  // Increment rate limit on successful generation
  incrementRateLimit();
  
  // Set cooldown timer
  setLastGenerationTime();
  
  // Cache the workout
  cacheWorkout(params, workout);
  
  // Also save to legacy cache for backwards compatibility
  localStorage.setItem('last_generated_workout', JSON.stringify({
    params,
    workout,
    timestamp: new Date().toISOString(),
  }));
  
  return workout;
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
