import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import RestTimer, { QuickAdjustButtons, SetCompleteButton } from '../components/RestTimer';
import { useToast } from '../components/Toast';
import { Workout, WorkoutExercise, ExerciseSet } from '../types';
import { saveWorkout, getUserProfile, saveUserProfile, getAllWorkouts } from '../utils/storage';
import { exerciseDatabase } from '../data/exercises';
import { calculateWorkoutXP, calculateStreak } from '../utils/gamification';
import { Clock, X, Search, Trash2, Eye } from 'lucide-react';
import ExerciseDemo from '../components/ExerciseDemo';
import GuidedReps from '../components/GuidedReps';
import { useExerciseGifUrl } from '../hooks/useExerciseGif';

// Small GIF preview component for workout page
const ExerciseGifPreview: React.FC<{ exerciseName: string; onClick?: () => void }> = ({ 
  exerciseName, 
  onClick 
}) => {
  const gifUrl = useExerciseGifUrl(exerciseName);

  if (!gifUrl) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer bg-dark-bg border border-white/10"
    >
      <img
        src={gifUrl}
        alt={exerciseName}
        className="w-full h-full object-cover"
        style={{
          filter: 'invert(1) hue-rotate(180deg) brightness(0.85) contrast(1.1)',
        }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-1">
        <Eye className="w-4 h-4 text-white" />
      </div>
    </motion.div>
  );
};

const LogWorkout: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startTime] = useState(new Date().toISOString());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showExerciseDemo, setShowExerciseDemo] = useState<string | null>(null);
  const [showGuidedReps, setShowGuidedReps] = useState<string | null>(null);
  const restDuration = 90; // default 90 seconds
  const { showToast } = useToast();

  // Workout timer
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredExercises = exerciseDatabase.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addExercise = (exerciseId: string) => {
    const newExercise: WorkoutExercise = {
      exerciseId,
      sets: [{ reps: 0, weight: 0, completed: false }],
      notes: ''
    };
    setExercises([...exercises, newExercise]);
    setShowExercisePicker(false);
    setSearchTerm('');
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    updatedExercises[exerciseIndex].sets.push({ 
      reps: lastSet?.reps || 0, 
      weight: lastSet?.weight || 0, 
      completed: false 
    });
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
    const updatedExercises = [...exercises];
    const wasCompleted = updatedExercises[exerciseIndex].sets[setIndex].completed;
    
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(updatedExercises);

    // Start rest timer when a set is completed
    if (field === 'completed' && value === true && !wasCompleted) {
      setShowRestTimer(true);
    }
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises(exercises.filter((_, i) => i !== exerciseIndex));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      removeExercise(exerciseIndex);
    } else {
      setExercises(updatedExercises);
    }
  };

  const saveWorkoutData = async () => {
    if (!workoutName.trim()) {
      showToast('Please enter a workout name', 'warning');
      return;
    }

    if (exercises.length === 0) {
      showToast('Please add at least one exercise', 'warning');
      return;
    }

    const endTime = new Date().toISOString();
    const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);

    const workout: Workout = {
      id: `workout-${Date.now()}`,
      date: new Date().toISOString(),
      name: workoutName,
      notes: workoutNotes,
      exercises,
      duration,
      startTime,
      endTime
    };

    await saveWorkout(workout);
    
    // Award XP and update profile
    const profile = await getUserProfile();
    const xpEarned = calculateWorkoutXP(workout);
    profile.xp += xpEarned;
    
    // Update streak
    const allWorkouts = await getAllWorkouts();
    profile.currentStreak = calculateStreak(allWorkouts);
    profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);
    
    await saveUserProfile(profile);
    
    // Reset form
    setWorkoutName('');
    setWorkoutNotes('');
    setExercises([]);
    
    showToast(`Workout saved! +${xpEarned} XP earned 💪`, 'success');
    if (onComplete) onComplete();
  };

  const getExerciseName = (exerciseId: string) => {
    return exerciseDatabase.find(ex => ex.id === exerciseId)?.name || exerciseId;
  };

  return (
    <PageLayout 
      title="Log Workout"
      action={
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveWorkoutData}
          className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-blue/50 transition-all"
        >
          Save Workout
        </motion.button>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Workout Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-4 mb-6 border border-white/10"
        >
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-accent-blue" />
            <span className="text-sm text-gray-400">Workout Duration:</span>
            <span className="text-2xl font-bold text-accent-blue">{formatElapsedTime(elapsedTime)}</span>
          </div>
        </motion.div>

        {/* Workout Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-6 mb-6 border border-white/10"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Workout Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Chest Day, Leg Day"
                className="w-full px-4 py-3 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How are you feeling today?"
                rows={2}
                className="w-full px-4 py-3 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Exercises */}
        <div className="space-y-4 mb-6">
          {exercises.map((exercise, exerciseIndex) => (
            <motion.div
              key={exerciseIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-2xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <ExerciseGifPreview 
                    exerciseName={getExerciseName(exercise.exerciseId)} 
                    onClick={() => setShowExerciseDemo(exercise.exerciseId)}
                  />
                  <h3 className="text-xl font-bold">{getExerciseName(exercise.exerciseId)}</h3>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => removeExercise(exerciseIndex)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium mb-2 px-2">
                  <div className="col-span-1">Set</div>
                  <div className="col-span-5">Weight (lbs)</div>
                  <div className="col-span-5">Reps</div>
                  <div className="col-span-1"></div>
                </div>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-center text-gray-400 font-medium">
                      {setIndex + 1}
                    </div>
                    <div className="col-span-5">
                      <QuickAdjustButtons
                        value={set.weight}
                        onChange={(val) => updateSet(exerciseIndex, setIndex, 'weight', val)}
                        step={5}
                        label="lbs"
                      />
                    </div>
                    <div className="col-span-5">
                      <QuickAdjustButtons
                        value={set.reps}
                        onChange={(val) => updateSet(exerciseIndex, setIndex, 'reps', val)}
                        step={1}
                        label="reps"
                      />
                    </div>
                    <div className="col-span-1">
                      <SetCompleteButton
                        completed={set.completed}
                        onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => addSet(exerciseIndex)}
                  className="flex-1 py-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:border-accent-blue hover:text-accent-blue transition-all text-sm font-medium"
                >
                  + Add Set
                </button>
                {exercise.sets.length > 1 && (
                  <button
                    onClick={() => removeSet(exerciseIndex, exercise.sets.length - 1)}
                    className="px-4 py-2 border border-dashed border-red-400/20 rounded-lg text-red-400 hover:border-red-400 transition-all text-sm font-medium"
                  >
                    Remove Last
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Exercise Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowExercisePicker(true)}
          className="w-full py-4 glass-dark rounded-xl border border-dashed border-white/20 hover:border-accent-blue transition-all text-accent-blue font-semibold"
        >
          + Add Exercise
        </motion.button>

        {/* Exercise Picker Modal */}
        <AnimatePresence>
          {showExercisePicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowExercisePicker(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-dark rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-white/10"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Select Exercise</h2>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowExercisePicker(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search exercises..."
                    className="w-full pl-12 pr-4 py-3 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto flex-1">
                  <div className="space-y-2">
                    {filteredExercises.map(exercise => (
                      <motion.button
                        key={exercise.id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addExercise(exercise.id)}
                        className="w-full text-left px-4 py-3 bg-dark-lighter rounded-lg hover:bg-white/10 transition-all border border-white/5"
                      >
                        <div className="font-semibold">{exercise.name}</div>
                        <div className="text-sm text-gray-400 capitalize">
                          {exercise.primaryMuscles.join(', ')}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rest Timer */}
        <AnimatePresence>
          {showRestTimer && (
            <RestTimer
              duration={restDuration}
              onComplete={() => setShowRestTimer(false)}
              onSkip={() => setShowRestTimer(false)}
            />
          )}
        </AnimatePresence>

        {/* Exercise Demo Modal */}
        <AnimatePresence>
          {showExerciseDemo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowExerciseDemo(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <ExerciseDemo
                  exerciseName={getExerciseName(showExerciseDemo)}
                  onClose={() => setShowExerciseDemo(null)}
                  onStartGuidedReps={() => {
                    setShowGuidedReps(showExerciseDemo);
                    setShowExerciseDemo(null);
                  }}
                  showGuidedButton={true}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guided Reps Modal */}
        <AnimatePresence>
          {showGuidedReps && (
            <GuidedReps
              exerciseName={getExerciseName(showGuidedReps)}
              onClose={() => setShowGuidedReps(null)}
              onComplete={(reps) => {
                console.log(`Completed ${reps} reps`);
                setShowGuidedReps(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default LogWorkout;
