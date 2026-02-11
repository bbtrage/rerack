import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { Workout, DashboardStats } from '../types';
import { getAllWorkouts } from '../utils/storage';
import { calculateDashboardStats, getMuscleGroupLabel, analyzeMuscles } from '../utils/analysis';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allWorkouts = await getAllWorkouts();
    setWorkouts(allWorkouts);
    
    if (allWorkouts.length > 0) {
      const dashboardStats = calculateDashboardStats(allWorkouts);
      setStats(dashboardStats);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (!stats || workouts.length === 0) {
    return (
      <PageLayout title="Dashboard">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-2xl p-12 text-center"
        >
          <div className="text-6xl mb-4">🏋️</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to ReRack!</h2>
          <p className="text-gray-400 mb-6">Start tracking your workouts to see your progress here.</p>
          <button className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-blue/50 transition-all">
            Log Your First Workout
          </button>
        </motion.div>
      </PageLayout>
    );
  }

  // Prepare radar chart data
  const muscleAnalyses = analyzeMuscles(workouts);
  const radarData = muscleAnalyses.slice(0, 8).map(analysis => ({
    muscle: getMuscleGroupLabel(analysis.muscleGroup),
    volume: analysis.totalVolume / 100, // Scale down for better visualization
  }));

  // Prepare volume trend data (last 7 workouts)
  const recentWorkouts = workouts.slice(0, 7).reverse();
  const volumeTrendData = recentWorkouts.map(workout => {
    const totalVolume = workout.exercises.reduce((sum, exercise) => {
      return sum + exercise.sets.reduce((setSum, set) => {
        return set.completed ? setSum + (set.weight * set.reps) : setSum;
      }, 0);
    }, 0);
    
    return {
      date: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: totalVolume
    };
  });

  return (
    <PageLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="📅"
          label="This Week"
          value={stats.weeklyWorkouts.toString()}
          unit="workouts"
        />
        <StatCard
          icon="🔥"
          label="Streak"
          value={stats.workoutStreak.toString()}
          unit="days"
        />
        <StatCard
          icon="💪"
          label="Total Volume"
          value={formatVolume(stats.totalVolume)}
          unit="lbs"
        />
        <StatCard
          icon="⚡"
          label="Strongest"
          value={stats.strongestMuscle ? getMuscleGroupLabel(stats.strongestMuscle).slice(0, 8) : 'N/A'}
          unit=""
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Muscle Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Muscle Balance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="muscle" stroke="#ffffff80" fontSize={12} />
              <PolarRadiusAxis stroke="#ffffff40" />
              <Radar name="Volume" dataKey="volume" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Volume Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" fontSize={12} />
              <YAxis stroke="#ffffff80" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-dark rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">💡 Focus Recommendation</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-gray-400 mb-2">Based on your training history, you should focus on:</p>
            <p className="text-2xl font-bold text-accent-purple">
              {stats.weakestMuscle ? getMuscleGroupLabel(stats.weakestMuscle) : 'Keep training!'}
            </p>
          </div>
          <div className="text-6xl">🎯</div>
        </div>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <h3 className="text-xl font-bold mb-4">Recent Workouts</h3>
        <div className="space-y-3">
          {workouts.slice(0, 5).map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass-dark rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{workout.name}</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(workout.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{workout.exercises.length} exercises</p>
                  {workout.duration && (
                    <p className="text-sm text-accent-green">{workout.duration} min</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageLayout>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: string; unit: string }> = ({ icon, label, value, unit }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="glass-dark rounded-xl p-4 text-center"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-gray-400 uppercase">{unit}</div>
    <div className="text-sm text-gray-400 mt-1">{label}</div>
  </motion.div>
);

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(1) + 'M';
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K';
  }
  return volume.toString();
};

export default Dashboard;
