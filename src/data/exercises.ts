import { ExerciseDefinition } from '../types';

export const exerciseDatabase: ExerciseDefinition[] = [
  // Chest Exercises
  {
    id: 'bench-press',
    name: 'Bench Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    category: 'push'
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    category: 'push'
  },
  {
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    category: 'push'
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'abs'],
    category: 'push'
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    category: 'push'
  },

  // Back Exercises
  {
    id: 'deadlift',
    name: 'Deadlift',
    primaryMuscles: ['back', 'hamstrings'],
    secondaryMuscles: ['glutes', 'forearms', 'traps'],
    category: 'pull'
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    primaryMuscles: ['lats', 'back'],
    secondaryMuscles: ['biceps', 'forearms'],
    category: 'pull'
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    primaryMuscles: ['back', 'lats'],
    secondaryMuscles: ['biceps', 'forearms'],
    category: 'pull'
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    primaryMuscles: ['lats', 'back'],
    secondaryMuscles: ['biceps', 'forearms'],
    category: 'pull'
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    category: 'pull'
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    primaryMuscles: ['back', 'lats'],
    secondaryMuscles: ['biceps', 'forearms'],
    category: 'pull'
  },

  // Shoulder Exercises
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'traps'],
    category: 'push'
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    category: 'push'
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    category: 'push'
  },
  {
    id: 'front-raise',
    name: 'Front Raise',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    category: 'push'
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    category: 'pull'
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    category: 'push'
  },

  // Arms - Biceps
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    category: 'pull'
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    category: 'pull'
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    category: 'pull'
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    category: 'pull'
  },

  // Arms - Triceps
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    category: 'push'
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    category: 'push'
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    category: 'push'
  },
  {
    id: 'close-grip-bench',
    name: 'Close Grip Bench Press',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    category: 'push'
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    category: 'push'
  },

  // Legs - Quads
  {
    id: 'squat',
    name: 'Squat',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'abs'],
    category: 'legs'
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'abs'],
    category: 'legs'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    category: 'legs'
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    category: 'legs'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    category: 'legs'
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    category: 'legs'
  },

  // Legs - Hamstrings
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['glutes', 'back'],
    category: 'legs'
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    category: 'legs'
  },
  {
    id: 'nordic-curls',
    name: 'Nordic Curls',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    category: 'legs'
  },

  // Legs - Glutes
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    category: 'legs'
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    category: 'legs'
  },

  // Legs - Calves
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    category: 'legs'
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    category: 'legs'
  },

  // Core
  {
    id: 'plank',
    name: 'Plank',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['shoulders'],
    category: 'core'
  },
  {
    id: 'crunches',
    name: 'Crunches',
    primaryMuscles: ['abs'],
    secondaryMuscles: [],
    category: 'core'
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    primaryMuscles: ['abs'],
    secondaryMuscles: [],
    category: 'core'
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['forearms'],
    category: 'core'
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['shoulders'],
    category: 'core'
  },

  // Traps
  {
    id: 'shrugs',
    name: 'Shrugs',
    primaryMuscles: ['traps'],
    secondaryMuscles: ['forearms'],
    category: 'pull'
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    primaryMuscles: ['traps', 'shoulders'],
    secondaryMuscles: [],
    category: 'pull'
  },

  // Forearms
  {
    id: 'wrist-curl',
    name: 'Wrist Curl',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    category: 'pull'
  },
  {
    id: 'farmers-walk',
    name: "Farmer's Walk",
    primaryMuscles: ['forearms'],
    secondaryMuscles: ['traps', 'abs'],
    category: 'pull'
  },
];

export const getExerciseById = (id: string): ExerciseDefinition | undefined => {
  return exerciseDatabase.find(ex => ex.id === id);
};

export const getExercisesByMuscle = (muscle: string): ExerciseDefinition[] => {
  return exerciseDatabase.filter(ex => 
    ex.primaryMuscles.includes(muscle as any) || 
    ex.secondaryMuscles.includes(muscle as any)
  );
};

export const getExercisesByCategory = (category: string): ExerciseDefinition[] => {
  return exerciseDatabase.filter(ex => ex.category === category);
};
