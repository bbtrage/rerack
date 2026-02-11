/**
 * ExerciseDemo Component
 * Displays animated exercise GIF with tempo overlay and instructions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useExerciseGif } from '../hooks/useExerciseGif';
import { Play, X } from 'lucide-react';

interface Tempo {
  up: number;
  hold: number;
  down: number;
}

interface ExerciseDemoProps {
  exerciseName: string;
  tempo?: Tempo;
  onClose?: () => void;
  onStartGuidedReps?: () => void;
  showGuidedButton?: boolean;
}

const ExerciseDemo: React.FC<ExerciseDemoProps> = ({
  exerciseName,
  tempo = { up: 2, hold: 1, down: 2 },
  onClose,
  onStartGuidedReps,
  showGuidedButton = true,
}) => {
  const { gifUrl, loading, error, exercise } = useExerciseGif(exerciseName);
  const [gifLoaded, setGifLoaded] = useState(false);

  if (error || (!loading && !gifUrl)) {
    return (
      <div className="glass-dark rounded-2xl p-6 border border-white/10">
        {onClose && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{exerciseName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4">💪</div>
          <h4 className="text-lg font-semibold mb-2">{exerciseName}</h4>
          <p className="text-sm text-gray-400">
            Exercise demonstration not available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10">
      {onClose && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{exerciseName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* GIF Container with Dark Theme Styling */}
      <div className="relative mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-dark-bg via-dark-secondary to-dark-bg">
        {loading && !gifLoaded && (
          <div className="aspect-video flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading demonstration...</p>
            </div>
          </div>
        )}
        
        {gifUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: gifLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Dark background container */}
            <div className="relative bg-[#0a0a0a] rounded-2xl overflow-hidden">
              {/* Radial gradient overlay for edge fading */}
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-dark-bg/50 pointer-events-none z-10" />
              
              {/* GIF with dark theme filter */}
              <img
                src={gifUrl}
                alt={`${exerciseName} demonstration`}
                className="w-full h-full object-contain"
                style={{
                  filter: 'invert(1) hue-rotate(180deg) brightness(0.85) contrast(1.1)',
                  maxHeight: '400px',
                }}
                onLoad={() => setGifLoaded(true)}
                loading="lazy"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Tempo Indicator */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Tempo</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-dark rounded-xl p-3 text-center border border-white/5">
            <div className="text-2xl mb-1">⬆️</div>
            <div className="text-lg font-bold text-accent-green">{tempo.up}s</div>
            <div className="text-xs text-gray-400">Up</div>
          </div>
          <div className="glass-dark rounded-xl p-3 text-center border border-white/5">
            <div className="text-2xl mb-1">⏸</div>
            <div className="text-lg font-bold text-yellow-400">{tempo.hold}s</div>
            <div className="text-xs text-gray-400">Hold</div>
          </div>
          <div className="glass-dark rounded-xl p-3 text-center border border-white/5">
            <div className="text-2xl mb-1">⬇️</div>
            <div className="text-lg font-bold text-red-400">{tempo.down}s</div>
            <div className="text-xs text-gray-400">Down</div>
          </div>
        </div>
      </div>

      {/* Exercise Info */}
      {exercise && (
        <>
          {/* Target Muscles */}
          {exercise.targetMuscles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                Target Muscles
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-lg text-sm font-medium capitalize"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                Secondary Muscles
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-dark-lighter border border-white/10 rounded-lg text-sm text-gray-300 capitalize"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {exercise.equipments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                Equipment
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.equipments.map((equipment, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-lg text-sm font-medium capitalize"
                  >
                    {equipment}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Instructions
              </h4>
              <div className="space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-300 flex-1">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Guided Reps Button */}
      {showGuidedButton && onStartGuidedReps && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartGuidedReps}
          className="w-full py-4 bg-gradient-to-r from-accent-blue to-accent-purple rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-accent-blue/50 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start Guided Reps
        </motion.button>
      )}
    </div>
  );
};

export default ExerciseDemo;
