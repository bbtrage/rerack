import React, { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, { duration: duration * 1000 });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
