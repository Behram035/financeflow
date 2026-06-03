'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  PiggyBank,
  Plus,
  Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Category {
  name?: string;
  color?: string;
  icon?: string;
}

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  categoryId?: Category;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/transactions', {
          params: {
            startDate: startOfMonth(new Date()).toISOString(),
            endDate: endOfMonth(new Date()).toISOString(),
            limit: 1000,
          },
        });

        setTransactions(response.data.data);
      } catch (error) {
        console.error('[v0] Failed to fetch dashboard transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.max((balance / income) * 100, 0) : 0;
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (value: number) => `PKR ${value.toFixed(2)}`;

  const stats = [
    {
      label: 'Total Income',
      value: formatCurrency(income),
      icon: ArrowUpRight,
      color: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(expenses),
      icon: ArrowDownLeft,
      color: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(balance),
      icon: BadgeDollarSign,
      color: 'bg-blue-100',
      textColor: balance >= 0 ? 'text-blue-600' : 'text-red-600',
    },
    {
      label: 'Monthly Savings',
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome back, {session?.user?.name || 'there'}!
        </h1>
        <p className="text-slate-600">
          Here&apos;s your financial overview for this month
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {isLoading ? 'PKR--' : stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.color} ${stat.textColor} w-12 h-12 rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-slate-500 text-center py-8">
                Loading transactions...
              </p>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${transaction.type === 'income'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                        }`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-slate-500">
                        {transaction.categoryId?.name || 'Uncategorized'} /{' '}
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-right font-semibold ${transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">
                No transactions yet. Create your first transaction to get started!
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/transactions">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Add Transaction
                </h3>
                <p className="text-sm text-slate-600">
                  Record income or expense
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/budgets">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Set Budget
                </h3>
                <p className="text-sm text-slate-600">
                  Create spending limits
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
