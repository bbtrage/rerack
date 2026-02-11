/**
 * GuidedReps Component
 * Interactive guided rep mode with tempo-synced countdown and visual feedback
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import ProgressRing from './ProgressRing';

interface Tempo {
  up: number;
  hold: number;
  down: number;
}

interface GuidedRepsProps {
  exerciseName: string;
  tempo?: Tempo;
  targetReps?: number;
  onComplete?: (repsCompleted: number) => void;
  onClose?: () => void;
}

type Phase = 'up' | 'hold' | 'down';

const GuidedReps: React.FC<GuidedRepsProps> = ({
  exerciseName,
  tempo = { up: 2, hold: 1, down: 2 },
  targetReps = 10,
  onComplete,
  onClose,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('up');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  const getPhaseColor = (phase: Phase): string => {
    switch (phase) {
      case 'up':
        return 'text-accent-green';
      case 'hold':
        return 'text-yellow-400';
      case 'down':
        return 'text-red-400';
    }
  };

  const getPhaseLabel = (phase: Phase): string => {
    switch (phase) {
      case 'up':
        return '⬆️ Lifting';
      case 'hold':
        return '⏸ Hold';
      case 'down':
        return '⬇️ Lowering';
    }
  };

  const getPhaseDuration = useCallback((phase: Phase): number => {
    switch (phase) {
      case 'up':
        return tempo.up;
      case 'hold':
        return tempo.hold;
      case 'down':
        return tempo.down;
    }
  }, [tempo]);

  const getNextPhase = useCallback((phase: Phase): Phase => {
    switch (phase) {
      case 'up':
        return 'hold';
      case 'hold':
        return 'down';
      case 'down':
        return 'up';
    }
  }, []);

  const startWorkout = () => {
    setShowCountdown(true);
    setCountdown(3);
  };

  const resetWorkout = () => {
    setIsActive(false);
    setCurrentPhase('up');
    setPhaseProgress(0);
    setRepsCompleted(0);
    setShowCountdown(false);
    setCountdown(3);
  };

  const togglePause = () => {
    setIsActive(!isActive);
  };

  // Countdown timer
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      setIsActive(true);
    }
  }, [showCountdown, countdown]);

  // Phase timer
  useEffect(() => {
    if (!isActive) return;

    const phaseDuration = getPhaseDuration(currentPhase);
    const interval = 50; // Update every 50ms for smooth animation
    const increment = interval / (phaseDuration * 1000);

    const timer = setInterval(() => {
      setPhaseProgress((prev) => {
        const newProgress = prev + increment;
        
        if (newProgress >= 1) {
          const nextPhase = getNextPhase(currentPhase);
          
          // Increment rep counter when completing the down phase
          if (currentPhase === 'down') {
            setRepsCompleted((reps) => {
              const newReps = reps + 1;
              if (newReps >= targetReps) {
                setIsActive(false);
                if (onComplete) {
                  onComplete(newReps);
                }
              }
              return newReps;
            });
          }
          
          setCurrentPhase(nextPhase);
          return 0;
        }
        
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, currentPhase, tempo, targetReps, onComplete, getPhaseDuration, getNextPhase]);

  const progressPercentage = (phaseProgress * 100).toFixed(0);
  const timeRemaining = ((1 - phaseProgress) * getPhaseDuration(currentPhase)).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-dark rounded-2xl p-8 max-w-lg w-full border border-white/10"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Guided Reps</h2>
            <p className="text-gray-400">{exerciseName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {showCountdown && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl z-10"
            >
              <div className="text-center">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-8xl font-bold text-accent-blue mb-4"
                >
                  {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
                <p className="text-gray-400">Get ready...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rep Counter */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-accent-blue mb-2">
            {repsCompleted} / {targetReps}
          </div>
          <p className="text-gray-400">Reps Completed</p>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <ProgressRing
              progress={phaseProgress * 100}
              size={200}
              strokeWidth={12}
              color={
                currentPhase === 'up'
                  ? '#10b981'
                  : currentPhase === 'hold'
                  ? '#fbbf24'
                  : '#ef4444'
              }
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold mb-2 ${getPhaseColor(currentPhase)}`}>
                {timeRemaining}s
              </div>
              <div className="text-sm text-gray-400">{progressPercentage}%</div>
            </div>
          </div>
        </div>

        {/* Current Phase */}
        <div className="text-center mb-8">
          <motion.div
            key={currentPhase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-bold mb-2 ${getPhaseColor(currentPhase)}`}
          >
            {getPhaseLabel(currentPhase)}
          </motion.div>
          <p className="text-gray-400">
            {getPhaseDuration(currentPhase)}s duration
          </p>
        </div>

        {/* Tempo Overview */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div
            className={`glass-dark rounded-xl p-3 text-center border transition-all ${
              currentPhase === 'up'
                ? 'border-accent-green bg-accent-green/10'
                : 'border-white/5'
            }`}
          >
            <div className="text-xl mb-1">⬆️</div>
            <div className="text-sm font-bold">{tempo.up}s</div>
          </div>
          <div
            className={`glass-dark rounded-xl p-3 text-center border transition-all ${
              currentPhase === 'hold'
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-white/5'
            }`}
          >
            <div className="text-xl mb-1">⏸</div>
            <div className="text-sm font-bold">{tempo.hold}s</div>
          </div>
          <div
            className={`glass-dark rounded-xl p-3 text-center border transition-all ${
              currentPhase === 'down'
                ? 'border-red-400 bg-red-400/10'
                : 'border-white/5'
            }`}
          >
            <div className="text-xl mb-1">⬇️</div>
            <div className="text-sm font-bold">{tempo.down}s</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isActive && repsCompleted === 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startWorkout}
              className="flex-1 py-4 bg-gradient-to-r from-accent-blue to-accent-purple rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start
            </motion.button>
          )}

          {isActive && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={togglePause}
              className="flex-1 py-4 bg-yellow-500 rounded-xl font-semibold flex items-center justify-center gap-2 text-black"
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
          )}

          {!isActive && repsCompleted > 0 && repsCompleted < targetReps && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={togglePause}
              className="flex-1 py-4 bg-accent-green rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Resume
            </motion.button>
          )}

          {repsCompleted > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetWorkout}
              className="px-6 py-4 glass-dark rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </motion.button>
          )}
        </div>

        {/* Completion Message */}
        {repsCompleted >= targetReps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-accent-green/20 border border-accent-green rounded-xl text-center"
          >
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-semibold text-accent-green">
              Great job! You completed {targetReps} reps!
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GuidedReps;
