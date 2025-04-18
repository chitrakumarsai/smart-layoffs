import { NextRequest, NextResponse } from 'next/server';

interface UserProfile {
  username: string;
  previousRole: string;
  layoffDate: string;
  skills: string[];
  interests: string[];
  lookingFor: string[];
}

interface MatchFilters {
  skills: string[];
  interests: string[];
  dateRange: string;
}

// Mock database of users - replace with actual database in production
const mockUsers: (UserProfile & { id: string })[] = [
  {
    id: '1',
    username: 'alex_tech',
    previousRole: 'Senior Software Engineer',
    layoffDate: '2025-03-15',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    interests: ['Machine Learning', 'Web3', 'Startups'],
    lookingFor: ['Mentorship', 'Job Opportunities']
  },
  {
    id: '2',
    username: 'sarah_pm',
    previousRole: 'Product Manager',
    layoffDate: '2025-02-28',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
    interests: ['AI/ML', 'EdTech', 'Remote Work'],
    lookingFor: ['Networking', 'Startup Opportunities']
  },
  // Add more mock users as needed
];

function calculateMatchScore(
  userProfile: UserProfile,
  potentialMatch: UserProfile,
  filters: MatchFilters
): number {
  let score = 0;
  const weights = {
    skills: 0.4,
    interests: 0.3,
    dateRange: 0.3
  };

  // Calculate skills match
  if (filters.skills.length > 0) {
    const skillsOverlap = filters.skills.filter(skill => 
      potentialMatch.skills.includes(skill)
    ).length;
    score += (skillsOverlap / filters.skills.length) * weights.skills * 100;
  } else {
    const skillsOverlap = userProfile.skills.filter(skill => 
      potentialMatch.skills.includes(skill)
    ).length;
    const maxSkills = Math.max(userProfile.skills.length, potentialMatch.skills.length);
    score += (skillsOverlap / maxSkills) * weights.skills * 100;
  }

  // Calculate interests match
  if (filters.interests.length > 0) {
    const interestsOverlap = filters.interests.filter(interest => 
      potentialMatch.interests.includes(interest)
    ).length;
    score += (interestsOverlap / filters.interests.length) * weights.interests * 100;
  } else {
    const interestsOverlap = userProfile.interests.filter(interest => 
      potentialMatch.interests.includes(interest)
    ).length;
    const maxInterests = Math.max(userProfile.interests.length, potentialMatch.interests.length);
    score += (interestsOverlap / maxInterests) * weights.interests * 100;
  }

  // Calculate date range match
  const userDate = new Date(userProfile.layoffDate);
  const matchDate = new Date(potentialMatch.layoffDate);
  const diffMonths = Math.abs(userDate.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  let dateScore = 0;
  switch (filters.dateRange) {
    case '1month':
      dateScore = diffMonths <= 1 ? 100 : 0;
      break;
    case '3months':
      dateScore = diffMonths <= 3 ? 100 : 0;
      break;
    case '6months':
      dateScore = diffMonths <= 6 ? 100 : 0;
      break;
    default:
      dateScore = 100; // 'any' timeframe
  }
  score += dateScore * weights.dateRange;

  return Math.round(score);
}

export async function POST(request: NextRequest) {
  try {
    const { profile, filters } = await request.json();

    // In a real application, fetch potential matches from your database
    // For now, we'll use our mock database
    const potentialMatches = mockUsers.filter(user => user.username !== profile.username);

    const matches = potentialMatches.map(match => ({
      ...match,
      matchScore: calculateMatchScore(profile, match, filters)
    }))
    .filter(match => match.matchScore > 30) // Only return matches above 30% compatibility
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6); // Limit to top 6 matches

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in community matching:', error);
    return NextResponse.json(
      { error: 'Failed to process matching request' },
      { status: 500 }
    );
  }
}