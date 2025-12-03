"use client";

// This route renders the homepage for preview purposes
// Access it at http://localhost:3000/preview

import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('../homepage'), { ssr: false });

export default function PreviewPage() {
  return <HomePage />;
}
