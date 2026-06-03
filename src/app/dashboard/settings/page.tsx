'use client';

import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/auth/signin' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </motion.div>

      <motion.div variants={itemVariants} className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Notifications Section */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Notifications
            </h2>

            <div className="space-y-4">
              {[
                {
                  title: 'Email Notifications',
                  description: 'Receive alerts about budget limits and transactions',
                  enabled: true,
                },
                {
                  title: 'Push Notifications',
                  description: 'Get real-time alerts on your device',
                  enabled: true,
                },
              ].map((notif, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{notif.title}</p>
                    <p className="text-sm text-slate-600">{notif.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={notif.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Security
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Password</p>
                  <p className="text-sm text-slate-600">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" className="text-sm">
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-600">Add extra security to your account</p>
                </div>
                <Button variant="outline" className="text-sm">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 md:p-8 border-red-200 bg-red-50">
          <h2 className="text-2xl font-semibold text-red-900 mb-6">
            Danger Zone
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-slate-900">Sign Out</p>
                <p className="text-sm text-slate-600">Sign out of your account</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="text-sm border-red-200 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-slate-900">Delete Account</p>
                <p className="text-sm text-slate-600">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="outline"
                className="text-sm border-red-200 text-red-600 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
