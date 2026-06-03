'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CategorySchema, CategoryInput } from '@/lib/validation/schemas';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import {
  Pencil, Trash, ArrowUpRight, ArrowDownLeft,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Wallet,
  CreditCard,
  Briefcase,
  Gift,
  Heart,
  Coffee,
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
  });

  const iconOptions = [
    { name: 'Shopping', icon: ShoppingCart },
    { name: 'Home', icon: Home },
    { name: 'Transport', icon: Car },
    { name: 'Food', icon: Utensils },
    { name: 'Wallet', icon: Wallet },
    { name: 'Card', icon: CreditCard },
    { name: 'Work', icon: Briefcase },
    { name: 'Gift', icon: Gift },
    { name: 'Health', icon: Heart },
    { name: 'Coffee', icon: Coffee },
  ];

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find(opt => opt.name === iconName);
    return option ? option.icon : ShoppingCart; // Default to ShoppingCart if not found
  };
  const [open, setOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('[v0] Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CategoryInput) => {
    try {
      if (editingId) {
        await axios.put(`/api/categories/${editingId}`, data);
        setEditingId(null);
      } else {
        await axios.post('/api/categories', data);
      }
      reset();
      await fetchCategories();
    } catch (error) {
      console.error('[v0] Failed to save category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      await fetchCategories();
    } catch (error) {
      console.error('[v0] Failed to delete category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    reset({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
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
        <h1 className="text-4xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-600 mt-1">Organize your transactions by categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <Card className="p-6 lg:sticky lg:top-24 lg:h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {editingId ? 'Edit Category' : 'Add Category'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <Input
                placeholder="Category name"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
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

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Color
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...register('color')}
                  className="w-32 h-8 p-0 border rounded cursor-pointer"
                  defaultValue="#3b82f6"
                />

                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: watch('color') }}
                />
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Icon
              </label>

              <div className="relative">
                {/* Selected Button */}
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="w-full flex items-center gap-2 px-3 py-2 border rounded-lg bg-white"
                >
                  <selectedIcon.icon className="w-5 h-5" />
                  <span>{selectedIcon.name}</span>
                </button>

                {/* Dropdown */}
                {open && (
                  <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    {iconOptions.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(item);
                            setValue('icon', item.name); // store name or icon id
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* hidden input for RHF */}
              <input type="hidden" {...register('icon')} />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
              >
                {editingId ? 'Update' : 'Add'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    reset();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <Card className="p-6 text-center">Loading...</Card>
          ) : categories.length === 0 ? (
            <Card className="p-6 text-center text-slate-600">
              No categories yet. Create one to get started!
            </Card>
          ) : (
            <div className='grid md:grid-cols-2 gap-2'>
              {/* Income Categories */}
              {categories.filter(c => c.type === 'income').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Income Categories
                  </h3>
                  <div className="space-y-2">
                    {categories
                      .filter(c => c.type === 'income')
                      .map((category) => (
                        <motion.div
                          key={category._id}
                          whileHover={{ x: 4 }}
                        >
                          <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <div>
                                <p className="flex items-center gap-2">
                                  {(() => {
                                    const IconComponent = getIconComponent(category.icon);
                                    return <IconComponent className="h-5 w-5" />;
                                  })()}
                                  {category.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(category)}
                                className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg cursor-pointer transition-colors"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* Expense Categories */}
              {categories.filter(c => c.type === 'expense').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Expense Categories
                  </h3>
                  <div className="space-y-2">
                    {categories
                      .filter(c => c.type === 'expense')
                      .map((category) => (
                        <motion.div
                          key={category._id}
                          whileHover={{ x: 4 }}
                        >
                          <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <div>
                                <p className="font-medium text-slate-900 flex items-center gap-2">
                                  {(() => {
                                    const IconComponent = getIconComponent(category.icon);
                                    return <IconComponent className="h-5 w-5" />;
                                  })()}
                                  {category.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(category)}
                                className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg cursor-pointer transition-colors"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
