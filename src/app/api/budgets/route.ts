import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongodb';
import Budget from '@/lib/db/models/Budget';
import Transaction from '@/lib/db/models/Transaction';
import Category from '@/lib/db/models/Category';
import { BudgetSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    await connectDB();

    const query: any = { userId: session.user.id };
    if (month) {
      const startOfMonth = new Date(month);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
      query.month = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const budgets = await Budget.find(query)
      .populate('categoryId', 'name type color icon')
      .sort({ createdAt: -1 });

    // Calculate spent amounts from transactions
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startOfMonth = new Date(budget.month);
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

        const spent = await Transaction.aggregate([
          {
            $match: {
              userId: session.user.id,
              categoryId: budget.categoryId._id,
              type: 'expense',
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]);

        return {
          ...budget.toObject(),
          spent: spent[0]?.total || 0,
        };
      })
    );

    return NextResponse.json(budgetsWithSpent);
  } catch (error) {
    console.error('[v0] Get budgets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = BudgetSchema.parse(body);

    await connectDB();

    // Verify category exists
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

    const budget = await Budget.create({
      ...validatedData,
      userId: session.user.id,
      notifications: [
        { type: 'email', sent: false },
        { type: 'push', sent: false },
        { type: 'in-app', sent: false },
      ],
    });

    await budget.populate('categoryId', 'name type color icon');

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.error('[v0] Create budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
