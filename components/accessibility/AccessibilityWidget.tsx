import React, { useState } from 'react';
import { Accessibility, X, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../../hooks/useAccessibility';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { prefs, updatePref, reset, isMounted } = useAccessibility();

  if (!isMounted) return null;

  return (
    <div className="a11y-panel-container font-sans" style={{ filter: 'none' }}>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-28 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{ zIndex: 100000 }}
        aria-label="Open Accessibility Menu"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      {/* Slide-in Panel */}
      <div
        className="fixed right-0 top-0 h-screen w-[320px] bg-[var(--card)] border-l border-[var(--border)] text-[var(--foreground)] shadow-2xl flex flex-col"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 100001,
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between bg-[#2563eb] px-4 py-3.5 text-white">
          <div className="flex items-center gap-2 font-semibold">
            <Accessibility className="h-5 w-5" />
            <span>Accessibility Menu</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="rounded p-1 hover:bg-blue-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              title="Reset Settings"
              aria-label="Reset all accessibility settings"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 hover:bg-blue-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              title="Close Menu"
              aria-label="Close accessibility menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Panel Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide text-left">
          
          {/* 1. PROFILES SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Profiles
            </h3>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">ADHD Friendly</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">ADHD Friendly mode</p>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={prefs.adhdFriendly}
                    onChange={(e) => updatePref('adhdFriendly', e.target.checked)}
                  />
                  <span className="a11y-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. CONTENT ADJUSTMENTS SECTION */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Content Adjustments
            </h3>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-4">
              
              {/* Font Size Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Font Size</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{prefs.fontScale}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="200"
                  value={prefs.fontScale}
                  onChange={(e) => updatePref('fontScale', parseInt(e.target.value))}
                  className="a11y-range"
                />
              </div>

              <hr className="border-[var(--border)]" />

              {/* Font Weight (Bold text) Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Bold Text</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Increases body text weight</p>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={prefs.boldText}
                    onChange={(e) => updatePref('boldText', e.target.checked)}
                  />
                  <span className="a11y-switch-slider"></span>
                </label>
              </div>

              <hr className="border-[var(--border)]" />

              {/* Line Height Steps */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Line Height</h4>
                <div className="a11y-btn-group">
                  <button
                    onClick={() => updatePref('lineHeight', 'normal')}
                    className={`a11y-btn-group-btn ${prefs.lineHeight === 'normal' ? 'active' : ''}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => updatePref('lineHeight', 'increased')}
                    className={`a11y-btn-group-btn ${prefs.lineHeight === 'increased' ? 'active' : ''}`}
                  >
                    Increased
                  </button>
                  <button
                    onClick={() => updatePref('lineHeight', 'double')}
                    className={`a11y-btn-group-btn ${prefs.lineHeight === 'double' ? 'active' : ''}`}
                  >
                    Double
                  </button>
                </div>
              </div>

              <hr className="border-[var(--border)]" />

              {/* Letter Spacing Steps */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Letter Spacing</h4>
                <div className="a11y-btn-group">
                  <button
                    onClick={() => updatePref('letterSpacing', 'normal')}
                    className={`a11y-btn-group-btn ${prefs.letterSpacing === 'normal' ? 'active' : ''}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => updatePref('letterSpacing', 'wide')}
                    className={`a11y-btn-group-btn ${prefs.letterSpacing === 'wide' ? 'active' : ''}`}
                  >
                    Wide
                  </button>
                  <button
                    onClick={() => updatePref('letterSpacing', 'wider')}
                    className={`a11y-btn-group-btn ${prefs.letterSpacing === 'wider' ? 'active' : ''}`}
                  >
                    Wider
                  </button>
                </div>
              </div>

              <hr className="border-[var(--border)]" />

              {/* Dyslexia Font Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Dyslexia Font</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Use OpenDyslexic font</p>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={prefs.dyslexiaFont}
                    onChange={(e) => updatePref('dyslexiaFont', e.target.checked)}
                  />
                  <span className="a11y-switch-slider"></span>
                </label>
              </div>

              <hr className="border-[var(--border)]" />

              {/* Highlight Links Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Highlight Links</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">High-contrast anchor styles</p>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={prefs.highlightLinks}
                    onChange={(e) => updatePref('highlightLinks', e.target.checked)}
                  />
                  <span className="a11y-switch-slider"></span>
                </label>
              </div>

              <hr className="border-[var(--border)]" />

              {/* Highlight Titles Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Highlight Titles</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Underlines page headings</p>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={prefs.highlightTitles}
                    onChange={(e) => updatePref('highlightTitles', e.target.checked)}
                  />
                  <span className="a11y-switch-slider"></span>
                </label>
              </div>

            </div>
          </div>

          {/* 3. COLOR ADJUSTMENTS SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Color Adjustments
            </h3>
            <div className="a11y-color-grid">
              {[
                { id: 'monochrome', label: 'Monochrome' } as const,
                { id: 'low-saturation', label: 'Low Saturation' } as const,
                { id: 'high-saturation', label: 'High Saturation' } as const,
                { id: 'high-contrast', label: 'High Contrast' } as const,
                { id: 'light-contrast', label: 'Light Contrast' } as const,
                { id: 'dark-contrast', label: 'Dark Contrast' } as const,
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updatePref('colorMode', prefs.colorMode === mode.id ? null : mode.id)}
                  className={`a11y-color-btn ${prefs.colorMode === mode.id ? 'active' : ''}`}
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 opacity-80" />
                  <span className="truncate">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. NAVIGATION AIDS SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Navigation Aids
            </h3>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-4">
              
              {/* Reading Guide Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Reading Guide</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Horizontal focus overlay bar</p>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={prefs.readingGuide}
                    onChange={(e) => updatePref('readingGuide', e.target.checked)}
                  />
                  <span className="a11y-switch-slider"></span>
                </label>
              </div>

              <hr className="border-[var(--border)]" />

              {/* Big Cursor Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Big Cursor</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Enlarged black pointer</p>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={prefs.bigCursor}
                    onChange={(e) => updatePref('bigCursor', e.target.checked)}
                  />
                  <span className="a11y-switch-slider"></span>
                </label>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
