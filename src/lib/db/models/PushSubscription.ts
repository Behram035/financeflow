import mongoose, { Schema, Document } from 'mongoose';

export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: {
      auth: string;
      p256dh: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      endpoint: {
        type: String,
        required: true,
      },
      expirationTime: {
        type: Number,
        default: null,
      },
      keys: {
        auth: {
          type: String,
          required: true,
        },
        p256dh: {
          type: String,
          required: true,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for userId
pushSubscriptionSchema.index({ userId: 1 });

export default mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);
