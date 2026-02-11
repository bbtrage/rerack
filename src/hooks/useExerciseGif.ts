/**
 * useExerciseGif Hook
 * Fetches and caches exercise GIF data from ExerciseDB
 */

import { useState, useEffect } from 'react';
import { ExerciseDBExercise } from '../lib/exercisedb';
import { findBestMatchWithVariations } from '../utils/exerciseMapping';

interface UseExerciseGifResult {
  gifUrl: string | null;
  loading: boolean;
  error: boolean;
  exercise: ExerciseDBExercise | null;
}

/**
 * Hook to fetch exercise GIF and data
 * @param exerciseName - The name of the exercise from the app's database
 * @param minConfidence - Minimum confidence score for fuzzy matching (0-1)
 */
export function useExerciseGif(
  exerciseName: string,
  minConfidence: number = 0.6
): UseExerciseGifResult {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [exercise, setExercise] = useState<ExerciseDBExercise | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchExerciseGif() {
      if (!exerciseName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        // Try to find best match with variations
        const matchedExercise = await findBestMatchWithVariations(
          exerciseName,
          minConfidence
        );

        if (!mounted) return;

        if (matchedExercise) {
          setExercise(matchedExercise);
          setGifUrl(matchedExercise.gifUrl);
          setError(false);
        } else {
          setExercise(null);
          setGifUrl(null);
          setError(true);
        }
      } catch (err) {
        console.warn('Error fetching exercise GIF:', err);
        if (mounted) {
          setError(true);
          setExercise(null);
          setGifUrl(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchExerciseGif();

    return () => {
      mounted = false;
    };
  }, [exerciseName, minConfidence]);

  return { gifUrl, loading, error, exercise };
}

/**
 * Hook variant that returns just the GIF URL
 */
export function useExerciseGifUrl(exerciseName: string): string | null {
  const { gifUrl } = useExerciseGif(exerciseName);
  return gifUrl;
}

/**
 * Hook to prefetch exercise GIFs for multiple exercises
 * Useful for preloading GIFs for a workout
 */
export function usePrefetchExerciseGifs(exerciseNames: string[]): void {
  useEffect(() => {
    let mounted = true;

    async function prefetch() {
      for (const name of exerciseNames) {
        if (!mounted) break;
        try {
          await findBestMatchWithVariations(name);
        } catch (err) {
          console.warn(`Failed to prefetch ${name}:`, err);
        }
      }
    }

    if (exerciseNames.length > 0) {
      prefetch();
    }

    return () => {
      mounted = false;
    };
  }, [exerciseNames]);
}
