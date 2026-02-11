/**
 * Exercise Mapping Utility
 * Maps app exercise names to ExerciseDB exercise IDs using fuzzy matching
 */

import { searchExercises, ExerciseDBExercise } from '../lib/exercisedb';
import { getExerciseMapping, cacheExerciseMapping, cacheExercise } from './exerciseGifCache';

/**
 * Calculate similarity score between two strings (0-1)
 * Uses simple Levenshtein distance-based approach
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }

  // Calculate Levenshtein distance
  const matrix: number[][] = [];
  const len1 = s1.length;
  const len2 = s2.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

/**
 * Find best matching exercise from ExerciseDB
 */
export async function findBestMatch(
  appExerciseName: string,
  minConfidence: number = 0.6
): Promise<ExerciseDBExercise | null> {
  // Check cache first
  const cachedMapping = await getExerciseMapping(appExerciseName);
  if (cachedMapping && cachedMapping.confidence >= minConfidence) {
    // Try to get the full exercise data from cache
    const { getCachedExercise } = await import('./exerciseGifCache');
    const cachedExercise = await getCachedExercise(cachedMapping.exerciseDBId);
    if (cachedExercise) {
      return cachedExercise;
    }
  }

  // Search ExerciseDB API
  try {
    const results = await searchExercises(appExerciseName);

    if (results.length === 0) {
      return null;
    }

    // Find best match by calculating similarity scores
    let bestMatch: ExerciseDBExercise | null = null;
    let bestScore = 0;

    for (const exercise of results) {
      const score = calculateSimilarity(appExerciseName, exercise.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = exercise;
      }
    }

    // Only return if confidence is above threshold
    if (bestMatch && bestScore >= minConfidence) {
      // Cache the mapping and exercise data
      await cacheExerciseMapping({
        appExerciseName,
        exerciseDBId: bestMatch.exerciseId,
        exerciseDBName: bestMatch.name,
        confidence: bestScore,
      });
      await cacheExercise(bestMatch);
      return bestMatch;
    }

    return null;
  } catch (error) {
    console.warn('Failed to find best match:', error);
    return null;
  }
}

/**
 * Normalize exercise name for better matching
 * Removes common variations and standardizes format
 */
export function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common prefixes/suffixes
    .replace(/^(barbell|dumbbell|cable|machine|smith|bodyweight)\s+/i, '')
    .replace(/\s+(barbell|dumbbell|cable|machine|smith)$/i, '')
    // Normalize variations
    .replace(/\bdb\b/gi, 'dumbbell')
    .replace(/\bbb\b/gi, 'barbell')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get exercise variations to try when searching
 */
export function getExerciseVariations(name: string): string[] {
  const variations: string[] = [name];
  const normalized = normalizeExerciseName(name);
  
  if (normalized !== name.toLowerCase()) {
    variations.push(normalized);
  }

  // Add common equipment variations
  const equipmentPrefixes = ['barbell', 'dumbbell', 'cable', 'machine', 'smith'];
  equipmentPrefixes.forEach(prefix => {
    if (!name.toLowerCase().includes(prefix)) {
      variations.push(`${prefix} ${normalized}`);
    }
  });

  return variations;
}

/**
 * Find best match trying multiple variations
 */
export async function findBestMatchWithVariations(
  appExerciseName: string,
  minConfidence: number = 0.6
): Promise<ExerciseDBExercise | null> {
  // Try original name first
  let match = await findBestMatch(appExerciseName, minConfidence);
  if (match) return match;

  // Try variations
  const variations = getExerciseVariations(appExerciseName);
  for (const variation of variations) {
    if (variation === appExerciseName) continue;
    match = await findBestMatch(variation, minConfidence);
    if (match) return match;
  }

  return null;
}
