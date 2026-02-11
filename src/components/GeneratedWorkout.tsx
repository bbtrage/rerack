/**
 * GeneratedWorkout Component
 * Displays AI-generated workout with volume optimization details
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, RotateCw, Save, Play, Eye } from 'lucide-react';
import { AIWorkout } from '../types/aiWorkout';
import ExerciseDemo from './ExerciseDemo';

interface GeneratedWorkoutProps {
  workout: AIWorkout;
  onRegenerate: () => void;
  onSave: () => void;
  onStartWorkout: () => void;
  isSaving?: boolean;
}

const GeneratedWorkout: React.FC<GeneratedWorkoutProps> = ({
  workout,
  onRegenerate,
  onSave,
  onStartWorkout,
  isSaving = false,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Modal for Exercise Demo */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExercise(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <ExerciseDemo
                exerciseName={selectedExercise}
                onClose={() => setSelectedExercise(null)}
                showGuidedButton={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent mb-2">
              {workout.workoutName}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ~{workout.estimatedTime} min
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {workout.muscleGroups.reduce((sum, mg) => sum + mg.totalSets, 0)} total sets
              </span>
            </div>
          </div>
        </div>

        {/* Warmup */}
        {workout.warmup && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <h4 className="text-sm font-semibold text-yellow-400 uppercase mb-1">
              Warm-Up
            </h4>
            <p className="text-sm text-gray-300">{workout.warmup}</p>
          </div>
        )}
      </motion.div>

      {/* Muscle Groups and Exercises */}
      <div className="space-y-4">
        {workout.muscleGroups.map((muscleGroup, mgIndex) => (
          <motion.div
            key={muscleGroup.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: mgIndex * 0.1 }}
            className="glass-dark rounded-2xl p-6 border border-white/10"
          >
            {/* Muscle Group Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-accent-blue mb-1">
                  {muscleGroup.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {muscleGroup.totalSets} sets
                  </span>
                  {muscleGroup.note && (
                    <span className="text-xs text-gray-500">
                      • {muscleGroup.note}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-3 py-1 rounded-lg bg-accent-blue/20 text-accent-blue text-sm font-medium">
                ✓ Optimal
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-3">
              {muscleGroup.exercises.map((exercise, exIndex) => (
                <motion.div
                  key={`${exercise.name}-${exIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (mgIndex * 0.1) + (exIndex * 0.05) }}
                  className="p-4 rounded-xl bg-dark-bg/50 border border-white/5 hover:border-accent-blue/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedExercise(exercise.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-white group-hover:text-accent-blue transition-colors">
                          {exIndex + 1}. {exercise.name}
                        </span>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="font-medium text-accent-purple">
                          {exercise.sets} × {exercise.reps}
                        </span>
                        <span>Rest: {exercise.restSeconds}s</span>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          💡 {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Volume Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-dark rounded-2xl p-6 border border-accent-green/30 bg-gradient-to-br from-accent-green/5 to-transparent"
      >
        <h3 className="text-lg font-bold text-accent-green mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Volume Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {workout.muscleGroups.map((mg) => (
            <div
              key={mg.name}
              className="p-3 rounded-xl bg-dark-bg/50 border border-white/5"
            >
              <div className="text-sm text-gray-400">{mg.name}</div>
              <div className="text-lg font-bold text-white">{mg.totalSets} sets</div>
              <div className="text-xs text-accent-green">✅ Optimal</div>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-400">
          <strong className="text-white">Total Time:</strong> ~{workout.estimatedTime} minutes
        </div>
      </motion.div>

      {/* Training Tips */}
      {workout.tips && workout.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-dark rounded-2xl p-6 border border-accent-purple/30"
        >
          <h3 className="text-lg font-bold text-accent-purple mb-3">💡 Training Tips</h3>
          <ul className="space-y-2">
            {workout.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-accent-purple mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartWorkout}
          className="py-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-lg shadow-lg hover:shadow-accent-blue/50 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start This Workout
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRegenerate}
          className="py-4 rounded-xl glass-dark border border-white/10 text-white font-semibold hover:border-accent-blue/30 transition-all flex items-center justify-center gap-2"
        >
          <RotateCw className="w-5 h-5" />
          Regenerate
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={isSaving}
          className="py-4 rounded-xl glass-dark border border-accent-green/30 text-accent-green font-semibold hover:bg-accent-green/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Template'}
        </motion.button>
      </div>
    </div>
  );
};

export default GeneratedWorkout;
