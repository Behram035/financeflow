import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  month: Date;
  limit: number;
  spent: number;
  alertThreshold: number;
  notifications: Array<{
    type: 'email' | 'push' | 'in-app';
    sent: boolean;
    sentAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    month: {
      type: Date,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ['email', 'push', 'in-app'],
        },
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes
budgetSchema.index({ userId: 1, month: -1 });
budgetSchema.index({ userId: 1, categoryId: 1, month: -1 });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);
