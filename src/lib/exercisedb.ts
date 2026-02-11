/**
 * ExerciseDB API Client
 * Free API for exercise data and animated GIFs
 * Documentation: https://exercisedb-api.vercel.app
 */

const BASE_URL = 'https://exercisedb-api.vercel.app/api/v1';

export interface ExerciseDBExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

export interface ExerciseDBResponse {
  data: ExerciseDBExercise[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Search exercises by name
 */
export async function searchExercises(query: string): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises?search=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`ExerciseDB API error: ${response.status}`);
      return [];
    }

    const result: ExerciseDBResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Failed to fetch exercises from ExerciseDB:', error);
    return [];
  }
}

/**
 * Get exercises by body part
 */
export async function getExercisesByBodyPart(bodyPart: string): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`ExerciseDB API error: ${response.status}`);
      return [];
    }

    const result: ExerciseDBResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Failed to fetch exercises by body part:', error);
    return [];
  }
}

/**
 * Get exercises by equipment
 */
export async function getExercisesByEquipment(equipment: string): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises/equipment/${encodeURIComponent(equipment)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`ExerciseDB API error: ${response.status}`);
      return [];
    }

    const result: ExerciseDBResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Failed to fetch exercises by equipment:', error);
    return [];
  }
}

/**
 * Get all exercises with pagination
 */
export async function getAllExercises(
  limit: number = 100,
  offset: number = 0
): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`ExerciseDB API error: ${response.status}`);
      return [];
    }

    const result: ExerciseDBResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Failed to fetch all exercises:', error);
    return [];
  }
}

/**
 * Get exercises by target muscle
 */
export async function getExercisesByTargetMuscle(targetMuscle: string): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises/target/${encodeURIComponent(targetMuscle)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`ExerciseDB API error: ${response.status}`);
      return [];
    }

    const result: ExerciseDBResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Failed to fetch exercises by target muscle:', error);
    return [];
  }
}

/**
 * Build GIF URL from exercise ID
 */
export function getGifUrl(exerciseId: string): string {
  return `https://static.exercisedb.dev/media/${exerciseId}.gif`;
}
