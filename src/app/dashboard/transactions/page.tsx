'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionsList } from '@/components/transactions/TransactionsList';
import axios from 'axios';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<any>({});

  const handleAddTransaction = async (data: any) => {
    try {
      if (editingTransaction) {
        await axios.put(`/api/transactions/${editingTransaction._id}`, data);
        setEditingTransaction(null);
      } else {
        await axios.post('/api/transactions', data);
      }
      setShowForm(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('[v0] Failed to save transaction:', error);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setShowForm(!showForm);
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          {showForm ? '✕ Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - Sticky on desktop */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 lg:sticky lg:top-24 lg:h-fit"
          >
            <TransactionForm
              onSubmit={handleAddTransaction}
              initialData={editingTransaction}
            />
          </motion.div>
        )}

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          <TransactionsList
            key={refreshKey}
            filters={filters}
            onEdit={handleEdit}
            onRefresh={() => setRefreshKey(prev => prev + 1)}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
