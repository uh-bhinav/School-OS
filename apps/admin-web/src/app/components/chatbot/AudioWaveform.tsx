/**
 * AudioWaveform.tsx
 *
 * Animated audio waveform visualization component for voice input.
 * Displays animated bars that simulate audio levels when listening.
 * Similar to ChatGPT's voice input visual feedback.
 *
 * This is purely visual feedback - no actual audio analysis.
 * The animation runs continuously while `isActive` is true.
 */

import { useEffect, useState } from 'react';

interface AudioWaveformProps {
  /** Whether the waveform should be animating */
  isActive: boolean;
  /** Number of bars to display */
  barCount?: number;
  /** Color of the bars (Tailwind class or CSS color) */
  barColor?: string;
  /** Additional CSS classes */
  className?: string;
}

export default function AudioWaveform({
  isActive,
  barCount = 5,
  barColor = 'bg-white',
  className = '',
}: AudioWaveformProps) {
  // Random heights for each bar to create organic-looking animation
  const [heights, setHeights] = useState<number[]>(
    Array(barCount).fill(0).map(() => Math.random() * 0.5 + 0.2)
  );

  useEffect(() => {
    if (!isActive) {
      // Reset to minimal height when not active
      setHeights(Array(barCount).fill(0.15));
      return;
    }

    // Animate bars with random heights at intervals
    const interval = setInterval(() => {
      setHeights(
        Array(barCount)
          .fill(0)
          .map(() => Math.random() * 0.7 + 0.3) // Height between 30% and 100%
      );
    }, 150); // Update every 150ms for smooth animation

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div
      className={`flex items-center justify-center gap-0.5 h-5 ${className}`}
      aria-hidden="true"
    >
      {heights.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-150 ease-in-out ${barColor}`}
          style={{
            height: `${height * 100}%`,
            opacity: isActive ? 1 : 0.3,
            transform: isActive ? 'scaleY(1)' : 'scaleY(0.5)',
          }}
        />
      ))}
    </div>
  );
}
