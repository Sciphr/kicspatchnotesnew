'use client';

import { useEffect } from 'react';

export default function EmailProcessorInitializer() {
  useEffect(() => {
    const initializeProcessor = async () => {
      try {
        const response = await fetch('/api/start-processor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('Email processor initialized');
        } else {
          console.warn('Failed to initialize email processor');
        }
      } catch (error) {
        console.warn('Email processor initialization error:', error);
      }
    };

    // Start processor after a small delay to ensure app is fully loaded
    const timer = setTimeout(initializeProcessor, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}