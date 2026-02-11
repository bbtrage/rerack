import React from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'log', label: 'Log', icon: '✏️' },
    { id: 'history', label: 'History', icon: '📅' },
    { id: 'muscles', label: 'Muscles', icon: '💪' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'exercises', label: 'Exercises', icon: '🏋️' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/10 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            ReRack
          </h1>
          <p className="text-sm text-gray-400 mt-1">Track your gains</p>
        </div>
        
        <nav className="space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                currentPage === item.id
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 px-2 py-2 z-50">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 5).map(item => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'text-accent-blue'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;
