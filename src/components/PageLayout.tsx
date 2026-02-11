import React from 'react';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-20 md:pb-0"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            {title}
          </h1>
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    </motion.div>
  );
};

export default PageLayout;
