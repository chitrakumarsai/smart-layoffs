"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

interface UserData {
  username: string;
  role: string;
}

interface CommunityMember {
  id: string;
  name: string;
  role: string;
  focusAreas: string[];
  location: string;
  matchScore: number;
}

export default function CommunityPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Wellness Coach',
      focusAreas: ['Anxiety Management', 'Mindfulness', 'Work-Life Balance'],
      location: 'San Francisco, CA',
      matchScore: 92
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'Mental Health Advocate',
      focusAreas: ['Stress Relief', 'Career Transition Support', 'Meditation'],
      location: 'Remote',
      matchScore: 88
    },
    {
      id: '3',
      name: 'Emily Thompson',
      role: 'Support Group Leader',
      focusAreas: ['Depression Support', 'Peer Counseling', 'Coping Strategies'],
      location: 'New York, NY',
      matchScore: 85
    }
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

  const handleConnect = (memberId: string) => {
    // Implementation for connection request
    console.log('Connecting with member:', memberId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient">
      <Navbar username={userData?.username || ''} />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Healing Together
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join a supportive community of people who understand what you're going through. Share experiences, find support, and grow together during challenging times.
            </p>
          </div>

          {/* Stats Section */}
          <div className="glass-effect rounded-2xl p-8 mb-12 animate-fadeIn">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Peer Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1,000+</div>
                <div className="text-gray-600">Group Sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">5,000+</div>
                <div className="text-gray-600">Members Supporting Each Other</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Support Groups
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-xl hover:bg-white/60 transition-all cursor-pointer">
                  <h3 className="font-medium text-purple-600">Anxiety & Stress Management</h3>
                  <p className="text-sm text-gray-600 mt-1">Weekly group sessions for managing anxiety and stress</p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl hover:bg-white/60 transition-all cursor-pointer">
                  <h3 className="font-medium text-purple-600">Career Transition Support</h3>
                  <p className="text-sm text-gray-600 mt-1">Share experiences and coping strategies during career changes</p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl hover:bg-white/60 transition-all cursor-pointer">
                  <h3 className="font-medium text-purple-600">Mindfulness Practice</h3>
                  <p className="text-sm text-gray-600 mt-1">Daily meditation and mindfulness sessions</p>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Community Resources
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-xl">
                  <h3 className="font-medium text-purple-600">Crisis Support</h3>
                  <p className="text-sm text-gray-600 mt-1">24/7 helpline and emergency resources</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">Access Now →</button>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <h3 className="font-medium text-purple-600">Wellness Library</h3>
                  <p className="text-sm text-gray-600 mt-1">Articles, videos, and tools for mental health</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">Browse Resources →</button>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <h3 className="font-medium text-purple-600">Find a Therapist</h3>
                  <p className="text-sm text-gray-600 mt-1">Connect with licensed mental health professionals</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">Search Directory →</button>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="glass-effect rounded-2xl p-8 mb-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4">
              <select className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                <option>All Support Types</option>
                <option>Anxiety Support</option>
                <option>Depression Support</option>
                <option>Stress Management</option>
                <option>Career Transition</option>
                <option>Work-Life Balance</option>
              </select>
              <select className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                <option>All Locations</option>
                <option>Remote</option>
                <option>Local</option>
              </select>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="glass-effect rounded-xl p-6 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-gray-600 text-sm">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600 mb-1">
                      {member.matchScore}% Match
                    </div>
                    <div className="text-xs text-gray-500">{member.location}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {member.focusAreas.map((area, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleConnect(member.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Connect for Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}