/**
 * AIWorkoutGenerator Page
 * Main page for AI-powered workout generation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, AlertCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import MuscleSelector from '../components/MuscleSelector';
import WorkoutConfig from '../components/WorkoutConfig';
import GeneratedWorkout from '../components/GeneratedWorkout';
import { useToast } from '../components/Toast';
import {
  MuscleGroup,
  WorkoutDuration,
  WorkoutLevel,
  Equipment,
  WorkoutGoal,
  AIWorkout,
  AIWorkoutParams,
} from '../types/aiWorkout';
import {
  generateWorkout,
  isGeminiConfigured,
  getRateLimitInfo,
  isRateLimited,
} from '../lib/gemini';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Step = 'select' | 'config' | 'result';

const LOADING_MESSAGES = [
  '🤖 Analyzing muscle groups...',
  '📊 Optimizing volume distribution...',
  '🏋️ Selecting the best exercises...',
  '⚡ Finalizing your workout...',
];

const AIWorkoutGenerator: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Step management
  const [step, setStep] = useState<Step>('select');
  
  // Workout parameters
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [duration, setDuration] = useState<WorkoutDuration>(45);
  const [level, setLevel] = useState<WorkoutLevel>('Intermediate');
  const [equipment, setEquipment] = useState<Equipment>('Full Gym');
  const [goal, setGoal] = useState<WorkoutGoal>('Hypertrophy');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<AIWorkout | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Rate limit info
  const rateLimitInfo = getRateLimitInfo();
  const remaining = rateLimitInfo.limit - rateLimitInfo.count;

  const handleToggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleGenerate = async () => {
    if (selectedMuscles.length === 0) {
      showToast('Please select at least one muscle group', 'error');
      return;
    }

    if (!isGeminiConfigured()) {
      setError('Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your environment variables.');
      return;
    }

    if (isRateLimited()) {
      setError(`You've used all ${rateLimitInfo.limit} AI workouts today. Try again tomorrow or upgrade to Pro for unlimited generations!`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoadingMessageIndex(0);

    // Rotate loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    try {
      const params: AIWorkoutParams = {
        selectedMuscles,
        duration,
        level,
        equipment,
        goal,
      };

      const workout = await generateWorkout(params);
      setGeneratedWorkout(workout);
      setStep('result');
      showToast('Workout generated successfully! 🎉', 'success');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate workout. Please try again.');
      showToast(err.message || 'Failed to generate workout', 'error');
    } finally {
      setIsGenerating(false);
      clearInterval(messageInterval);
    }
  };

  const handleRegenerate = async () => {
    setStep('config');
    setTimeout(() => handleGenerate(), 100);
  };

  const handleSaveTemplate = async () => {
    if (!generatedWorkout) return;

    setIsSaving(true);
    try {
      if (!isSupabaseConfigured || !user) {
        // Save to localStorage for local-only mode
        const localTemplates = JSON.parse(localStorage.getItem('ai_workout_templates') || '[]');
        const template = {
          id: `local_${Date.now()}`,
          workout_name: generatedWorkout.workoutName,
          muscle_groups: selectedMuscles,
          config: { selectedMuscles, duration, level, equipment, goal },
          workout_data: generatedWorkout,
          created_at: new Date().toISOString(),
        };
        localTemplates.push(template);
        localStorage.setItem('ai_workout_templates', JSON.stringify(localTemplates));
        showToast('Template saved locally! 💾', 'success');
      } else {
        // Save to Supabase
        const { error } = await supabase!.from('ai_workout_templates').insert({
          id: `${user.id}_${Date.now()}`,
          user_id: user.id,
          workout_name: generatedWorkout.workoutName,
          muscle_groups: selectedMuscles,
          config: { selectedMuscles, duration, level, equipment, goal },
          workout_data: generatedWorkout,
        });

        if (error) throw error;
        showToast('Template saved to your account! 💾', 'success');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      showToast('Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartWorkout = () => {
    // TODO: Pre-fill LogWorkout page with generated workout
    // For now, just show a toast
    showToast('Starting workout... (integration with LogWorkout coming soon)', 'info');
  };

  const canProceedToConfig = selectedMuscles.length > 0;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-accent-blue" />
            <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
              AI Workout Generator
            </span>
          </h1>
          <p className="text-gray-400">
            Select muscles, configure your workout, and let AI optimize the perfect plan
          </p>
          {!isGeminiConfigured() && (
            <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300 text-left">
                <strong>API Key Required:</strong> Add REACT_APP_GEMINI_API_KEY to your .env file to use this feature.
                Get your free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.
              </p>
            </div>
          )}
          {remaining > 0 && remaining <= rateLimitInfo.limit && (
            <div className="mt-2 text-sm text-gray-400">
              {remaining}/{rateLimitInfo.limit} AI workouts remaining today
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          {(['select', 'config', 'result'] as Step[]).map((s, index) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 transition-all ${
                  step === s ? 'text-accent-blue' : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                    step === s
                      ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white'
                      : 'glass-dark border border-white/10'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {s === 'select' ? 'Select Muscles' : s === 'config' ? 'Configure' : 'Generated'}
                </span>
              </div>
              {index < 2 && (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="glass-dark rounded-2xl p-8 border border-white/10 max-w-md mx-4 text-center">
                <div className="w-16 h-16 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto mb-6" />
                <motion.p
                  key={loadingMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-semibold text-white"
                >
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MuscleSelector
                selectedMuscles={selectedMuscles}
                onToggleMuscle={handleToggleMuscle}
              />
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('config')}
                  disabled={!canProceedToConfig}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-lg shadow-lg hover:shadow-accent-blue/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <WorkoutConfig
                duration={duration}
                level={level}
                equipment={equipment}
                goal={goal}
                onDurationChange={setDuration}
                onLevelChange={setLevel}
                onEquipmentChange={setEquipment}
                onGoalChange={setGoal}
              />
              <div className="mt-6 flex justify-between gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('select')}
                  className="px-6 py-4 rounded-xl glass-dark border border-white/10 text-white font-semibold hover:border-accent-blue/30 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-lg shadow-lg hover:shadow-accent-blue/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Optimized Workout
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'result' && generatedWorkout && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <GeneratedWorkout
                workout={generatedWorkout}
                onRegenerate={handleRegenerate}
                onSave={handleSaveTemplate}
                onStartWorkout={handleStartWorkout}
                isSaving={isSaving}
              />
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStep('select');
                    setGeneratedWorkout(null);
                    setSelectedMuscles([]);
                  }}
                  className="px-6 py-3 rounded-xl glass-dark border border-white/10 text-white font-semibold hover:border-accent-blue/30 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Start New Workout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default AIWorkoutGenerator;
