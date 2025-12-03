'use client';

import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';

interface FloatingGetInTouchButtonProps {
  onClick: () => void;
}

export const FloatingGetInTouchButton = ({ onClick }: FloatingGetInTouchButtonProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <button
            onClick={onClick}
            className={`fixed bottom-8 right-8 z-[90] flex items-center gap-3 px-6 py-4 bg-[#0A2DAA] text-white font-bold rounded-full shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all duration-300 group ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        >
            <Mail className="w-5 h-5" />
            <span className="hidden sm:inline">Get in Touch</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E4B400] rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E4B400] rounded-full"></div>
        </button>
    );
};
