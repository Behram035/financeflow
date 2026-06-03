'use client';

import { useSession, signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, toggleDarkMode } from '@/store/slices/uiSlice';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Moon, Sun, LogOut } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleSidebar())}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
          </motion.button>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-red-400 hover:bg-red-700 text-dark hover:text-white font-medium transition-colors text-sm"
                >
                  <LogOut className='h-5 w-5' /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
