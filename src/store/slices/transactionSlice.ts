import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  _id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: 'income' | 'expense';
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: 'date' | 'amount' | 'category';
    sortOrder?: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'date',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t._id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<TransactionState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'date',
        sortOrder: 'desc',
      };
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<TransactionState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  setPagination,
} = transactionSlice.actions;

export default transactionSlice.reducer;
