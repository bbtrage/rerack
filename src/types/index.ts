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

// Gamification types
export type UserRank = 'beginner' | 'intermediate' | 'advanced' | 'elite' | 'legend';

export type AchievementType = 
  | 'first_workout' | 'streak_7' | 'streak_30' | 'workouts_100'
  | 'thousand_club' | 'pr_machine' | 'chest_master' | 'leg_legend'
  | 'back_boss' | 'shoulder_specialist' | 'arm_artist';

export interface Achievement {
  id: AchievementType;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  unlockedAt?: string; // ISO date when unlocked
}

export interface UserProfile {
  xp: number;
  level: number;
  rank: UserRank;
  achievements: Achievement[];
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalVolume: number;
  totalPRs: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  date: string; // ISO date
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: 'push' | 'pull' | 'legs' | 'fullBody' | 'custom';
  exercises: {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
    targetWeight?: number;
  }[];
}
