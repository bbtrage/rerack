/**
 * MuscleSelector Component
 * Scattered bubble layout for selecting multiple muscle groups
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { MuscleGroup } from '../types/aiWorkout';

interface MuscleSelectorProps {
  selectedMuscles: MuscleGroup[];
  onToggleMuscle: (muscle: MuscleGroup) => void;
}

// All available muscle groups
const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs',
  'Core',
  'Obliques',
  'Traps',
  'Lats',
  'Rear Delts',
  'Front Delts',
  'Side Delts',
];

// Quick select combos
const QUICK_COMBOS: { label: string; muscles: MuscleGroup[] }[] = [
  { label: 'Push Day', muscles: ['Chest', 'Shoulders', 'Triceps', 'Front Delts'] },
  { label: 'Pull Day', muscles: ['Back', 'Biceps', 'Lats', 'Rear Delts', 'Traps'] },
  { label: 'Leg Day', muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
  { label: 'Upper Body', muscles: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'] },
  { label: 'Full Body', muscles: ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings'] },
  { label: 'Arms', muscles: ['Biceps', 'Triceps', 'Forearms'] },
];

const MuscleSelector: React.FC<MuscleSelectorProps> = ({
  selectedMuscles,
  onToggleMuscle,
}) => {
  const isMuscleSelected = (muscle: MuscleGroup) => selectedMuscles.includes(muscle);

  const handleQuickCombo = (muscles: MuscleGroup[]) => {
    // Toggle combo: if all are selected, deselect all; otherwise select all
    const allSelected = muscles.every((m) => isMuscleSelected(m));
    
    if (allSelected) {
      muscles.forEach((m) => {
        if (isMuscleSelected(m)) {
          onToggleMuscle(m);
        }
      });
    } else {
      muscles.forEach((m) => {
        if (!isMuscleSelected(m)) {
          onToggleMuscle(m);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Combos */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          Quick Select
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_COMBOS.map((combo) => (
            <motion.button
              key={combo.label}
              onClick={() => handleQuickCombo(combo.muscles)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg glass-dark border border-accent-blue/30 text-sm font-medium text-accent-blue hover:bg-accent-blue/10 transition-all"
            >
              {combo.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Muscle Group Bubbles - Scattered Layout */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          Select Muscle Groups
        </h3>
        
        {/* Scattered bubble container */}
        <div className="relative min-h-[400px] p-4 rounded-2xl glass-dark border border-white/10">
          <div className="flex flex-wrap gap-3 justify-center items-center">
            {MUSCLE_GROUPS.map((muscle, index) => {
              const isSelected = isMuscleSelected(muscle);
              
              // Create slight random offset for organic feel (deterministic based on index)
              const offsetX = (index * 7) % 3 - 1; // -1, 0, or 1
              const offsetY = (index * 11) % 3 - 1;
              const rotation = (index * 5) % 3 - 1; // slight rotation variance
              
              return (
                <motion.button
                  key={muscle}
                  onClick={() => onToggleMuscle(muscle)}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: isSelected ? 1.05 : 1,
                    opacity: 1,
                    x: offsetX * 4,
                    y: offsetY * 4,
                    rotate: rotation * 0.5,
                  }}
                  whileHover={{ scale: isSelected ? 1.08 : 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 20,
                    delay: index * 0.02,
                  }}
                  className={`
                    relative px-5 py-3 rounded-full font-medium text-sm
                    transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/30 border-2 border-accent-blue'
                        : 'glass-dark border border-white/10 text-gray-300 hover:border-accent-blue/30 hover:text-white'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {muscle}
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.span>
                    )}
                  </span>
                  
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple opacity-30 blur-md -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Summary */}
      {selectedMuscles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl glass-dark border border-accent-blue/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-1">
                Selected Muscles
              </h4>
              <p className="text-accent-blue font-medium">
                {selectedMuscles.join(', ')}
              </p>
            </div>
            <div className="text-2xl font-bold text-accent-blue">
              {selectedMuscles.length}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MuscleSelector;
