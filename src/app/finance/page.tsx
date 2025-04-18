"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ExpenseModal from '../components/ExpenseModal';

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
}

interface Budget {
  category: string;
  allocated: number;
  spent: number;
}

interface UserData {
  id: string;
  username: string;
  role: string;
}

interface StressAnalysis {
  stressLevel: number;
  suggestions: string[];
  analysis: string;
}

export default function FinancePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [savings, setSavings] = useState(45000);
  const [monthlyBurn, setMonthlyBurn] = useState(3500);
  const [runway, setRunway] = useState(12.8);
  const [stressAnalysis, setStressAnalysis] = useState<StressAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [budgets, setBudgets] = useState<Budget[]>([
    { category: 'Housing', allocated: 2000, spent: 1800 },
    { category: 'Utilities', allocated: 300, spent: 250 },
    { category: 'Food', allocated: 600, spent: 450 },
    { category: 'Transportation', allocated: 400, spent: 320 }
  ]);

  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

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
      fetchExpenses(parsedUserData.id);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      router.push('/auth');
    }
  }, [router]);

  const fetchExpenses = async (userId: string) => {
    try {
      const response = await fetch(`/api/finance?userId=${userId}`);
      const data = await response.json();
      setRecentExpenses(data);
      updateBudgets(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const updateBudgets = (expenses: Expense[]) => {
    const newBudgets = [...budgets];
    
    // Reset spent amounts
    newBudgets.forEach(budget => {
      budget.spent = 0;
    });

    // Calculate new spent amounts
    expenses.forEach(expense => {
      const budget = newBudgets.find(b => b.category === expense.category);
      if (budget) {
        budget.spent += expense.amount;
      }
    });

    setBudgets(newBudgets);
    
    // Update monthly burn rate
    const totalMonthlyExpenses = newBudgets.reduce((acc, budget) => acc + budget.spent, 0);
    setMonthlyBurn(totalMonthlyExpenses);
    
    // Update runway
    if (totalMonthlyExpenses > 0) {
      setRunway(savings / totalMonthlyExpenses);
    }
  };

  const handleAddExpense = async (expense: { category: string; amount: number; date: string }) => {
    if (!userData) return;

    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expense,
          userId: userData.id
        })
      });

      if (response.ok) {
        const newExpense = await response.json();
        setRecentExpenses(prevExpenses => [newExpense, ...prevExpenses]);
        updateBudgets([...recentExpenses, newExpense]);
        setIsExpenseModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!userData) return;

    try {
      const response = await fetch(`/api/finance?id=${id}&userId=${userData.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecentExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
        updateBudgets(recentExpenses.filter(expense => expense.id !== id));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getProgressColor = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage < 70) return 'from-green-500 to-emerald-500';
    if (percentage < 90) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const analyzeFinancialStress = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'financial_forecast',
          text: JSON.stringify({
            currentSavings: savings,
            monthlyExpenses: budgets.reduce((acc, budget) => ({
              ...acc,
              [budget.category]: budget.spent
            }), {}),
            severancePay: 0, // Add this to form input
            monthlyIncome: 0, // Add this to form input
            timeframe: runway,
            expenseChange: 0 // Calculate from previous month
          })
        })
      });

      const data = await response.json();
      setStressAnalysis({
        stressLevel: data.stressLevel,
        suggestions: data.analysis.split('\n').filter((line: string) => line.startsWith('-')),
        analysis: data.analysis
      });
    } catch (error) {
      console.error('Error analyzing stress:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient">
      <Navbar username={userData?.username || ''} />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 fade-in mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Overview
            </h1>
            <p className="text-gray-600">Track and manage your finances during career transition</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'Total Savings', value: `$${savings.toLocaleString()}`, trend: 'up' },
              { title: 'Monthly Burn Rate', value: `$${monthlyBurn.toLocaleString()}`, trend: 'down' },
              { title: 'Runway', value: `${runway.toFixed(1)} months`, trend: 'stable' }
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-effect rounded-2xl p-6 animate-fadeIn card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                  <span className={`text-${
                    stat.trend === 'up' ? 'green' : stat.trend === 'down' ? 'red' : 'gray'
                  }-500`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {stat.trend === 'up' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      ) : stat.trend === 'down' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      )}
                    </svg>
                  </span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Budget Overview */}
          <div className="glass-effect rounded-2xl p-8 mb-8 animate-fadeIn">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Budget Overview
            </h2>
            <div className="space-y-6">
              {budgets.map((budget) => (
                <div key={budget.category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-gray-600">${budget.spent} / ${budget.allocated}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressColor(budget.spent, budget.allocated)} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${(budget.spent / budget.allocated) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="glass-effect rounded-2xl p-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Recent Expenses
              </h2>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Add Expense
              </button>
            </div>

            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4 text-right">Amount</th>
                    <th className="pb-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentExpenses.map((expense) => (
                    <tr key={expense.id} className="text-sm">
                      <td className="py-4">{expense.date}</td>
                      <td className="py-4">{expense.category}</td>
                      <td className="py-4 text-right">${expense.amount}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stress Analysis Section */}
          <div className="glass-effect rounded-2xl p-8 mt-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Financial Stress Analysis
              </h2>
              <button
                onClick={analyzeFinancialStress}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Stress Level'}
              </button>
            </div>

            {stressAnalysis && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium">Current Stress Level</div>
                  <div className={`text-xl font-bold ${
                    stressAnalysis.stressLevel <= 3 ? 'text-green-600' :
                    stressAnalysis.stressLevel <= 7 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {stressAnalysis.stressLevel}/10
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">AI Suggestions</h3>
                  <div className="bg-white/50 rounded-xl p-4">
                    <ul className="space-y-2">
                      {stressAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span className="text-gray-700">{suggestion.replace('-', '').trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Detailed Analysis</h3>
                  <div className="bg-white/50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-line">{stressAnalysis.analysis}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleAddExpense}
        categories={budgets.map(b => b.category)}
      />
    </div>
  );
}