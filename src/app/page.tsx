"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';

interface UserData {
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

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

  const features = [
    {
      title: "Career Support",
      description: "Get personalized coaching and resources to navigate your career transition successfully.",
      gradient: "from-blue-500 to-purple-500",
      href: "/story"
    },
    {
      title: "Financial Planning",
      description: "Advanced tools to manage your finances and plan for the future with confidence.",
      gradient: "from-purple-500 to-pink-500",
      href: "/finance"
    },
    {
      title: "Community Connection",
      description: "Connect with others in similar situations, share experiences, and find support.",
      gradient: "from-pink-500 to-red-500",
      href: "/community"
    }
  ];

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient">
      <Navbar username={userData.username} userRole={userData.role} />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 fade-in">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome, {userData.firstName || userData.username}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your comprehensive support system designed to help you bounce back stronger.
            </p>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <button 
                key={feature.title}
                onClick={() => router.push(feature.href)}
                className="glass-effect rounded-2xl p-8 card-hover animate-fadeIn text-left w-full transition-transform hover:scale-105"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`bg-gradient-to-r ${feature.gradient} w-12 h-12 rounded-xl mb-6 animate-pulse`} />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-32 glass-effect rounded-2xl p-12 text-center animate-fadeIn">
            <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Journey Matters
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">93%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">45 Days</div>
                <div className="text-gray-600">Average Recovery Time</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Community Support</div>
              </div>
            </div>
          </div>

          <div className="mt-32 text-center space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Ready to Take Control?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Complete Your Profile
              </button>
              <button
                onClick={() => router.push('/community')}
                className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-3 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Join Community
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
