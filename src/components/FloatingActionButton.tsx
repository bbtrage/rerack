import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
}

const FloatingActionButton: React.FC<FABProps> = ({ onClick, icon, label }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-lg shadow-accent-blue/50 flex items-center justify-center text-white hover:shadow-xl hover:shadow-accent-purple/50 transition-shadow"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {icon || <Plus className="w-8 h-8" />}
      {label && (
        <span className="absolute -top-10 bg-dark-secondary px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
      )}
    </motion.button>
  );
};

export default FloatingActionButton;
