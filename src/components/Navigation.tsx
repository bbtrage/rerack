import React from 'react';
import { motion } from 'framer-motion';
import { Home, PlusCircle, History, Activity, TrendingUp, Dumbbell, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'ai-generator', label: 'AI', icon: Sparkles },
    { id: 'log', label: 'Log', icon: PlusCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'muscles', label: 'Muscles', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

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
        
        <nav className="space-y-2 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Sign Out Button (only show if authenticated with Supabase) */}
        {isSupabaseConfigured && user && (
          <div className="mt-auto pt-4 border-t border-white/10">
            <motion.button
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 text-gray-300 hover:bg-white/5"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 px-2 py-2 z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                  currentPage === item.id
                    ? 'text-accent-blue'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent-blue rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;
