import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongodb';
import Transaction from '@/lib/db/models/Transaction';
import Category from '@/lib/db/models/Category';
import { TransactionSchema, TransactionFilterSchema } from '@/lib/validation/schemas';
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

    // Build filter object
    const filterData = {
      type: searchParams.get('type') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as 'date' | 'amount' | 'category') || 'date',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const validatedFilter = TransactionFilterSchema.parse(filterData);

    await connectDB();

    // Build query
    const query: any = { userId: session.user.id };

    if (validatedFilter.type) query.type = validatedFilter.type;
    if (validatedFilter.categoryId) query.categoryId = validatedFilter.categoryId;

    if (validatedFilter.startDate || validatedFilter.endDate) {
      query.date = {};
      if (validatedFilter.startDate) query.date.$gte = validatedFilter.startDate;
      if (validatedFilter.endDate) query.date.$lte = validatedFilter.endDate;
    }

    if (validatedFilter.minAmount || validatedFilter.maxAmount) {
      query.amount = {};
      if (validatedFilter.minAmount) query.amount.$gte = validatedFilter.minAmount;
      if (validatedFilter.maxAmount) query.amount.$lte = validatedFilter.maxAmount;
    }

    if (validatedFilter.search) {
      query.description = { $regex: validatedFilter.search, $options: 'i' };
    }

    // Build sort object
    const sortBy = validatedFilter.sortBy === 'date' ? 'date' : validatedFilter.sortBy === 'amount' ? 'amount' : 'categoryId';
    const sortOrder = validatedFilter.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    // Get total count
    const total = await Transaction.countDocuments(query);

    // Get transactions with pagination
    const skip = (validatedFilter.page - 1) * validatedFilter.limit;
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(validatedFilter.limit)
      .populate('categoryId', 'name type color icon');

    return NextResponse.json({
      data: transactions,
      pagination: {
        page: validatedFilter.page,
        limit: validatedFilter.limit,
        total,
        pages: Math.ceil(total / validatedFilter.limit),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.error('[v0] Get transactions error:', error);
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
    const validatedData = TransactionSchema.parse(body);

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

    const transaction = await Transaction.create({
      ...validatedData,
      userId: session.user.id,
    });

    // Populate category info
    await transaction.populate('categoryId', 'name type color icon');

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.error('[v0] Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
