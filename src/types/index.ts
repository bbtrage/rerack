export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'traps' | 'lats';

export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  category: 'push' | 'pull' | 'legs' | 'core';
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  date: string; // ISO string
  name: string;
  notes?: string;
  exercises: WorkoutExercise[];
  duration?: number; // minutes
  startTime?: string;
  endTime?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
}

export interface MuscleAnalysis {
  muscleGroup: MuscleGroup;
  totalVolume: number; // sets × reps × weight
  frequency: number; // times trained
  lastTrained: string | null; // date
  rank: number; // 1 = strongest, higher = weaker
}

export interface DashboardStats {
  weeklyWorkouts: number;
  totalVolume: number;
  workoutStreak: number;
  strongestMuscle: MuscleGroup | null;
  weakestMuscle: MuscleGroup | null;
}
