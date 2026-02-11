import { UserProfile, UserRank, Achievement, AchievementType, Workout } from '../types';

// XP thresholds for each level
const XP_PER_LEVEL = 1000;

// Calculate level from XP
export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

// Calculate XP needed for next level
export const getXPForNextLevel = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  return currentLevel * XP_PER_LEVEL;
};

// Calculate progress to next level (0-100%)
export const getLevelProgress = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  const xpInCurrentLevel = currentXP - ((currentLevel - 1) * XP_PER_LEVEL);
  return (xpInCurrentLevel / XP_PER_LEVEL) * 100;
};

// Determine rank based on level
export const getRankFromLevel = (level: number): UserRank => {
  if (level >= 50) return 'legend';
  if (level >= 30) return 'elite';
  if (level >= 15) return 'advanced';
  if (level >= 5) return 'intermediate';
  return 'beginner';
};

// Calculate XP earned from a workout
export const calculateWorkoutXP = (workout: Workout): number => {
  let xp = 50; // Base XP for completing a workout
  
  // Bonus for number of exercises
  xp += workout.exercises.length * 10;
  
  // Bonus for total sets
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  xp += totalSets * 5;
  
  // Bonus for duration (if available)
  if (workout.duration && workout.duration >= 30) {
    xp += Math.min(workout.duration, 120); // Cap at 120 bonus
  }
  
  return xp;
};

// Achievement definitions
export const achievementDefinitions: Record<AchievementType, Omit<Achievement, 'unlockedAt'>> = {
  first_workout: {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🎯',
    requirement: 1,
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    icon: '🔥',
    requirement: 7,
  },
  streak_30: {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day workout streak',
    icon: '⚡',
    requirement: 30,
  },
  workouts_100: {
    id: 'workouts_100',
    name: 'Century Club',
    description: 'Complete 100 workouts',
    icon: '💯',
    requirement: 100,
  },
  thousand_club: {
    id: 'thousand_club',
    name: '1000lb Club',
    description: 'Total 1000+ lbs in squat + bench + deadlift',
    icon: '🏆',
    requirement: 1000,
  },
  pr_machine: {
    id: 'pr_machine',
    name: 'PR Machine',
    description: 'Hit 10 personal records',
    icon: '📈',
    requirement: 10,
  },
  chest_master: {
    id: 'chest_master',
    name: 'Chest Master',
    description: 'Lift 50,000 lbs total chest volume',
    icon: '💪',
    requirement: 50000,
  },
  leg_legend: {
    id: 'leg_legend',
    name: 'Leg Legend',
    description: 'Lift 100,000 lbs total leg volume',
    icon: '🦵',
    requirement: 100000,
  },
  back_boss: {
    id: 'back_boss',
    name: 'Back Boss',
    description: 'Lift 50,000 lbs total back volume',
    icon: '🎖️',
    requirement: 50000,
  },
  shoulder_specialist: {
    id: 'shoulder_specialist',
    name: 'Shoulder Specialist',
    description: 'Lift 30,000 lbs total shoulder volume',
    icon: '🌟',
    requirement: 30000,
  },
  arm_artist: {
    id: 'arm_artist',
    name: 'Arm Artist',
    description: 'Lift 25,000 lbs total arm volume',
    icon: '💪',
    requirement: 25000,
  },
};

// Check if an achievement should be unlocked
export const checkAchievementUnlock = (
  achievementId: AchievementType,
  profile: UserProfile,
  workouts: Workout[]
): boolean => {
  const achievement = achievementDefinitions[achievementId];
  
  // Check if already unlocked
  if (profile.achievements.some(a => a.id === achievementId)) {
    return false;
  }
  
  switch (achievementId) {
    case 'first_workout':
      return profile.totalWorkouts >= 1;
    case 'streak_7':
      return profile.currentStreak >= 7;
    case 'streak_30':
      return profile.currentStreak >= 30;
    case 'workouts_100':
      return profile.totalWorkouts >= 100;
    case 'pr_machine':
      return profile.totalPRs >= 10;
    // Muscle-specific achievements would need volume calculation
    default:
      return false;
  }
};

// Calculate current streak from workouts
export const calculateStreak = (workouts: Workout[]): number => {
  if (workouts.length === 0) return 0;
  
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedWorkouts.length; i++) {
    const workoutDate = new Date(sortedWorkouts[i].date);
    workoutDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);
    
    const daysDiff = Math.floor((expectedDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      streak++;
    } else if (daysDiff > 0) {
      break;
    }
  }
  
  return streak;
};

// Initialize default user profile
export const createDefaultProfile = (): UserProfile => ({
  xp: 0,
  level: 1,
  rank: 'beginner',
  achievements: [],
  currentStreak: 0,
  longestStreak: 0,
  totalWorkouts: 0,
  totalVolume: 0,
  totalPRs: 0,
});
