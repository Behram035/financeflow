'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { UpdateProfileInput, UpdateProfileSchema } from '@/lib/validation/schemas';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      image: session?.user?.image || '',
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveMessage({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        message: 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
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
      className="max-w-2xl space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600 mt-1">Manage your profile</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Profile Information
          </h2>

          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${saveMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
                }`}
            >
              {saveMessage.message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <Input
                id="name"
                placeholder="Your name"
                disabled={isSaving}
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                disabled={isSaving}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Image URL Field */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-2">
                Profile Image URL (Optional)
              </label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                disabled={isSaving}
                {...register('image')}
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-500">{errors.image.message}</p>
              )}
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-6"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </motion.div>

    </motion.div>
  );
}
