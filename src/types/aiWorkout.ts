/**
 * Types for AI-generated workouts
 */

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Abs'
  | 'Core'
  | 'Obliques'
  | 'Traps'
  | 'Lats'
  | 'Rear Delts'
  | 'Front Delts'
  | 'Side Delts';

export type WorkoutDuration = 15 | 30 | 45 | 60 | 90;

export type WorkoutLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type Equipment =
  | 'Full Gym'
  | 'Dumbbells Only'
  | 'Barbell + Bench'
  | 'Bodyweight'
  | 'Home Gym'
  | 'Cables + Machines';

export type WorkoutGoal = 'Strength' | 'Hypertrophy' | 'Endurance';

export interface AIWorkoutParams {
  selectedMuscles: MuscleGroup[];
  duration: WorkoutDuration;
  level: WorkoutLevel;
  equipment: Equipment;
  goal?: WorkoutGoal;
}

export interface AIExercise {
  name: string;
  sets: number;
  reps: string; // Can be "8", "8-12", "AMRAP", etc.
  restSeconds: number;
  notes?: string;
}

export interface AIMuscleGroupWorkout {
  name: MuscleGroup;
  totalSets: number;
  note?: string;
  exercises: AIExercise[];
}

export interface AIWorkout {
  workoutName: string;
  estimatedTime: number;
  muscleGroups: AIMuscleGroupWorkout[];
  warmup?: string;
  tips?: string[];
}

export interface SavedAIWorkout {
  id: string;
  user_id?: string;
  workout_name: string;
  muscle_groups: MuscleGroup[];
  config: AIWorkoutParams;
  workout_data: AIWorkout;
  created_at: string;
}

export interface RateLimitInfo {
  count: number;
  lastReset: string;
  limit: number;
}
