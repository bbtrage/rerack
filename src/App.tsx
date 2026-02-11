import React, { useState } from 'react';
import Navigation from './components/Navigation';
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
    <div className="min-h-screen bg-dark-bg text-white">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="md:ml-64">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
