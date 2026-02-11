import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { Workout } from '../types';
import { getAllWorkouts, deleteWorkout } from '../utils/storage';
import { exerciseDatabase } from '../data/exercises';

const WorkoutHistory: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const allWorkouts = await getAllWorkouts();
    setWorkouts(allWorkouts);
    setLoading(false);
  };

  const handleDelete = async (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      await deleteWorkout(workoutId);
      loadWorkouts();
      setSelectedWorkout(null);
    }
  };

  const getExerciseName = (exerciseId: string) => {
    return exerciseDatabase.find(ex => ex.id === exerciseId)?.name || exerciseId;
  };

  const groupWorkoutsByMonth = (workouts: Workout[]) => {
    const grouped: { [key: string]: Workout[] } = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(workout);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <PageLayout title="Workout History">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (workouts.length === 0) {
    return (
      <PageLayout title="Workout History">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-2xl p-12 text-center"
        >
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold mb-2">No Workouts Yet</h2>
          <p className="text-gray-400">Your workout history will appear here.</p>
        </motion.div>
      </PageLayout>
    );
  }

  const groupedWorkouts = groupWorkoutsByMonth(workouts);

  return (
    <PageLayout title="Workout History">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Workout List */}
        <div className="space-y-6">
          {Object.entries(groupedWorkouts).map(([monthKey, monthWorkouts]) => {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            return (
              <div key={monthKey}>
                <h3 className="text-lg font-semibold text-gray-400 mb-3">{monthName}</h3>
                <div className="space-y-3">
                  {monthWorkouts.map((workout, index) => (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedWorkout(workout)}
                      className={`glass-dark rounded-xl p-4 cursor-pointer transition-all hover:bg-white/10 ${
                        selectedWorkout?.id === workout.id ? 'ring-2 ring-accent-blue' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{workout.name}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(workout.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        {workout.duration && (
                          <span className="text-sm text-accent-green">{workout.duration} min</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>🏋️ {workout.exercises.length} exercises</span>
                        <span>
                          📊 {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} sets
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Workout Details */}
        <div className="sticky top-6">
          {selectedWorkout ? (
            <motion.div
              key={selectedWorkout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedWorkout.name}</h2>
                  <p className="text-gray-400">
                    {new Date(selectedWorkout.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selectedWorkout.id)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>

              {selectedWorkout.notes && (
                <div className="mb-6 p-4 bg-dark-lighter rounded-lg">
                  <p className="text-sm text-gray-300">{selectedWorkout.notes}</p>
                </div>
              )}

              <div className="space-y-4">
                {selectedWorkout.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="border-l-2 border-accent-blue pl-4">
                    <h4 className="font-semibold mb-2">{getExerciseName(exercise.exerciseId)}</h4>
                    <div className="space-y-1">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center space-x-3 text-sm">
                          <span className="text-gray-400 w-8">Set {setIndex + 1}</span>
                          <span className={set.completed ? 'text-accent-green' : 'text-gray-400'}>
                            {set.weight} lbs × {set.reps} reps
                            {set.completed && ' ✓'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass-dark rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-gray-400">Select a workout to view details</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkoutHistory;
