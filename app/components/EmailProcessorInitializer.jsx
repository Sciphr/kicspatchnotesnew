'use client';

import { useEffect } from 'react';
import { startEmailProcessor } from '../lib/emailProcessor';

export default function EmailProcessorInitializer() {
  useEffect(() => {
    // Auto-start the email processor when the app loads
    startEmailProcessor();
    console.log('Email processor initialized');
  }, []);

  return null;
}