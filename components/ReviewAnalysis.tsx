// Displays AI-generated review insights including sentiment, strengths, and improvement areas.
// Fetches analysis from the /api/analyze-reviews endpoint and renders color-coded cards.

'use client';
import { useEffect, useState } from 'react';
import { FiBarChart2, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

interface ReviewAnalysisData {
  sentimentScore: number;
  sentimentLabel: string;
  strengths: string[];
  improvements: string[];
  themes: string[];
  totalReviews: number;
  averageRating: number;
}

// Displays AI-generated review insights with sentiment cards
export default function ReviewAnalysis({ businessId }: { businessId: string }) {
  const [analysis, setAnalysis] = useState<ReviewAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch review analysis on mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch('/api/analyze-reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId }),
        });
        const data = await res.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [businessId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-8 bg-white/80 dark:bg-white/[0.04] border border-blue-500/12 dark:border-white/10 rounded-[26px] animate-pulse backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
        <div className="h-8 bg-blue-500/15 dark:bg-blue-500/10 rounded-xl w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-blue-500/10 dark:bg-white/[0.05] rounded-xl w-2/3"></div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!analysis || analysis.totalReviews === 0) {
    return (
      <div className="p-8 bg-blue-50/60 dark:bg-blue-500/[0.06] border border-blue-500/12 dark:border-white/10 rounded-[26px] text-center backdrop-blur-xl">
        <p className="text-slate-600 dark:text-slate-300 font-medium">No reviews yet. Get some reviews to see insights!</p>
      </div>
    );
  }

  // Map sentiment labels to color classes
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Very Positive':
        return 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30';
      case 'Positive':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25';
      case 'Neutral':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20';
      case 'Negative':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20';
      case 'Very Negative':
        return 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/25';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-white/[0.04] rounded-[26px] border border-blue-500/12 dark:border-white/10 p-8 space-y-8 backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 border-b border-blue-500/10 dark:border-white/10 pb-6">
        <FiBarChart2 className="text-blue-600 dark:text-blue-300" size={28} />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Review Insights</h2>
      </div>

      {/* Sentiment overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border backdrop-blur-sm ${getSentimentColor(analysis.sentimentLabel)}`}>
          <p className="text-sm font-semibold opacity-80 mb-2">Overall Sentiment</p>
          <p className="text-3xl font-bold mb-4">{analysis.sentimentLabel}</p>
          <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.sentimentScore * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 bg-blue-50/60 dark:bg-blue-500/[0.08] rounded-2xl border border-blue-500/20 dark:border-blue-500/15 backdrop-blur-sm">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-300 opacity-80 mb-2">Average Rating</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-200 mb-2">
            {analysis.averageRating.toFixed(1)} / 5 ⭐
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">From {analysis.totalReviews} reviews</p>
        </div>

        <div className="p-6 bg-indigo-50/60 dark:bg-indigo-500/[0.08] rounded-2xl border border-indigo-500/20 dark:border-indigo-500/15 backdrop-blur-sm">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 opacity-80 mb-2">Engagement</p>
          <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-200 mb-2">{analysis.totalReviews}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Customer reviews</p>
        </div>
      </div>

      {/* Strengths list */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-emerald-500 dark:text-emerald-400" size={24} />
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">What Customers Love</h3>
        </div>
        <div className="space-y-3">
          {analysis.strengths.map((strength, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/25 backdrop-blur-sm hover:bg-emerald-500/15 transition-all"
            >
              <span className="text-emerald-500 dark:text-emerald-400 text-xl flex-shrink-0">✓</span>
              <p className="text-emerald-700 dark:text-emerald-300 font-medium capitalize">{strength}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement areas */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiAlertCircle className="text-amber-500 dark:text-amber-400" size={24} />
          <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">Areas to Improve</h3>
        </div>
        <div className="space-y-3">
          {analysis.improvements.map((improvement, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/25 backdrop-blur-sm hover:bg-amber-500/15 transition-all"
            >
              <span className="text-amber-500 dark:text-amber-400 text-xl flex-shrink-0">⚠</span>
              <p className="text-amber-700 dark:text-amber-300 font-medium capitalize">{improvement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Theme tags */}
      {analysis.themes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Popular Themes</h3>
          <div className="flex flex-wrap gap-3">
            {analysis.themes.map((theme, i) => (
              <span
                key={i}
                className="px-5 py-2.5 bg-blue-500/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-500/25 dark:border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/20 transition-all"
              >
                #{theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}