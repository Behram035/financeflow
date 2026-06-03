import { z } from 'zod';

// Auth Schemas
export const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;

// Transaction Schemas
export const TransactionSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  date: z.coerce.date(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const TransactionFilterSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'category']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionFormInput = z.input<typeof TransactionSchema>;
export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;

// Category Schemas
export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

// Budget Schemas
export const BudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Limit must be positive'),
  month: z.coerce.date(),
  alertThreshold: z.number().min(0).max(100).default(80),
});

// Budget form schema (without month, added separately)
export const BudgetFormSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Limit must be positive'),
  alertThreshold: z.number().min(0).max(100).default(80),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;
export type BudgetFormInput = z.input<typeof BudgetFormSchema>;

// Profile Schemas
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url().optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
