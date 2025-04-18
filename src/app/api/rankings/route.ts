import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'src/app/api/auth/users.json');

interface LeetCodeSubmission {
  userId: string;
  problemId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  timestamp: string;
}

interface UserProgress {
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

interface User {
  id: string;
  username: string;
  leetcodeSolved: number;
  leetcodeStats: {
    easy: number;
    medium: number;
    hard: number;
    languages: string[];
  };
  stressLevel?: number;
}

interface WellbeingProgress {
  userId: string;
  username: string;
  category: string;
  activitiesCompleted: number;
  totalActivities: number;
  recentActivities: Array<{
    id: string;
    name: string;
    type: 'Mindfulness' | 'Exercise' | 'Social' | 'Creative';
    completedAt: string;
  }>;
  trend: 'up' | 'down' | 'stable';
}

// Mock database for user wellbeing progress
let wellbeingProgress: WellbeingProgress[] = [
  {
    userId: "1",
    username: "alice",
    category: "Emotional Awareness",
    activitiesCompleted: 45,
    totalActivities: 100,
    recentActivities: [
      { id: "1", name: "Daily Mood Check-in", type: "Mindfulness", completedAt: "2025-04-10" },
      { id: "2", name: "Gratitude Journaling", type: "Mindfulness", completedAt: "2025-04-09" }
    ],
    trend: 'up'
  },
  {
    userId: "2",
    username: "bob",
    category: "Physical Wellbeing",
    activitiesCompleted: 32,
    totalActivities: 75,
    recentActivities: [
      { id: "3", name: "30min Walk", type: "Exercise", completedAt: "2025-04-08" },
      { id: "4", name: "Yoga Session", type: "Exercise", completedAt: "2025-04-07" }
    ],
    trend: 'stable'
  }
];

function getUsers(): User[] {
  try {
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    return [];
  }
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getRankedUsers(users: User[]): UserProgress[] {
  return users
    .map((user: User) => ({
      userId: user.id,
      username: user.username,
      leetcodeSolved: user.leetcodeSolved,
      leetcodeStats: user.leetcodeStats,
      stressLevel: user.stressLevel,
      rank: 0
    }))
    .sort((a: UserProgress, b: UserProgress) => b.leetcodeSolved - a.leetcodeSolved)
    .map((user: UserProgress, index: number) => ({ ...user, rank: index + 1 }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const type = url.searchParams.get("type") || "leetcode"; // leetcode or wellbeing
  const category = url.searchParams.get("category");

  if (type === "wellbeing") {
    if (userId) {
      const userStats = wellbeingProgress.filter(progress => progress.userId === userId);
      if (category) {
        return NextResponse.json(userStats.filter(stat => 
          stat.category.toLowerCase() === category.toLowerCase()
        ));
      }
      return NextResponse.json(userStats);
    }
    return NextResponse.json(wellbeingProgress);
  } else {
    const users = getUsers();
    const rankedUsers = getRankedUsers(users);

    if (userId) {
      const userProgress = rankedUsers.find((user: UserProgress) => user.userId === userId);
      return NextResponse.json(userProgress || null);
    }
    return NextResponse.json(rankedUsers);
  }
}

export async function POST(request: Request) {
  const { type, ...data } = await request.json();

  try {
    if (type === "wellbeing") {
      const newProgress: WellbeingProgress = data;
      const existingIndex = wellbeingProgress.findIndex(
        progress => progress.userId === newProgress.userId && 
        progress.category === newProgress.category
      );

      if (existingIndex !== -1) {
        wellbeingProgress[existingIndex] = {
          ...wellbeingProgress[existingIndex],
          ...newProgress,
          trend: newProgress.activitiesCompleted > wellbeingProgress[existingIndex].activitiesCompleted ? 'up' :
                newProgress.activitiesCompleted < wellbeingProgress[existingIndex].activitiesCompleted ? 'down' : 'stable'
        };
      } else {
        wellbeingProgress.push(newProgress);
      }

      return NextResponse.json({
        message: 'Wellbeing progress updated successfully',
        progress: wellbeingProgress.filter(progress => progress.userId === newProgress.userId)
      });

    } else {
      const submission: LeetCodeSubmission = data;
      const users = getUsers();
      const userIndex = users.findIndex((user: User) => user.id === submission.userId);

      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      users[userIndex].leetcodeSolved++;
      users[userIndex].leetcodeStats[submission.difficulty]++;
      
      if (!users[userIndex].leetcodeStats.languages.includes(submission.language)) {
        users[userIndex].leetcodeStats.languages.push(submission.language);
      }

      saveUsers(users);

      const rankedUsers = getRankedUsers(users);
      return NextResponse.json({
        message: 'Progress updated successfully',
        rankings: rankedUsers,
        userProgress: rankedUsers.find((user: UserProgress) => user.userId === submission.userId)
      });
    }
  } catch (error) {
    console.error('Rankings update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}