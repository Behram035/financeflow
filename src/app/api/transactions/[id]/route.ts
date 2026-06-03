import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongodb';
import Transaction from '@/lib/db/models/Transaction';
import Category from '@/lib/db/models/Category';
import { TransactionSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import { Types } from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { id } = await params;
    await connectDB();

    const transaction = await Transaction.findOne({
      _id: new Types.ObjectId(id),
      userId: session.user.id,
    }).populate('categoryId', 'name type color icon');

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('[v0] Get transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = TransactionSchema.parse(body);
    const { id } = await params;
    await connectDB();

    // Verify category exists and belongs to user
    const category = await Category.findOne({
      _id: validatedData.categoryId,
      userId: session.user.id,
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Verify transaction type matches category type
    if (category.type !== validatedData.type) {
      return NextResponse.json(
        { error: 'Transaction type does not match category type' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: session.user.id,
      },
      validatedData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name type color icon');

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.error('[v0] Update transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { id } = await params;
    await connectDB();

    const transaction = await Transaction.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: session.user.id,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('[v0] Delete transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
