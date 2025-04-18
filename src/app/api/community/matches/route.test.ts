import { POST } from './route';
import { NextRequest } from 'next/server';

describe('Community Matching API', () => {
  const mockProfile = {
    username: 'test_user',
    previousRole: 'Software Engineer',
    layoffDate: '2025-03-01',
    skills: ['JavaScript', 'React'],
    interests: ['AI/ML', 'Web3'],
    lookingFor: ['Networking']
  };

  const mockFilters = {
    skills: [],
    interests: [],
    dateRange: '3months'
  };

  it('should return matches for a valid request', async () => {
    const request = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({ profile: mockProfile, filters: mockFilters })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matches).toBeDefined();
    expect(Array.isArray(data.matches)).toBe(true);
    expect(data.matches.length).toBeLessThanOrEqual(6);

    // Verify match structure
    if (data.matches.length > 0) {
      const firstMatch = data.matches[0];
      expect(firstMatch).toHaveProperty('id');
      expect(firstMatch).toHaveProperty('username');
      expect(firstMatch).toHaveProperty('matchScore');
      expect(firstMatch.matchScore).toBeGreaterThan(30);
    }
  });

  it('should apply filters correctly', async () => {
    const filteredRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({
        profile: mockProfile,
        filters: {
          ...mockFilters,
          skills: ['JavaScript'],
          dateRange: '1month'
        }
      })
    });

    const response = await POST(filteredRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.matches.forEach((match: any) => {
      expect(match.skills).toContain('JavaScript');
    });
  });

  it('should handle invalid requests', async () => {
    const invalidRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: 'invalid json'
    });

    const response = await POST(invalidRequest);
    expect(response.status).toBe(500);
  });

  it('should handle invalid requests', async () => {
    const invalidRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' })
    });

    const response = await POST(invalidRequest);
    expect(response.status).toBe(400);
  });

  it('should handle empty profile data', async () => {
    const emptyProfileRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({ profile: {}, filters: mockFilters })
    });

    const response = await POST(emptyProfileRequest);
    expect(response.status).toBe(400);
  });

  it('should return empty matches for highly specific filters', async () => {
    const specificRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({
        profile: mockProfile,
        filters: {
          skills: ['VerySpecificSkill'],
          interests: ['VerySpecificInterest'],
          dateRange: '1week'
        }
      })
    });

    const response = await POST(specificRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matches).toHaveLength(0);
  });

  it('should maintain match score consistency', async () => {
    const request = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({ profile: mockProfile, filters: mockFilters })
    });

    const response1 = await POST(request);
    const data1 = await response1.json();
    const response2 = await POST(request);
    const data2 = await response2.json();

    // For the same input, match scores should be consistent
    expect(data1.matches).toEqual(data2.matches);
  });

  it('should return empty matches for no overlapping skills or interests', async () => {
    const noOverlapRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          ...mockProfile,
          skills: ['Rust', 'Golang'],
          interests: ['Blockchain', 'IoT']
        },
        filters: {
          ...mockFilters,
          skills: ['Python', 'Java'],
          interests: ['Cloud Computing']
        }
      })
    });

    const response = await POST(noOverlapRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matches.length).toBe(0);
  });

  it('should prioritize matches within specified date range', async () => {
    const dateRangeRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          ...mockProfile,
          layoffDate: '2025-03-01'
        },
        filters: {
          ...mockFilters,
          dateRange: '1month'
        }
      })
    });

    const response = await POST(dateRangeRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.matches.forEach((match: any) => {
      const matchDate = new Date(match.layoffDate);
      const profileDate = new Date('2025-03-01');
      const diffInDays = Math.abs(matchDate.getTime() - profileDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBeLessThanOrEqual(30);
    });
  });

  it('should handle missing optional fields gracefully', async () => {
    const partialProfileRequest = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          username: 'partial_user',
          previousRole: 'Product Manager',
          layoffDate: '2025-03-01'
        },
        filters: mockFilters
      })
    });

    const response = await POST(partialProfileRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matches).toBeDefined();
  });

  it('should respect maximum matches limit', async () => {
    const request = new NextRequest('http://localhost/api/community/matches', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          ...mockProfile,
          skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript'],
          interests: ['AI/ML', 'Web3', 'Cloud Computing', 'DevOps']
        },
        filters: mockFilters
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matches.length).toBeLessThanOrEqual(6);
  });
});