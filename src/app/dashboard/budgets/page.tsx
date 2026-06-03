'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { BudgetFormSchema, BudgetFormInput } from '@/lib/validation/schemas';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { format } from 'date-fns';
import { Pencil, Trash } from 'lucide-react';

interface Budget {
  _id: string;
  categoryId: any;
  month: string;
  limit: number;
  spent: number;
  alertThreshold: number;
}

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetFormInput>({
    resolver: zodResolver(BudgetFormSchema),
  });

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [budgetsRes, categoriesRes] = await Promise.all([
        axios.get(`/api/budgets?month=${selectedMonth}`),
        axios.get('/api/categories?type=expense'),
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('[v0] Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BudgetFormInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...data,
        month: new Date(`${selectedMonth}-01`),
      };

      if (editingId) {
        await axios.put(`/api/budgets/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post('/api/budgets', payload);
      }
      reset();
      await fetchData();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to save budget'
        : 'Failed to save budget';
      setError(message);
      console.error('[v0] Failed to save budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/budgets/${id}`);
      await fetchData();
    } catch (error) {
      console.error('[v0] Failed to delete budget:', error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget._id);
    reset({
      categoryId: budget.categoryId._id,
      limit: budget.limit,
      alertThreshold: budget.alertThreshold,
    });
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Budgets</h1>
        <p className="text-slate-600 mt-1">
          Set spending limits and track your expenses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="p-6 lg:sticky lg:top-24 lg:h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {editingId ? 'Edit Budget' : 'Create Budget'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Month
              </label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={editingId !== null}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Limit
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1.5 text-slate-500">PKR </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...register('limit', { valueAsNumber: true })}
                  className="pl-12"
                />
              </div>
              {errors.limit && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.limit.message}
                </p>
              )}
            </div>

            {/* Alert Threshold */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Alert Threshold (%)
              </label>
              <Input
                type="number"
                placeholder="80"
                min="0"
                max="100"
                {...register('alertThreshold', { valueAsNumber: true })}
              />
              {errors.alertThreshold && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.alertThreshold.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    reset();
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Budgets List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <Card className="p-6 text-center">Loading...</Card>
          ) : budgets.length === 0 ? (
            <Card className="p-6 text-center text-slate-600">
              No budgets for this month. Create one to get started!
            </Card>
          ) : (
            budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = budget.spent > budget.limit;

              return (
                <motion.div
                  key={budget._id}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {budget.categoryId?.icon}{' '}
                          {budget.categoryId?.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {format(
                            new Date(budget.month),
                            'MMMM yyyy'
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg cursor-pointer transition-colors"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget._id)}
                          className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Spending Info */}
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <p className="text-sm text-slate-600">Spent</p>
                        <p
                          className={`text-2xl font-bold ${isOverBudget
                            ? 'text-red-600'
                            : getPercentageColor(percentage)
                            }`}
                        >
                          PKR {budget.spent.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Budget</p>
                        <p className="text-2xl font-bold text-slate-900">
                          PKR {budget.limit.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          {isOverBudget ? 'Over' : 'Remaining'}
                        </p>
                        <p
                          className={`text-2xl font-bold ${isOverBudget
                            ? 'text-red-600'
                            : 'text-green-600'
                            }`}
                        >
                          PKR {Math.abs(
                            budget.limit - budget.spent
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: 'easeOut',
                        }}
                        className={`h-full ${getProgressBarColor(percentage)}`}
                      />
                    </div>

                    {/* Percentage */}
                    <div className="mt-3 flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold ${getPercentageColor(
                          percentage
                        )}`}
                      >
                        {percentage.toFixed(1)}% used
                      </p>
                      {isOverBudget && (
                        <p className="text-sm text-red-600 font-medium">
                          Over budget by PKR {(budget.spent - budget.limit).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
