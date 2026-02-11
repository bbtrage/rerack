import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { exerciseDatabase } from '../data/exercises';
import ExerciseDemo from '../components/ExerciseDemo';
import GuidedReps from '../components/GuidedReps';

const ExerciseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showGuidedReps, setShowGuidedReps] = useState(false);

  const categories = ['all', 'push', 'pull', 'legs', 'core'];

  const filteredExercises = exerciseDatabase.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedExerciseData = exerciseDatabase.find(ex => ex.id === selectedExercise);

  return (
    <PageLayout title="Exercise Library">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Exercise List */}
        <div>
          <div className="glass-dark rounded-2xl p-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises..."
              className="w-full px-4 py-3 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none mb-4"
            />
            
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-accent-blue text-white'
                      : 'bg-dark-lighter text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedExercise(exercise.id)}
                className={`glass-dark rounded-xl p-4 cursor-pointer transition-all hover:bg-white/10 ${
                  selectedExercise === exercise.id ? 'ring-2 ring-accent-blue' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-accent-blue/20 text-accent-blue rounded">
                        {exercise.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {exercise.primaryMuscles.length + exercise.secondaryMuscles.length} muscles
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl">
                    {exercise.category === 'push' && '💪'}
                    {exercise.category === 'pull' && '🔙'}
                    {exercise.category === 'legs' && '🦵'}
                    {exercise.category === 'core' && '🎯'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Exercise Details */}
        <div className="sticky top-6">
          {selectedExerciseData ? (
            <ExerciseDemo
              exerciseName={selectedExerciseData.name}
              onStartGuidedReps={() => setShowGuidedReps(true)}
              showGuidedButton={true}
            />
          ) : (
            <div className="glass-dark rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-gray-400">Select an exercise to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Guided Reps Modal */}
      <AnimatePresence>
        {showGuidedReps && selectedExerciseData && (
          <GuidedReps
            exerciseName={selectedExerciseData.name}
            onClose={() => setShowGuidedReps(false)}
            onComplete={(reps) => {
              console.log(`Completed ${reps} reps of ${selectedExerciseData.name}`);
              setShowGuidedReps(false);
            }}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default ExerciseLibrary;
