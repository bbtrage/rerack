import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { Workout, WorkoutExercise, ExerciseSet } from '../types';
import { saveWorkout } from '../utils/storage';
import { exerciseDatabase } from '../data/exercises';

const LogWorkout: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startTime] = useState(new Date().toISOString());

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
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(updatedExercises);
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
      alert('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      alert('Please add at least one exercise');
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
    
    // Reset form
    setWorkoutName('');
    setWorkoutNotes('');
    setExercises([]);
    
    alert('Workout saved successfully! 💪');
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
        {/* Workout Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-6 mb-6"
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
              className="glass-dark rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{getExerciseName(exercise.exerciseId)}</h3>
                <button
                  onClick={() => removeExercise(exerciseIndex)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center space-x-3">
                    <div className="w-12 text-center text-gray-400 font-medium">
                      {setIndex + 1}
                    </div>
                    <input
                      type="number"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                      placeholder="Weight"
                      className="flex-1 px-4 py-2 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none"
                    />
                    <span className="text-gray-400">×</span>
                    <input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                      placeholder="Reps"
                      className="flex-1 px-4 py-2 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none"
                    />
                    <button
                      onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        set.completed 
                          ? 'bg-accent-green text-white' 
                          : 'bg-dark-lighter border border-white/10 text-gray-400'
                      }`}
                    >
                      {set.completed ? '✓' : ''}
                    </button>
                    <button
                      onClick={() => removeSet(exerciseIndex, setIndex)}
                      className="w-10 h-10 rounded-lg bg-dark-lighter border border-white/10 text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(exerciseIndex)}
                className="mt-4 w-full py-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:border-accent-blue hover:text-accent-blue transition-all"
              >
                + Add Set
              </button>
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
        {showExercisePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExercisePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Select Exercise</h2>
                <button
                  onClick={() => setShowExercisePicker(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                className="w-full px-4 py-3 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none mb-4"
                autoFocus
              />

              <div className="overflow-y-auto flex-1">
                <div className="space-y-2">
                  {filteredExercises.map(exercise => (
                    <motion.button
                      key={exercise.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addExercise(exercise.id)}
                      className="w-full text-left px-4 py-3 bg-dark-lighter rounded-lg hover:bg-white/10 transition-all"
                    >
                      <div className="font-semibold">{exercise.name}</div>
                      <div className="text-sm text-gray-400">
                        {exercise.primaryMuscles.join(', ')}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default LogWorkout;
