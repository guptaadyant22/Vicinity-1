import { useState, useEffect, useCallback } from 'react';

export interface AccessibilityPrefs {
  adhdFriendly: boolean;
  fontScale: number;
  boldText: boolean;
  lineHeight: 'normal' | 'increased' | 'double';
  letterSpacing: 'normal' | 'wide' | 'wider';
  dyslexiaFont: boolean;
  highlightLinks: boolean;
  highlightTitles: boolean;
  colorMode: 'monochrome' | 'low-saturation' | 'high-saturation' | 'high-contrast' | 'light-contrast' | 'dark-contrast' | null;
  readingGuide: boolean;
  bigCursor: boolean;
}

const DEFAULT_PREFS: AccessibilityPrefs = {
  adhdFriendly: false,
  fontScale: 100,
  boldText: false,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  dyslexiaFont: false,
  highlightLinks: false,
  highlightTitles: false,
  colorMode: null,
  readingGuide: false,
  bigCursor: false,
};

const STORAGE_KEY = 'a11y-prefs';

export function useAccessibility() {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULT_PREFS);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Rehydrate state from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Error rehydrating accessibility preferences', e);
    }
  }, []);

  // 2. Helper to update a specific preference
  const updatePref = useCallback(<K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving accessibility preference', e);
      }
      return updated;
    });
  }, []);

  // 3. Reset function to clear preferences and DOM adjustments
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error removing accessibility preferences', e);
    }
    setPrefs(DEFAULT_PREFS);
  }, []);

  // 4. Single useEffect to handle all DOM updates based on prefs
  useEffect(() => {
    if (!isMounted) return;

    const html = document.documentElement;

    // --- ADHD Friendly ---
    let handleAdhdMouseMove: (e: MouseEvent) => void;
    if (prefs.adhdFriendly) {
      html.classList.add('a11y-adhd');

      let topMask = document.getElementById('a11y-adhd-mask-top');
      let bottomMask = document.getElementById('a11y-adhd-mask-bottom');
      
      if (!topMask) {
        topMask = document.createElement('div');
        topMask.id = 'a11y-adhd-mask-top';
        topMask.style.position = 'fixed';
        topMask.style.left = '0';
        topMask.style.top = '0';
        topMask.style.width = '100vw';
        topMask.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
        topMask.style.pointerEvents = 'none';
        topMask.style.zIndex = '9996';
        topMask.style.height = 'calc(50vh - 60px)';
        document.body.appendChild(topMask);
      }
      
      if (!bottomMask) {
        bottomMask = document.createElement('div');
        bottomMask.id = 'a11y-adhd-mask-bottom';
        bottomMask.style.position = 'fixed';
        bottomMask.style.left = '0';
        bottomMask.style.width = '100vw';
        bottomMask.style.bottom = '0';
        bottomMask.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
        bottomMask.style.pointerEvents = 'none';
        bottomMask.style.zIndex = '9996';
        bottomMask.style.top = 'calc(50vh + 60px)';
        document.body.appendChild(bottomMask);
      }

      handleAdhdMouseMove = (e: MouseEvent) => {
        const tMask = document.getElementById('a11y-adhd-mask-top');
        const bMask = document.getElementById('a11y-adhd-mask-bottom');
        const gapHeight = 120;
        const halfGap = gapHeight / 2;
        if (tMask) {
          tMask.style.height = `${Math.max(0, e.clientY - halfGap)}px`;
        }
        if (bMask) {
          bMask.style.top = `${e.clientY + halfGap}px`;
        }
      };

      window.addEventListener('mousemove', handleAdhdMouseMove);
    } else {
      html.classList.remove('a11y-adhd');
      const topMask = document.getElementById('a11y-adhd-mask-top');
      const bottomMask = document.getElementById('a11y-adhd-mask-bottom');
      if (topMask) topMask.remove();
      if (bottomMask) bottomMask.remove();
    }

    // --- Font Scale ---
    if (prefs.fontScale !== 100) {
      html.classList.add('a11y-active');
      html.style.setProperty('--a11y-font-scale', String(prefs.fontScale / 100));
    } else {
      html.classList.remove('a11y-active');
      html.style.removeProperty('--a11y-font-scale');
    }

    // --- Font Weight ---
    if (prefs.boldText) {
      html.classList.add('a11y-bold');
    } else {
      html.classList.remove('a11y-bold');
    }

    // --- Line Height ---
    if (prefs.lineHeight === 'increased') {
      html.classList.add('a11y-lh-1');
      html.classList.remove('a11y-lh-2');
    } else if (prefs.lineHeight === 'double') {
      html.classList.add('a11y-lh-2');
      html.classList.remove('a11y-lh-1');
    } else {
      html.classList.remove('a11y-lh-1', 'a11y-lh-2');
    }

    // --- Letter Spacing ---
    if (prefs.letterSpacing === 'wide') {
      html.classList.add('a11y-ls-1');
      html.classList.remove('a11y-ls-2');
    } else if (prefs.letterSpacing === 'wider') {
      html.classList.add('a11y-ls-2');
      html.classList.remove('a11y-ls-1');
    } else {
      html.classList.remove('a11y-ls-1', 'a11y-ls-2');
    }

    // --- Dyslexia Font ---
    if (prefs.dyslexiaFont) {
      const fontId = 'a11y-dyslexia-font';
      let styleEl = document.getElementById(fontId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = fontId;
        styleEl.textContent = `
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff');
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff');
            font-weight: bold;
            font-style: normal;
          }
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Italic.woff') format('woff');
            font-weight: normal;
            font-style: italic;
          }
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-BoldItalic.woff') format('woff');
            font-weight: bold;
            font-style: italic;
          }
        `;
        document.head.appendChild(styleEl);
      }
      html.classList.add('a11y-dyslexia');
    } else {
      html.classList.remove('a11y-dyslexia');
    }

    // --- Highlight Links ---
    if (prefs.highlightLinks) {
      html.classList.add('a11y-links');
    } else {
      html.classList.remove('a11y-links');
    }

    // --- Highlight Titles ---
    if (prefs.highlightTitles) {
      html.classList.add('a11y-titles');
    } else {
      html.classList.remove('a11y-titles');
    }

    // --- Color Mode Filters ---
    const filterMap: Record<string, string> = {
      monochrome: 'grayscale(100%)',
      'low-saturation': 'saturate(50%)',
      'high-saturation': 'saturate(200%)',
      'high-contrast': 'contrast(150%)',
      'light-contrast': 'brightness(1.15)',
      'dark-contrast': 'brightness(0.8)',
    };

    if (prefs.colorMode && filterMap[prefs.colorMode]) {
      html.style.filter = filterMap[prefs.colorMode];
    } else {
      html.style.filter = '';
    }

    // --- Big Cursor ---
    if (prefs.bigCursor) {
      html.classList.add('a11y-cursor');
    } else {
      html.classList.remove('a11y-cursor');
    }

    // --- Reading Guide Overlay ---
    let handleMouseMove: (e: MouseEvent) => void;
    if (prefs.readingGuide) {
      let guideEl = document.getElementById('a11y-reading-guide');
      if (!guideEl) {
        guideEl = document.createElement('div');
        guideEl.id = 'a11y-reading-guide';
        guideEl.style.position = 'fixed';
        guideEl.style.left = '0';
        guideEl.style.width = '100vw';
        guideEl.style.height = '80px';
        guideEl.style.backgroundColor = 'rgba(250, 204, 21, 0.25)';
        guideEl.style.pointerEvents = 'none';
        guideEl.style.zIndex = '9998';
        guideEl.style.top = '-100px';
        document.body.appendChild(guideEl);
      }

      handleMouseMove = (e: MouseEvent) => {
        const guide = document.getElementById('a11y-reading-guide');
        if (guide) {
          guide.style.top = `${e.clientY - 40}px`;
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
    } else {
      const guideEl = document.getElementById('a11y-reading-guide');
      if (guideEl) {
        guideEl.remove();
      }
    }

    // --- Cleanup on unmount or prefs change ---
    return () => {
      if (handleMouseMove) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (handleAdhdMouseMove) {
        window.removeEventListener('mousemove', handleAdhdMouseMove);
      }
    };
  }, [prefs, isMounted]);

  // Clean up all DOM styles/classes if hook completely unmounts (navigating away from home page)
  useEffect(() => {
    return () => {
      const html = document.documentElement;
      html.classList.remove(
        'a11y-adhd',
        'a11y-active',
        'a11y-bold',
        'a11y-lh-1',
        'a11y-lh-2',
        'a11y-ls-1',
        'a11y-ls-2',
        'a11y-dyslexia',
        'a11y-links',
        'a11y-titles',
        'a11y-cursor'
      );
      html.style.removeProperty('--a11y-font-scale');
      html.style.filter = '';

      const guideEl = document.getElementById('a11y-reading-guide');
      if (guideEl) {
        guideEl.remove();
      }

      const topMask = document.getElementById('a11y-adhd-mask-top');
      const bottomMask = document.getElementById('a11y-adhd-mask-bottom');
      if (topMask) topMask.remove();
      if (bottomMask) bottomMask.remove();
    };
  }, []);

  return {
    prefs,
    updatePref,
    reset,
    isMounted,
  };
}
