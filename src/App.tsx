import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import FloatingActionButton from './components/FloatingActionButton';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import WorkoutHistory from './pages/WorkoutHistory';
import MuscleAnalysis from './pages/MuscleAnalysis';
import Analytics from './pages/Analytics';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import MigrationModal from './components/MigrationModal';
import OfflineIndicator from './components/OfflineIndicator';
import InstallPrompt from './components/InstallPrompt';
import { isSupabaseConfigured } from './lib/supabase';
import { hasLocalData } from './utils/storage';

function MainApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [localWorkoutCount, setLocalWorkoutCount] = useState(0);

  useEffect(() => {
    // Check if user has local data that needs migration
    const checkLocalData = async () => {
      if (!isSupabaseConfigured) return;

      const hasData = await hasLocalData();
      if (hasData) {
        // Count local workouts for display
        const localforage = (await import('localforage')).default;
        const workoutStore = localforage.createInstance({
          name: 'rerack',
          storeName: 'workouts'
        });
        
        let count = 0;
        await workoutStore.iterate(() => {
          count++;
        });

        if (count > 0) {
          setLocalWorkoutCount(count);
          setShowMigrationModal(true);
        }
      }
    };

    // Small delay to let auth settle
    const timer = setTimeout(checkLocalData, 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'log':
        return <LogWorkout onComplete={() => setCurrentPage('dashboard')} />;
      case 'history':
        return <WorkoutHistory />;
      case 'muscles':
        return <MuscleAnalysis />;
      case 'analytics':
        return <Analytics />;
      case 'exercises':
        return <ExerciseLibrary />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark-bg text-white">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="md:ml-64 pb-20 md:pb-0">
          {renderPage()}
        </div>
        {currentPage !== 'log' && (
          <FloatingActionButton 
            onClick={() => setCurrentPage('log')}
            label="Start Workout"
          />
        )}
        <OfflineIndicator />
        <InstallPrompt />
        <MigrationModal
          isOpen={showMigrationModal}
          onClose={() => setShowMigrationModal(false)}
          workoutCount={localWorkoutCount}
        />
      </div>
    </ToastProvider>
  );
}

function AuthPages() {
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot'>('login');

  switch (authPage) {
    case 'login':
      return (
        <Login
          onNavigateToSignUp={() => setAuthPage('signup')}
          onNavigateToForgotPassword={() => setAuthPage('forgot')}
        />
      );
    case 'signup':
      return <SignUp onNavigateToLogin={() => setAuthPage('login')} />;
    case 'forgot':
      return <ForgotPassword onNavigateToLogin={() => setAuthPage('login')} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AuthGuard fallback={<AuthPages />}>
        <MainApp />
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
