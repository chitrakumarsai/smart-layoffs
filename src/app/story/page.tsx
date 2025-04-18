"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

interface UserData {
  username: string;
  role: string;
}

export default function StoryPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    if (!token || !storedUserData) {
      router.push('/auth');
      return;
    }
    try {
      setUserData(JSON.parse(storedUserData));
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      router.push('/auth');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ story }),
      });

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      setFeedback('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const examples = [
    "During my layoff, I struggled with anxiety but found strength through daily meditation...",
    "Joining support groups helped me overcome the initial shock and isolation...",
    "I learned to reframe my layoff as an opportunity for personal growth..."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient">
      <Navbar username={userData?.username || ''} />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Journey Matters
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Share your story, inspire others, and be part of a supportive community. Every experience shared helps others feel less alone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Share Your Story
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-xl">
                  <p className="text-gray-600">Your journey of resilience and growth can inspire others. Write about your experiences, challenges, and victories.</p>
                  <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
                    Start Writing
                  </button>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <h3 className="font-medium text-purple-600">Writing Prompts</h3>
                  <ul className="text-sm text-gray-600 mt-2 space-y-2">
                    <li>• What helped you most during challenging times?</li>
                    <li>• How has your perspective changed through this journey?</li>
                    <li>• What advice would you give to others facing similar challenges?</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Featured Stories
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-xl hover:bg-white/60 transition-all cursor-pointer">
                  <h3 className="font-medium text-purple-600">Finding Strength in Vulnerability</h3>
                  <p className="text-sm text-gray-600 mt-1">A journey from burnout to balanced living</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>Sarah M.</span>
                    <span className="mx-2">•</span>
                    <span>5 min read</span>
                  </div>
                </div>
                <div className="p-4 bg-white/50 rounded-xl hover:bg-white/60 transition-all cursor-pointer">
                  <h3 className="font-medium text-purple-600">Rebuilding After Change</h3>
                  <p className="text-sm text-gray-600 mt-1">How I turned a career setback into an opportunity</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>David K.</span>
                    <span className="mx-2">•</span>
                    <span>7 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 mb-12 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">
              Story Guidelines
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <h3 className="font-medium text-purple-600 mb-2">Be Authentic</h3>
                <p className="text-sm text-gray-600">Share your genuine experience and emotions</p>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-purple-600 mb-2">Be Respectful</h3>
                <p className="text-sm text-gray-600">Maintain privacy and show compassion</p>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-purple-600 mb-2">Be Supportive</h3>
                <p className="text-sm text-gray-600">Focus on growth and hope</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Examples Section */}
            <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Example Stories
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/50 rounded-xl cursor-pointer hover:bg-white/60 transition-all duration-200"
                    onClick={() => setStory(example)}
                  >
                    <p className="text-sm text-gray-600">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Story Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Mental Health Journey
                </label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Share your mental health journey, coping strategies, or moments of growth..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
                  required
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isGenerating || !story.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      'Get Feedback'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Feedback Section */}
            {feedback && (
              <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Feedback
                </h2>
                <div className="prose prose-purple max-w-none">
                  <div className="p-4 bg-white/50 rounded-xl">
                    <p className="text-gray-700">{feedback}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Story Crafting Tips
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/50 rounded-xl">
                  <h3 className="font-medium text-purple-600 mb-2">Be Authentic</h3>
                  <p className="text-sm text-gray-600">
                    Share your genuine experiences and emotions - your story can help others feel less alone.
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <h3 className="font-medium text-purple-600 mb-2">Focus on Growth</h3>
                  <p className="text-sm text-gray-600">
                    Include how you've grown, what you've learned, and the coping strategies that helped you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}