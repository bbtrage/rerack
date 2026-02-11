import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Plus, Minus, X, Check } from 'lucide-react';
import ProgressRing from './ProgressRing';

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, onComplete, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-24 md:bottom-8 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div className="glass-dark rounded-2xl p-6 shadow-2xl border border-white/10 min-w-[300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-accent-blue" />
            <span className="font-semibold">Rest Timer</span>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center">
          <ProgressRing
            progress={progress}
            size={120}
            strokeWidth={8}
            color="#3b82f6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-400 mt-1">remaining</div>
            </div>
          </ProgressRing>
        </div>

        <button
          onClick={onSkip}
          className="mt-4 w-full py-2 text-sm text-accent-blue hover:text-accent-purple transition-colors"
        >
          Skip Rest
        </button>
      </div>
    </motion.div>
  );
};

export default RestTimer;

// Quick adjust buttons component
export const QuickAdjustButtons: React.FC<{
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
}> = ({ value, onChange, step = 5, label }) => {
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(Math.max(0, value - step))}
        className="w-8 h-8 rounded-lg bg-dark-lighter border border-white/10 hover:border-accent-blue text-accent-blue flex items-center justify-center transition-all"
      >
        <Minus className="w-4 h-4" />
      </motion.button>
      
      <div className="flex-1 text-center">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={label}
          className="w-full px-3 py-2 bg-dark-lighter rounded-lg border border-white/10 focus:border-accent-blue focus:outline-none text-center"
        />
      </div>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(value + step)}
        className="w-8 h-8 rounded-lg bg-dark-lighter border border-white/10 hover:border-accent-blue text-accent-blue flex items-center justify-center transition-all"
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

// Set completion button
export const SetCompleteButton: React.FC<{
  completed: boolean;
  onClick: () => void;
}> = ({ completed, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-10 h-10 rounded-lg transition-all flex items-center justify-center ${
        completed 
          ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg' 
          : 'bg-dark-lighter border border-white/10 text-gray-400 hover:border-accent-blue'
      }`}
    >
      <Check className={`w-5 h-5 ${completed ? 'opacity-100' : 'opacity-0'}`} />
    </motion.button>
  );
};
