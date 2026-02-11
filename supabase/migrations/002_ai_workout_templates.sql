-- AI Workout Templates Table
-- Stores user-saved AI-generated workout templates

CREATE TABLE public.ai_workout_templates (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_name TEXT NOT NULL,
  muscle_groups TEXT[] NOT NULL,
  config JSONB NOT NULL, -- Stores AIWorkoutParams
  workout_data JSONB NOT NULL, -- Stores AIWorkout
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.ai_workout_templates ENABLE ROW LEVEL SECURITY;

-- Users can only access their own templates
CREATE POLICY "Users can view own templates" ON public.ai_workout_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.ai_workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.ai_workout_templates FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_ai_workout_templates_user_id ON public.ai_workout_templates(user_id);
CREATE INDEX idx_ai_workout_templates_created_at ON public.ai_workout_templates(created_at DESC);
