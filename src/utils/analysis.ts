import { Workout, MuscleAnalysis, MuscleGroup, DashboardStats } from '../types';
import { exerciseDatabase } from '../data/exercises';

export const analyzeMuscles = (workouts: Workout[]): MuscleAnalysis[] => {
  const muscleData: Map<MuscleGroup, { volume: number; frequency: number; lastTrained: string | null }> = new Map();
  
  // Initialize all muscle groups
  const allMuscles: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'traps', 'lats'
  ];
  
  allMuscles.forEach(muscle => {
    muscleData.set(muscle, { volume: 0, frequency: 0, lastTrained: null });
  });
  
  // Analyze workouts
  workouts.forEach(workout => {
    const workoutDate = new Date(workout.date);
    
    workout.exercises.forEach(exercise => {
      const exerciseDefinition = exerciseDatabase.find(ex => ex.id === exercise.exerciseId);
      if (!exerciseDefinition) return;
      
      // Calculate volume for this exercise
      const totalVolume = exercise.sets.reduce((sum, set) => {
        if (set.completed) {
          return sum + (set.weight * set.reps);
        }
        return sum;
      }, 0);
      
      // Update primary muscles (full credit)
      exerciseDefinition.primaryMuscles.forEach(muscle => {
        const data = muscleData.get(muscle)!;
        data.volume += totalVolume;
        data.frequency += 1;
        
        if (!data.lastTrained || new Date(data.lastTrained) < workoutDate) {
          data.lastTrained = workout.date;
        }
      });
      
      // Update secondary muscles (half credit)
      exerciseDefinition.secondaryMuscles.forEach(muscle => {
        const data = muscleData.get(muscle)!;
        data.volume += totalVolume * 0.5;
        data.frequency += 0.5;
        
        if (!data.lastTrained || new Date(data.lastTrained) < workoutDate) {
          data.lastTrained = workout.date;
        }
      });
    });
  });
  
  // Convert to array and calculate ranks
  const analyses: MuscleAnalysis[] = Array.from(muscleData.entries()).map(([muscle, data]) => ({
    muscleGroup: muscle,
    totalVolume: data.volume,
    frequency: data.frequency,
    lastTrained: data.lastTrained,
    rank: 0
  }));
  
  // Calculate recency score and composite score
  const now = new Date();
  const scoredAnalyses = analyses.map(analysis => {
    const daysSinceLastTrained = analysis.lastTrained 
      ? Math.floor((now.getTime() - new Date(analysis.lastTrained).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    // Composite score: higher volume + higher frequency + more recent = better
    // Normalize and weight factors
    const volumeScore = analysis.totalVolume;
    const frequencyScore = analysis.frequency * 100;
    const recencyScore = Math.max(0, 100 - daysSinceLastTrained);
    
    const compositeScore = volumeScore + frequencyScore + recencyScore;
    
    return { ...analysis, compositeScore };
  });
  
  // Sort by composite score (higher is better)
  scoredAnalyses.sort((a, b) => b.compositeScore - a.compositeScore);
  
  // Assign ranks
  scoredAnalyses.forEach((analysis, index) => {
    analysis.rank = index + 1;
  });
  
  return scoredAnalyses.map(({ compositeScore, ...analysis }) => analysis);
};

export const getWeakestMuscles = (analyses: MuscleAnalysis[], count: number = 3): MuscleAnalysis[] => {
  return [...analyses]
    .sort((a, b) => b.rank - a.rank)
    .slice(0, count);
};

export const getStrongestMuscles = (analyses: MuscleAnalysis[], count: number = 3): MuscleAnalysis[] => {
  return [...analyses]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, count);
};

export const calculateDashboardStats = (workouts: Workout[]): DashboardStats => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Weekly workouts
  const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length;
  
  // Total volume (all time)
  const totalVolume = workouts.reduce((total, workout) => {
    return total + workout.exercises.reduce((workoutTotal, exercise) => {
      return workoutTotal + exercise.sets.reduce((setTotal, set) => {
        return set.completed ? setTotal + (set.weight * set.reps) : setTotal;
      }, 0);
    }, 0);
  }, 0);
  
  // Workout streak
  let streak = 0;
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let currentDate = now;
  for (const workout of sortedWorkouts) {
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }
  
  // Strongest and weakest muscles
  const muscleAnalyses = analyzeMuscles(workouts);
  const strongest = getStrongestMuscles(muscleAnalyses, 1)[0];
  const weakest = getWeakestMuscles(muscleAnalyses, 1)[0];
  
  return {
    weeklyWorkouts,
    totalVolume: Math.round(totalVolume),
    workoutStreak: streak,
    strongestMuscle: strongest?.muscleGroup || null,
    weakestMuscle: weakest?.muscleGroup || null
  };
};

export const getMuscleGroupLabel = (muscle: MuscleGroup): string => {
  const labels: Record<MuscleGroup, string> = {
    chest: 'Chest',
    back: 'Back',
    shoulders: 'Shoulders',
    biceps: 'Biceps',
    triceps: 'Triceps',
    forearms: 'Forearms',
    quads: 'Quadriceps',
    hamstrings: 'Hamstrings',
    glutes: 'Glutes',
    calves: 'Calves',
    abs: 'Abs',
    traps: 'Traps',
    lats: 'Lats'
  };
  return labels[muscle];
};
