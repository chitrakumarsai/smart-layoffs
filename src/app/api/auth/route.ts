import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const USERS_FILE = path.join(process.cwd(), 'src/app/api/auth/users.json');

interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  leetcodeSolved: number;
  leetcodeStats: {
    easy: number;
    medium: number;
    hard: number;
    languages: string[];
  };
  stressLevel?: number;
  createdAt: string;
  lastLogin: string;
}

function getUsers(): User[] {
  try {
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    return [];
  }
}

function saveUsers(users: User[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(request: Request) {
  try {
    const { email, password, action } = await request.json();

    const users = getUsers();

    if (action === 'login') {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Don't send password in response
      const { password: _, ...userData } = user;
      return NextResponse.json({
        token: uuidv4(), // In production, use proper JWT
        userData
      });

    } else if (action === 'register') {
      if (users.some(u => u.email === email)) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      const newUser: User = {
        id: uuidv4(),
        email,
        password,
        username: email.split('@')[0],
        role: 'user',
        leetcodeSolved: 0,
        leetcodeStats: {
          easy: 0,
          medium: 0,
          hard: 0,
          languages: []
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);

      const { password: _, ...userData } = newUser;
      return NextResponse.json({
        token: uuidv4(), // In production, use proper JWT
        userData
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}