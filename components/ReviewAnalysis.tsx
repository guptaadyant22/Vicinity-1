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

export default function ReviewAnalysis({ businessId }: { businessId: string }) {
  const [analysis, setAnalysis] = useState<ReviewAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="p-8 bg-[#0f0f0f] border border-orange-500/25 rounded-2xl animate-pulse backdrop-blur-xl">
        <div className="h-8 bg-orange-500/20 rounded-lg w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-orange-500/15 rounded-lg w-2/3"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis || analysis.totalReviews === 0) {
    return (
      <div className="p-8 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/25 rounded-2xl text-center backdrop-blur-xl">
        <p className="text-gray-300 font-medium">No reviews yet. Get some reviews to see insights!</p>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Very Positive':
        return 'bg-green-500/15 text-green-300 border-green-500/30';
      case 'Positive':
        return 'bg-green-500/10 text-green-400 border-green-500/25';
      case 'Neutral':
        return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
      case 'Negative':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/20';
      case 'Very Negative':
        return 'bg-red-500/10 text-red-300 border-red-500/25';
      default:
        return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
    }
  };

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-orange-500/25 p-8 space-y-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-orange-500/20 pb-6">
        <FiBarChart2 className="text-orange-500" size={28} />
        <h2 className="text-3xl font-bold text-white">Review Insights</h2>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border backdrop-blur-sm ${getSentimentColor(analysis.sentimentLabel)}`}>
          <p className="text-sm font-semibold opacity-80 mb-2">Overall Sentiment</p>
          <p className="text-3xl font-bold mb-4">{analysis.sentimentLabel}</p>
          <div className="w-full bg-gray-700/30 h-2 rounded-full">
            <div
              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.sentimentScore * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-500/15 to-orange-500/15 rounded-xl border border-orange-500/25 backdrop-blur-sm">
          <p className="text-sm font-semibold text-orange-300 opacity-80 mb-2">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-300 mb-2">
            {analysis.averageRating.toFixed(1)} / 5 ⭐
          </p>
          <p className="text-sm text-gray-400">From {analysis.totalReviews} reviews</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-xl border border-blue-500/25 backdrop-blur-sm">
          <p className="text-sm font-semibold text-blue-300 opacity-80 mb-2">Engagement</p>
          <p className="text-3xl font-bold text-blue-300 mb-2">{analysis.totalReviews}</p>
          <p className="text-sm text-gray-400">Customer reviews</p>
        </div>
      </div>

      {/* Strengths */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-green-400" size={24} />
          <h3 className="text-xl font-bold text-green-400">What Customers Love</h3>
        </div>
        <div className="space-y-3">
          {analysis.strengths.map((strength, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/25 backdrop-blur-sm hover:bg-green-500/15 transition-all"
            >
              <span className="text-green-400 text-xl flex-shrink-0">✓</span>
              <p className="text-green-300 font-medium capitalize">{strength}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Areas for Improvement */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiAlertCircle className="text-orange-400" size={24} />
          <h3 className="text-xl font-bold text-orange-400">Areas to Improve</h3>
        </div>
        <div className="space-y-3">
          {analysis.improvements.map((improvement, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/25 backdrop-blur-sm hover:bg-orange-500/15 transition-all"
            >
              <span className="text-orange-400 text-xl flex-shrink-0">⚠</span>
              <p className="text-orange-300 font-medium capitalize">{improvement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Themes */}
      {analysis.themes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Popular Themes</h3>
          <div className="flex flex-wrap gap-3">
            {analysis.themes.map((theme, i) => (
              <span
                key={i}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 rounded-full text-sm font-semibold border border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/30 transition-all"
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