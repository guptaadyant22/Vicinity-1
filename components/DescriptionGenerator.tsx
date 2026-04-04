// AI-powered description generator that calls the generate-description API endpoint.
// Provides a textarea editor with character validation (100–500), regenerate, and save actions.

'use client';
import { useState } from 'react';
import { FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';

interface GeneratorProps {
  businessName: string;
  businessType: string;
  features: string[];
  city?: string;
  state?: string;
  onDescriptionGenerated?: (description: string) => void;
  initialDescription?: string;
}

// AI description generator with editor, save, and regenerate actions
export default function DescriptionGenerator({
  businessName,
  businessType,
  features,
  city,
  state,
  onDescriptionGenerated,
  initialDescription = '',
}: GeneratorProps) {
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(!!initialDescription);

  // Call the AI description API
  const generateDescription = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType,
          features,
          city,
          state,
        }),
      });

      const data = await res.json();
      if (data.description) {
        setDescription(data.description);
        setShowEditor(true);
      }
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pass the finalized description to the parent
  const handleSave = () => {
    onDescriptionGenerated?.(description);
  };

  const charCount = description.length;
  const isValid = charCount >= 100 && charCount <= 500;

  return (
    <div className="bg-white/80 dark:bg-white/[0.04] rounded-[26px] border border-blue-500/12 dark:border-white/10 p-8 space-y-6 backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Business Description</h3>
        {!showEditor && (
          <button
            onClick={generateDescription}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] hover:shadow-[0_14px_36px_rgba(59,130,246,0.32)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiRefreshCw />
                Generate with AI
              </>
            )}
          </button>
        )}
      </div>

      {showEditor ? (
        <div className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter business description..."
            className="w-full px-4 py-3 border border-blue-500/15 dark:border-white/10 rounded-2xl bg-white dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none h-32 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />

          <div className="flex items-center justify-between">
            <div className={`text-sm font-semibold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {charCount}/500 characters {charCount >= 100 ? '✓' : '(minimum 100)'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDescription('');
                  setShowEditor(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-blue-500/15 dark:border-white/10 rounded-2xl bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-white/[0.08] hover:border-blue-500/30 transition-all text-sm font-medium"
              >
                <FiX size={16} />
                Clear
              </button>
              <button
                onClick={generateDescription}
                disabled={loading}
                className="flex items-center gap-2 bg-white dark:bg-white/[0.04] text-blue-600 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/20 px-5 py-2.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.22)] hover:shadow-[0_14px_36px_rgba(59,130,246,0.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <FiCheck size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 text-sm italic">Click &quot;Generate with AI&quot; to create a description</p>
      )}
    </div>
  );
}