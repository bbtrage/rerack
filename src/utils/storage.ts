import localforage from 'localforage';
import { Workout, PersonalRecord, UserProfile, WorkoutTemplate } from '../types';
import { createDefaultProfile } from './gamification';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

// Offline queue store for pending sync operations
const syncQueueStore = localforage.createInstance({
  name: 'rerack',
  storeName: 'syncQueue'
});

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'workouts' | 'user_profiles' | 'personal_records';
  data: any;
  timestamp: number;
}

// Helper to check if we should use Supabase
const shouldUseSupabase = async (): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data } = await supabase.auth.getUser();
  return !!data.user;
};

// Add operation to sync queue
const addToSyncQueue = async (operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<void> => {
  const syncOp: SyncOperation = {
    ...operation,
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
  await syncQueueStore.setItem(syncOp.id, syncOp);
};

// Workouts
export const saveWorkout = async (workout: Workout): Promise<void> => {
  const useSupabase = await shouldUseSupabase();

  // Save to local cache first
  await workoutStore.setItem(workout.id, workout);

  if (useSupabase && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('workouts').upsert({
        id: workout.id,
        user_id: user.id,
        name: workout.name,
        date: workout.date,
        notes: workout.notes || null,
        exercises: workout.exercises,
        duration: workout.duration,
        start_time: workout.startTime || null,
        end_time: workout.endTime || null,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving workout to Supabase:', err);
      // Queue for later sync
      await addToSyncQueue({
        type: 'create',
        table: 'workouts',
        data: workout
      });
    }
  }
};

export const getWorkout = async (id: string): Promise<Workout | null> => {
  const useSupabase = await shouldUseSupabase();

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const workout: Workout = {
          id: data.id,
          name: data.name,
          date: data.date,
          notes: data.notes || undefined,
          exercises: data.exercises,
          duration: data.duration,
          startTime: data.start_time || undefined,
          endTime: data.end_time || undefined
        };
        // Cache locally
        await workoutStore.setItem(workout.id, workout);
        return workout;
      }
    } catch (err) {
      console.error('Error fetching workout from Supabase:', err);
    }
  }

  // Fallback to local storage
  return await workoutStore.getItem(id);
};

export const getAllWorkouts = async (): Promise<Workout[]> => {
  const useSupabase = await shouldUseSupabase();

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const workouts: Workout[] = data.map(w => ({
          id: w.id,
          name: w.name,
          date: w.date,
          notes: w.notes || undefined,
          exercises: w.exercises,
          duration: w.duration,
          startTime: w.start_time || undefined,
          endTime: w.end_time || undefined
        }));

        // Cache all workouts locally
        for (const workout of workouts) {
          await workoutStore.setItem(workout.id, workout);
        }

        return workouts;
      }
    } catch (err) {
      console.error('Error fetching workouts from Supabase:', err);
    }
  }

  // Fallback to local storage
  const workouts: Workout[] = [];
  await workoutStore.iterate((value: any) => {
    workouts.push(value as Workout);
  });
  return workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const deleteWorkout = async (id: string): Promise<void> => {
  const useSupabase = await shouldUseSupabase();

  // Delete from local cache
  await workoutStore.removeItem(id);

  if (useSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting workout from Supabase:', err);
      // Queue for later sync
      await addToSyncQueue({
        type: 'delete',
        table: 'workouts',
        data: { id }
      });
    }
  }
};

export const updateWorkout = async (workout: Workout): Promise<void> => {
  await saveWorkout(workout);
};

// Personal Records
export const savePersonalRecord = async (pr: PersonalRecord): Promise<void> => {
  const useSupabase = await shouldUseSupabase();
  const key = `${pr.exerciseId}-${pr.weight}-${pr.reps}`;

  // Save to local cache
  await prStore.setItem(key, pr);

  if (useSupabase && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('personal_records').insert({
        user_id: user.id,
        exercise_id: pr.exerciseId,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving personal record to Supabase:', err);
      await addToSyncQueue({
        type: 'create',
        table: 'personal_records',
        data: pr
      });
    }
  }
};

export const getAllPersonalRecords = async (): Promise<PersonalRecord[]> => {
  const useSupabase = await shouldUseSupabase();

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const prs: PersonalRecord[] = data.map(pr => ({
          exerciseId: pr.exercise_id,
          weight: pr.weight,
          reps: pr.reps,
          date: pr.date
        }));

        // Cache locally
        for (const pr of prs) {
          const key = `${pr.exerciseId}-${pr.weight}-${pr.reps}`;
          await prStore.setItem(key, pr);
        }

        return prs;
      }
    } catch (err) {
      console.error('Error fetching personal records from Supabase:', err);
    }
  }

  // Fallback to local storage
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
  const useSupabase = await shouldUseSupabase();

  if (useSupabase && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create default one
        if (error.code === 'PGRST116') {
          const defaultProfile = createDefaultProfile();
          await saveUserProfile(defaultProfile);
          return defaultProfile;
        }
        throw error;
      }

      if (data) {
        const profile: UserProfile = {
          xp: data.xp,
          level: data.level,
          rank: data.rank,
          achievements: data.achievements,
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          totalWorkouts: data.total_workouts,
          totalVolume: data.total_volume,
          totalPRs: data.total_prs
        };

        // Cache locally
        await profileStore.setItem('profile', profile);
        return profile;
      }
    } catch (err) {
      console.error('Error fetching user profile from Supabase:', err);
    }
  }

  // Fallback to local storage
  const profile = await profileStore.getItem<UserProfile>('profile');
  return profile || createDefaultProfile();
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  const useSupabase = await shouldUseSupabase();

  // Save to local cache
  await profileStore.setItem('profile', profile);

  if (useSupabase && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('user_profiles').upsert({
        user_id: user.id,
        xp: profile.xp,
        level: profile.level,
        rank: profile.rank,
        achievements: profile.achievements,
        current_streak: profile.currentStreak,
        longest_streak: profile.longestStreak,
        total_workouts: profile.totalWorkouts,
        total_volume: profile.totalVolume,
        total_prs: profile.totalPRs,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving user profile to Supabase:', err);
      await addToSyncQueue({
        type: 'update',
        table: 'user_profiles',
        data: profile
      });
    }
  }
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

// Sync offline data to Supabase
export const syncOfflineData = async (): Promise<{ success: boolean; synced: number; failed: number }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, synced: 0, failed: 0 };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, synced: 0, failed: 0 };
  }

  const operations: SyncOperation[] = [];
  await syncQueueStore.iterate((value: any) => {
    operations.push(value as SyncOperation);
  });

  if (operations.length === 0) {
    return { success: true, synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  // Process operations in order
  for (const op of operations.sort((a, b) => a.timestamp - b.timestamp)) {
    try {
      if (op.table === 'workouts') {
        if (op.type === 'create' || op.type === 'update') {
          const workout = op.data as Workout;
          await supabase.from('workouts').upsert({
            id: workout.id,
            user_id: user.id,
            name: workout.name,
            date: workout.date,
            notes: workout.notes || null,
            exercises: workout.exercises,
            duration: workout.duration,
            start_time: workout.startTime || null,
            end_time: workout.endTime || null
          });
        } else if (op.type === 'delete') {
          await supabase.from('workouts').delete().eq('id', op.data.id);
        }
      } else if (op.table === 'user_profiles') {
        const profile = op.data as UserProfile;
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          xp: profile.xp,
          level: profile.level,
          rank: profile.rank,
          achievements: profile.achievements,
          current_streak: profile.currentStreak,
          longest_streak: profile.longestStreak,
          total_workouts: profile.totalWorkouts,
          total_volume: profile.totalVolume,
          total_prs: profile.totalPRs
        });
      } else if (op.table === 'personal_records') {
        const pr = op.data as PersonalRecord;
        await supabase.from('personal_records').insert({
          user_id: user.id,
          exercise_id: pr.exerciseId,
          weight: pr.weight,
          reps: pr.reps,
          date: pr.date
        });
      }

      // Remove from queue on success
      await syncQueueStore.removeItem(op.id);
      synced++;
    } catch (err) {
      console.error('Error syncing operation:', op, err);
      failed++;
    }
  }

  return { success: failed === 0, synced, failed };
};

// Migrate local data to cloud (one-time migration for existing users)
export const migrateLocalToCloud = async (): Promise<{ success: boolean; workouts: number; profile: boolean }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, workouts: 0, profile: false };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, workouts: 0, profile: false };
  }

  let workoutCount = 0;
  let profileMigrated = false;

  try {
    // Migrate workouts
    const localWorkouts: Workout[] = [];
    await workoutStore.iterate((value: any) => {
      localWorkouts.push(value as Workout);
    });

    for (const workout of localWorkouts) {
      await supabase.from('workouts').upsert({
        id: workout.id,
        user_id: user.id,
        name: workout.name,
        date: workout.date,
        notes: workout.notes || null,
        exercises: workout.exercises,
        duration: workout.duration,
        start_time: workout.startTime || null,
        end_time: workout.endTime || null
      });
      workoutCount++;
    }

    // Migrate profile
    const localProfile = await profileStore.getItem<UserProfile>('profile');
    if (localProfile) {
      await supabase.from('user_profiles').upsert({
        user_id: user.id,
        xp: localProfile.xp,
        level: localProfile.level,
        rank: localProfile.rank,
        achievements: localProfile.achievements,
        current_streak: localProfile.currentStreak,
        longest_streak: localProfile.longestStreak,
        total_workouts: localProfile.totalWorkouts,
        total_volume: localProfile.totalVolume,
        total_prs: localProfile.totalPRs
      });
      profileMigrated = true;
    }

    // Migrate personal records
    const localPRs: PersonalRecord[] = [];
    await prStore.iterate((value: any) => {
      localPRs.push(value as PersonalRecord);
    });

    for (const pr of localPRs) {
      await supabase.from('personal_records').insert({
        user_id: user.id,
        exercise_id: pr.exerciseId,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date
      });
    }

    return { success: true, workouts: workoutCount, profile: profileMigrated };
  } catch (err) {
    console.error('Error migrating local data to cloud:', err);
    return { success: false, workouts: workoutCount, profile: profileMigrated };
  }
};

// Check if user has local data that can be migrated
export const hasLocalData = async (): Promise<boolean> => {
  let hasData = false;
  
  await workoutStore.iterate(() => {
    hasData = true;
    return; // Break iteration
  });

  if (hasData) return true;

  const profile = await profileStore.getItem('profile');
  return !!profile;
};

// Clear local data after successful migration
export const clearLocalData = async (): Promise<void> => {
  await workoutStore.clear();
  await prStore.clear();
  await profileStore.clear();
  await syncQueueStore.clear();
};
