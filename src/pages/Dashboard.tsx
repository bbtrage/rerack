import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import ProgressRing from '../components/ProgressRing';
import AnimatedCounter from '../components/AnimatedCounter';
import { Workout, DashboardStats, UserProfile } from '../types';
import { getAllWorkouts, getUserProfile, saveUserProfile } from '../utils/storage';
import { calculateDashboardStats, getMuscleGroupLabel, analyzeMuscles } from '../utils/analysis';
import { 
  calculateLevel, 
  getLevelProgress, 
  getRankFromLevel, 
  calculateWorkoutXP,
  calculateStreak 
} from '../utils/gamification';
import { 
  Flame, 
  TrendingUp, 
  Award, 
  Zap, 
  Target, 
  Calendar,
  Dumbbell 
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allWorkouts = await getAllWorkouts();
    setWorkouts(allWorkouts);
    
    const userProfile = await getUserProfile();
    
    if (allWorkouts.length > 0) {
      const dashboardStats = calculateDashboardStats(allWorkouts);
      setStats(dashboardStats);
      
      // Update profile with latest stats
      const currentStreak = calculateStreak(allWorkouts);
      const totalVolume = dashboardStats.totalVolume;
      
      userProfile.currentStreak = currentStreak;
      userProfile.longestStreak = Math.max(userProfile.longestStreak, currentStreak);
      userProfile.totalWorkouts = allWorkouts.length;
      userProfile.totalVolume = totalVolume;
      userProfile.level = calculateLevel(userProfile.xp);
      userProfile.rank = getRankFromLevel(userProfile.level);
      
      await saveUserProfile(userProfile);
    }
    
    setProfile(userProfile);
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
      {/* Hero Stats - Gamification */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Level & XP */}
        <HeroStatCard
          icon={<Award className="w-8 h-8" />}
          label="Level"
          value={profile?.level || 1}
          subtitle={profile?.rank.toUpperCase() || 'BEGINNER'}
          gradient="from-yellow-500 to-orange-500"
        >
          <ProgressRing 
            progress={getLevelProgress(profile?.xp || 0)} 
            size={60}
            strokeWidth={4}
            color="#f59e0b"
          >
            <span className="text-lg font-bold">{profile?.level || 1}</span>
          </ProgressRing>
        </HeroStatCard>

        {/* Streak */}
        <HeroStatCard
          icon={<Flame className="w-8 h-8" />}
          label="Streak"
          value={profile?.currentStreak || 0}
          subtitle="DAYS"
          gradient="from-orange-500 to-red-500"
        />

        {/* Weekly Workouts */}
        <HeroStatCard
          icon={<Calendar className="w-8 h-8" />}
          label="This Week"
          value={stats.weeklyWorkouts}
          subtitle="WORKOUTS"
          gradient="from-blue-500 to-cyan-500"
        />

        {/* Total Volume */}
        <HeroStatCard
          icon={<Dumbbell className="w-8 h-8" />}
          label="Total Volume"
          value={formatVolume(stats.totalVolume)}
          subtitle="LBS LIFTED"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Muscle Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-accent-blue" />
            <h3 className="text-xl font-bold">Muscle Balance</h3>
          </div>
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
          className="glass-dark rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-green" />
            <h3 className="text-xl font-bold">Volume Trend</h3>
          </div>
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
        className="glass-dark rounded-2xl p-6 border border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-accent-purple" />
          <h3 className="text-xl font-bold">Focus Recommendation</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-gray-400 mb-2">Based on your training history, you should focus on:</p>
            <p className="text-2xl font-bold text-accent-purple">
              {stats.weakestMuscle ? getMuscleGroupLabel(stats.weakestMuscle) : 'Keep training!'}
            </p>
          </div>
          <Target className="w-16 h-16 text-accent-purple/50" />
        </div>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {workouts.slice(0, 5).map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="glass-dark rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/5"
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

const HeroStatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  subtitle: string;
  gradient: string;
  children?: React.ReactNode;
}> = ({ icon, label, value, subtitle, gradient, children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05, y: -4 }}
    className="glass-dark rounded-2xl p-6 border border-white/10 relative overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className={`text-transparent bg-gradient-to-br ${gradient} bg-clip-text`}>
          {icon}
        </div>
        {children}
      </div>
      {!children && (
        <div className="text-3xl font-bold mb-1">
          <AnimatedCounter value={typeof value === 'number' ? value : 0} />
          {typeof value === 'string' && value}
        </div>
      )}
      <div className="text-xs text-gray-400 font-semibold">{subtitle}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
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
