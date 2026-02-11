import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { MuscleAnalysis } from '../types';
import { getAllWorkouts } from '../utils/storage';
import { analyzeMuscles, getMuscleGroupLabel, getWeakestMuscles, getStrongestMuscles } from '../utils/analysis';

const MuscleAnalysisPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<MuscleAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allWorkouts = await getAllWorkouts();
    
    if (allWorkouts.length > 0) {
      const muscleAnalyses = analyzeMuscles(allWorkouts);
      setAnalyses(muscleAnalyses);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <PageLayout title="Muscle Analysis">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (analyses.length === 0) {
    return (
      <PageLayout title="Muscle Analysis">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-2xl p-12 text-center"
        >
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
          <p className="text-gray-400">Complete workouts to see your muscle balance analysis.</p>
        </motion.div>
      </PageLayout>
    );
  }

  const weakest = getWeakestMuscles(analyses, 3);
  const strongest = getStrongestMuscles(analyses, 3);

  const getMuscleIntensity = (muscle: string): number => {
    const analysis = analyses.find(a => a.muscleGroup === muscle);
    if (!analysis) return 0;
    
    const maxVolume = Math.max(...analyses.map(a => a.totalVolume));
    return analysis.totalVolume / maxVolume;
  };

  const getMuscleColor = (muscle: string, baseColor: string): string => {
    const intensity = getMuscleIntensity(muscle);
    if (intensity === 0) return '#1a1a2e';
    
    const alpha = Math.max(0.2, intensity);
    return baseColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
  };

  return (
    <PageLayout title="Muscle Analysis">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Body Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Body Heat Map</h3>
          <p className="text-sm text-gray-400 mb-6">Hover over muscle groups to see details</p>
          
          <div className="relative mx-auto" style={{ maxWidth: '400px' }}>
            <svg viewBox="0 0 400 600" className="w-full">
              {/* Head */}
              <ellipse cx="200" cy="40" rx="30" ry="40" fill="#2a2a3e" stroke="#ffffff20" strokeWidth="2" />
              
              {/* Shoulders */}
              <ellipse 
                cx="140" cy="100" rx="35" ry="25" 
                fill={getMuscleColor('shoulders', 'rgb(59, 130, 246)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-blue"
              />
              <ellipse 
                cx="260" cy="100" rx="35" ry="25" 
                fill={getMuscleColor('shoulders', 'rgb(59, 130, 246)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-blue"
              />
              
              {/* Chest */}
              <ellipse 
                cx="200" cy="130" rx="50" ry="40" 
                fill={getMuscleColor('chest', 'rgb(168, 85, 247)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('chest')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-purple"
              />
              
              {/* Abs */}
              <rect 
                x="175" y="170" width="50" height="80" rx="10"
                fill={getMuscleColor('abs', 'rgb(16, 185, 129)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('abs')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-green"
              />
              
              {/* Biceps */}
              <ellipse 
                cx="120" cy="160" rx="20" ry="35" 
                fill={getMuscleColor('biceps', 'rgb(59, 130, 246)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-blue"
              />
              <ellipse 
                cx="280" cy="160" rx="20" ry="35" 
                fill={getMuscleColor('biceps', 'rgb(59, 130, 246)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-blue"
              />
              
              {/* Forearms */}
              <rect 
                x="105" y="195" width="20" height="45" rx="10"
                fill={getMuscleColor('forearms', 'rgb(59, 130, 246)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('forearms')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-blue"
              />
              <rect 
                x="275" y="195" width="20" height="45" rx="10"
                fill={getMuscleColor('forearms', 'rgb(59, 130, 246)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('forearms')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-blue"
              />
              
              {/* Quads */}
              <ellipse 
                cx="170" cy="350" rx="25" ry="80" 
                fill={getMuscleColor('quads', 'rgb(168, 85, 247)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-purple"
              />
              <ellipse 
                cx="230" cy="350" rx="25" ry="80" 
                fill={getMuscleColor('quads', 'rgb(168, 85, 247)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-purple"
              />
              
              {/* Calves */}
              <ellipse 
                cx="170" cy="480" rx="18" ry="50" 
                fill={getMuscleColor('calves', 'rgb(16, 185, 129)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-green"
              />
              <ellipse 
                cx="230" cy="480" rx="18" ry="50" 
                fill={getMuscleColor('calves', 'rgb(16, 185, 129)')}
                stroke="#ffffff40" strokeWidth="2"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-all hover:stroke-accent-green"
              />
            </svg>

            {/* Hover Tooltip */}
            {hoveredMuscle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 glass-dark p-4 rounded-lg shadow-lg"
              >
                <h4 className="font-bold">{getMuscleGroupLabel(hoveredMuscle as any)}</h4>
                {analyses.find(a => a.muscleGroup === hoveredMuscle) && (
                  <>
                    <p className="text-sm text-gray-400">
                      Volume: {Math.round(analyses.find(a => a.muscleGroup === hoveredMuscle)!.totalVolume).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Frequency: {analyses.find(a => a.muscleGroup === hoveredMuscle)!.frequency.toFixed(1)}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Rankings */}
        <div className="space-y-6">
          {/* Weakest Muscles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-4 text-red-400">🎯 Focus On (Undertrained)</h3>
            <div className="space-y-3">
              {weakest.map((muscle, index) => (
                <motion.div
                  key={muscle.muscleGroup}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg"
                >
                  <div>
                    <div className="font-semibold">{getMuscleGroupLabel(muscle.muscleGroup)}</div>
                    <div className="text-sm text-gray-400">
                      Volume: {Math.round(muscle.totalVolume).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-2xl">#{muscle.rank}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strongest Muscles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-4 text-accent-green">💪 Strongest</h3>
            <div className="space-y-3">
              {strongest.map((muscle, index) => (
                <motion.div
                  key={muscle.muscleGroup}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg"
                >
                  <div>
                    <div className="font-semibold">{getMuscleGroupLabel(muscle.muscleGroup)}</div>
                    <div className="text-sm text-gray-400">
                      Volume: {Math.round(muscle.totalVolume).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-2xl">#{muscle.rank}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* All Muscles Ranking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-4">Complete Rankings</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analyses.sort((a, b) => a.rank - b.rank).map((muscle, index) => (
                <div
                  key={muscle.muscleGroup}
                  className="flex justify-between items-center p-2 hover:bg-dark-lighter rounded transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 w-8">#{muscle.rank}</span>
                    <span>{getMuscleGroupLabel(muscle.muscleGroup)}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {Math.round(muscle.totalVolume).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MuscleAnalysisPage;
