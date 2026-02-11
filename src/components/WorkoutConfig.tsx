/**
 * WorkoutConfig Component
 * Configuration options for AI workout generation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { WorkoutDuration, WorkoutLevel, Equipment, WorkoutGoal } from '../types/aiWorkout';

interface WorkoutConfigProps {
  duration: WorkoutDuration;
  level: WorkoutLevel;
  equipment: Equipment;
  goal: WorkoutGoal;
  onDurationChange: (duration: WorkoutDuration) => void;
  onLevelChange: (level: WorkoutLevel) => void;
  onEquipmentChange: (equipment: Equipment) => void;
  onGoalChange: (goal: WorkoutGoal) => void;
}

const DURATIONS: WorkoutDuration[] = [15, 30, 45, 60, 90];
const LEVELS: WorkoutLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const EQUIPMENT_OPTIONS: Equipment[] = [
  'Full Gym',
  'Dumbbells Only',
  'Barbell + Bench',
  'Bodyweight',
  'Home Gym',
  'Cables + Machines',
];
const GOALS: { value: WorkoutGoal; label: string; reps: string }[] = [
  { value: 'Strength', label: 'Strength', reps: '1-5 reps' },
  { value: 'Hypertrophy', label: 'Hypertrophy', reps: '8-12 reps' },
  { value: 'Endurance', label: 'Endurance', reps: '15+ reps' },
];

interface PillSelectorProps<T> {
  options: readonly T[] | { value: T; label: string; reps?: string }[];
  selected: T;
  onChange: (value: T) => void;
  label: string;
}

function PillSelector<T extends string | number>({
  options,
  selected,
  onChange,
  label,
}: PillSelectorProps<T>) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const displayLabel = typeof option === 'object' ? option.label : String(option);
          const subLabel = typeof option === 'object' ? option.reps : null;
          const isSelected = selected === value;

          return (
            <motion.button
              key={String(value)}
              onClick={() => onChange(value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={`
                px-4 py-3 rounded-xl font-medium transition-all
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/30'
                    : 'glass-dark border border-white/10 text-gray-300 hover:border-accent-blue/30 hover:text-white'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">
                  {typeof option === 'number' ? `${displayLabel}m` : displayLabel}
                </span>
                {subLabel && (
                  <span className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    {subLabel}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const WorkoutConfig: React.FC<WorkoutConfigProps> = ({
  duration,
  level,
  equipment,
  goal,
  onDurationChange,
  onLevelChange,
  onEquipmentChange,
  onGoalChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Duration Selector */}
      <PillSelector
        label="Duration"
        options={DURATIONS}
        selected={duration}
        onChange={onDurationChange}
      />

      {/* Level Selector */}
      <PillSelector
        label="Experience Level"
        options={LEVELS}
        selected={level}
        onChange={onLevelChange}
      />

      {/* Equipment Selector */}
      <PillSelector
        label="Available Equipment"
        options={EQUIPMENT_OPTIONS}
        selected={equipment}
        onChange={onEquipmentChange}
      />

      {/* Goal Selector */}
      <PillSelector
        label="Training Goal"
        options={GOALS}
        selected={goal}
        onChange={onGoalChange}
      />

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl glass-dark border border-accent-purple/30 bg-gradient-to-br from-accent-purple/5 to-transparent"
      >
        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          Workout Configuration
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Duration:</span>
            <span className="ml-2 text-white font-medium">{duration} min</span>
          </div>
          <div>
            <span className="text-gray-400">Level:</span>
            <span className="ml-2 text-white font-medium">{level}</span>
          </div>
          <div>
            <span className="text-gray-400">Equipment:</span>
            <span className="ml-2 text-white font-medium">{equipment}</span>
          </div>
          <div>
            <span className="text-gray-400">Goal:</span>
            <span className="ml-2 text-white font-medium">{goal}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkoutConfig;
