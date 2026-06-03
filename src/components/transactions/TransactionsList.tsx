'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { format } from 'date-fns';
import { Pencil, Trash, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  categoryId?: any;
}

interface TransactionsListProps {
  filters?: any;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function TransactionsList({
  filters = {},
  onEdit,
  onDelete,
  onRefresh,
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [filters, page]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: '10',
      });

      const response = await axios.get(`/api/transactions?${params}`);
      setTransactions(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('[v0] Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await axios.delete(`/api/transactions/${id}`);
      await fetchTransactions();
      if (onDelete) await onDelete(id);
    } catch (error) {
      console.error('[v0] Failed to delete transaction:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-slate-600">Loading transactions...</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      {transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600 mb-4">No transactions found</p>
          <p className="text-sm text-slate-500">
            Create your first transaction to get started
          </p>
        </Card>
      ) : (
        <>
          {transactions.map((transaction) => (
            <motion.div
              key={transaction._id}
              variants={itemVariants}
              whileHover={{ x: 4 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">
                      {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-green-500" /> : <ArrowDownLeft className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-slate-500">
                        {transaction.categoryId?.name} •{' '}
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`font-semibold text-lg ${transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'} PKR {" "}
                        {transaction.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors cursor-pointer text-red-600"
                        title="Delete"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {(page - 1) * 10 + 1} to{' '}
                {Math.min(page * 10, total)} of {total} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                  className="text-sm"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 text-slate-900'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  className="text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
