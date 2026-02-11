/**
 * Exercise GIF Cache using localforage
 * Caches ExerciseDB exercise data locally for 7 days
 */

import localforage from 'localforage';
import { ExerciseDBExercise } from '../lib/exercisedb';

const CACHE_KEY_PREFIX = 'exercisedb_cache_';
const CACHE_EXPIRY_DAYS = 7;
const CACHE_VERSION = '1.0';

interface CachedExercise {
  data: ExerciseDBExercise;
  cachedAt: number;
  version: string;
}

interface ExerciseMapping {
  appExerciseName: string;
  exerciseDBId: string;
  exerciseDBName: string;
  confidence: number;
  cachedAt: number;
}

// Initialize localforage instance for exercise cache
const exerciseCache = localforage.createInstance({
  name: 'rerack-exercisedb',
  storeName: 'exercises',
});

/**
 * Check if cache is expired
 */
function isCacheExpired(cachedAt: number): boolean {
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  return Date.now() - cachedAt > expiryTime;
}

/**
 * Get cached exercise by ExerciseDB ID
 */
export async function getCachedExercise(exerciseId: string): Promise<ExerciseDBExercise | null> {
  try {
    const key = `${CACHE_KEY_PREFIX}${exerciseId}`;
    const cached = await exerciseCache.getItem<CachedExercise>(key);

    if (!cached) {
      return null;
    }

    // Check if cache is expired or version mismatch
    if (isCacheExpired(cached.cachedAt) || cached.version !== CACHE_VERSION) {
      await exerciseCache.removeItem(key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.warn('Failed to get cached exercise:', error);
    return null;
  }
}

/**
 * Cache exercise data
 */
export async function cacheExercise(exercise: ExerciseDBExercise): Promise<void> {
  try {
    const key = `${CACHE_KEY_PREFIX}${exercise.exerciseId}`;
    const cached: CachedExercise = {
      data: exercise,
      cachedAt: Date.now(),
      version: CACHE_VERSION,
    };
    await exerciseCache.setItem(key, cached);
  } catch (error) {
    console.warn('Failed to cache exercise:', error);
  }
}

/**
 * Get exercise mapping (app exercise name -> ExerciseDB ID)
 */
export async function getExerciseMapping(appExerciseName: string): Promise<ExerciseMapping | null> {
  try {
    const key = `mapping_${appExerciseName.toLowerCase()}`;
    const mapping = await exerciseCache.getItem<ExerciseMapping>(key);

    if (!mapping) {
      return null;
    }

    // Check if cache is expired
    if (isCacheExpired(mapping.cachedAt)) {
      await exerciseCache.removeItem(key);
      return null;
    }

    return mapping;
  } catch (error) {
    console.warn('Failed to get exercise mapping:', error);
    return null;
  }
}

/**
 * Cache exercise mapping
 */
export async function cacheExerciseMapping(mapping: Omit<ExerciseMapping, 'cachedAt'>): Promise<void> {
  try {
    const key = `mapping_${mapping.appExerciseName.toLowerCase()}`;
    const cachedMapping: ExerciseMapping = {
      ...mapping,
      cachedAt: Date.now(),
    };
    await exerciseCache.setItem(key, cachedMapping);
  } catch (error) {
    console.warn('Failed to cache exercise mapping:', error);
  }
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const keys = await exerciseCache.keys();
    const removePromises = keys.map(async (key) => {
      const item = await exerciseCache.getItem<CachedExercise | ExerciseMapping>(key);
      if (item && 'cachedAt' in item && isCacheExpired(item.cachedAt)) {
        await exerciseCache.removeItem(key);
      }
    });
    await Promise.all(removePromises);
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    await exerciseCache.clear();
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  exerciseEntries: number;
  mappingEntries: number;
}> {
  try {
    const keys = await exerciseCache.keys();
    const exerciseEntries = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX)).length;
    const mappingEntries = keys.filter(k => k.startsWith('mapping_')).length;

    return {
      totalEntries: keys.length,
      exerciseEntries,
      mappingEntries,
    };
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return {
      totalEntries: 0,
      exerciseEntries: 0,
      mappingEntries: 0,
    };
  }
}
