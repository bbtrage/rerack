import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { migrateLocalToCloud, clearLocalData } from '../utils/storage';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutCount: number;
}

export default function MigrationModal({ isOpen, onClose, workoutCount }: MigrationModalProps) {
  const [migrating, setMigrating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ workouts: number; profile: boolean } | null>(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setError('');

    try {
      const migrationResult = await migrateLocalToCloud();
      
      if (migrationResult.success) {
        setResult({
          workouts: migrationResult.workouts,
          profile: migrationResult.profile
        });
        setSuccess(true);
        
        // Clear local data after successful migration
        await clearLocalData();
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError('Migration failed. Please try again or contact support.');
      }
    } catch (err) {
      setError('An error occurred during migration. Your data is safe and you can try again.');
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={!migrating ? handleSkip : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-dark rounded-2xl p-8"
          >
            {!success ? (
              <>
                {/* Close button */}
                {!migrating && (
                  <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Icon */}
                <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-accent-blue" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center mb-2">
                  Import Local Data
                </h2>

                {/* Description */}
                <p className="text-white/60 text-center mb-6">
                  We found <strong className="text-white">{workoutCount} workout{workoutCount !== 1 ? 's' : ''}</strong> stored locally on this device. 
                  Would you like to import them to your cloud account?
                </p>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    disabled={migrating}
                    className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleMigrate}
                    disabled={migrating}
                    className="flex-1 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {migrating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Import
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-white/40 text-center mt-4">
                  Your local data will remain safe. You can skip this and import later.
                </p>
              </>
            ) : (
              <>
                {/* Success state */}
                <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent-green" />
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">
                  Import Complete!
                </h2>

                <p className="text-white/60 text-center mb-6">
                  Successfully imported:
                </p>

                <div className="space-y-2 mb-6">
                  {result && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">Workouts</span>
                        <span className="font-semibold text-accent-green">{result.workouts}</span>
                      </div>
                      {result.profile && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/80">Profile Data</span>
                          <CheckCircle className="w-5 h-5 text-accent-green" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <p className="text-sm text-white/60 text-center">
                  Your data is now synced to the cloud and accessible from any device.
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
