import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncOfflineData } from '../utils/storage';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (isOnline && !justCameOnline) {
      setJustCameOnline(true);
      handleSync();
    } else if (!isOnline) {
      setJustCameOnline(false);
    }
  }, [isOnline]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncOfflineData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {(!isOnline || syncing) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`
            glass-dark rounded-full px-4 py-2 flex items-center gap-2
            ${syncing ? 'bg-accent-blue/20 border-accent-blue/30' : 'bg-orange-500/20 border-orange-500/30'}
          `}>
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 text-accent-blue animate-spin" />
                <span className="text-sm font-medium text-accent-blue">Syncing...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Offline</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
