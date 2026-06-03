'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { TransactionSchema, TransactionInput, TransactionFormInput } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface TransactionFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: any;
}

export function TransactionForm({ onSubmit, isLoading = false, initialData }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: initialData,
  });

  const watchType = watch('type');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (watchType) {
      setSelectedType(watchType);
    }
  }, [watchType]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/categories?type=${selectedType}`);
      setCategories(response.data);
    } catch (error) {
      console.error('[v0] Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedType]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      date: new Date(data.date),
    });
    if (!initialData) reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              {(['income', 'expense'] as const).map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={type}
                    {...register('type')}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="capitalize text-slate-700 flex items-center gap-1">
                    {type === 'income' ? <><ArrowUpRight className="w-5 h-5 text-green-600" /> Income </> : <><ArrowDownLeft className="w-5 h-5 text-red-600" /> Expense </>}
                  </span>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              id="categoryId"
              {...register('categoryId')}
              disabled={isLoading || loadingCategories}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-slate-500">PKR </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
                {...register('amount', { valueAsNumber: true })}
                className="pl-12 w-full"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Enter transaction description"
              disabled={isLoading}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </label>
            <Input
              id="date"
              type="date"
              disabled={isLoading}
              {...register('date')}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="Add any additional notes"
              disabled={isLoading}
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || loadingCategories}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </Card>
    </motion.div >
  );
}
