import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { Workout } from '../types';
import { getAllWorkouts } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const Analytics: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allWorkouts = await getAllWorkouts();
    setWorkouts(allWorkouts);
    setLoading(false);
  };

  if (loading) {
    return (
      <PageLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (workouts.length === 0) {
    return (
      <PageLayout title="Analytics">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-2xl p-12 text-center"
        >
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
          <p className="text-gray-400">Complete workouts to see analytics and progress.</p>
        </motion.div>
      </PageLayout>
    );
  }

  // Prepare data for charts
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyVolume = last30Days.map(date => {
    const dayWorkouts = workouts.filter(w => w.date.startsWith(date));
    const volume = dayWorkouts.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exSum, ex) => {
        return exSum + ex.sets.reduce((setSum, set) => {
          return set.completed ? setSum + (set.weight * set.reps) : setSum;
        }, 0);
      }, 0);
    }, 0);
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.round(volume),
      workouts: dayWorkouts.length
    };
  });

  const weeklyStats = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (11 - i) * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });
    
    const volume = weekWorkouts.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exSum, ex) => {
        return exSum + ex.sets.reduce((setSum, set) => {
          return set.completed ? setSum + (set.weight * set.reps) : setSum;
        }, 0);
      }, 0);
    }, 0);
    
    return {
      week: `Week ${i + 1}`,
      workouts: weekWorkouts.length,
      volume: Math.round(volume)
    };
  });

  return (
    <PageLayout title="Analytics">
      <div className="space-y-6">
        {/* Daily Volume (Last 30 Days) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Daily Volume (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" fontSize={10} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#ffffff80" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Trends */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-4">Weekly Workout Count</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="week" stroke="#ffffff80" fontSize={12} />
                <YAxis stroke="#ffffff80" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="workouts" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-4">Weekly Volume</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="week" stroke="#ffffff80" fontSize={12} />
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

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">All-Time Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-dark-lighter rounded-lg">
              <div className="text-3xl font-bold text-accent-blue">{workouts.length}</div>
              <div className="text-sm text-gray-400 mt-1">Total Workouts</div>
            </div>
            <div className="text-center p-4 bg-dark-lighter rounded-lg">
              <div className="text-3xl font-bold text-accent-purple">
                {workouts.reduce((sum, w) => sum + w.exercises.length, 0)}
              </div>
              <div className="text-sm text-gray-400 mt-1">Total Exercises</div>
            </div>
            <div className="text-center p-4 bg-dark-lighter rounded-lg">
              <div className="text-3xl font-bold text-accent-green">
                {workouts.reduce((sum, w) => sum + w.exercises.reduce((s, e) => s + e.sets.length, 0), 0)}
              </div>
              <div className="text-sm text-gray-400 mt-1">Total Sets</div>
            </div>
            <div className="text-center p-4 bg-dark-lighter rounded-lg">
              <div className="text-3xl font-bold text-blue-400">
                {Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / 60)}
              </div>
              <div className="text-sm text-gray-400 mt-1">Hours Trained</div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Analytics;
