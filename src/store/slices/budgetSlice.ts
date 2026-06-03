import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Budget {
  _id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  month: string;
  limit: number;
  spent: number;
  alertThreshold: number;
  percentageUsed?: number;
  createdAt: string;
  updatedAt: string;
}

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  selectedMonth: string; // YYYY-MM format
}

const initialState: BudgetState = {
  budgets: [],
  isLoading: false,
  error: null,
  selectedMonth: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
};

export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload.map(budget => ({
        ...budget,
        percentageUsed: (budget.spent / budget.limit) * 100,
      }));
      state.error = null;
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push({
        ...action.payload,
        percentageUsed: (action.payload.spent / action.payload.limit) * 100,
      });
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.budgets[index] = {
          ...action.payload,
          percentageUsed: (action.payload.spent / action.payload.limit) * 100,
        };
      }
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(b => b._id !== action.payload);
    },
    updateBudgetSpending: (
      state,
      action: PayloadAction<{ budgetId: string; amount: number }>
    ) => {
      const budget = state.budgets.find(b => b._id === action.payload.budgetId);
      if (budget) {
        budget.spent = action.payload.amount;
        budget.percentageUsed = (budget.spent / budget.limit) * 100;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
  },
});

export const {
  setBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  updateBudgetSpending,
  setLoading,
  setError,
  setSelectedMonth,
} = budgetSlice.actions;

export default budgetSlice.reducer;
