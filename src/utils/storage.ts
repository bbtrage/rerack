import localforage from 'localforage';
import { Workout, PersonalRecord } from '../types';

// Configure localforage
const workoutStore = localforage.createInstance({
  name: 'rerack',
  storeName: 'workouts'
});

const prStore = localforage.createInstance({
  name: 'rerack',
  storeName: 'personalRecords'
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
