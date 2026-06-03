'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  categoryId?: any;
  date: string;
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthRange, setMonthRange] = useState({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });

  useEffect(() => {
    fetchTransactions();
  }, [monthRange]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/transactions', {
        params: {
          startDate: monthRange.start.toISOString(),
          endDate: monthRange.end.toISOString(),
          limit: 1000,
        },
      });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('[v0] Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  // Group by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const category = t.categoryId?.name || 'Uncategorized';
      const existing = acc.find((item: any) => item.name === category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: category, value: t.amount });
      }
      return acc;
    }, []);

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc: any, t) => {
      const category = t.categoryId?.name || 'Uncategorized';
      const existing = acc.find((item: any) => item.name === category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: category, value: t.amount });
      }
      return acc;
    }, []);

  // Trend data (by day)
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(monthRange.start);
    date.setDate(date.getDate() + i);
    if (date > monthRange.end) return null;

    const dayTransactions = transactions.filter(
      t =>
        new Date(t.date).toDateString() === date.toDateString()
    );

    const dayIncome = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const dayExpense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: format(date, 'MMM dd'),
      income: dayIncome,
      expense: dayExpense,
    };
  }).filter(Boolean);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-600 mt-1">
          Analyze your spending patterns and financial trends
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Total Income</p>
            <p className="text-3xl font-bold text-green-600">
              PKR {income.toFixed(2)}
            </p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">
              PKR {expenses.toFixed(2)}
            </p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Balance</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              PKR {balance.toFixed(2)}
            </p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Income vs Expense Chart */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Daily Trend (Last 30 Days)
            </h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">No data available</p>
            )}
          </Card>
        </motion.div>

        {/* Expense by Category */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Expenses by Category (Pie Chart)
            </h2>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    className='text-xs'
                    label={({ name, value }) =>
                      `${name}: PKR ${value.toFixed(0)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseByCategory.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `PKR ${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">No expenses recorded</p>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Income by Category
          </h2>
          {incomeByCategory.length > 0 ? (
            <div className="space-y-3">
              {incomeByCategory.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span className="text-slate-600">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    PKR {cat.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No income recorded</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Expenses by Category
          </h2>
          {expenseByCategory.length > 0 ? (
            <div className="space-y-3">
              {expenseByCategory.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span className="text-slate-600">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    PKR {cat.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No expenses recorded</p>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
