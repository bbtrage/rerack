import localforage from 'localforage';
import { Workout, PersonalRecord, UserProfile, WorkoutTemplate } from '../types';
import { createDefaultProfile } from './gamification';

// Configure localforage
const workoutStore = localforage.createInstance({
  name: 'rerack',
  storeName: 'workouts'
});

const prStore = localforage.createInstance({
  name: 'rerack',
  storeName: 'personalRecords'
});

const profileStore = localforage.createInstance({
  name: 'rerack',
  storeName: 'profile'
});

const templateStore = localforage.createInstance({
  name: 'rerack',
  storeName: 'templates'
});

// Workouts
export const saveWorkout = async (workout: Workout): Promise<void> => {
  await workoutStore.setItem(workout.id, workout);
};

export const getWorkout = async (id: string): Promise<Workout | null> => {
  return await workoutStore.getItem(id);
};

export const getAllWorkouts = async (): Promise<Workout[]> => {
  const workouts: Workout[] = [];
  await workoutStore.iterate((value: any) => {
    workouts.push(value as Workout);
  });
  return workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const deleteWorkout = async (id: string): Promise<void> => {
  await workoutStore.removeItem(id);
};

export const updateWorkout = async (workout: Workout): Promise<void> => {
  await workoutStore.setItem(workout.id, workout);
};

// Personal Records
export const savePersonalRecord = async (pr: PersonalRecord): Promise<void> => {
  const key = `${pr.exerciseId}-${pr.weight}-${pr.reps}`;
  await prStore.setItem(key, pr);
};

export const getAllPersonalRecords = async (): Promise<PersonalRecord[]> => {
  const prs: PersonalRecord[] = [];
  await prStore.iterate((value: any) => {
    prs.push(value as PersonalRecord);
  });
  return prs;
};

export const getPersonalRecordForExercise = async (exerciseId: string): Promise<PersonalRecord | null> => {
  const allPRs = await getAllPersonalRecords();
  const exercisePRs = allPRs.filter(pr => pr.exerciseId === exerciseId);
  
  if (exercisePRs.length === 0) return null;
  
  // Find the best PR (highest weight * reps)
  return exercisePRs.reduce((best, current) => {
    const bestScore = best.weight * best.reps;
    const currentScore = current.weight * current.reps;
    return currentScore > bestScore ? current : best;
  });
};

// User Profile
export const getUserProfile = async (): Promise<UserProfile> => {
  const profile = await profileStore.getItem<UserProfile>('profile');
  return profile || createDefaultProfile();
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  await profileStore.setItem('profile', profile);
};

// Workout Templates
export const saveTemplate = async (template: WorkoutTemplate): Promise<void> => {
  await templateStore.setItem(template.id, template);
};

export const getAllTemplates = async (): Promise<WorkoutTemplate[]> => {
  const templates: WorkoutTemplate[] = [];
  await templateStore.iterate((value: any) => {
    templates.push(value as WorkoutTemplate);
  });
  return templates;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await templateStore.removeItem(id);
};
