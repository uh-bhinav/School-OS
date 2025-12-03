'use client';

import React from 'react';

export const LogoPlaceholder = () => (
    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md">
        <img 
            src="https://placehold.co/80x80/0A2DAA/E4B400?text=AI" 
            alt="AcadionAI Logo" 
            className="w-full h-full object-cover"
        />
    </div>
);

export const AppleLogo = () => (
  <svg viewBox="0 0 384 512" width="18" height="18" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.8 125.2 25.2-.6 41.3-17.5 75-17.5 34.6 0 51.6 18.1 76.1 17.6 43.5-.9 92-80.8 102.1-103-2-2-42-16.7-40.7-58.3zm-51.5-144.6c15.6-21.6 30-51.6 20.8-97.6-23.9 3.1-60.8 24-78.7 54.3-14.7 24.6-24 53-15.8 87.6 25.2 2.2 57.3-21.7 73.7-44.3z"/>
  </svg>
);

export const GooglePlayLogo = () => (
  <svg viewBox="0 0 512 512" width="18" height="18" fill="currentColor">
     <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
  </svg>
);
