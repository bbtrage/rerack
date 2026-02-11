import React, { useState } from 'react';
import Navigation from './components/Navigation';
import FloatingActionButton from './components/FloatingActionButton';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import WorkoutHistory from './pages/WorkoutHistory';
import MuscleAnalysis from './pages/MuscleAnalysis';
import Analytics from './pages/Analytics';
import ExerciseLibrary from './pages/ExerciseLibrary';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

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
      </div>
    </ToastProvider>
  );
}

export default App;
