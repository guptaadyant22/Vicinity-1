"use client";

import React, { useState, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import AccessibilityWidget from './AccessibilityWidget';

export default function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isAdhd, setIsAdhd] = useState(false);

  useEffect(() => {
    const checkAdhd = () => {
      setIsAdhd(document.documentElement.classList.contains('a11y-adhd'));
    };
    checkAdhd();
    const observer = new MutationObserver(checkAdhd);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion={isAdhd ? "always" : "user"}>
      {children}
      <AccessibilityWidget />
    </MotionConfig>
  );
}
