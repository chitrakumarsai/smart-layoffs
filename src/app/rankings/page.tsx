"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

interface UserData {
  username: string;
  role: string;
  id: string;
}

interface UserRanking {
  userId: string;
  username: string;
  leetcodeSolved: number;
  leetcodeStats: {
    easy: number;
    medium: number;
    hard: number;
    languages: string[];
  };
  rank: number;
  stressLevel?: number;
}

interface LeetCodeSubmission {
  problemId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
}

export default function RankingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('solved');
  const [newSubmission, setNewSubmission] = useState<LeetCodeSubmission>({
    problemId: '',
    difficulty: 'easy',
    language: 'python'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    if (!token || !storedUserData) {
      router.push('/auth');
      return;
    }
    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      fetchRankings();
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      router.push('/auth');
    }
  }, [router]);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rankings?type=leetcode');
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    try {
      const response = await fetch('/api/rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'leetcode',
          ...newSubmission,
          userId: userData.id,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRankings(data.rankings);
        setNewSubmission({
          problemId: '',
          difficulty: 'easy',
          language: 'python'
        });
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error submitting problem:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient">
        <Navbar username={userData?.username || ''} />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading rankings...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient">
      <Navbar username={userData?.username || ''} />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 fade-in mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LeetCode Rankings
            </h1>
            <p className="text-gray-600">Track your progress and compete with others</p>
          </div>

          {/* Add Problem Form */}
          <div className="glass-effect rounded-2xl p-6 mb-8 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Log Solved Problem</h2>
            <form onSubmit={handleSubmitProblem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem ID/Name
                  </label>
                  <input
                    type="text"
                    value={newSubmission.problemId}
                    onChange={(e) => setNewSubmission({
                      ...newSubmission,
                      problemId: e.target.value
                    })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newSubmission.difficulty}
                    onChange={(e) => setNewSubmission({
                      ...newSubmission,
                      difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                    })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={newSubmission.language}
                    onChange={(e) => setNewSubmission({
                      ...newSubmission,
                      language: e.target.value
                    })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-6 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Submit Problem
                </button>
              </div>
            </form>
          </div>

          {/* Rankings Table */}
          <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
            <div className="overflow-x-auto">
              {rankings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No rankings available yet. Be the first to submit!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th className="pb-4">Rank</th>
                      <th className="pb-4">Username</th>
                      <th className="pb-4">Total Solved</th>
                      <th className="pb-4">Easy</th>
                      <th className="pb-4">Medium</th>
                      <th className="pb-4">Hard</th>
                      <th className="pb-4">Languages</th>
                      <th className="pb-4">Stress Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rankings.map((user) => (
                      <tr key={user.userId} className={`text-sm ${
                        userData?.id === user.userId ? 'bg-purple-50' : ''
                      }`}>
                        <td className="py-4">{user.rank}</td>
                        <td className="py-4">{user.username}</td>
                        <td className="py-4">{user.leetcodeSolved || 0}</td>
                        <td className="py-4">{user.leetcodeStats?.easy || 0}</td>
                        <td className="py-4">{user.leetcodeStats?.medium || 0}</td>
                        <td className="py-4">{user.leetcodeStats?.hard || 0}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.leetcodeStats?.languages?.map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs"
                              >
                                {lang}
                              </span>
                            )) || null}
                          </div>
                        </td>
                        <td className="py-4">
                          {user.stressLevel ? (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.stressLevel <= 3 ? 'bg-green-100 text-green-600' :
                              user.stressLevel <= 7 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {user.stressLevel}/10
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}