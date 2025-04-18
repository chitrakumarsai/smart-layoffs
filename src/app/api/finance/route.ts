import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const FINANCE_FILE = path.join(process.cwd(), 'src/app/api/finance/data.json');

interface Expense {
  id: string;
  userId: string;
  category: string;
  amount: number;
  date: string;
  createdAt: string;
}

function getFinanceData(): { expenses: Expense[] } {
  try {
    const data = fs.readFileSync(FINANCE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { expenses: [] };
  }
}

function saveFinanceData(data: { expenses: Expense[] }): void {
  fs.writeFileSync(FINANCE_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const data = getFinanceData();
  const userExpenses = data.expenses.filter(expense => expense.userId === userId);

  return NextResponse.json(userExpenses);
}

export async function POST(request: Request) {
  try {
    const { userId, category, amount, date } = await request.json();

    if (!userId || !category || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newExpense: Expense = {
      id: uuidv4(),
      userId,
      category,
      amount: parseFloat(amount),
      date,
      createdAt: new Date().toISOString()
    };

    const data = getFinanceData();
    data.expenses.push(newExpense);
    saveFinanceData(data);

    return NextResponse.json(newExpense);
  } catch (error) {
    console.error('Finance error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const userId = url.searchParams.get("userId");

  if (!id || !userId) {
    return NextResponse.json({ error: 'Missing id or userId' }, { status: 400 });
  }

  const data = getFinanceData();
  const expenseIndex = data.expenses.findIndex(e => e.id === id && e.userId === userId);

  if (expenseIndex === -1) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }

  data.expenses.splice(expenseIndex, 1);
  saveFinanceData(data);

  return NextResponse.json({ message: 'Expense deleted successfully' });
}