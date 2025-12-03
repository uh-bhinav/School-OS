'use client';

import React from 'react';

interface TestimonialCardProps {
  img: string;
  name: string;
  role: string;
  text: string;
  index: number;
  progress: number;
}

export const TestimonialCard = ({ img, name, role, text, index, progress }: TestimonialCardProps) => {
    const totalCards = 4;
    const cardIndex = totalCards - 1 - index; // Reverse order so first card appears first
    
    // Each card appears at a specific scroll progress point
    const appearAt = cardIndex * 0.25; // Cards appear at 0%, 25%, 50%, 75%
    const isVisible = progress >= appearAt;
    
    // Calculate stack position - cards that appeared earlier go to the back
    const stackPosition = Math.max(0, Math.floor((progress - appearAt) / 0.25));
    
    // Tilt angle - alternating left/right tilt for each card in stack
    const baseTilt = (index % 2 === 0) ? -2 : 2;
    const tiltAngle = isVisible ? baseTilt * (1 + stackPosition * 0.5) : 0;
    
    // Y offset - cards stack with slight offset to show depth
    const yOffset = isVisible ? stackPosition * -8 : 100;
    
    // Scale - cards in back are slightly smaller
    const scale = isVisible ? 1 - (stackPosition * 0.03) : 0.9;
    
    // Z-index - newer cards on top
    const zIndex = isVisible ? (totalCards - stackPosition) : 0;
    
    // Opacity
    const opacity = isVisible ? 1 - (stackPosition * 0.15) : 0;
    
    // Brightness - cards in back are slightly dimmer
    const brightness = 1 - (stackPosition * 0.08);

    return (
        <div 
            className="absolute left-1/2 w-full max-w-2xl transition-all duration-700 ease-out"
            style={{
                transform: `translateX(-50%) translateY(${yOffset}px) rotate(${tiltAngle}deg) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                filter: `brightness(${brightness})`,
            }}
        >
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
                {/* Quote Text */}
                <p className="text-slate-700 text-lg leading-relaxed mb-6">&quot;{text}&quot;</p>
                
                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <img src={img} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
                    <div>
                        <h4 className="font-bold text-slate-900">{name}</h4>
                        <p className="text-sm text-[#0A2DAA]">{role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
