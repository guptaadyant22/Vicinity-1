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

  const handleSave = () => {
    onDescriptionGenerated?.(description);
  };

  const charCount = description.length;
  const isValid = charCount >= 100 && charCount <= 500;

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-orange-500/25 p-8 space-y-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Business Description</h3>
        {!showEditor && (
          <button
            onClick={generateDescription}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
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
            className="w-full px-4 py-3 border border-orange-500/25 rounded-xl bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 focus:border-transparent resize-none h-32 placeholder-gray-500 transition-all"
          />

          <div className="flex items-center justify-between">
            <div className={`text-sm font-semibold ${isValid ? 'text-green-400' : 'text-orange-400'}`}>
              {charCount}/500 characters {charCount >= 100 ? '✓' : '(minimum 100)'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDescription('');
                  setShowEditor(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-orange-500/25 rounded-xl bg-[#1a1a1a] text-gray-300 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all text-sm font-medium"
              >
                <FiX size={16} />
                Clear
              </button>
              <button
                onClick={generateDescription}
                disabled={loading}
                className="flex items-center gap-2 bg-[#1a1a1a] text-orange-400 border border-orange-500/25 px-5 py-2.5 rounded-xl hover:bg-orange-500/10 hover:border-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <FiCheck size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">Click "Generate with AI" to create a description</p>
      )}
    </div>
  );
}