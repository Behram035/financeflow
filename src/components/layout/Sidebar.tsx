'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  Target,
  Tags,
  BarChart3,
  Settings,
  User,
  Wallet,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Transactions',
    href: '/dashboard/transactions',
    icon: CreditCard,
  },
  {
    label: 'Budgets',
    href: '/dashboard/budgets',
    icon: Target,
  },
  {
    label: 'Categories',
    href: '/dashboard/categories',
    icon: Tags,
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);

  // Handle sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      const shouldBeOpen = isDesktop;

      if (shouldBeOpen !== sidebarOpen) {
        dispatch(toggleSidebar());
      }
    };

    // Check on mount
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, sidebarOpen]);

  // Close sidebar when route changes (on mobile)
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop && sidebarOpen) {
      dispatch(toggleSidebar());
    }
  }, [pathname, dispatch, sidebarOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        transition={{ type: 'spring', damping: 20 }}
        className={cn(
          'fixed md:static left-0 top-0 h-screen w-64 bg-slate-900 text-white z-40',
          'flex flex-col border-r border-slate-800',
          'md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">FinanceFlow</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile when nav item is clicked
                  if (sidebarOpen) {
                    dispatch(toggleSidebar());
                  }
                }}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg transition-all',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg"><Icon className="w-5 h-5" /></span>
                    <span className="font-small">{item.label}</span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/dashboard/profile">
            <div className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2.5">
              <span className="text-xl"><User className='w-5 h-5' /></span>
              <span>Profile</span>
            </div>
          </Link>
        </div>
      </motion.aside>
    </>
  );
}
