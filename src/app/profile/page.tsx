"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import JournalModal from '../components/JournalModal';

interface JournalEntry {
  date: string;
  mood: number;
  content: string;
}

interface UserData {
  username: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      date: '2025-04-01',
      mood: 7,
      content: 'Starting to feel more optimistic about the future. Had a great networking call today.'
    },
    {
      date: '2025-04-02',
      mood: 8,
      content: 'Applied to three promising positions. The interview prep is paying off.'
    }
  ]);

  const [skills, setSkills] = useState([
    { name: 'JavaScript', level: 85 },
    { name: 'React', level: 80 },
    { name: 'Node.js', level: 75 },
    { name: 'TypeScript', level: 70 }
  ]);

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

  const addJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => [entry, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient">
      <Navbar username={userData?.username || ''} />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="text-center space-y-4 fade-in mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-gray-600">Track your progress and maintain your journal</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills Section */}
            <div className="glass-effect rounded-2xl p-8 shadow-lg animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Skills
                </h2>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Update Skills
                </button>
              </div>
              <div className="space-y-6">
                {skills.map(skill => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Journal Section */}
            <div className="glass-effect rounded-2xl p-8 shadow-lg animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Journal
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  New Entry
                </button>
              </div>
              
              <div className="space-y-6">
                {journalEntries.map((entry, index) => (
                  <div 
                    key={entry.date}
                    className="bg-white/50 rounded-xl p-6 hover:bg-white/60 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-gray-600">{entry.date}</div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Mood:</span>
                        <span className="text-sm font-medium text-purple-600">{entry.mood}/10</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <JournalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={addJournalEntry}
      />
    </div>
  );
}